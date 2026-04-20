import type { CreateNoteInput } from "@/storage/IndexedDBService";
import type { Note } from "@/models/Note";

function newNoteId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * In-process storage used when IndexedDB is unavailable (tests, SSR, etc.).
 */
export class InMemoryNoteStore {
  private byId = new Map<string, Note>();

  async createNote(input: CreateNoteInput): Promise<Note> {
    const now = new Date();
    const note: Note = {
      id: newNoteId(),
      title: input.title.trim(),
      body: input.body,
      createdAt: now,
      updatedAt: now,
    };
    this.byId.set(note.id, note);
    return note;
  }

  async getNotes(): Promise<Note[]> {
    return [...this.byId.values()].sort((a, b) => {
      const du = b.updatedAt.getTime() - a.updatedAt.getTime();
      if (du !== 0) {
        return du;
      }
      const dc = b.createdAt.getTime() - a.createdAt.getTime();
      if (dc !== 0) {
        return dc;
      }
      return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
    });
  }

  async updateNote(
    id: string,
    updates: Partial<Pick<Note, "title" | "body">>,
  ): Promise<Note | undefined> {
    const existing = this.byId.get(id);
    if (!existing) {
      return undefined;
    }
    const now = new Date();
    const next: Note = {
      ...existing,
      title:
        updates.title !== undefined ? updates.title.trim() : existing.title,
      body: updates.body !== undefined ? updates.body : existing.body,
      updatedAt: now,
    };
    this.byId.set(id, next);
    return next;
  }

  async deleteNote(id: string): Promise<void> {
    this.byId.delete(id);
  }

  /** Replace all notes (used by tests and dev tooling). */
  replaceAll(notes: Note[]): void {
    this.byId = new Map(notes.map((n) => [n.id, n]));
  }

  clear(): void {
    this.byId.clear();
  }
}

export const sharedInMemoryStore = new InMemoryNoteStore();
