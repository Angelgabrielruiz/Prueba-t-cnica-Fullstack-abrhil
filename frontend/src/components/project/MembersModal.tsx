import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { addMember, removeMember } from "../../api/projects";
import { useAuth } from "../../auth/useAuth";
import { Avatar } from "../Avatar";
import type { Project } from "../../types";

export function MembersModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [error, setError] = useState<string | null>(null);

  const isAdmin = project.members.some(
    (m) => m.user.id === user?.id && m.role === "admin",
  );

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["project", project.id] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  const inviteMutation = useMutation({
    mutationFn: () => addMember(project.id, email.trim(), role),
    onSuccess: () => {
      setEmail("");
      setError(null);
      invalidate();
    },
    onError: (err) => {
      const detail =
        axios.isAxiosError(err) && err.response?.data
          ? extractErrorMessage(err.response.data)
          : null;
      setError(detail ?? "No se pudo invitar al usuario.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: number) => removeMember(project.id, userId),
    onSuccess: () => {
      setError(null);
      invalidate();
    },
    onError: (err) => {
      const detail =
        axios.isAxiosError(err) && err.response?.data
          ? extractErrorMessage(err.response.data)
          : null;
      setError(detail ?? "No se pudo quitar al miembro.");
    },
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-title" style={{ marginBottom: 20 }}>Miembros del proyecto</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: isAdmin ? 20 : 0 }}>
          {project.members.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar id={m.user.id} name={m.user.name} size={30} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{m.user.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{m.user.email}</div>
              </div>
              <span
                className="pill"
                style={{
                  background: m.role === "admin" ? "#FCF1D6" : "#E7ECF5",
                  color: m.role === "admin" ? "var(--gold)" : "var(--text-muted)",
                }}
              >
                {m.role === "admin" ? "Admin" : "Miembro"}
              </span>
              {isAdmin && m.user.id !== user?.id && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: "6px 10px", fontSize: 12 }}
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(m.user.id)}
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="form-stack" style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
            <div className="field-label">Invitar por correo</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
              />
              <select
                className="input"
                style={{ width: 120 }}
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "member")}
              >
                <option value="member">Miembro</option>
                <option value="admin">Admin</option>
              </select>
              <button
                className="btn btn-primary"
                disabled={!email.trim() || inviteMutation.isPending}
                onClick={() => inviteMutation.mutate()}
              >
                Invitar
              </button>
            </div>
            {error && <div className="field-error">{error}</div>}
            <div style={{ fontSize: 11.5, color: "var(--text-placeholder)" }}>
              Solo se puede invitar a usuarios que ya tengan una cuenta creada en abrhil.
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button className="btn btn-secondary" style={{ width: "100%" }} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function extractErrorMessage(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const firstValue = Object.values(data as Record<string, unknown>)[0];
    if (Array.isArray(firstValue)) return String(firstValue[0]);
    if (typeof firstValue === "string") return firstValue;
  }
  return null;
}
