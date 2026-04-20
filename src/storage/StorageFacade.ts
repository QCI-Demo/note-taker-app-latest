import * as IndexedDBService from "@/storage/IndexedDBService";
import * as SQLiteService from "@/storage/SQLiteService";
import { sharedInMemoryStore } from "@/storage/memoryStore";
import {
  type StorageBackendKind,
  resolveStorageBackendKind as resolveBackend,
} from "@/storage/storagePlatform";
import type { CreateNoteInput } from "@/storage/IndexedDBService";
import type { Note } from "@/models/Note";

export type { StorageBackendKind } from "@/storage/storagePlatform";

/**
 * Selects IndexedDB on web, SQLite placeholder on native, in-memory otherwise.
 */
export function resolveStorageBackendKind(): StorageBackendKind {
  return resolveBackend();
}

type StorageApi = {
  createNote: (input: CreateNoteInput) => Promise<Note>;
  getNotes: () => Promise<Note[]>;
  updateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "body">>,
  ) => Promise<Note | undefined>;
  deleteNote: (id: string) => Promise<void>;
};

function createApi(kind: StorageBackendKind): StorageApi {
  if (kind === "sqlite") {
    return {
      createNote: SQLiteService.createNote,
      getNotes: SQLiteService.getNotes,
      updateNote: SQLiteService.updateNote,
      deleteNote: SQLiteService.deleteNote,
    };
  }
  if (kind === "memory") {
    return {
      createNote: (input) => sharedInMemoryStore.createNote(input),
      getNotes: () => sharedInMemoryStore.getNotes(),
      updateNote: (id, updates) =>
        sharedInMemoryStore.updateNote(id, updates),
      deleteNote: (id) => sharedInMemoryStore.deleteNote(id),
    };
  }
  return {
    createNote: IndexedDBService.createNote,
    getNotes: IndexedDBService.getNotes,
    updateNote: IndexedDBService.updateNote,
    deleteNote: IndexedDBService.deleteNote,
  };
}

export const storageBackendKind: StorageBackendKind =
  resolveStorageBackendKind();

const implementation = createApi(storageBackendKind);

/**
 * Unified storage entry: delegates to IndexedDB, SQLite (placeholder), or memory.
 */
export const storage: StorageApi = {
  createNote: (input) => implementation.createNote(input),
  getNotes: () => implementation.getNotes(),
  updateNote: (id, updates) => implementation.updateNote(id, updates),
  deleteNote: (id) => implementation.deleteNote(id),
};
