import {
  clearAllNotesForTests,
  createNote,
  deleteNote,
  getNotes,
  seedNotesForTests,
  updateNote,
} from "@/storage/IndexedDBService";
import type { Note } from "@/models/Note";

describe("IndexedDBService", () => {
  beforeEach(async () => {
    await clearAllNotesForTests();
  });

  it("createNote persists and getNotes returns newest first", async () => {
    const n1 = await createNote({ title: " First ", body: "a" });
    expect(n1.title).toBe("First");

    const n2 = await createNote({ title: "Second", body: "b" });
    const list = await getNotes();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(n2.id);
    expect(list[1].id).toBe(n1.id);
  });

  it("updateNote returns undefined when id missing", async () => {
    const result = await updateNote("missing-id", { title: "x" });
    expect(result).toBeUndefined();
  });

  it("updateNote trims title and bumps updatedAt", async () => {
    const created = await createNote({ title: "T", body: "body" });
    const updated = await updateNote(created.id, {
      title: "  New ",
      body: "next",
    });
    expect(updated?.title).toBe("New");
    expect(updated?.body).toBe("next");
    expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(
      created.updatedAt.getTime(),
    );
    const list = await getNotes();
    expect(list[0].title).toBe("New");
  });

  it("deleteNote removes note", async () => {
    const n = await createNote({ title: "Del", body: "" });
    await deleteNote(n.id);
    expect(await getNotes()).toHaveLength(0);
  });

  it("seedNotesForTests preloads rows", async () => {
    const d = new Date("2026-01-01T00:00:00.000Z");
    const batch: Note[] = [
      {
        id: "seed-1",
        title: "S1",
        body: "",
        createdAt: d,
        updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      },
    ];
    await seedNotesForTests(batch);
    const notes = await getNotes();
    expect(notes.some((x) => x.id === "seed-1")).toBe(true);
  });
});
