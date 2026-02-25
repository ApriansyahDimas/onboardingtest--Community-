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
          <div className="mt-4 flex items-center gap-2">
            <span
              className="text-xs px-3 rounded-full inline-flex items-center justify-center"
              style={{
                background: 'var(--brand-gradient-soft)',
                color: '#6365b9',
                fontWeight: 600,
                minHeight: 28,
                lineHeight: 1,
              }}
            >
              Day {daysOnboarded} of onboarding
            </span>
          </div>
        )}
        <p
          className="text-[#666666] text-sm mt-3 leading-relaxed"
          style={{
            marginLeft: -8,
            marginRight: -8,
            paddingLeft: 10,
            paddingRight: 10,
            textAlign: 'justify',
            textIndent: '1.5em',
          }}
        >
          Welcome to Imajin. We are happy you chose to join us. This onboarding page is
          here to support you from day one, so you can understand how we work and start
          collaborating with confidence. Let&apos;s get started.
        </p>
      </div>

      {/* Progress ring */}
      <div className="rounded-2xl border border-[#eeeeee] p-6 flex flex-col items-center">
        <ProgressRing percentage={progress} size={132} strokeWidth={11} />
        <p className="mt-3 text-sm text-[#666666]">Onboarding progress</p>
        <div className="mt-4 flex items-center gap-2.5">
          <div className="flex-1 rounded-xl border border-[#eeeeee] bg-[#fafafa] px-3 py-2.5 text-center">
            <p className="text-[11px] text-[#666666] leading-none">Completed</p>
            <p
              className="text-[#111111] mt-1"
              style={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1 }}
            >
              {completed}
            </p>
          </div>
          <div className="flex-1 rounded-xl border border-[#eeeeee] bg-[#fafafa] px-3 py-2.5 text-center">
            <p className="text-[11px] text-[#666666] leading-none">Remaining</p>
            <p
              className="text-[#111111] mt-1"
              style={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1 }}
            >
              {totalAssigned - completed}
            </p>
          </div>
          <div className="flex-1 rounded-xl border border-[#eeeeee] bg-[#fafafa] px-3 py-2.5 text-center">
            <p className="text-[11px] text-[#666666] leading-none">Total</p>
            <p
              className="text-[#111111] mt-1"
              style={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1 }}
            >
              {totalAssigned}
            </p>
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
              className="flex items-center gap-1 text-sm text-[#6365b9]"
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



