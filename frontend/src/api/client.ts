import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "./tokenStore";

export const AUTH_LOGOUT_EVENT = "abrhil:auth-logout";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const access = tokenStore.getAccess();
  if (access) {
    config.headers.set("Authorization", `Bearer ${access}`);
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;

  try {
    const { data } = await axios.post<{ access: string }>(
      `${baseURL}/auth/login/refresh/`,
      { refresh },
    );
    tokenStore.setAccess(data.access);
    return data.access;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const newAccess = await refreshPromise;
    if (!newAccess) {
      tokenStore.clear();
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
      return Promise.reject(error);
    }

    original.headers.set("Authorization", `Bearer ${newAccess}`);
    return apiClient(original);
  },
);
