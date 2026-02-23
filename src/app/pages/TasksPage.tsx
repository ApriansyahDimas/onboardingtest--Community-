import { useNavigate } from 'react-router';
import { useApp, isGroupLocked, daysSince } from '../context/AppContext';
import { TaskCard } from '../components/TaskCard';
import { Lock } from 'lucide-react';

export function TasksPage() {
  const { state, currentUser, getUserTaskGroups } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const groups = getUserTaskGroups(currentUser.id);
  const myAssignments = state.assignments.filter((a) => a.userId === currentUser.id);

  // If no groups defined, fall back to flat list
  if (groups.length === 0) {
    return (
      <div className="px-4 pt-6 pb-6">
        {myAssignments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#666666] mb-4">
              {myAssignments.length} task{myAssignments.length !== 1 ? 's' : ''} assigned
            </p>
            {myAssignments.map((assignment) => {
              const task = state.tasks.find((t) => t.id === assignment.taskId);
              if (!task) return null;
              return (
                <TaskCard
                  key={assignment.id}
                  task={task}
                  assignment={assignment}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Total count
  const allTaskIds = Array.from(new Set(groups.flatMap((g) => g.taskIds)));
  const total = allTaskIds.length;
  const completed = myAssignments.filter(
    (a) => allTaskIds.includes(a.taskId) && a.status === 'COMPLETED'
  ).length;

  return (
    <div className="px-4 pt-6 pb-6">
      {/* Summary */}
      <p className="text-sm text-[#666666] mb-6">
        {completed} of {total} task{total !== 1 ? 's' : ''} completed
      </p>

      <div className="space-y-8">
        {groups.map((group) => {
          const locked = isGroupLocked(group, currentUser);

          // Compute unlock info
          let unlockInfo = '';
          if (locked && group.unlockAfterDays !== null && currentUser.joinDate) {
            const elapsed = daysSince(currentUser.joinDate);
            const remaining = group.unlockAfterDays - elapsed;
            unlockInfo = remaining > 0
              ? `Unlocks in ${remaining} day${remaining !== 1 ? 's' : ''}`
              : 'Unlocks soon';
          }

          return (
            <div key={group.id}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {locked && <Lock size={14} className="text-[#999999] flex-shrink-0" />}
                  <h3
                    className="text-[#111111]"
                    style={{ fontWeight: 700, fontSize: '0.95rem' }}
                  >
                    {group.name}
                  </h3>
                </div>
                {locked && unlockInfo && (
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: '#f5f5f5', color: '#999999' }}
                  >
                    {unlockInfo}
                  </span>
                )}
                {locked && !unlockInfo && (
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: '#f5f5f5', color: '#999999' }}
                  >
                    Locked
                  </span>
                )}
                {!locked && group.unlockAfterDays !== null && currentUser.joinDate && (
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ background: 'var(--brand-gradient-soft)', color: '#7f15a8' }}
                  >
                    Day {daysSince(currentUser.joinDate)}
                  </span>
                )}
              </div>

              {/* Tasks in this group */}
              {group.taskIds.length === 0 ? (
                <p className="text-sm text-[#999999] pl-1">No tasks in this section yet.</p>
              ) : (
                <div className="space-y-3">
                  {group.taskIds.map((taskId) => {
                    const task = state.tasks.find((t) => t.id === taskId);
                    const assignment = myAssignments.find((a) => a.taskId === taskId);
                    if (!task) return null;
                    return (
                      <TaskCard
                        key={taskId}
                        task={task}
                        assignment={assignment}
                        locked={locked}
                        onClick={locked ? undefined : () => navigate(`/tasks/${task.id}`)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className="flex items-center justify-center rounded-2xl bg-[#f5f5f5] mb-4"
        style={{ width: 56, height: 56 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cccccc" strokeWidth="2">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      </div>
      <p className="text-[#666666] text-sm">No tasks assigned yet.</p>
      <p className="text-[#999999] text-xs mt-1">Your admin will assign tasks to you.</p>
    </div>
  );
}


