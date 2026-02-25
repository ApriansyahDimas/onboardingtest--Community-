import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp, daysSince } from '../context/AppContext';
import { getInitials, formatDate } from '../lib/utils';
import { LogOut, User, Shield, Calendar, Briefcase, Phone, Building } from 'lucide-react';

export function ProfilePage() {
  const { currentUser, logout, resetToSeed, updateUser } = useApp();
  const navigate = useNavigate();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleReset = () => {
    if (confirm('Reset all data to seed state? This will clear all progress.')) {
      resetToSeed();
      navigate('/login', { replace: true });
    }
  };

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (!editingField) return;
    updateUser(currentUser.id, { [editingField]: editValue });
    setEditingField(null);
  };

  const daysOnboarded = currentUser.joinDate ? daysSince(currentUser.joinDate) : null;

  const infoRows = [
    {
      field: 'name',
      label: 'Full name',
      value: currentUser.name,
      icon: <User size={18} className="text-[#6365b9] flex-shrink-0" />,
      editable: false,
    },
    {
      field: 'email',
      label: 'Email',
      value: currentUser.email,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6365b9" strokeWidth="2" className="flex-shrink-0">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      editable: false,
    },
    {
      field: 'position',
      label: 'Position',
      value: currentUser.position ?? '',
      icon: <Briefcase size={18} className="text-[#6365b9] flex-shrink-0" />,
      editable: true,
    },
    {
      field: 'department',
      label: 'Department',
      value: currentUser.department ?? '',
      icon: <Building size={18} className="text-[#6365b9] flex-shrink-0" />,
      editable: true,
    },
    {
      field: 'phone',
      label: 'Phone',
      value: currentUser.phone ?? '',
      icon: <Phone size={18} className="text-[#6365b9] flex-shrink-0" />,
      editable: true,
    },
    {
      field: 'role',
      label: 'Role',
      value: currentUser.role === 'ADMIN' ? 'Administrator' : 'Employee',
      icon: <Shield size={18} className="text-[#6365b9] flex-shrink-0" />,
      editable: false,
    },
  ];

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Avatar + name */}
      <div className="flex flex-col items-center py-6 mb-6 border border-[#eeeeee] rounded-2xl">
        <div
          className="flex items-center justify-center rounded-full brand-gradient-bg text-white mb-3"
          style={{ width: 72, height: 72, fontSize: '1.25rem', fontWeight: 700 }}
        >
          {currentUser.image ? (
            <img
              src={currentUser.image}
              alt={currentUser.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(currentUser.name)
          )}
        </div>
        <h2
          className="text-[#111111]"
          style={{ fontWeight: 700, fontSize: '1.125rem' }}
        >
          {currentUser.name}
        </h2>
        <p className="text-[#666666] text-sm mt-0.5">{currentUser.email}</p>
        <span
          className="mt-2 text-xs px-3 py-1 rounded-full"
          style={{
            background: currentUser.role === 'ADMIN' ? 'var(--brand-gradient-soft)' : '#f5f5f5',
            color: currentUser.role === 'ADMIN' ? '#6365b9' : '#666666',
            fontWeight: 600,
          }}
        >
          {currentUser.role === 'ADMIN' ? 'Administrator' : 'Employee'}
        </span>

        {/* Join date + days */}
        {currentUser.joinDate && (
          <div className="mt-3 flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-[#999999]">Join date</p>
              <p className="text-sm text-[#111111]" style={{ fontWeight: 600 }}>
                {formatDate(currentUser.joinDate)}
              </p>
            </div>
            {daysOnboarded !== null && (
              <>
                <div className="h-8 border-l border-[#eeeeee]" />
                <div className="text-center">
                  <p className="text-xs text-[#999999]">Day</p>
                  <p
                    className="text-sm"
                    style={{ fontWeight: 700, color: '#6365b9' }}
                  >
                    {daysOnboarded}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info rows */}
      <div className="space-y-3 mb-8">
        {infoRows.map((row) => (
          <div
            key={row.field}
            className="flex items-center gap-3 p-4 rounded-xl border border-[#eeeeee]"
          >
            {row.icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#666666]">{row.label}</p>
              {editingField === row.field ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') setEditingField(null);
                    }}
                    className="flex-1 text-sm text-[#111111] border-b border-[#6365b9] outline-none bg-transparent py-0.5"
                  />
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="text-xs text-[#6365b9]"
                    style={{ fontWeight: 600 }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="text-xs text-[#999999]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[#111111] truncate" style={{ fontWeight: 500 }}>
                  {row.value || '—'}
                </p>
              )}
            </div>
            {row.editable && editingField !== row.field && (
              <button
                type="button"
                onClick={() => startEdit(row.field, row.value)}
                className="text-xs text-[#6365b9] flex-shrink-0 hover:opacity-70"
                style={{ fontWeight: 500 }}
              >
                Edit
              </button>
            )}
          </div>
        ))}

        {/* Join date row */}
        {currentUser.joinDate && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-[#eeeeee]">
            <Calendar size={18} className="text-[#6365b9] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#666666]">Join date</p>
              <p className="text-sm text-[#111111]" style={{ fontWeight: 500 }}>
                {formatDate(currentUser.joinDate)}
              </p>
            </div>
            {daysOnboarded !== null && (
              <span
                className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                style={{ background: 'var(--brand-gradient-soft)', color: '#6365b9', fontWeight: 600 }}
              >
                Day {daysOnboarded}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#eeeeee] text-sm text-[#111111] hover:bg-[#f5f5f5] transition-colors"
          style={{ fontWeight: 500 }}
        >
          <LogOut size={16} />
          Sign out
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
          style={{ fontWeight: 500 }}
        >
          Reset demo data
        </button>
      </div>
    </div>
  );
}




