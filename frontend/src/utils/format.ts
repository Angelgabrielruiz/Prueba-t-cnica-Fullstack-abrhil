export function formatDate(value: string | null): string {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export function dueLabel(dueDate: string | null): string {
  if (!dueDate) return "Sin fecha límite";
  return (isOverdue(dueDate) ? "Venció " : "Vence ") + formatDate(dueDate);
}

export function formatDuration(seconds: number): string {
  const hours = seconds / 3600;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  const days = hours / 24;
  return `${days.toFixed(1)} d`;
}
