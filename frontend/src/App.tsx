import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { WorkspaceDetails } from './pages/WorkspaceDetails';
import { WorkspaceSettings } from './pages/WorkspaceSettings';
import { ProjectDetails } from './pages/ProjectDetails';
import { MyTasks } from './pages/MyTasks';
import { Recent } from './pages/Recent';
import { Starred } from './pages/Starred';
import { AccountSettings } from './pages/AccountSettings';
import { AppLayout } from './components/layout/AppLayout';
import { useUser } from './features/auth/queries';

function App() {
  const { data: user, isPending } = useUser();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600 font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/workspaces" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/workspaces" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/workspaces" replace /> : <Register />} />
      
      {/* Ensure /dashboard redirects to /workspaces to prevent breaking existing navigation */}
      <Route path="/dashboard" element={<Navigate to="/workspaces" replace />} />

      {/* Authenticated Application Shell */}
      <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route path="/workspaces" element={<Dashboard />} />
        <Route path="/workspaces/:workspaceId" element={<WorkspaceDetails />} />
        <Route path="/workspaces/:workspaceId/settings" element={<WorkspaceSettings />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/recent" element={<Recent />} />
        <Route path="/starred" element={<Starred />} />
        <Route path="/settings" element={<AccountSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
