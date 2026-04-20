import { useState, type CSSProperties } from "react";
import { CreateNoteModal } from "@/components/CreateNoteModal";
import { NoteEditInline } from "@/components/NoteEditInline";
import { tokens } from "@/design/tokens";
import { useNotesStore } from "@/stores/notesStore";
import styles from "./NotesApp.module.css";

const tokenStyle: CSSProperties = {
  ["--color-surface" as string]: tokens.color.surface,
  ["--color-surface-alt" as string]: tokens.color.surfaceAlt,
  ["--color-border" as string]: tokens.color.border,
  ["--color-text" as string]: tokens.color.text,
  ["--color-text-muted" as string]: tokens.color.textMuted,
  ["--color-primary" as string]: tokens.color.primary,
  ["--color-primary-hover" as string]: tokens.color.primaryHover,
  ["--color-danger" as string]: tokens.color.danger,
  ["--color-focus-ring" as string]: tokens.color.focusRing,
  ["--space-xs" as string]: tokens.space.xs,
  ["--space-sm" as string]: tokens.space.sm,
  ["--space-md" as string]: tokens.space.md,
  ["--space-lg" as string]: tokens.space.lg,
  ["--space-xl" as string]: tokens.space.xl,
  ["--radius-sm" as string]: tokens.radius.sm,
  ["--radius-md" as string]: tokens.radius.md,
  ["--radius-lg" as string]: tokens.radius.lg,
  ["--font-family" as string]: tokens.font.family,
  ["--font-size-sm" as string]: tokens.font.sizeSm,
  ["--font-size-md" as string]: tokens.font.sizeMd,
  ["--font-size-lg" as string]: tokens.font.sizeLg,
  ["--font-weight-normal" as string]: String(tokens.font.weightNormal),
  ["--font-weight-semibold" as string]: String(tokens.font.weightSemibold),
  ["--shadow-modal" as string]: tokens.shadow.modal,
};

export function NotesApp() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const notes = useNotesStore((s) => s.notes);
  const updateNote = useNotesStore((s) => s.updateNote);

  return (
    <div className={styles.app} style={tokenStyle}>
      <header className={styles.header}>
        <h1 className={styles.title}>Notes</h1>
        <button
          type="button"
          className={styles.addButton}
          data-testid="add-note-button"
          onClick={() => setModalOpen(true)}
        >
          Add Note
        </button>
      </header>

      <main className={styles.main}>
        {notes.length === 0 ? (
          <p className={styles.empty}>No notes yet. Add your first note.</p>
        ) : (
          <ul className={styles.list} data-testid="note-list" aria-label="Notes">
            {notes.map((note) => (
              <li
                key={note.id}
                className={styles.listItem}
                data-note-id={note.id}
              >
                {editingId === note.id ? (
                  <NoteEditInline
                    note={note}
                    onSave={(updated) => {
                      updateNote(note.id, updated);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className={styles.noteRow}>
                    <div className={styles.noteContent}>
                      <span className={styles.noteTitle}>{note.title}</span>
                      {note.body ? (
                        <span className={styles.notePreview}>{note.body}</span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className={styles.iconButton}
                      data-testid={`edit-note-${note.id}`}
                      aria-label={`Edit note: ${note.title}`}
                      onClick={() => setEditingId(note.id)}
                    >
                      ✎
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <CreateNoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
