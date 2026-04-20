import { create } from "zustand";
import type { Note } from "@/models/Note";
import type { CreateNoteInput } from "@/storage/IndexedDBService";
import { storage } from "@/storage/StorageFacade";

interface NotesState {
  notes: Note[];
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  addNote: (note: CreateNoteInput) => Promise<void>;
  updateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "body">>,
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isHydrating: false,
  hydrate: async () => {
    if (get().isHydrating) {
      return;
    }
    set({ isHydrating: true });
    try {
      const notes = await storage.getNotes();
      set({ notes });
    } finally {
      set({ isHydrating: false });
    }
  },
  addNote: async (payload) => {
    const optimistic: Note = {
      id: `optimistic-${Date.now()}`,
      title: payload.title.trim(),
      body: payload.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ notes: [optimistic, ...state.notes] }));
    try {
      const note = await storage.createNote(payload);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === optimistic.id ? note : n)),
      }));
    } catch (e) {
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== optimistic.id),
      }));
      throw e;
    }
  },
  updateNote: async (id, updates) => {
    const current = get().notes.find((n) => n.id === id);
    if (!current) {
      return;
    }
    const now = new Date();
    const optimistic: Note = {
      ...current,
      title:
        updates.title !== undefined ? updates.title.trim() : current.title,
      body: updates.body !== undefined ? updates.body : current.body,
      updatedAt: now,
    };
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? optimistic : n)),
    }));
    try {
      const note = await storage.updateNote(id, updates);
      if (!note) {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }));
        return;
      }
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? note : n)),
      }));
    } catch (e) {
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? current : n)),
      }));
      throw e;
    }
  },
  deleteNote: async (id) => {
    const previous = get().notes;
    const removed = previous.find((n) => n.id === id);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    }));
    try {
      await storage.deleteNote(id);
    } catch (e) {
      if (removed) {
        set({ notes: previous });
      }
      throw e;
    }
  },
}));
