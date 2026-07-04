import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createProject, listProjects } from "../api/projects";
import { listTasks } from "../api/tasks";
import { Avatar } from "../components/Avatar";
import { ErrorState, LoadingState } from "../components/Feedback";
import { ProjectFormModal } from "../components/project/ProjectFormModal";
import { colorForId } from "../theme/tokens";
import type { ProjectWrite } from "../types";

export function ProjectsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const tasksQuery = useQuery({
    queryKey: ["tasks", "all"],
    queryFn: () => listTasks({}),
    enabled: !!projectsQuery.data?.length,
  });

  const createMutation = useMutation({
    mutationFn: (payload: ProjectWrite) => createProject(payload),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowCreate(false);
      navigate(`/projects/${project.id}`);
    },
  });

  const stats = useMemo(() => {
    const byProject = new Map<number, { total: number; done: number }>();
    for (const task of tasksQuery.data ?? []) {
      const entry = byProject.get(task.project) ?? { total: 0, done: 0 };
      entry.total += 1;
      if (task.status === "done") entry.done += 1;
      byProject.set(task.project, entry);
    }
    return byProject;
  }, [tasksQuery.data]);

  if (projectsQuery.isLoading) return <LoadingState />;
  if (projectsQuery.isError) return <ErrorState />;

  return (
    <>
      <div className="page-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <div className="page-title">Proyectos</div>
          <div className="page-subtitle">Selecciona un proyecto para ver su tablero.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Nuevo proyecto
        </button>
      </div>

      <div className="projects-grid">
        {projectsQuery.data?.map((project) => {
          const stat = stats.get(project.id) ?? { total: 0, done: 0 };
          const pct = stat.total ? Math.round((stat.done / stat.total) * 100) : 0;
          const color = colorForId(project.id);
          return (
            <div
              key={project.id}
              className="project-card"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="project-card-bar" style={{ background: color }} />
              <div className="project-card-body">
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em" }}>
                    {project.title}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 5, lineHeight: 1.45 }}>
                    {project.description || "Sin descripción."}
                  </div>
                </div>
                <div className="avatar-stack">
                  {project.members.slice(0, 5).map((m) => (
                    <Avatar key={m.id} id={m.user.id} name={m.user.name} size={26} />
                  ))}
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                    <span>{stat.done} de {stat.total} tareas</span>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>{pct}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {projectsQuery.data?.length === 0 && (
        <div style={{ padding: "0 40px", color: "var(--text-muted)" }}>
          Todavía no perteneces a ningún proyecto. Crea el primero.
        </div>
      )}

      {showCreate && (
        <ProjectFormModal
          onClose={() => setShowCreate(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
          submitting={createMutation.isPending}
          error={createMutation.isError}
        />
      )}
    </>
  );
}
