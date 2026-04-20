import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteListItem } from "@/components/NoteListItem";
import { resetNotesStoreAndDb } from "@/test/resetNotesStore";
import { useNotesStore } from "@/stores/notesStore";
import type { Note } from "@/models/Note";

const sampleNote: Note = {
  id: "note-to-delete",
  title: "Deletable note",
  body: "Some body",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

beforeEach(async () => {
  await resetNotesStoreAndDb([sampleNote]);
});

describe("NoteListItem delete", () => {
  it("opens confirmation dialog when delete is clicked", async () => {
    const user = userEvent.setup();
    render(
      <NoteListItem
        note={sampleNote}
        isEditing={false}
        onEditingChange={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete note" }));

    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("alertdialog", { name: /delete "deletable note"/i }),
    ).toBeInTheDocument();
  });

  it("calls deleteNote and removes the note when confirmed", async () => {
    const user = userEvent.setup();
    const deleteNote = jest.spyOn(useNotesStore.getState(), "deleteNote");

    render(
      <NoteListItem
        note={sampleNote}
        isEditing={false}
        onEditingChange={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete note" }));
    await user.click(screen.getByTestId("confirm-dialog-confirm"));

    expect(deleteNote).toHaveBeenCalledWith(sampleNote.id);
    expect(useNotesStore.getState().notes).toHaveLength(0);

    deleteNote.mockRestore();
  });

  it("closes dialog without deleting when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(
      <NoteListItem
        note={sampleNote}
        isEditing={false}
        onEditingChange={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete note" }));
    await user.click(screen.getByTestId("confirm-dialog-cancel"));

    expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
    expect(useNotesStore.getState().notes).toHaveLength(1);
  });

  it("traps focus inside the dialog while open", async () => {
    const user = userEvent.setup();
    render(
      <NoteListItem
        note={sampleNote}
        isEditing={false}
        onEditingChange={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete note" }));

    const cancel = screen.getByTestId("confirm-dialog-cancel");
    const confirm = screen.getByTestId("confirm-dialog-confirm");

    expect(cancel).toHaveFocus();

    await user.tab();
    expect(confirm).toHaveFocus();

    await user.tab();
    expect(cancel).toHaveFocus();
  });
});
