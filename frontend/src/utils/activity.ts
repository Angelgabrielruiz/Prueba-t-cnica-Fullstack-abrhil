import { statusMeta } from "../theme/tokens";
import type { Activity, TaskStatus } from "../types";

function statusLabel(value: unknown): string {
  const meta = statusMeta[value as TaskStatus];
  return meta?.label ?? String(value);
}

export function activitySummary(a: Activity): string {
  const title = a.task_title ?? "una tarea eliminada";
  switch (a.action) {
    case "task_created":
      return `creó la tarea "${title}"`;
    case "task_status_changed":
      return `cambió el estado de "${title}" de ${statusLabel(a.metadata.old_status)} a ${statusLabel(a.metadata.new_status)}`;
    case "task_assigned":
      return `asignó la tarea "${title}"`;
    case "comment_added":
      return `comentó en "${title}"`;
    default:
      return a.action_display;
  }
}
