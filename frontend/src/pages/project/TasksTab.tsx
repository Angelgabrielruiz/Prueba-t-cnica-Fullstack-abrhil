import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { createTask, listTasks, updateTask } from "../../api/tasks";
import { ErrorState, LoadingState } from "../../components/Feedback";
import { TaskCard } from "../../components/tasks/TaskCard";
import { TaskDetailModal } from "../../components/tasks/TaskDetailModal";
import { TaskFormModal } from "../../components/tasks/TaskFormModal";
import { useDebounce } from "../../hooks/useDebounce";
import { kanbanColumns, priorityMeta, statusMeta } from "../../theme/tokens";
import type { Task, TaskPriority, TaskStatus, TaskWrite } from "../../types";
import type { ProjectTabContext } from "./ProjectDetailPage";

type ModalState =
  | { type: "form"; task?: Task; defaultStatus?: TaskStatus }
  | { type: "detail"; task: Task }
  | null;

export function TasksTab() {
  const { project } = useOutletContext<ProjectTabContext>();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [assigneeFilter, setAssigneeFilter] = useState<number | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [modal, setModal] = useState<ModalState>(null);

  const tasksQuery = useQuery({
    queryKey: ["tasks", project.id, debouncedSearch, assigneeFilter, priorityFilter],
    queryFn: () =>
      listTasks({
        project: project.id,
        search: debouncedSearch || undefined,
        assignee: assigneeFilter === "all" ? undefined : assigneeFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
      }),
  });

  function invalidateAfterMutation() {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["activity"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  const createMutation = useMutation({
    mutationFn: (payload: TaskWrite) => createTask(payload),
    onSuccess: () => {
      invalidateAfterMutation();
      setModal(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TaskWrite> }) =>
      updateTask(id, payload),
    onSuccess: (updated) => {
      invalidateAfterMutation();
      setModal((current) =>
        current?.type === "detail" ? { type: "detail", task: updated } : null,
      );
    },
  });

  const columns = useMemo(() => {
    const tasks = tasksQuery.data ?? [];
    return kanbanColumns.map((status) => ({
      status,
      tasks: tasks.filter((t) => t.status === status),
    }));
  }, [tasksQuery.data]);

  if (tasksQuery.isLoading) return <LoadingState />;
  if (tasksQuery.isError) return <ErrorState />;

  return (
    <>
      <div className="tasks-toolbar">
        <input
          className="input"
          style={{ width: 220 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tareas…"
        />
        <div className="chip-group">
          <button
            className={"chip" + (assigneeFilter === "all" ? " active" : "")}
            onClick={() => setAssigneeFilter("all")}
          >
            Todos
          </button>
          {project.members.map((m) => (
            <button
              key={m.user.id}
              className={"chip" + (assigneeFilter === m.user.id ? " active" : "")}
              onClick={() => setAssigneeFilter(m.user.id)}
            >
              {m.user.name}
            </button>
          ))}
        </div>
        <div className="chip-group">
          <button
            className={"chip" + (priorityFilter === "all" ? " active" : "")}
            onClick={() => setPriorityFilter("all")}
          >
            Todas
          </button>
          {(Object.keys(priorityMeta) as TaskPriority[]).map((p) => (
            <button
              key={p}
              className={"chip" + (priorityFilter === p ? " active" : "")}
              onClick={() => setPriorityFilter(p)}
            >
              {priorityMeta[p].label}
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary"
          style={{ marginLeft: "auto" }}
          onClick={() => setModal({ type: "form" })}
        >
          + Nueva tarea
        </button>
      </div>

      <div className="kanban-board">
        {columns.map((col) => {
          const meta = statusMeta[col.status];
          return (
            <div key={col.status} className="kanban-column">
              <div className="kanban-column-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="dot" style={{ background: meta.color }} />
                  <span style={{ fontWeight: 800, fontSize: 13.5 }}>{meta.label}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>
                  {col.tasks.length}
                </span>
              </div>
              <div className="kanban-tasks">
                {col.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => setModal({ type: "detail", task })} />
                ))}
              </div>
              <button
                style={{
                  border: "1.5px dashed #C7D3E8",
                  background: "none",
                  borderRadius: 9,
                  padding: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
                onClick={() => setModal({ type: "form", defaultStatus: col.status })}
              >
                + Añadir tarea
              </button>
            </div>
          );
        })}
      </div>

      {modal?.type === "form" && (
        <TaskFormModal
          project={project}
          initialTask={modal.task}
          defaultStatus={modal.defaultStatus}
          onClose={() => setModal(null)}
          submitting={createMutation.isPending || updateMutation.isPending}
          error={createMutation.isError || updateMutation.isError}
          onSubmit={(payload) => {
            if (modal.task) {
              updateMutation.mutate({ id: modal.task.id, payload });
            } else {
              createMutation.mutate(payload);
            }
          }}
        />
      )}

      {modal?.type === "detail" && (
        <TaskDetailModal
          task={modal.task}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ type: "form", task: modal.task })}
          onStatusChange={(status) =>
            updateMutation.mutate({ id: modal.task.id, payload: { status } })
          }
        />
      )}
    </>
  );
}
