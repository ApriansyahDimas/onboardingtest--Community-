import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from '../../components/TaskCard';

export function AdminTasksPage() {
  const { state, createTask } = useApp();
  const navigate = useNavigate();

  const handleCreateTask = () => {
    const task = createTask();
    navigate(`/admin/tasks/${task.id}/builder`);
  };

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[#111111]" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Task Library
          </h2>
          <p className="text-sm text-[#666666] mt-0.5">
            {state.tasks.length} task{state.tasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateTask}
          className="flex items-center gap-1.5 text-sm text-white px-4 py-2.5 rounded-xl"
          style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
        >
          <Plus size={15} />
          New Task
        </button>
      </div>

      {state.tasks.length === 0 ? (
        <button
          type="button"
          onClick={handleCreateTask}
          className="w-full border-2 border-dashed border-[#eeeeee] rounded-xl flex flex-col items-center justify-center transition-colors hover:border-[#6365b9] hover-brand-gradient-bg-soft"
          style={{ height: 120 }}
        >
          <div
            className="flex items-center justify-center rounded-full mb-2"
            style={{ width: 44, height: 44, background: 'var(--brand-gradient-soft)' }}
          >
            <Plus size={22} className="text-[#6365b9]" />
          </div>
          <span className="text-sm text-[#6365b9]" style={{ fontWeight: 600 }}>
            Create your first task
          </span>
        </button>
      ) : (
        <div className="space-y-3">
          {state.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => navigate(`/admin/tasks/${task.id}/builder`)}
            />
          ))}
          <button
            type="button"
            onClick={handleCreateTask}
            className="w-full border-2 border-dashed border-[#eeeeee] rounded-xl flex items-center justify-center transition-colors hover:border-[#6365b9] hover-brand-gradient-bg-soft"
            style={{ height: 56 }}
          >
            <Plus size={16} className="text-[#6365b9] mr-2" />
            <span className="text-sm text-[#6365b9]" style={{ fontWeight: 500 }}>
              Add task
            </span>
          </button>
        </div>
      )}
    </div>
  );
}





