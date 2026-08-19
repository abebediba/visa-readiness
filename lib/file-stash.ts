"use client";

// Transient, in-memory handle to the picked File so opt-in AI extraction can
// read it later in the session. Never persisted; lost on reload by design —
// the UI falls back to asking the user to re-select the file.
const stash = new Map<string, File>();

export function stashFile(docId: string, file: File) {
  stash.set(docId, file);
}

export function takeFile(docId: string): File | undefined {
  return stash.get(docId);
}

export function dropFile(docId: string) {
  stash.delete(docId);
}
