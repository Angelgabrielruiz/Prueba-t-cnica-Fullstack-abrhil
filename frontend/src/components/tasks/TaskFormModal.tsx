import { useState } from "react";
import { Avatar } from "../Avatar";
import { kanbanColumns, priorityMeta, statusMeta } from "../../theme/tokens";
import type { Project, Task, TaskPriority, TaskStatus, TaskWrite } from "../../types";

interface TaskFormModalProps {
  project: Project;
  initialTask?: Task;
  defaultStatus?: TaskStatus;
  onClose: () => void;
  onSubmit: (payload: TaskWrite) => void;
  submitting: boolean;
  error?: boolean;
}

const priorities: TaskPriority[] = ["high", "medium", "low"];

export function TaskFormModal({
  project,
  initialTask,
  defaultStatus,
  onClose,
  onSubmit,
  submitting,
  error,
}: TaskFormModalProps) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? defaultStatus ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority ?? "medium");
  const [assigneeId, setAssigneeId] = useState<number | null>(initialTask?.assignee?.id ?? null);
  const [dueDate, setDueDate] = useState(initialTask?.due_date ?? "");
  const [titleError, setTitleError] = useState(false);

  function handleSave() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    onSubmit({
      project: project.id,
      title,
      description,
      status,
      priority,
      assignee: assigneeId,
      due_date: dueDate || null,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-title" style={{ marginBottom: 20 }}>
          {initialTask ? "Editar tarea" : "Nueva tarea"}
        </div>
        <div className="form-stack">
          <div>
            <div className="field-label">Título</div>
            <input
              className={"input" + (titleError ? " input-error" : "")}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(false);
              }}
              placeholder="Nombre de la tarea"
            />
            {titleError && <div className="field-error">El título es obligatorio.</div>}
          </div>

          <div>
            <div className="field-label">Descripción</div>
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles de la tarea…"
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          <div>
            <div className="field-label">Estado</div>
            <div className="option-row">
              {kanbanColumns.map((s) => {
                const meta = statusMeta[s];
                const selected = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    className="option-pill"
                    onClick={() => setStatus(s)}
                    style={{
                      background: selected ? meta.bg : "#fff",
                      color: meta.color,
                      borderColor: selected ? meta.color : "var(--border)",
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="field-label">Prioridad</div>
            <div className="option-row">
              {priorities.map((p) => {
                const meta = priorityMeta[p];
                const selected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    className="option-pill"
                    onClick={() => setPriority(p)}
                    style={{
                      background: selected ? meta.bg : "#fff",
                      color: meta.color,
                      borderColor: selected ? meta.color : "var(--border)",
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="field-label">Asignado a</div>
            <div className="option-row">
              <button
                type="button"
                className="option-pill"
                onClick={() => setAssigneeId(null)}
                style={{ borderColor: assigneeId === null ? "var(--accent)" : "var(--border)" }}
              >
                Sin asignar
              </button>
              {project.members.map((m) => (
                <button
                  key={m.user.id}
                  type="button"
                  onClick={() => setAssigneeId(m.user.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    border: `1.5px solid ${assigneeId === m.user.id ? "var(--accent)" : "var(--border)"}`,
                    background: "#fff",
                    padding: "6px 12px 6px 6px",
                    borderRadius: 22,
                    cursor: "pointer",
                  }}
                >
                  <Avatar id={m.user.id} name={m.user.name} size={22} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{m.user.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="field-label">Fecha límite</div>
            <input
              type="date"
              className="input"
              style={{ width: "auto" }}
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {error && <div className="field-error">No se pudo guardar la tarea. Intenta de nuevo.</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={submitting} onClick={handleSave}>
              {submitting ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
