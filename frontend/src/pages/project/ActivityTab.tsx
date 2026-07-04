import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { listActivity } from "../../api/activity";
import { Avatar } from "../../components/Avatar";
import { ErrorState, LoadingState } from "../../components/Feedback";
import { activitySummary } from "../../utils/activity";
import { formatDateTime } from "../../utils/format";
import type { ActivityAction } from "../../types";
import type { ProjectTabContext } from "./ProjectDetailPage";

const filters: { value: ActivityAction | "all"; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "task_created", label: "Tareas creadas" },
  { value: "task_status_changed", label: "Cambios de estado" },
  { value: "comment_added", label: "Comentarios" },
];

export function ActivityTab() {
  const { project } = useOutletContext<ProjectTabContext>();
  const [filter, setFilter] = useState<ActivityAction | "all">("all");

  const activityQuery = useQuery({
    queryKey: ["activity", project.id, filter],
    queryFn: () => listActivity({ project: project.id, action: filter === "all" ? undefined : filter }),
  });

  if (activityQuery.isLoading) return <LoadingState />;
  if (activityQuery.isError) return <ErrorState />;

  const items = activityQuery.data ?? [];

  return (
    <>
      <div style={{ padding: "20px 40px 8px", display: "flex", gap: 6 }}>
        {filters.map((f) => (
          <button
            key={f.value}
            className={"chip" + (filter === f.value ? " active" : "")}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="activity-timeline">
        {items.map((a, index) => (
          <div key={a.id} className="timeline-item">
            <div className="timeline-rail">
              <Avatar id={a.user?.id ?? 0} name={a.user?.name ?? "?"} size={32} />
              {index < items.length - 1 && <div className="timeline-line" />}
            </div>
            <div style={{ flex: 1, paddingBottom: 2 }}>
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>{a.user?.name ?? "Alguien"}</span>{" "}
                {activitySummary(a)}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-placeholder)", marginTop: 6, fontWeight: 600 }}>
                {formatDateTime(a.created_at)}
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
            No hay actividad registrada todavía para este filtro.
          </div>
        )}
      </div>
    </>
  );
}
