import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { getProject } from "../../api/projects";
import { Avatar } from "../../components/Avatar";
import { ErrorState, LoadingState } from "../../components/Feedback";
import { MembersModal } from "../../components/project/MembersModal";
import type { Project } from "../../types";

export interface ProjectTabContext {
  project: Project;
}

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const id = Number(projectId);
  const [showMembers, setShowMembers] = useState(false);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    enabled: Number.isFinite(id),
  });

  if (isLoading) return <LoadingState />;
  if (isError || !project) return <ErrorState message="No se pudo cargar el proyecto." />;

  return (
    <>
      <div className="project-header">
        <div className="breadcrumb">
          <button onClick={() => navigate("/")}>Proyectos</button> / {project.title}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: "-0.01em" }}>
            {project.title}
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
    </>
  );
}
