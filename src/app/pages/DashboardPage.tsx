import { useNavigate } from 'react-router';
import { useApp, daysSince, isGroupLocked } from '../context/AppContext';
import { ProgressRing } from '../components/ProgressRing';
import { TaskCard } from '../components/TaskCard';
import { ChevronRight } from 'lucide-react';

export function DashboardPage() {
  const { state, currentUser, getUserTaskGroups } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const groups = getUserTaskGroups(currentUser.id);
  const myAssignments = state.assignments.filter((a) => a.userId === currentUser.id);

  const totalAssigned = myAssignments.length;
  const completed = myAssignments.filter((a) => a.status === 'COMPLETED').length;
  const progress = totalAssigned === 0 ? 0 : Math.round((completed / totalAssigned) * 100);

  const daysOnboarded = currentUser.joinDate ? daysSince(currentUser.joinDate) : null;
  const greetingName =
    currentUser.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .join(' ') || 'User';

  // Most recent 3 unlocked assignments
  const recentAssignments = myAssignments.slice(0, 3).filter((assignment) => {
    // Check if the task is in a locked group
    const taskLocked = groups.some((g) => {
      return g.taskIds.includes(assignment.taskId) && isGroupLocked(g, currentUser);
    });
    return !taskLocked;
  });

  return (
    <div className="px-4 pt-6 pb-6">
      {/* Greeting */}
      <div className="mb-6">
        <h2
          className="mt-0.5"
          style={{
            fontWeight: 900,
            fontSize: '1.8rem',
            lineHeight: 1.1,
            color: '#ffffff',
            WebkitTextStroke: '2px #201128',
            paintOrder: 'stroke fill',
            textShadow: '2px 2px 0 #201128',
            letterSpacing: '-0.02em',
          }}
        >
          Halo, <span style={{ color: '#ffde55' }}>{greetingName}!</span>
        </h2>
        {daysOnboarded !== null && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'var(--brand-gradient-soft)', color: '#7f15a8', fontWeight: 600 }}
            >
              Day {daysOnboarded} of onboarding
            </span>
          </div>
        )}
        <p className="text-[#666666] text-sm mt-3 leading-relaxed">
          Complete your onboarding tasks to get up to speed with everything you need to know.
        </p>
      </div>

      {/* Progress ring */}
      <div className="rounded-2xl border border-[#eeeeee] p-6 flex flex-col items-center">
        <ProgressRing percentage={progress} size={132} strokeWidth={11} />
        <p className="mt-3 text-sm text-[#666666]">Onboarding progress</p>
        <div className="mt-4 flex items-center gap-6 text-center">
          <div>
            <p className="text-[#111111]" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {completed}
            </p>
            <p className="text-[#666666] text-xs">Completed</p>
          </div>
          <div className="h-8 border-l border-[#eeeeee]" />
          <div>
            <p className="text-[#111111]" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {totalAssigned - completed}
            </p>
            <p className="text-[#666666] text-xs">Remaining</p>
          </div>
          <div className="h-8 border-l border-[#eeeeee]" />
          <div>
            <p className="text-[#111111]" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {totalAssigned}
            </p>
            <p className="text-[#666666] text-xs">Total</p>
          </div>
        </div>
      </div>

      {/* Recent tasks */}
      {recentAssignments.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#111111]" style={{ fontWeight: 600 }}>
              Your tasks
            </h3>
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="flex items-center gap-1 text-sm text-[#7f15a8]"
            >
              See all
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recentAssignments.map((assignment) => {
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
        </div>
      )}

      {totalAssigned === 0 && (
        <div className="mt-6 text-center py-10">
          <p className="text-[#666666] text-sm">No tasks assigned yet.</p>
          <p className="text-[#999999] text-xs mt-1">Check back with your admin.</p>
        </div>
      )}
    </div>
  );
}


