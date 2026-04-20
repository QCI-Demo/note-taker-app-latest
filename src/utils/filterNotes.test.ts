import { filterNotesByQuery } from "@/utils/filterNotes";
import type { Note } from "@/models/Note";

const fixedDate = new Date("2026-01-01T00:00:00.000Z");

const base: Omit<Note, "id"> = {
  title: "",
  body: "",
  createdAt: fixedDate,
  updatedAt: fixedDate,
};

function makeNote(id: string, title: string, body: string): Note {
  return { ...base, id, title, body };
}

describe("filterNotesByQuery", () => {
  it("matches title case-insensitively", () => {
    const notes = [
      makeNote("1", "Hello World", ""),
      makeNote("2", "Other", ""),
    ];
    expect(filterNotesByQuery(notes, "hello")).toEqual([notes[0]]);
  });

  it("matches body case-insensitively", () => {
    const notes = [makeNote("1", "T", "AlphaBeta"), makeNote("2", "T", "Gamma")];
    expect(filterNotesByQuery(notes, "ALPHABETA")).toEqual([notes[0]]);
  });

  it("returns all notes when query is empty or whitespace", () => {
    const notes = [makeNote("1", "A", "B"), makeNote("2", "C", "D")];
    expect(filterNotesByQuery(notes, "")).toEqual(notes);
    expect(filterNotesByQuery(notes, "   ")).toEqual(notes);
  });
});
