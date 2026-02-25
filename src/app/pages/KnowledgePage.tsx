import { Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const KNOWLEDGE_ITEMS = [
  { id: 'k1', title: 'Company Handbook', description: 'Policies, culture, and guidelines.', locked: false },
  { id: 'k2', title: 'Benefits Guide', description: 'Learn about your benefits and perks.', locked: false },
  { id: 'k3', title: 'IT Setup Guide', description: 'Tools, access, and setup instructions.', locked: false },
  { id: 'k4', title: 'Security Policies', description: 'Data handling and security best practices.', locked: true },
  { id: 'k5', title: 'Advanced Workflows', description: 'For experienced team members.', locked: true },
];

export function KnowledgePage() {
  const { state, currentUser } = useApp();

  const myAssignments = state.assignments.filter((a) => a.userId === currentUser?.id);
  const completed = myAssignments.filter((a) => a.status === 'COMPLETED').length;
  const total = myAssignments.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="px-4 pt-6 pb-4">
      <p className="text-sm text-[#666666] mb-6">
        Resources and guides to help you succeed.
      </p>

      <div className="space-y-3">
        {KNOWLEDGE_ITEMS.map((item) => {
          const isLocked = item.locked && progress < 50;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-[#eeeeee] px-4 py-4 flex items-center gap-3"
              style={{ opacity: isLocked ? 0.5 : 1 }}
            >
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  background: isLocked ? '#f5f5f5' : 'var(--brand-gradient-soft)',
                }}
              >
                {isLocked ? (
                  <Lock size={18} className="text-[#cccccc]" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6365b9" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#111111] text-sm" style={{ fontWeight: 600 }}>
                  {item.title}
                </p>
                <p className="text-[#666666] text-xs mt-0.5">{item.description}</p>
              </div>
              {isLocked && (
                <span className="text-xs text-[#999999] flex-shrink-0">50% to unlock</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}



