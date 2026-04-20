/**
 * Performance check: 100 synthetic notes — insert and read must each finish within 100ms.
 * Uses fake-indexeddb so the script runs in Node without a browser.
 */
import "fake-indexeddb/auto";

import { performance } from "node:perf_hooks";

import { createNote, getNotes, db } from "../src/storage/IndexedDBService";

const BUDGET_MS = 100;
const COUNT = 100;

function randomText(len: number): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function main(): Promise<void> {
  await db.delete();
  await db.open();

  const insertStart = performance.now();
  for (let i = 0; i < COUNT; i += 1) {
    await createNote({
      title: `Bench ${i} ${randomText(12)}`,
      body: randomText(80),
    });
  }
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
