import { useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "@/utils/debounce";
import styles from "./NoteSearchBar.module.css";

const DEFAULT_DEBOUNCE_MS = 300;

export interface NoteSearchBarProps {
  /** Called after input has been stable for {@link debounceMs}. */
  onDebouncedChange: (query: string) => void;
  debounceMs?: number;
}

export function NoteSearchBar({
  onDebouncedChange,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: NoteSearchBarProps) {
  const [inputValue, setInputValue] = useState("");
  const onDebouncedChangeRef = useRef(onDebouncedChange);
  onDebouncedChangeRef.current = onDebouncedChange;

  const debouncedNotify = useMemo(
    () =>
      debounce((q: string) => {
        onDebouncedChangeRef.current(q);
      }, debounceMs),
    [debounceMs],
  );

  useEffect(() => {
    return () => debouncedNotify.cancel();
  }, [debouncedNotify]);

  const handleChange = (value: string) => {
    setInputValue(value);
    debouncedNotify(value);
  };

  const handleClear = () => {
    debouncedNotify.cancel();
    setInputValue("");
    onDebouncedChangeRef.current("");
  };

  const showClear = inputValue.length > 0;

  return (
    <div className={styles.search} role="search">
      <div className={styles.wrapper}>
        <input
          id="note-search-input"
          className={styles.input}
          type="search"
          aria-label="Search notes"
          autoComplete="off"
          placeholder="Search notes…"
          value={inputValue}
          data-testid="note-search-input"
          onChange={(e) => handleChange(e.target.value)}
        />
        <button
          type="button"
          className={styles.clearButton}
          aria-label="Clear search"
          data-testid="note-search-clear"
          disabled={!showClear}
          onClick={handleClear}
        >
          ×
        </button>
      </div>
    </div>
  );
}
