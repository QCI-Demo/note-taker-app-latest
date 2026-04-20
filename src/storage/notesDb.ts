import Dexie, { type EntityTable } from "dexie";
import type { Note } from "@/models/Note";

export class NotesDatabase extends Dexie {
  notes!: EntityTable<Note, "id">;

  constructor() {
    super("note-taker-notes");
    this.version(1).stores({
      notes: "id, updatedAt",
    });
  }
}

export const db = new NotesDatabase();
