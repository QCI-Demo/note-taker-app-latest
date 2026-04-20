import * as SQLiteService from "@/storage/SQLiteService";

describe("SQLiteService (placeholder)", () => {
  it("createNote resolves with trimmed title", async () => {
    const n = await SQLiteService.createNote({
      title: "  Hi ",
      body: "b",
    });
    expect(n.title).toBe("Hi");
    expect(n.body).toBe("b");
    expect(n.id).toContain("sqlite-placeholder");
  });

  it("getNotes resolves to empty array", async () => {
    const list = await SQLiteService.getNotes();
    expect(list).toEqual([]);
  });

  it("updateNote resolves with trimmed title or undefined when id empty", async () => {
    const u = await SQLiteService.updateNote("id-1", { title: "  X " });
    expect(u?.title).toBe("X");
    const missing = await SQLiteService.updateNote("", { title: "x" });
    expect(missing).toBeUndefined();
  });

  it("deleteNote resolves", async () => {
    await expect(SQLiteService.deleteNote("any")).resolves.toBeUndefined();
  });
});
