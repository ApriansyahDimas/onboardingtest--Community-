import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightContent?: ReactNode;
}

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/knowledge': 'Knowledge',
  '/profile': 'Profile',
  '/admin/tasks': 'Tasks',
  '/admin/users': 'Manage Users',
};

export function Header({ title, showBack, rightContent }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useApp();

  // Determine title from path
  let derivedTitle = title ?? ROUTE_TITLES[location.pathname] ?? '';

  // For task viewer: /tasks/:taskId
  if (!derivedTitle && location.pathname.startsWith('/tasks/')) {
    const taskId = location.pathname.split('/')[2];
    const task = state.tasks.find((t) => t.id === taskId);
    derivedTitle = task?.title ?? 'Task';
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-30 flex justify-center bg-white border-b border-[#eeeeee]"
    >
      <div
        className="w-full flex items-center px-4"
        style={{ maxWidth: 460, height: 56 }}
      >
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-lg text-[#666666] hover:bg-[#f5f5f5] transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1
          className="text-[#111111] flex-1 truncate"
          style={{ fontWeight: 700, fontSize: '1.1rem' }}
        >
          {derivedTitle}
        </h1>
        {rightContent && (
          <div className="flex items-center gap-2 ml-2">{rightContent}</div>
        )}
      </div>
    </div>
  );
}
