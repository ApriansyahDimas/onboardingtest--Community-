import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { TaskViewerPage } from './pages/TaskViewerPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminTasksPage } from './pages/admin/AdminTasksPage';
import { TaskBuilderPage } from './pages/admin/TaskBuilderPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'tasks/:taskId',
        element: <TaskViewerPage />,
      },
      {
        path: 'knowledge',
        element: <KnowledgePage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'admin/tasks',
        element: <AdminTasksPage />,
      },
      {
        path: 'admin/tasks/:taskId/builder',
        element: <TaskBuilderPage />,
      },
      {
        path: 'admin/users',
        element: <AdminUsersPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
