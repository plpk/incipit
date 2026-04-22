// Central design tokens. Keep in sync with tailwind.config.ts and globals.css.

export const colors = {
  canvas: "#f7f7f5",
  surface: "#ffffff",
  brand: "#0d9488",
  brandAccent: "#06b6d4",

  ink: {
    900: "#1a1a2e",
    700: "#3f3f46",
    600: "#52525b",
    500: "#71717a",
    400: "#a1a1aa",
    300: "#d4d4d8",
  },

  entity: {
    person: { text: "#c2410c", bg: "#fff7ed", border: "#ffedd5" },
    place: { text: "#334155", bg: "#f1f5f9", border: "#e2e8f0" },
    organization: { text: "#92400e", bg: "#fffbeb", border: "#fef3c7" },
    other: { text: "#52525b", bg: "#f4f4f5", border: "#e4e4e7" },
  },

  status: {
    high: { text: "#059669", bg: "#ecfdf5" },
    medium: { text: "#d97706", bg: "#fffbeb" },
    low: { text: "#dc2626", bg: "#fef2f2" },
    unable: { text: "#a1a1aa", bg: "#f4f4f5" },
  },
} as const;

export const gradients = {
  brand: "linear-gradient(135deg, #0d9488, #06b6d4)",
  brandSoft:
    "linear-gradient(135deg, rgba(13,148,136,0.04), rgba(6,182,212,0.03))",
  brandBorder: "rgba(13,148,136,0.08)",
} as const;

export const shadows = {
  card: "0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)",
  cardHover: "0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
  cardLift: "0 8px 32px rgba(0,0,0,0.1)",
  btn: "0 2px 10px rgba(13,148,136,0.25)",
  glow: "0 4px 16px rgba(13,148,136,0.25)",
} as const;

export type EntityKind = "person" | "place" | "organization" | "other";

export function entityClass(kind: EntityKind): string {
  switch (kind) {
    case "person":
      return "entity-chip entity-person";
    case "place":
      return "entity-chip entity-place";
    case "organization":
      return "entity-chip entity-org";
    default:
      return "entity-chip entity-other";
  }
}

export function entityInlineClass(kind: EntityKind): string {
  switch (kind) {
    case "person":
      return "ent-person";
    case "place":
      return "ent-place";
    case "organization":
      return "ent-org";
    default:
      return "";
  }
}
