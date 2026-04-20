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
  updateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "body">>,
  ) => void;
  deleteNote: (id: string) => void;
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
  updateNote: (id, updates) =>
    set((state) => {
      const index = state.notes.findIndex((n) => n.id === id);
      if (index === -1) {
        return state;
      }
      const now = new Date().toISOString();
      const previous = state.notes[index];
      const nextNotes = [...state.notes];
      nextNotes[index] = {
        ...previous,
        title:
          updates.title !== undefined ? updates.title.trim() : previous.title,
        body: updates.body !== undefined ? updates.body : previous.body,
        updatedAt: now,
      };
      return { notes: nextNotes };
    }),
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    })),
}));
