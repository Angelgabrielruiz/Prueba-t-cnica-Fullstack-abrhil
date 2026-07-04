import { priorityMeta, statusMeta } from "../theme/tokens";
import type { TaskPriority, TaskStatus } from "../types";

export function StatusPill({ status }: { status: TaskStatus }) {
  const meta = statusMeta[status];
  return (
    <span className="pill" style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </span>
  );
}

export function PriorityPill({ priority }: { priority: TaskPriority }) {
  const meta = priorityMeta[priority];
  return (
    <span className="pill" style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </span>
  );
}
