"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Application, Outcome, RouteId, UploadedDoc } from "./types";
import { getRoute } from "./routes/definitions";
import { runAssessment } from "./engine/assess";

type State = {
  application: Application | null;
  startApplication: (routeId: RouteId) => void;
  resetApplication: () => void;
  setAnswer: (id: string, value: string | boolean) => void;
  addDocument: (doc: Omit<UploadedDoc, "id" | "addedAt" | "facts" | "factsConfirmed">) => string | null;
  removeDocument: (id: string) => void;
  setDocumentFacts: (id: string, facts: Record<string, string>, confirmed: boolean) => void;
  runAssessmentNow: () => void;
  markSubmitted: () => void;
  recordOutcome: (outcome: Omit<Outcome, "recordedAt" | "scoreAtSubmission">) => void;
};

function now() {
  return new Date().toISOString();
}

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      application: null,

      startApplication: (routeId) =>
        set({
          application: {
            id: `app_${Math.random().toString(36).slice(2, 10)}`,
            routeId,
            createdAt: now(),
            updatedAt: now(),
            answers: {},
            documents: [],
            history: [],
          },
        }),

      resetApplication: () => set({ application: null }),

      setAnswer: (id, value) => {
        const app = get().application;
        if (!app) return;
        set({ application: { ...app, updatedAt: now(), answers: { ...app.answers, [id]: value } } });
      },

      addDocument: (doc) => {
        const app = get().application;
        if (!app) return null;
        const entry: UploadedDoc = {
          ...doc,
          id: `doc_${Math.random().toString(36).slice(2, 10)}`,
          addedAt: now(),
          facts: {},
          factsConfirmed: false,
        };
        set({ application: { ...app, updatedAt: now(), documents: [...app.documents, entry] } });
        return entry.id;
      },

      removeDocument: (id) => {
        const app = get().application;
        if (!app) return;
        set({
          application: { ...app, updatedAt: now(), documents: app.documents.filter((d) => d.id !== id) },
        });
      },

      setDocumentFacts: (id, facts, confirmed) => {
        const app = get().application;
        if (!app) return;
        set({
          application: {
            ...app,
            updatedAt: now(),
            documents: app.documents.map((d) => (d.id === id ? { ...d, facts, factsConfirmed: confirmed } : d)),
          },
        });
      },

      runAssessmentNow: () => {
        const app = get().application;
        if (!app) return;
        const route = getRoute(app.routeId);
        if (!route) return;
        const assessment = runAssessment(app, route);
        set({
          application: {
            ...app,
            updatedAt: now(),
            assessment,
            history: [...app.history, { ranAt: assessment.ranAt, overall: assessment.overall }],
          },
        });
      },
      markSubmitted: () => {
        const app = get().application;
        if (!app || app.submittedAt) return;
        set({ application: { ...app, updatedAt: now(), submittedAt: now() } });
      },

      recordOutcome: (outcome) => {
        const app = get().application;
        if (!app) return;
        set({
          application: {
            ...app,
            updatedAt: now(),
            outcome: {
              ...outcome,
              scoreAtSubmission: app.assessment?.overall,
              recordedAt: now(),
            },
          },
        });
      },
    }),
    { name: "visa-readiness-application" }
  )
);
