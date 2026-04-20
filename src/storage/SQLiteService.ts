import type { CreateNoteInput } from "@/storage/IndexedDBService";
import type { Note } from "@/models/Note";

function newPlaceholderId(): string {
  return `sqlite-placeholder-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * **Placeholder** SQLite-backed persistence for Capacitor/native builds.
 *
 * Returns resolved Promises with mock-shaped data. Native implementation will
 * use `@capacitor-community/sqlite` (or similar) and map rows to {@link Note}.
 *
 * @todo Replace mock responses with real SQL INSERT/SELECT/UPDATE/DELETE.
 * @todo Add migrations and schema versioning for the notes table.
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const now = new Date();
  const note: Note = {
    id: newPlaceholderId(),
    title: input.title.trim(),
    body: input.body,
    createdAt: now,
    updatedAt: now,
  };
  // TODO: await sqlite.run('INSERT INTO notes ...', ...)
  return Promise.resolve(note);
}

/**
 * @todo SELECT * FROM notes ORDER BY updatedAt DESC
 */
export async function getNotes(): Promise<Note[]> {
  // TODO: fetch rows and map to Note[]
  return Promise.resolve([]);
}

/**
 * @todo UPDATE notes SET ... WHERE id = ?
 */
export async function updateNote(
  id: string,
  updates: Partial<Pick<Note, "title" | "body">>,
): Promise<Note | undefined> {
  if (!id) {
    return Promise.resolve(undefined);
  }
  const now = new Date();
  const note: Note = {
    id,
    title: updates.title !== undefined ? updates.title.trim() : "Placeholder",
    body: updates.body !== undefined ? updates.body : "",
    createdAt: new Date(0),
    updatedAt: now,
  };
  // TODO: load existing row; return undefined when id not found
  return Promise.resolve(note);
}

/**
 * @todo DELETE FROM notes WHERE id = ?
 */
export async function deleteNote(id: string): Promise<void> {
  void id;
  // TODO: await sqlite.run('DELETE FROM notes WHERE id = ?', [id])
  return Promise.resolve();
}
