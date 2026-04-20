import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateNoteModal } from "@/components/CreateNoteModal";
import { resetNotesStoreAndDb } from "@/test/resetNotesStore";
import { useNotesStore } from "@/stores/notesStore";

beforeEach(async () => {
  await resetNotesStoreAndDb([]);
});

describe("CreateNoteModal", () => {
  it("renders dialog and form fields when open", () => {
    render(
      <CreateNoteModal isOpen onClose={() => {}} />,
    );

    expect(screen.getByTestId("create-note-modal")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: /new note/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^body$/i)).toBeInTheDocument();
  });

  it("shows inline error for empty title on blur", async () => {
    const user = userEvent.setup();
    render(<CreateNoteModal isOpen onClose={() => {}} />);

    const title = screen.getByLabelText(/^title$/i);
    await user.click(title);
    await user.tab();
    await user.click(screen.getByLabelText(/^body$/i));

    expect(await screen.findByRole("alert")).toHaveTextContent(/title is required/i);
  });

  it("shows error on submit when title is whitespace only", async () => {
    const user = userEvent.setup();
    render(<CreateNoteModal isOpen onClose={() => {}} />);

    await user.type(screen.getByLabelText(/^title$/i), "   ");
    await user.click(screen.getByRole("button", { name: /create note/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/title is required/i);
    expect(useNotesStore.getState().notes).toHaveLength(0);
  });

  it("adds note to store on successful submit and calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<CreateNoteModal isOpen onClose={onClose} />);

    await user.type(screen.getByLabelText(/^title$/i), "  Hello title  ");
    await user.type(screen.getByLabelText(/^body$/i), "Body text");
    await user.click(screen.getByRole("button", { name: /create note/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());

    const notes = useNotesStore.getState().notes;
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({
      title: "Hello title",
      body: "Body text",
    });
    expect(notes[0].id).toMatch(
      /^([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|note-\d+-[a-z0-9]+)$/i,
    );
    expect(notes[0].createdAt).toBe(notes[0].updatedAt);
  });
});
