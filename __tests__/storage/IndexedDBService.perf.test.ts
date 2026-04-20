import {
  clearAllNotesForTests,
  createNote,
  getNotes,
} from "@/storage/IndexedDBService";

describe("IndexedDBService performance (100 notes)", () => {
  beforeEach(async () => {
    await clearAllNotesForTests();
  });

  it("getNotes completes in under 100ms for 100 notes", async () => {
    for (let i = 0; i < 100; i += 1) {
      await createNote({ title: `Note ${i}`, body: "x" });
    }

    const t0 = performance.now();
    const list = await getNotes();
    const elapsed = performance.now() - t0;

    expect(list).toHaveLength(100);
    expect(elapsed).toBeLessThan(100);
  });
});
