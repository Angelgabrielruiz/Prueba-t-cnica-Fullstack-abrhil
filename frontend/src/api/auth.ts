import { apiClient } from "./client";
import type { AuthResponse, User } from "../types";

export async function login(email: string, password: string): Promise<AuthResponse["user"] & { access: string; refresh: string }> {
  const { data } = await apiClient.post<{ access: string; refresh: string }>(
    "/auth/login/",
    { username: email, password },
  );
  const me = await fetchMe(data.access);
  return { ...me, access: data.access, refresh: data.refresh };
}

async function fetchMe(access: string): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me/", {
    headers: { Authorization: `Bearer ${access}` },
  });
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register/", {
    name,
    email,
    password,
  });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me/");
  return data;
}
