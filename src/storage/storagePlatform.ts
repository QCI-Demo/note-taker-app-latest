export type StorageBackendKind = "indexeddb" | "sqlite" | "memory";

function readPlatformEnv(): string | undefined {
  if (typeof process !== "undefined" && process.env?.PLATFORM) {
    return process.env.PLATFORM;
  }
  return undefined;
}

function hasCapacitorRuntime(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const w = window as Window & { Capacitor?: unknown; capacitor?: unknown };
  return Boolean(w.Capacitor ?? w.capacitor);
}

function userAgentSuggestsNativeShell(): boolean {
  if (typeof navigator === "undefined" || !navigator.userAgent) {
    return false;
  }
  return /Capacitor|Cordova|ionic/i.test(navigator.userAgent);
}

function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

/**
 * Pure platform resolution (no imports). Used by {@link StorageFacade} and unit tests.
 */
export function resolveStorageBackendKind(): StorageBackendKind {
  const platform = readPlatformEnv()?.toLowerCase();
  if (platform === "native" || platform === "ios" || platform === "android") {
    return "sqlite";
  }
  if (hasCapacitorRuntime() || userAgentSuggestsNativeShell()) {
    return "sqlite";
  }
  if (isIndexedDbAvailable()) {
    return "indexeddb";
  }
  return "memory";
}

export { readPlatformEnv };
