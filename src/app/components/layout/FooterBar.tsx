import { useNavigate, useLocation } from 'react-router';
import { useApp } from '../../context/AppContext';
import { getInitials } from '../../lib/utils';

export function FooterBar() {
  const { state, setAdminMode, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = currentUser?.role === 'ADMIN';

  const handleAdminToggle = () => {
    if (!isAdmin) return;
    const next = !state.adminMode;
    setAdminMode(next);
    if (next) {
      navigate('/admin/tasks');
    } else {
      navigate('/dashboard');
    }
  };

  const goToProfile = () => navigate('/profile');

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-white border-t border-[#eeeeee]"
    >
      <div
        className="w-full flex items-center justify-between px-4"
        style={{ maxWidth: 460, height: 64 }}
      >
        {/* Left: Admin mode toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={state.adminMode}
            onClick={handleAdminToggle}
            disabled={!isAdmin}
            className="relative inline-flex items-center flex-shrink-0 rounded-full transition-colors focus:outline-none"
            style={{
              width: 40,
              height: 22,
              background: state.adminMode ? 'var(--brand-gradient)' : '#cccccc',
              opacity: isAdmin ? 1 : 0.4,
              cursor: isAdmin ? 'pointer' : 'not-allowed',
            }}
          >
            <span
              className="inline-block bg-white rounded-full shadow transition-transform"
              style={{
                width: 18,
                height: 18,
                transform: state.adminMode ? 'translateX(20px)' : 'translateX(2px)',
              }}
            />
          </button>
          <span className="text-xs text-[#666666]" style={{ whiteSpace: 'nowrap' }}>
            Admin mode
          </span>
        </div>

        {/* Center: Company logo */}
        <div className="flex items-center justify-center">
          <span
            className="text-[#7f15a8]"
            style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}
          >
            Company
          </span>
        </div>

        {/* Right: Profile avatar */}
        <button
          type="button"
          onClick={goToProfile}
          className="flex items-center justify-center rounded-full brand-gradient-bg text-white flex-shrink-0 transition-opacity hover:opacity-85"
          style={{ width: 38, height: 38, fontSize: '0.8rem', fontWeight: 700 }}
          aria-label="Profile"
        >
          {currentUser?.image ? (
            <img
              src={currentUser.image}
              alt={currentUser.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{currentUser ? getInitials(currentUser.name) : '?'}</span>
          )}
        </button>
      </div>
    </div>
  );
}



