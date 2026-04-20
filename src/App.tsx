import { useState } from "react";
import { NoteEditInline } from "@/components/NoteEditInline";
import { useNotesStore } from "@/store/notesStore";

export function App() {
  const notes = useNotesStore((s) => s.notes);
  const updateNote = useNotesStore((s) => s.updateNote);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="app">
      <h1>Notes</h1>
      <ul className="note-list">
        {notes.map((note) => (
          <li key={note.id} className="note-card" data-note-id={note.id}>
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
              <div className="note-card__header">
                <div>
                  <h2 className="note-card__title">{note.title}</h2>
                  <p className="note-card__body">{note.body}</p>
                </div>
                <button
                  type="button"
                  className="icon-button"
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
    </div>
  );
}
