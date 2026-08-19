"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabase";
import { pushApplication } from "@/lib/cloud";
import { useApp } from "@/lib/store";

export function useCloudSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const supabase = supabaseClient();
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, ready };
}

/**
 * Mounted once in the root layout. While signed in, debounce-pushes the
 * application to the user's own cloud row after every local change. Does
 * nothing when Supabase is unconfigured or the user is signed out — the app
 * stays fully local.
 */
export function CloudSync() {
  const { session } = useCloudSession();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!session) return;
    const unsubscribe = useApp.subscribe((state, prev) => {
      if (state.application === prev.application || !state.application) return;
      const app = state.application;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        pushApplication(app).catch(() => {
          /* transient network failures retry on the next change; the account page shows sync state */
        });
      }, 2000);
    });
    return () => {
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [session]);

  return null;
}
