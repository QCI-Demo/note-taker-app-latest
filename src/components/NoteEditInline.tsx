import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { Note } from "@/types/note";
import styles from "./NoteEditInline.module.css";

export interface NoteEditInlineProps {
  note: Note;
  onSave: (title: string, body: string) => void;
  onCancel: () => void;
}

export function NoteEditInline({ note, onSave, onCancel }: NoteEditInlineProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [statusMessage, setStatusMessage] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();
  const statusId = useId();

  useEffect(() => {
    if (!editing) {
      setTitle(note.title);
      setBody(note.body);
    }
  }, [note.title, note.body, editing]);

  useEffect(() => {
    if (editing) {
      titleInputRef.current?.focus();
    }
  }, [editing]);

  const announce = (message: string) => {
    setStatusMessage(message);
  };

  const handleStartEdit = () => {
    setTitle(note.title);
    setBody(note.body);
    setEditing(true);
    announce("Edit mode. Title and body fields are available.");
  };

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      announce("Title is required. Enter a title before saving.");
      titleInputRef.current?.focus();
      return;
    }
    onSave(trimmed, body);
    setEditing(false);
    announce("Note saved.");
  };

  const handleCancel = () => {
    setTitle(note.title);
    setBody(note.body);
    setEditing(false);
    onCancel();
    announce("Edit cancelled. Changes discarded.");
    requestAnimationFrame(() => {
      editButtonRef.current?.focus();
    });
  };

  const onTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const onBodyKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (editing) {
    return (
      <div className={styles.card} data-testid="note-edit-inline">
        <p id={statusId} className={styles.srOnly}>
          Status updates for this note.
        </p>
        <div aria-live="polite" aria-atomic="true" className={styles.srOnly}>
          {statusMessage}
        </div>
        <form
          className={styles.editForm}
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className={styles.field}>
            <label htmlFor={titleId} className={styles.label}>
              Title
            </label>
            <input
              ref={titleInputRef}
              id={titleId}
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={onTitleKeyDown}
              aria-label="Note title"
              autoComplete="off"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor={bodyId} className={styles.label}>
              Body
            </label>
            <textarea
              id={bodyId}
              className={styles.textarea}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={onBodyKeyDown}
              aria-label="Note body"
              autoComplete="off"
              rows={5}
            />
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={handleCancel}
              aria-label="Cancel editing note"
              data-testid="note-edit-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primary}
              aria-label="Save note changes"
              data-testid="note-edit-save"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.card} data-testid="note-edit-inline">
      <p id={statusId} className={styles.srOnly}>
        Status updates for this note.
      </p>
      <div aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {statusMessage}
      </div>
      <div className={styles.viewRow}>
        <div className={styles.viewContent}>
          <span className={styles.noteTitle}>{note.title}</span>
          {note.body ? (
            <span className={styles.notePreview}>{note.body}</span>
          ) : null}
        </div>
        <button
          ref={editButtonRef}
          type="button"
          className={styles.iconButton}
          onClick={handleStartEdit}
          aria-label={`Edit note: ${note.title}`}
          data-testid="note-edit-open"
        >
          ✎
        </button>
      </div>
    </div>
  );
}
