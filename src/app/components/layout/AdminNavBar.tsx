import { useNavigate, useLocation } from 'react-router';

const ADMIN_NAV = [
  { path: '/admin/tasks', label: 'Tasks' },
  { path: '/admin/users', label: 'Users' },
];

export function AdminNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex border-b border-[#eeeeee] bg-white">
      {ADMIN_NAV.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className="flex-1 py-2 text-sm transition-colors"
            style={{
              color: active ? '#6365b9' : '#666666',
              fontWeight: active ? 700 : 400,
              borderBottom: active ? '2px solid #6365b9' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}


