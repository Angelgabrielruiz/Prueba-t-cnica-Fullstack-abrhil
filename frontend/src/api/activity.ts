import { apiClient } from "./client";
import type { Activity, Paginated } from "../types";

export interface ActivityFilters {
  project: number;
  action?: string;
}

export async function listActivity(filters: ActivityFilters): Promise<Activity[]> {
  const { data } = await apiClient.get<Paginated<Activity>>("/activity/", {
    params: { page_size: 100, ...filters },
  });
  return data.results;
}
