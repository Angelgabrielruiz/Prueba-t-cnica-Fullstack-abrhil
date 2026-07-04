import { Avatar } from "../Avatar";
import { PriorityPill } from "../Pills";
import { dueLabel, isOverdue } from "../../utils/format";
import type { Task } from "../../types";

export function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-card-title">{task.title}</div>
      <div className="task-card-row">
        <PriorityPill priority={task.priority} />
        {task.assignee && <Avatar id={task.assignee.id} name={task.assignee.name} size={22} />}
      </div>
      {task.due_date && (
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: isOverdue(task.due_date) && task.status !== "done" ? "var(--danger)" : "var(--text-muted)",
          }}
        >
          {dueLabel(task.due_date)}
        </div>
      )}
    </div>
  );
}
