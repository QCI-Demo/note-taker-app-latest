import { sharedInMemoryStore } from "@/storage/memoryStore";

describe("StorageFacade with memory backend", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock("@/storage/storagePlatform", () => ({
      resolveStorageBackendKind: () => "memory" as const,
      readPlatformEnv: () => undefined,
    }));
    sharedInMemoryStore.clear();
  });

  afterEach(() => {
    jest.dontMock("@/storage/storagePlatform");
    jest.resetModules();
  });

  it("delegates CRUD to shared in-memory store", async () => {
    const { storage } = await import("@/storage/StorageFacade");
    const created = await storage.createNote({ title: " Mem ", body: "x" });
    expect(created.title).toBe("Mem");

    const all = await storage.getNotes();
    expect(all.some((n) => n.id === created.id)).toBe(true);

    const upd = await storage.updateNote(created.id, { title: "Next" });
    expect(upd?.title).toBe("Next");

    await storage.deleteNote(created.id);
    expect((await storage.getNotes()).find((n) => n.id === created.id)).toBe(
      undefined,
    );
  });
});
