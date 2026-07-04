import { useState } from "react";
import type { Project, ProjectWrite } from "../../types";

interface ProjectFormModalProps {
  initialProject?: Project;
  onClose: () => void;
  onSubmit: (payload: ProjectWrite) => void;
  submitting: boolean;
  error?: boolean;
}

export function ProjectFormModal({
  initialProject,
  onClose,
  onSubmit,
  submitting,
  error,
}: ProjectFormModalProps) {
  const [title, setTitle] = useState(initialProject?.title ?? "");
  const [description, setDescription] = useState(initialProject?.description ?? "");
  const [titleError, setTitleError] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-title" style={{ marginBottom: 20 }}>
          {initialProject ? "Editar proyecto" : "Nuevo proyecto"}
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
              placeholder="Nombre del proyecto"
            />
          </div>
          <div>
            <div className="field-label">Descripción</div>
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles del proyecto…"
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
          {error && (
            <div className="field-error">
              No se pudo {initialProject ? "guardar" : "crear"} el proyecto. Intenta de nuevo.
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={submitting}
              onClick={() => {
                if (!title.trim()) {
                  setTitleError(true);
                  return;
                }
                onSubmit({ title, description });
              }}
            >
              {submitting ? "Guardando…" : initialProject ? "Guardar cambios" : "Crear proyecto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
