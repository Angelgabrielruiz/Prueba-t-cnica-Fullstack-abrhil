import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { AuthPage } from "./pages/AuthPage";
import { ProjectsListPage } from "./pages/ProjectsListPage";
import { ProjectDetailPage } from "./pages/project/ProjectDetailPage";
import { DashboardTab } from "./pages/project/DashboardTab";
import { TasksTab } from "./pages/project/TasksTab";
import { ActivityTab } from "./pages/project/ActivityTab";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<ProjectsListPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailPage />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardTab />} />
                <Route path="tasks" element={<TasksTab />} />
                <Route path="activity" element={<ActivityTab />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
