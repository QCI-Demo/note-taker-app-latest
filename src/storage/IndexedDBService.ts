import Dexie, { type Table } from "dexie";
import type { Note } from "@/models/Note";

/**
 * Dexie database for local notes. Version bumps add migration hooks for future schema changes.
 */
class NoteTakerDatabase extends Dexie {
  notes!: Table<Note>;

  constructor() {
    super("NoteTakerDB");
    this.version(1).stores({
      notes: "id, title, createdAt, updatedAt",
    });
  }
}

/** Exported Dexie instance for advanced use (e.g. hooks, migrations). */
export const db = new NoteTakerDatabase();

function logStorageError(context: string, error: unknown): void {
  console.error(`[NoteStorage] ${context}`, error);
}

function assertNonEmptyString(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Note.${field} must be a non-empty string`);
  }
}

function assertString(value: string, field: string): void {
  if (typeof value !== "string") {
    throw new TypeError(`Note.${field} must be a string`);
  }
}

function assertDate(value: Date, field: string): void {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new TypeError(`Note.${field} must be a valid Date`);
  }
}

function validateNote(note: Note): void {
  assertNonEmptyString(note.id, "id");
  assertString(note.title, "title");
  assertString(note.body, "body");
  assertDate(note.createdAt, "createdAt");
  assertDate(note.updatedAt, "updatedAt");
}

function validateId(id: string): void {
  assertNonEmptyString(id, "id");
}

/** In-memory fallback when IndexedDB is missing or operations fail. */
export class InMemoryStore {
  private readonly notes = new Map<string, Note>();

  async createNote(note: Note): Promise<void> {
    validateNote(note);
    if (this.notes.has(note.id)) {
      throw new Error(`A note with id "${note.id}" already exists`);
    }
    this.notes.set(note.id, { ...note });
  }

  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }

  async updateNote(id: string, changes: Partial<Note>): Promise<number> {
    validateId(id);
    const existing = this.notes.get(id);
    if (!existing) {
      return 0;
    }
    const next: Note = { ...existing, ...changes, id };
    validateNote(next);
    this.notes.set(id, next);
    return 1;
  }

  async deleteNote(id: string): Promise<void> {
    validateId(id);
    this.notes.delete(id);
  }
}

type StorageBackend = {
  createNote(note: Note): Promise<void>;
  getNotes(): Promise<Note[]>;
  updateNote(id: string, changes: Partial<Note>): Promise<number>;
  deleteNote(id: string): Promise<void>;
};

const memoryStore = new InMemoryStore();

const dexieBackend: StorageBackend = {
  async createNote(note: Note): Promise<void> {
    validateNote(note);
    await db.notes.add(note);
  },
  async getNotes(): Promise<Note[]> {
    return db.notes.toArray();
  },
  async updateNote(id: string, changes: Partial<Note>): Promise<number> {
    validateId(id);
    return db.notes.update(id, changes);
  },
  async deleteNote(id: string): Promise<void> {
    validateId(id);
    await db.notes.delete(id);
  },
};

function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

let useDexie = isIndexedDbAvailable();

async function withFallback<T>(
  operation: string,
  fn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
): Promise<T> {
  try {
    if (!useDexie) {
      return await fallbackFn();
    }
    return await fn();
  } catch (error) {
    logStorageError(operation, error);
    useDexie = false;
    return await fallbackFn();
  }
}

export async function createNote(note: Note): Promise<void> {
  return withFallback(
    "createNote",
    () => dexieBackend.createNote(note),
    () => memoryStore.createNote(note),
  );
}

export async function getNotes(): Promise<Note[]> {
  return withFallback(
    "getNotes",
    () => dexieBackend.getNotes(),
    () => memoryStore.getNotes(),
  );
}

export async function updateNote(
  id: string,
  changes: Partial<Note>,
): Promise<number> {
  return withFallback(
    "updateNote",
    () => dexieBackend.updateNote(id, changes),
    () => memoryStore.updateNote(id, changes),
  );
}

export async function deleteNote(id: string): Promise<void> {
  return withFallback(
    "deleteNote",
    () => dexieBackend.deleteNote(id),
    () => memoryStore.deleteNote(id),
  );
}

/** Unified API: same functions as named exports; use this for UI integration. */
export const noteStorage = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} as const;
