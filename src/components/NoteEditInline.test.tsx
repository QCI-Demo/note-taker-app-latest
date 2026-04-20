import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "@/App";
import { NoteEditInline } from "@/components/NoteEditInline";
import { useNotesStore } from "@/store/notesStore";

describe("NoteEditInline", () => {
  beforeEach(() => {
    useNotesStore.setState({
      notes: [
        { id: "test-note-1", title: "Original title", body: "Original body" },
      ],
    });
  });

  it("renders title and body fields for the note", () => {
    render(
      <NoteEditInline
        note={{ id: "x", title: "Hello", body: "World" }}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByLabelText("Note title")).toHaveValue("Hello");
    expect(screen.getByLabelText("Note body")).toHaveValue("World");
  });

  it("focuses the title input on mount", () => {
    render(
      <NoteEditInline
        note={{ id: "x", title: "Hello", body: "World" }}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByTestId("note-edit-title")).toHaveFocus();
  });

  it("dispatches merged update on Save via App and store", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("edit-note-test-note-1"));
    await user.clear(screen.getByTestId("note-edit-title"));
    await user.type(screen.getByTestId("note-edit-title"), "Updated title");
    await user.click(screen.getByTestId("note-edit-save"));

    const note = useNotesStore.getState().notes.find((n) => n.id === "test-note-1");
    expect(note?.title).toBe("Updated title");
    expect(note?.body).toBe("Original body");
  });

  it("leaves store unchanged on Cancel", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("edit-note-test-note-1"));
    await user.clear(screen.getByTestId("note-edit-title"));
    await user.type(screen.getByTestId("note-edit-title"), "Draft title");
    await user.click(screen.getByTestId("note-edit-cancel"));

    const note = useNotesStore.getState().notes.find((n) => n.id === "test-note-1");
    expect(note?.title).toBe("Original title");
    expect(note?.body).toBe("Original body");
  });

  it("announces save and cancel via polite live region", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    const onCancel = jest.fn();
    const { container } = render(
      <NoteEditInline
        note={{ id: "x", title: "T", body: "B" }}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toBeTruthy();

    await user.click(screen.getByTestId("note-edit-save"));
    expect(onSave).toHaveBeenCalled();
    await waitFor(() => {
      expect(live?.textContent).toMatch(/saved/i);
    });

    await user.click(screen.getByTestId("note-edit-cancel"));
    await waitFor(() => {
      expect(live?.textContent).toMatch(/cancelled/i);
    });
    expect(onCancel).toHaveBeenCalled();
  });

  it("saves on Enter in title field", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    render(
      <NoteEditInline
        note={{ id: "x", title: "T", body: "B" }}
        onSave={onSave}
        onCancel={jest.fn()}
      />
    );
    await user.clear(screen.getByTestId("note-edit-title"));
    await user.type(screen.getByTestId("note-edit-title"), "New{Enter}");
    expect(onSave).toHaveBeenCalledWith({ title: "New", body: "B" });
  });

  it("cancels on Escape", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(
      <NoteEditInline
        note={{ id: "x", title: "T", body: "B" }}
        onSave={jest.fn()}
        onCancel={onCancel}
      />
    );
    await user.type(screen.getByTestId("note-edit-title"), "{Escape}");
    expect(onCancel).toHaveBeenCalled();
  });
});
