import {
  clearAllNotesForTests,
  seedNotesForTests,
} from "@/storage/IndexedDBService";
import { useNotesStore } from "@/stores/notesStore";
import type { Note } from "@/models/Note";

/**
 * Clears persisted notes and Zustand state. Use beforeEach in tests that touch storage.
 */
export async function resetNotesStoreAndDb(
  seed: Note[] | null = null,
): Promise<void> {
  await clearAllNotesForTests();
  useNotesStore.setState({ notes: [], isHydrating: false });
  if (seed?.length) {
    await seedNotesForTests(seed);
  }
  await useNotesStore.getState().hydrate();
}
