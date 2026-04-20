import Dexie, { type EntityTable } from "dexie";
import type { Note } from "@/models/Note";

export class NotesDatabase extends Dexie {
  notes!: EntityTable<Note, "id">;

  constructor() {
    const name =
      typeof process !== "undefined" && process.env.JEST_WORKER_ID
        ? `note-taker-notes-jest-${process.env.JEST_WORKER_ID}`
        : "note-taker-notes";
    super(name);
    this.version(1).stores({
      notes: "id, updatedAt",
    });
  }
}

export const db = new NotesDatabase();
