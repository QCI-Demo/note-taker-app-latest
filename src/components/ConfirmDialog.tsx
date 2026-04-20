import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./ConfirmDialog.module.css";

export interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function getFocusable(root: HTMLElement): HTMLElement[] {
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
}

export function ConfirmDialog({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    previousActiveElement.current = document.activeElement as HTMLElement;

    const dialogEl = dialogRef.current;
    const focusable = dialogEl ? getFocusable(dialogEl) : [];
    (focusable[0] ?? dialogEl)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const nodes = getFocusable(dialogRef.current);
      if (nodes.length === 0) {
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
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
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const modal = (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        data-testid="confirm-dialog"
      >
        <div className={styles.body}>
          <p id={titleId} className={styles.message}>
            {message}
          </p>
          <p id={descriptionId} className={styles.srOnly}>
            Press Cancel to keep this note, or Delete to remove it permanently.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={onCancel}
              data-testid="confirm-dialog-cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.danger}
              onClick={onConfirm}
              data-testid="confirm-dialog-confirm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
