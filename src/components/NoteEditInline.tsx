import { useEffect, useId, useRef, useState } from "react";
import type { Note } from "@/store/notesStore";

export type NoteEditInlineProps = {
  note: Note;
  onSave: (updated: Pick<Note, "title" | "body">) => void;
  onCancel: () => void;
};

export function NoteEditInline({ note, onSave, onCancel }: NoteEditInlineProps) {
  const groupLabelId = useId();
  const titleId = useId();
  const bodyId = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setTitle(note.title);
    setBody(note.body);
  }, [note.id, note.title, note.body]);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const announce = (message: string) => {
    setStatusMessage("");
    requestAnimationFrame(() => setStatusMessage(message));
  };

  const handleSave = () => {
    onSave({ title: title.trim(), body });
    announce("Note saved.");
  };

  const handleCancel = () => {
    setTitle(note.title);
    setBody(note.body);
    announce("Edit cancelled. Changes discarded.");
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
      return;
    }
    const isTitle = e.target === titleRef.current;
    const isBody = e.target instanceof HTMLTextAreaElement;
    if (e.key === "Enter") {
      if (isTitle && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
      if (isBody && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    }
  };

  return (
    <div
      className="note-edit-inline"
      role="group"
      aria-labelledby={groupLabelId}
      onKeyDown={handleKeyDown}
    >
      <h2 id={groupLabelId} className="sr-only">
        Edit note
      </h2>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>
      <label htmlFor={titleId} className="sr-only">
        Note title
      </label>
      <input
        ref={titleRef}
        id={titleId}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Note title"
        data-testid="note-edit-title"
        className="note-edit-inline__title"
      />
      <label htmlFor={bodyId} className="sr-only">
        Note body
      </label>
      <textarea
        id={bodyId}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        aria-label="Note body"
        data-testid="note-edit-body"
        rows={4}
        className="note-edit-inline__body"
      />
      <div className="note-edit-inline__actions">
        <button
          type="button"
          onClick={handleSave}
          aria-label="Save note changes"
          data-testid="note-edit-save"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Cancel editing note"
          data-testid="note-edit-cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
