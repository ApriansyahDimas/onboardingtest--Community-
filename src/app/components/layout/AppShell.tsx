import { Outlet, useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopBrandBar } from './TopBrandBar';
import { BottomNavBar } from './BottomNavBar';

// Paths that show the top brand bar + bottom nav (main pages)
const MAIN_PATHS = [
  '/dashboard',
  '/tasks',
  '/knowledge',
  '/profile',
  '/admin/tasks',
  '/admin/users',
];

const ROUTE_TITLES: Record<string, string> = {
  '/profile': 'Profile',
};

export function AppShell() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate, location.pathname]);

  const path = location.pathname;

  // Builder: TaskBuilderPage owns its full layout
  const isBuilder = path.includes('/builder');

  // Task viewer: /tasks/:id — TaskViewerPage owns its full layout
  const isTaskViewer =
    path.startsWith('/tasks/') && !path.startsWith('/admin/') && path !== '/tasks';

  // Main pages: show top brand bar + bottom nav
  const isMainPage = MAIN_PATHS.includes(path);

  // Derive title for detail pages that need back-header
  const pageTitle = ROUTE_TITLES[path] ?? '';

  // ── Builder: TaskBuilderPage manages its own layout ──────────────────────
  if (isBuilder) {
    return (
      <div className="min-h-screen bg-white flex justify-center">
        <div className="relative w-full bg-white" style={{ maxWidth: 460 }}>
          <Outlet />
        </div>
      </div>
    );
  }

  // ── Task viewer: TaskViewerPage manages its own layout ───────────────────
  if (isTaskViewer) {
    return (
      <div className="min-h-screen bg-white flex justify-center">
        <div className="relative w-full bg-white" style={{ maxWidth: 460 }}>
          <Outlet />
        </div>
      </div>
    );
  }

  // ── Main pages: TopBrandBar (top) + content + BottomNavBar ───────────────
  if (isMainPage) {
    return (
      <div className="min-h-screen bg-white">
        <div
          className="relative w-full"
          style={{
            background: 'var(--brand-gradient)',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <TopBrandBar />
          <div
            style={{
              height: '100vh',
              paddingTop: 72,
              paddingBottom: 64,
              background: 'var(--brand-gradient)',
            }}
          >
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                overflow: 'hidden',
                paddingTop: 22,
              }}
            >
              <main
                className="overflow-y-auto hide-scrollbar"
                style={{
                  flex: 1,
                  minHeight: 0,
                  backgroundColor: '#ffffff',
                }}
              >
                <div className="w-full mx-auto" style={{ maxWidth: 460 }}>
                  <Outlet />
                </div>
              </main>
            </div>
          </div>
          <BottomNavBar />
        </div>
      </div>
    );
  }

  // ── Detail pages: white back-header (no nav) ─────────────────────────────
  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="relative w-full bg-white" style={{ maxWidth: 460 }}>
        {/* Back header */}
        <div
          className="fixed top-0 left-0 right-0 z-30 flex justify-center bg-white"
          style={{ borderBottom: '1px solid #eeeeee' }}
        >
          <div
            className="w-full flex items-center px-3 gap-2"
            style={{ maxWidth: 460, height: 56 }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-[#666666] hover:bg-[#f5f5f5] transition-colors flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <h1
              className="text-[#111111] flex-1 truncate"
              style={{ fontWeight: 700, fontSize: '1.05rem' }}
            >
              {pageTitle}
            </h1>
          </div>
        </div>

        <main
          style={{ paddingTop: 56, minHeight: '100vh' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

