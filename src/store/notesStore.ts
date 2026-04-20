import { create } from "zustand";

export type Note = {
  id: string;
  title: string;
  body: string;
};

type NotesState = {
  notes: Note[];
  addNote: (note: Omit<Note, "id"> & { id?: string }) => void;
  updateNote: (id: string, updates: Partial<Pick<Note, "title" | "body">>) => void;
  deleteNote: (id: string) => void;
};

const seedNotes: Note[] = [
  {
    id: "seed-note-1",
    title: "Welcome",
    body: "Click the pencil to edit this note.",
  },
];

export const useNotesStore = create<NotesState>((set) => ({
  notes: seedNotes,
  addNote: (note) =>
    set((state) => ({
      notes: [
        ...state.notes,
        {
          id: note.id ?? crypto.randomUUID(),
          title: note.title,
          body: note.body,
        },
      ],
    })),
  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates } : n
      ),
    })),
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    })),
}));
