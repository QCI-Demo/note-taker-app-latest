import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { Note } from "@/models/Note";
import styles from "./NoteEditInline.module.css";

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
    const trimmed = title.trim();
    if (!trimmed) {
      announce("Title is required. Enter a title before saving.");
      titleRef.current?.focus();
      return;
    }
    onSave({ title: trimmed, body });
    announce("Note saved.");
  };

  const handleCancel = () => {
    setTitle(note.title);
    setBody(note.body);
    announce("Edit cancelled. Changes discarded.");
    onCancel();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
      className={styles.card}
      data-testid="note-edit-inline"
      role="group"
      aria-labelledby={groupLabelId}
      onKeyDown={onKeyDown}
    >
      <h2 id={groupLabelId} className={styles.srOnly}>
        Edit note
      </h2>
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>
      <div className={styles.editForm}>
        <div className={styles.field}>
          <label htmlFor={titleId} className={styles.label}>
            Title
          </label>
          <input
            ref={titleRef}
            id={titleId}
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Note title"
            data-testid="note-edit-title"
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
            aria-label="Note body"
            data-testid="note-edit-body"
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
            type="button"
            className={styles.primary}
            onClick={handleSave}
            aria-label="Save note changes"
            data-testid="note-edit-save"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
