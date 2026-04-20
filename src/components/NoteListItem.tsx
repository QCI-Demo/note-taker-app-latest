import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { NoteEditInline } from "@/components/NoteEditInline";
import type { Note } from "@/types/note";
import { useNotesStore } from "@/stores/notesStore";
import styles from "./NotesApp.module.css";

export interface NoteListItemProps {
  note: Note;
  isEditing: boolean;
  onEditingChange: (id: string | null) => void;
}

export function NoteListItem({
  note,
  isEditing,
  onEditingChange,
}: NoteListItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  const message = `Delete "${note.title}"? This cannot be undone.`;

  if (isEditing) {
    return (
      <NoteEditInline
        note={note}
        onSave={(updated) => {
          updateNote(note.id, updated);
          onEditingChange(null);
        }}
        onCancel={() => onEditingChange(null)}
      />
    );
  }

  return (
    <>
      <div className={styles.noteRow}>
        <div className={styles.noteContent}>
          <span className={styles.noteTitle}>{note.title}</span>
          {note.body ? (
            <span className={styles.notePreview}>{note.body}</span>
          ) : null}
        </div>
        <div className={styles.noteRowActions}>
          <button
            type="button"
            className={styles.deleteButton}
            aria-label="Delete note"
            data-testid="note-delete-open"
            onClick={() => setConfirmOpen(true)}
          >
            🗑
          </button>
          <button
            type="button"
            className={styles.iconButton}
            data-testid={`edit-note-${note.id}`}
            aria-label={`Edit note: ${note.title}`}
            onClick={() => onEditingChange(note.id)}
          >
            ✎
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={confirmOpen}
        message={message}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteNote(note.id);
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
