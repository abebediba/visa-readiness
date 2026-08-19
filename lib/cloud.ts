"use client";

import type { Application } from "./types";
import { supabaseClient } from "./supabase";

export type CloudCopy = { application: Application; updatedAt: string };

export async function pushApplication(app: Application): Promise<void> {
  const supabase = supabaseClient();
  if (!supabase) throw new Error("Cloud sync is not configured.");
  const { error } = await supabase
    .from("applications")
    .upsert({ id: app.id, payload: app, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

/** Latest application saved by the signed-in user, or null. */
export async function pullApplication(): Promise<CloudCopy | null> {
  const supabase = supabaseClient();
  if (!supabase) throw new Error("Cloud sync is not configured.");
  const { data, error } = await supabase
    .from("applications")
    .select("payload, updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { application: data.payload as Application, updatedAt: data.updated_at as string };
}

/** Data-rights control: removes every cloud copy the user owns. RLS scopes the delete. */
export async function deleteCloudCopies(): Promise<void> {
  const supabase = supabaseClient();
  if (!supabase) throw new Error("Cloud sync is not configured.");
  const { error } = await supabase.from("applications").delete().neq("id", "");
  if (error) throw new Error(error.message);
}
