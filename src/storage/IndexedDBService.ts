import { db } from "./notesDb";
import type { Note } from "@/models/Note";

export type CreateNoteInput = Omit<Note, "id" | "createdAt" | "updatedAt">;

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function normalizeNote(row: Note): Note {
  return {
    ...row,
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
  };
}

function newNoteId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Persists notes in IndexedDB via Dexie for web builds.
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const now = new Date();
  const note: Note = {
    id: newNoteId(),
    title: input.title.trim(),
    body: input.body,
    createdAt: now,
    updatedAt: now,
  };
  await db.notes.add(note);
  return note;
}

export async function getNotes(): Promise<Note[]> {
  const rows = (await db.notes.toArray()).map(normalizeNote);
  return rows.sort((a, b) => {
    const au = a.updatedAt.getTime();
    const bu = b.updatedAt.getTime();
    if (au !== bu) {
      return bu - au;
    }
    const ac = a.createdAt.getTime();
    const bc = b.createdAt.getTime();
    if (ac !== bc) {
      return bc - ac;
    }
    return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
  });
}

export async function updateNote(
  id: string,
  updates: Partial<Pick<Note, "title" | "body">>,
): Promise<Note | undefined> {
  const raw = await db.notes.get(id);
  if (!raw) {
    return undefined;
  }
  const existing = normalizeNote(raw);
  const now = new Date();
  const next: Note = {
    ...existing,
    title:
      updates.title !== undefined ? updates.title.trim() : existing.title,
    body: updates.body !== undefined ? updates.body : existing.body,
    updatedAt: now,
  };
  await db.notes.put(next);
  return next;
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

/**
 * Used by tests to reset state; not part of the public facade contract.
 */
export async function clearAllNotesForTests(): Promise<void> {
  await db.notes.clear();
}

/** Bulk-put notes for integration-style tests. */
export async function seedNotesForTests(notes: Note[]): Promise<void> {
  await db.notes.bulkPut(notes);
}

/** Re-export Dexie db for benchmarks and advanced scenarios. */
export { db };
