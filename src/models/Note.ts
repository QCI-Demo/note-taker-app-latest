/**
 * Plain-text note as stored locally and shown in the UI.
 */
export interface Note {
  /** Stable unique identifier (UUID). */
  id: string;
  /** Short label for the note. */
  title: string;
  /** Full note content. */
  body: string;
  /** When the note was first created. */
  createdAt: Date;
  /** When the note was last modified. */
  updatedAt: Date;
}
