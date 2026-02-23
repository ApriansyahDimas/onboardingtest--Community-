import { useNavigate, useLocation } from 'react-router';

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#7f15a8' : '#666666'} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    path: '/tasks',
    label: 'Tasks',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#7f15a8' : '#666666'} strokeWidth="2">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    path: '/knowledge',
    label: 'Knowledge',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#7f15a8' : '#666666'} strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

export function UserNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex border-b border-[#eeeeee] bg-white overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-w-0 transition-colors"
            style={{
              borderBottom: active ? '2px solid #7f15a8' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {item.icon(active)}
            <span
              className="text-xs"
              style={{
                color: active ? '#7f15a8' : '#666666',
                fontWeight: active ? 600 : 400,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

