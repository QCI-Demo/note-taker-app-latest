/**
 * Performance check: 100 synthetic notes — insert and read must each finish within 100ms.
 * Uses fake-indexeddb so the script runs in Node without a browser.
 */
import "fake-indexeddb/auto";

import { performance } from "node:perf_hooks";

import type { Note } from "../src/models/Note";
import { createNote, getNotes, db } from "../src/storage/IndexedDBService";

const BUDGET_MS = 100;
const COUNT = 100;

function randomText(len: number): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function makeNote(i: number): Note {
  const t = new Date(Date.UTC(2026, 0, 1, 0, 0, i));
  return {
    id: globalThis.crypto.randomUUID(),
    title: `Bench ${i} ${randomText(12)}`,
    body: randomText(80),
    createdAt: t,
    updatedAt: t,
  };
}

async function main(): Promise<void> {
  await db.delete();
  await db.open();

  const notes = Array.from({ length: COUNT }, (_, i) => makeNote(i));

  const insertStart = performance.now();
  await Promise.all(notes.map((n) => createNote(n)));
  const insertMs = performance.now() - insertStart;

  const readStart = performance.now();
  const loaded = await getNotes();
  const readMs = performance.now() - readStart;

  console.log(`Insert ${COUNT} notes: ${insertMs.toFixed(2)} ms`);
  console.log(`Read all notes:   ${readMs.toFixed(2)} ms (got ${loaded.length})`);

  const failed: string[] = [];
  if (insertMs > BUDGET_MS) {
    failed.push(`insert ${insertMs.toFixed(2)} ms > ${BUDGET_MS} ms`);
  }
  if (readMs > BUDGET_MS) {
    failed.push(`read ${readMs.toFixed(2)} ms > ${BUDGET_MS} ms`);
  }

  if (failed.length > 0) {
    console.error("Benchmark failed:", failed.join("; "));
    process.exitCode = 1;
  } else {
    console.log("Benchmark passed (within budget).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
