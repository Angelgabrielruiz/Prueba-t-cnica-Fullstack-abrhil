import { apiClient } from "./client";
import type { Paginated, Project, ProjectMember, ProjectWrite } from "../types";

export async function listProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<Paginated<Project>>("/projects/", {
    params: { page_size: 100 },
  });
  return data.results;
}

export async function getProject(id: number): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/projects/${id}/`);
  return data;
}

export async function createProject(payload: ProjectWrite): Promise<Project> {
  const { data } = await apiClient.post<Project>("/projects/", payload);
  return data;
}

export async function updateProject(
  id: number,
  payload: Partial<ProjectWrite>,
): Promise<Project> {
  const { data } = await apiClient.patch<Project>(`/projects/${id}/`, payload);
  return data;
}

export async function addMember(
  projectId: number,
  email: string,
  role: "admin" | "member" = "member",
): Promise<ProjectMember> {
  const { data } = await apiClient.post<ProjectMember>(
    `/projects/${projectId}/members/`,
    { email, role },
  );
  return data;
}

export async function removeMember(projectId: number, userId: number): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/members/${userId}/`);
}
