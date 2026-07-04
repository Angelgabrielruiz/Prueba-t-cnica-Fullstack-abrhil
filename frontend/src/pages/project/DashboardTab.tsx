import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getDashboard } from "../../api/dashboard";
import { listActivity } from "../../api/activity";
import { listTasks } from "../../api/tasks";
import { Avatar } from "../../components/Avatar";
import { ErrorState, LoadingState } from "../../components/Feedback";
import { colors, statusMeta } from "../../theme/tokens";
import { activitySummary } from "../../utils/activity";
import { formatDateTime, formatDuration } from "../../utils/format";
import type { TaskStatus } from "../../types";
import type { ProjectTabContext } from "./ProjectDetailPage";

export function DashboardTab() {
  const { project } = useOutletContext<ProjectTabContext>();
  const navigate = useNavigate();

  const tasksQuery = useQuery({
    queryKey: ["tasks", project.id],
    queryFn: () => listTasks({ project: project.id }),
  });
  const dashboardQuery = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });
  const activityQuery = useQuery({
    queryKey: ["activity", project.id, "preview"],
    queryFn: () => listActivity({ project: project.id }),
  });

  const stats = useMemo(() => {
    const tasks = tasksQuery.data ?? [];
    const byStatus: Record<TaskStatus, number> = { todo: 0, in_progress: 0, done: 0 };
    let overdue = 0;
    const now = new Date();
    for (const t of tasks) {
      byStatus[t.status] += 1;
      if (t.status !== "done" && t.due_date && new Date(t.due_date) < now) overdue += 1;
    }
    return { total: tasks.length, byStatus, overdue };
  }, [tasksQuery.data]);

  const collaborators = useMemo(() => {
    const completedCounts = new Map<number, number>();
    for (const t of tasksQuery.data ?? []) {
      if (t.status === "done" && t.assignee) {
        completedCounts.set(t.assignee.id, (completedCounts.get(t.assignee.id) ?? 0) + 1);
      }
    }
    return project.members
      .map((m) => ({ user: m.user, completedCount: completedCounts.get(m.user.id) ?? 0 }))
      .sort((a, b) => b.completedCount - a.completedCount);
  }, [tasksQuery.data, project.members]);

  const avgCompletion = dashboardQuery.data?.avg_completion_time_by_project.find(
    (row) => row.project_id === project.id,
  );

  if (tasksQuery.isLoading || dashboardQuery.isLoading) return <LoadingState />;
  if (tasksQuery.isError || dashboardQuery.isError) return <ErrorState />;

  const metricCards = [
    { label: "Total de tareas", value: stats.total, color: colors.text },
    { label: "Por hacer", value: stats.byStatus.todo, color: statusMeta.todo.color },
    { label: "En progreso", value: stats.byStatus.in_progress, color: statusMeta.in_progress.color },
    { label: "Hechas", value: stats.byStatus.done, color: statusMeta.done.color },
    {
      label: "Tiempo prom. de finalización",
      value: avgCompletion ? formatDuration(avgCompletion.avg_seconds) : "—",
      color: colors.teal,
    },
  ];

  const statusBreakdown = (Object.keys(stats.byStatus) as TaskStatus[]).map((key) => ({
    key,
    label: statusMeta[key].label,
    color: statusMeta[key].color,
    count: stats.byStatus[key],
    pct: stats.total ? (stats.byStatus[key] / stats.total) * 100 : 0,
  }));

  return (
    <div className="dashboard-body">
      <div className="metric-grid">
        {metricCards.map((mc) => (
          <div key={mc.label} className="card metric-card">
            <div className="metric-label">{mc.label}</div>
            <div className="metric-value" style={{ color: mc.color }}>{mc.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card panel">
          <div className="panel-title">Tareas por estado</div>
          <div className="status-bar">
            {statusBreakdown.map((sb) => (
              <div key={sb.key} style={{ height: "100%", width: `${sb.pct}%`, background: sb.color }} />
            ))}
          </div>
          <div className="status-legend">
            {statusBreakdown.map((sb) => (
              <div key={sb.key} className="status-legend-item">
                <span className="dot" style={{ background: sb.color }} />
                {sb.label} · <span style={{ fontWeight: 700, color: "var(--text)" }}>{sb.count}</span>
              </div>
            ))}
          </div>

          <div className="panel-title" style={{ margin: "22px 0 14px" }}>Actividad reciente</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(activityQuery.data ?? []).slice(0, 3).map((a) => (
              <div key={a.id} className="activity-preview-item">
                <Avatar id={a.user?.id ?? 0} name={a.user?.name ?? "?"} size={26} />
                <div style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>{a.user?.name ?? "Alguien"}</span>{" "}
                  {activitySummary(a)}
                  <div style={{ fontSize: 11.5, color: "var(--text-placeholder)", marginTop: 1 }}>
                    {formatDateTime(a.created_at)}
                  </div>
                </div>
              </div>
            ))}
            {activityQuery.data?.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin actividad todavía.</div>
            )}
          </div>
          <button className="link-btn" style={{ marginTop: 16 }} onClick={() => navigate("../activity")}>
            Ver toda la actividad →
          </button>
        </div>

        <div className="card panel">
          <div className="panel-title">Top colaboradores</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {collaborators.map(({ user, completedCount }) => (
              <div key={user.id} className="top-member-row">
                <Avatar id={user.id} name={user.name} size={30} />
                <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{user.name}</div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: completedCount ? colors.teal : "var(--text-muted)",
                    background: completedCount ? "#E1F3E9" : "#E7ECF5",
                    padding: "3px 9px",
                    borderRadius: 20,
                  }}
                >
                  {completedCount} completadas
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
