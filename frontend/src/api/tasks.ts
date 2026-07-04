import { apiClient } from "./client";
import type { Paginated, Task, TaskWrite } from "../types";

export interface TaskFilters {
  project?: number;
  status?: string;
  priority?: string;
  assignee?: number;
  search?: string;
}

export async function listTasks(filters: TaskFilters): Promise<Task[]> {
  const { data } = await apiClient.get<Paginated<Task>>("/tasks/", {
    params: { page_size: 200, ...filters },
  });
  return data.results;
}

export async function createTask(payload: TaskWrite): Promise<Task> {
  const { data } = await apiClient.post<Task>("/tasks/", payload);
  return data;
}

export async function updateTask(
  id: number,
  payload: Partial<TaskWrite>,
): Promise<Task> {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}/`, payload);
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}/`);
}
