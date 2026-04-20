import { act, fireEvent, render, screen } from "@testing-library/react";
import { NotesApp } from "@/components/NotesApp";
import { resetNotesStoreAndDb } from "@/test/resetNotesStore";
import type { Note } from "@/models/Note";

const fixedDate = new Date("2026-01-01T00:00:00.000Z");

function makeNotes(count: number): Note[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `n-${i}`,
    title: `Note ${i}`,
    body: i % 10 === 0 ? `special-token-${i}` : `Body for ${i}`,
    createdAt: fixedDate,
    updatedAt: fixedDate,
  }));
}

describe("Note search (debounced filter)", () => {
  beforeEach(async () => {
    await resetNotesStoreAndDb(makeNotes(100));
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not filter until debounce elapses", () => {
    render(<NotesApp />);

    const input = screen.getByRole("searchbox", { name: "Search notes" });
    fireEvent.change(input, { target: { value: "special" } });

    expect(screen.getAllByRole("listitem")).toHaveLength(100);

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(screen.getAllByRole("listitem")).toHaveLength(100);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getAllByRole("listitem")).toHaveLength(10);
  });

  it("filters case-insensitively on title after debounce", () => {
    render(<NotesApp />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search notes" }), {
      target: { value: "NOTE 5" },
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(11);
    expect(screen.getByText("Note 5")).toBeInTheDocument();
    expect(screen.getByText("Note 50")).toBeInTheDocument();
  });

  it("clears filter when clear button is used", () => {
    render(<NotesApp />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search notes" }), {
      target: { value: "xyz" },
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.getByTestId("note-search-empty")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(100);
  });
});
