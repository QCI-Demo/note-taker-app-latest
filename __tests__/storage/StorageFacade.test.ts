import { resolveStorageBackendKind } from "@/storage/storagePlatform";

describe("storage platform resolution", () => {
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;
  const originalIndexedDB = globalThis.indexedDB;
  const originalPlatform = process.env.PLATFORM;
  const originalCap: unknown = Reflect.get(globalThis, "Capacitor");

  afterEach(() => {
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow;
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
    if (originalNavigator !== undefined) {
      globalThis.navigator = originalNavigator;
    } else {
      Reflect.deleteProperty(globalThis, "navigator");
    }
    if (originalIndexedDB !== undefined) {
      globalThis.indexedDB = originalIndexedDB;
    } else {
      Reflect.deleteProperty(globalThis, "indexedDB");
    }
    if (originalPlatform !== undefined) {
      process.env.PLATFORM = originalPlatform;
    } else {
      Reflect.deleteProperty(process.env, "PLATFORM");
    }
    if (originalCap !== undefined) {
      Reflect.set(globalThis, "Capacitor", originalCap);
    } else {
      Reflect.deleteProperty(globalThis, "Capacitor");
    }
  });

  it("selects sqlite when process.env.PLATFORM is native", () => {
    process.env.PLATFORM = "native";
    expect(resolveStorageBackendKind()).toBe("sqlite");
  });

  it("selects sqlite when window.Capacitor is set", () => {
    Object.defineProperty(globalThis, "window", {
      value: { Capacitor: {} },
      configurable: true,
      writable: true,
    });
    Reflect.deleteProperty(globalThis, "Capacitor");
    globalThis.indexedDB = originalIndexedDB;
    expect(resolveStorageBackendKind()).toBe("sqlite");
  });

  it("selects indexeddb when web and IndexedDB is available", () => {
    process.env.PLATFORM = "";
    Object.defineProperty(globalThis, "window", {
      value: {},
      configurable: true,
      writable: true,
    });
    globalThis.indexedDB = originalIndexedDB;
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0" },
      configurable: true,
      writable: true,
    });
    expect(resolveStorageBackendKind()).toBe("indexeddb");
  });

  it("selects memory when IndexedDB is missing", () => {
    process.env.PLATFORM = "";
    Reflect.deleteProperty(globalThis, "indexedDB");
    Object.defineProperty(globalThis, "window", {
      value: {},
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0" },
      configurable: true,
      writable: true,
    });
    expect(resolveStorageBackendKind()).toBe("memory");
  });

  it("maps ANDROID platform to sqlite", () => {
    process.env.PLATFORM = "ANDROID";
    expect(resolveStorageBackendKind()).toBe("sqlite");
  });
});
