import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteEditInline } from "@/components/NoteEditInline";
import { useNotesStore } from "@/stores/notesStore";
import type { Note } from "@/types/note";

const sampleNote: Note = {
  id: "test-note-1",
  title: "Original title",
  body: "Original body",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function StoreBackedEdit({ noteId }: { noteId: string }) {
  const note = useNotesStore((s) => s.notes.find((n) => n.id === noteId));
  const updateNote = useNotesStore((s) => s.updateNote);
  if (!note) {
    return null;
  }
  return (
    <NoteEditInline
      note={note}
      onSave={(title, body) => {
        updateNote(note.id, { title, body });
      }}
      onCancel={() => {}}
    />
  );
}

beforeEach(() => {
  useNotesStore.setState({ notes: [] });
});

describe("NoteEditInline", () => {
  it("renders note title and body in view mode", () => {
    render(<NoteEditInline note={sampleNote} onSave={() => {}} onCancel={() => {}} />);

    expect(screen.getByText("Original title")).toBeInTheDocument();
    expect(screen.getByText("Original body")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit note/i })).toBeInTheDocument();
  });

  it("dispatches update on Save and announces status", async () => {
    const user = userEvent.setup();
    useNotesStore.setState({ notes: [sampleNote] });

    render(<StoreBackedEdit noteId={sampleNote.id} />);

    await user.click(screen.getByRole("button", { name: /edit note/i }));
    const titleInput = screen.getByRole("textbox", { name: /note title/i });
    await user.clear(titleInput);
    await user.type(titleInput, "Updated title");
    await user.click(screen.getByTestId("note-edit-save"));

    await waitFor(() => {
      expect(useNotesStore.getState().notes[0].title).toBe("Updated title");
    });
    expect(useNotesStore.getState().notes[0].body).toBe("Original body");

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(/note saved/i);
  });

  it("does not update store on Cancel and restores display", async () => {
    const user = userEvent.setup();
    useNotesStore.setState({ notes: [sampleNote] });

    render(<StoreBackedEdit noteId={sampleNote.id} />);

    await user.click(screen.getByRole("button", { name: /edit note/i }));
    const titleInput = screen.getByRole("textbox", { name: /note title/i });
    await user.clear(titleInput);
    await user.type(titleInput, "Should revert");
    await user.click(screen.getByTestId("note-edit-cancel"));

    expect(useNotesStore.getState().notes[0]).toMatchObject({
      title: "Original title",
      body: "Original body",
    });
    expect(screen.getByText("Original title")).toBeInTheDocument();

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(/edit cancelled/i);
  });

  it("cancels on Escape from title field", async () => {
    const user = userEvent.setup();
    useNotesStore.setState({ notes: [sampleNote] });

    render(<StoreBackedEdit noteId={sampleNote.id} />);

    await user.click(screen.getByRole("button", { name: /edit note/i }));
    await user.clear(screen.getByRole("textbox", { name: /note title/i }));
    await user.type(screen.getByRole("textbox", { name: /note title/i }), "X");
    await user.keyboard("{Escape}");

    expect(useNotesStore.getState().notes[0].title).toBe("Original title");
  });

  it("saves on Enter in title field", async () => {
    const user = userEvent.setup();
    useNotesStore.setState({ notes: [sampleNote] });

    render(<StoreBackedEdit noteId={sampleNote.id} />);

    await user.click(screen.getByRole("button", { name: /edit note/i }));
    const titleInput = screen.getByRole("textbox", { name: /note title/i });
    await user.clear(titleInput);
    await user.type(titleInput, "Enter save{enter}");

    await waitFor(() => {
      expect(useNotesStore.getState().notes[0].title).toBe("Enter save");
    });
  });
});
