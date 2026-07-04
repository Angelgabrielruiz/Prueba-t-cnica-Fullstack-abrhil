import { apiClient } from "./client";
import type { Comment, Paginated } from "../types";

export async function listComments(taskId: number): Promise<Comment[]> {
  const { data } = await apiClient.get<Paginated<Comment>>("/comments/", {
    params: { task: taskId, page_size: 100 },
  });
  return data.results;
}

export async function createComment(
  taskId: number,
  content: string,
): Promise<Comment> {
  const { data } = await apiClient.post<Comment>("/comments/", {
    task: taskId,
    content,
  });
  return data;
}
