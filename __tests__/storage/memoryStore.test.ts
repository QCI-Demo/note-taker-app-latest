import { InMemoryNoteStore } from "@/storage/memoryStore";

describe("InMemoryNoteStore", () => {
  it("CRUD round-trip", async () => {
    const store = new InMemoryNoteStore();
    const a = await store.createNote({ title: " A ", body: "x" });
    expect(a.title).toBe("A");
    const list = await store.getNotes();
    expect(list).toHaveLength(1);

    const u = await store.updateNote(a.id, { title: " B " });
    expect(u?.title).toBe("B");

    await store.deleteNote(a.id);
    expect(await store.getNotes()).toHaveLength(0);
  });

  it("updateNote returns undefined for unknown id", async () => {
    const store = new InMemoryNoteStore();
    expect(await store.updateNote("nope", { title: "x" })).toBeUndefined();
  });

  it("replaceAll and clear", async () => {
    const store = new InMemoryNoteStore();
    const d = new Date("2026-01-01T00:00:00.000Z");
    store.replaceAll([
      {
        id: "1",
        title: "T",
        body: "",
        createdAt: d,
        updatedAt: d,
      },
    ]);
    expect(await store.getNotes()).toHaveLength(1);
    store.clear();
    expect(await store.getNotes()).toHaveLength(0);
  });
});
