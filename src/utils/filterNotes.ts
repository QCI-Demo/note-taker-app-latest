import type { Note } from "@/models/Note";

/** Case-insensitive match on title or body (trimmed query). */
export function filterNotesByQuery(notes: Note[], query: string): Note[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return notes;
  }
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(q) ||
      note.body.toLowerCase().includes(q),
  );
}
