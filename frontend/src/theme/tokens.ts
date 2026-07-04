import type { TaskPriority, TaskStatus } from "../types";

export const colors = {
  accent: "#027BFF",
  accentDark: "#00318B",
  teal: "#2E8B57",
  pageBg: "#F2F5FB",
  authBg: "#EBEEF5",
  text: "#1A1A1A",
  textSecondary: "#33415C",
  textMuted: "#5B6B84",
  textPlaceholder: "#93A2BA",
  border: "#DDE6F5",
  surface: "#FFFFFF",
  surfaceMuted: "#F5F8FD",
  columnBg: "#EEF3FB",
  danger: "#C0392B",
  dangerBg: "#FCE4E2",
  logout: "#B14D3B",
  gold: "#B8860C",
  goldBg: "#FCF1D6",
};

export const font = "'Plus Jakarta Sans', system-ui, sans-serif";

export const statusMeta: Record<
  TaskStatus,
  { label: string; color: string; bg: string }
> = {
  todo: { label: "Por hacer", color: "#5B6B84", bg: "#E7ECF5" },
  in_progress: { label: "En progreso", color: colors.accent, bg: "#E1EEFF" },
  done: { label: "Hecho", color: colors.teal, bg: "#E1F3E9" },
};

export const priorityMeta: Record<
  TaskPriority,
  { label: string; color: string; bg: string }
> = {
  high: { label: "Alta", color: colors.danger, bg: colors.dangerBg },
  medium: { label: "Media", color: colors.gold, bg: colors.goldBg },
  low: { label: "Baja", color: colors.textMuted, bg: "#E7ECF5" },
};

export const kanbanColumns: TaskStatus[] = ["todo", "in_progress", "done"];

const avatarPalette = [
  "#027BFF",
  "#2E8B57",
  "#C0392B",
  "#B8860C",
  "#00318B",
  "#7B4FA6",
  "#1F7A4C",
  "#0757C4",
];

export function colorForId(id: number | string): string {
  const key = String(id);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return avatarPalette[hash % avatarPalette.length];
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
