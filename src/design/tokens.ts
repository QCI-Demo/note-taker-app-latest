/**
 * Design tokens — spacing, colors, typography aligned with product mock-ups.
 */
export const tokens = {
  color: {
    surface: "#ffffff",
    surfaceAlt: "#f4f4f6",
    border: "#d4d4d8",
    text: "#18181b",
    textMuted: "#52525b",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    danger: "#dc2626",
    focusRing: "#2563eb",
  },
  space: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
  },
  font: {
    family:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    sizeSm: "0.875rem",
    sizeMd: "1rem",
    sizeLg: "1.25rem",
    weightNormal: 400,
    weightSemibold: 600,
  },
  shadow: {
    modal: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
} as const;
