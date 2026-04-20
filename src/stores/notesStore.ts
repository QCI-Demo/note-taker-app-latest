import { create } from "zustand";
import type { Note } from "@/types/note";

function newNoteId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

interface NotesState {
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  addNote: (payload) =>
    set((state) => {
      const now = new Date().toISOString();
      const note: Note = {
        id: newNoteId(),
        title: payload.title.trim(),
        body: payload.body,
        createdAt: now,
        updatedAt: now,
      };
      return { notes: [note, ...state.notes] };
    }),
}));
