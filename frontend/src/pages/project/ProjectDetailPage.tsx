import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { deleteProject, getProject, updateProject } from "../../api/projects";
import { useAuth } from "../../auth/useAuth";
import { Avatar } from "../../components/Avatar";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ErrorState, LoadingState } from "../../components/Feedback";
import { EditIcon, TrashIcon } from "../../components/icons";
import { MembersModal } from "../../components/project/MembersModal";
import { ProjectFormModal } from "../../components/project/ProjectFormModal";
import type { Project, ProjectWrite } from "../../types";

export interface ProjectTabContext {
  project: Project;
}

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const id = Number(projectId);
  const [showMembers, setShowMembers] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    enabled: Number.isFinite(id),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: ProjectWrite) => updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowEdit(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/");
    },
  });

  if (isLoading) return <LoadingState />;
  if (isError || !project) return <ErrorState message="No se pudo cargar el proyecto." />;

  const isAdmin = project.members.some((m) => m.user.id === user?.id && m.role === "admin");

  return (
    <>
      <div className="project-header">
        <div className="breadcrumb">
          <button onClick={() => navigate("/")}>Proyectos</button> / {project.title}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: "-0.01em" }}>
              {project.title}
            </div>
            {isAdmin && (
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => setShowEdit(true)}
                  title="Editar proyecto"
                  style={{
                    border: "1.5px solid var(--border)",
                    background: "#fff",
                    color: "var(--text-muted)",
                    borderRadius: 8,
                    width: 30,
                    height: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <EditIcon size={14} />
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  title="Eliminar proyecto"
                  style={{
                    border: "1.5px solid var(--border)",
                    background: "#fff",
                    color: "var(--danger)",
                    borderRadius: 8,
                    width: 30,
                    height: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            )}
          </div>
          <button
            className="avatar-stack"
            onClick={() => setShowMembers(true)}
            style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}
            title="Ver miembros del proyecto"
          >
            {project.members.slice(0, 5).map((m) => (
              <Avatar key={m.id} id={m.user.id} name={m.user.name} size={28} />
            ))}
            <span
              style={{
                marginLeft: -8,
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "2px solid #fff",
                background: "var(--surface-muted)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              +
            </span>
          </button>
        </div>
        <div className="tabs-row">
          <div className="tabs-list">
            <NavLink to="dashboard" className={({ isActive }) => "tab-btn" + (isActive ? " active" : "")}>
              Dashboard
            </NavLink>
            <NavLink to="tasks" className={({ isActive }) => "tab-btn" + (isActive ? " active" : "")}>
              Tareas
            </NavLink>
            <NavLink to="activity" className={({ isActive }) => "tab-btn" + (isActive ? " active" : "")}>
              Actividad
            </NavLink>
          </div>
        </div>
      </div>

      <Outlet context={{ project } satisfies ProjectTabContext} />

      {showMembers && <MembersModal project={project} onClose={() => setShowMembers(false)} />}

      {showEdit && (
        <ProjectFormModal
          initialProject={project}
          onClose={() => setShowEdit(false)}
          onSubmit={(payload) => updateMutation.mutate(payload)}
          submitting={updateMutation.isPending}
          error={updateMutation.isError}
        />
      )}

      {showDelete && (
        <ConfirmModal
          title="Eliminar proyecto"
          message={`¿Seguro que quieres eliminar "${project.title}"? Se eliminarán también sus tareas, comentarios y actividad. Esta acción no se puede deshacer.`}
          submitting={deleteMutation.isPending}
          error={deleteMutation.isError ? "No se pudo eliminar el proyecto. Intenta de nuevo." : undefined}
          onConfirm={() => deleteMutation.mutate()}
          onClose={() => setShowDelete(false)}
        />
      )}
    </>
  );
}
