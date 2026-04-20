import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useNotesStore } from "@/stores/notesStore";
import styles from "./CreateNoteModal.module.css";

export interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

type FormValues = {
  title: string;
  body: string;
};

export function CreateNoteModal({
  isOpen,
  onClose,
  onCreated,
}: CreateNoteModalProps) {
  const titleHeadingId = useId();
  const dialogDescriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const addNote = useNotesStore((s) => s.addNote);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    trigger,
  } = useForm<FormValues>({
    defaultValues: { title: "", body: "" },
    mode: "onSubmit",
  });

  const titleRegister = register("title", {
    validate: (value) => {
      const t = value.trim();
      if (!t) {
        return "Title is required.";
      }
      return true;
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    previousActiveElement.current = document.activeElement as HTMLElement;

    const titleInput = document.getElementById(
      "create-note-title",
    ) as HTMLInputElement | null;
    titleInput?.focus();

    const getFocusable = (root: HTMLElement): HTMLElement[] => {
      const selector = [
        "button:not([disabled])",
        'a[href]:not([tabindex="-1"])',
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(", ");
      return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !el.hasAttribute("hidden"),
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = getFocusable(dialogRef.current);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !dialogRef.current.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      previousActiveElement.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const onSubmit = handleSubmit((values) => {
    addNote({
      title: values.title.trim(),
      body: values.body,
    });
    reset();
    onCreated?.();
    onClose();
  });

  const modal = (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleHeadingId}
        aria-describedby={dialogDescriptionId}
        tabIndex={-1}
        data-testid="create-note-modal"
      >
        <p id={dialogDescriptionId} className={styles.srOnly}>
          Create a new plain-text note. The title is required.
        </p>
        <div className={styles.header}>
          <h2 id={titleHeadingId} className={styles.heading}>
            New note
          </h2>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="create-note-title" className={styles.label}>
              Title
            </label>
            <input
              id="create-note-title"
              type="text"
              className={styles.input}
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby={
                errors.title ? "create-note-title-error" : undefined
              }
              autoComplete="off"
              {...titleRegister}
              onBlur={async (e) => {
                titleRegister.onBlur(e);
                await trigger("title");
              }}
            />
            {errors.title?.message ? (
              <p
                id="create-note-title-error"
                role="alert"
                className={styles.error}
              >
                {errors.title.message}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="create-note-body" className={styles.label}>
              Body
            </label>
            <textarea
              id="create-note-body"
              className={styles.textarea}
              rows={5}
              autoComplete="off"
              {...register("body")}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primary}
              data-testid="create-note-submit"
            >
              Create note
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
