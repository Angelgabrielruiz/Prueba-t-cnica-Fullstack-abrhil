import { apiClient } from "./client";
import type { DashboardResponse } from "../types";

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await apiClient.get<DashboardResponse>("/dashboard/");
  return data;
}
