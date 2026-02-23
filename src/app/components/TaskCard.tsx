import { ChevronRight, FileText, Lock } from 'lucide-react';
import type { Task, Assignment } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TaskCardProps {
  task: Task;
  assignment?: Assignment;
  onClick?: () => void;
  selected?: boolean;
  selectionMode?: boolean;
  locked?: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

const STATUS_COLOR: Record<string, string> = {
  NOT_STARTED: 'text-[#666666]',
  IN_PROGRESS: 'text-[#7f15a8]',
  COMPLETED: 'text-green-600',
};

export function TaskCard({
  task,
  assignment,
  onClick,
  selected,
  selectionMode,
  locked,
}: TaskCardProps) {
  const statusKey = assignment?.status ?? 'NOT_STARTED';

  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      className="w-full text-left"
      style={{ outline: 'none', cursor: locked ? 'default' : 'pointer' }}
    >
      <div
        className="flex items-center w-full rounded-xl border px-4 transition-colors"
        style={{
          height: 80,
          borderColor: selected ? '#7f15a8' : '#eeeeee',
          background: locked
            ? '#f9f9f9'
            : selected
            ? 'var(--brand-gradient-soft)'
            : '#ffffff',
          boxShadow: selected ? '0 0 0 2px #7f15a8' : 'none',
          opacity: locked ? 0.7 : 1,
        }}
      >
        {selectionMode && (
          <div
            className="mr-3 flex-shrink-0 rounded-full border-2 flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderColor: selected ? '#7f15a8' : '#cccccc',
              background: selected ? 'var(--brand-gradient)' : 'transparent',
            }}
          >
            {selected && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path
                  d="M1 4.5L4 7.5L10 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        )}
        <TaskThumbnail task={task} />
        <div className="flex-1 min-w-0">
          <p className="text-[#111111] truncate" style={{ fontWeight: 600 }}>
            {task.title}
          </p>
          {locked ? (
            <p className="mt-1 text-xs text-[#999999]">Locked</p>
          ) : assignment ? (
            <p className={`mt-1 text-sm ${STATUS_COLOR[statusKey]}`}>
              {STATUS_LABEL[statusKey]}
            </p>
          ) : (
            <p className="mt-1 text-sm text-[#666666]">Draft</p>
          )}
        </div>
        {locked ? (
          <Lock size={16} className="text-[#cccccc] flex-shrink-0 ml-2" />
        ) : (
          !selectionMode && (
            <ChevronRight size={18} className="text-[#666666] flex-shrink-0 ml-2" />
          )
        )}
      </div>
    </button>
  );
}

function TaskThumbnail({ task }: { task: Task }) {
  const hasImage = !!task.openingCoverUrl?.trim();

  return (
    <div
      className="mr-3 flex-shrink-0 overflow-hidden rounded-lg border"
      style={{
        width: 52,
        height: 52,
        borderColor: '#eeeeee',
        backgroundColor: '#f7f7fb',
      }}
      aria-hidden="true"
    >
      {hasImage ? (
        <ImageWithFallback
          src={task.openingCoverUrl}
          alt=""
          className="w-full h-full object-cover"
          style={{ display: 'block' }}
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(99,101,185,0.14) 0%, rgba(99,101,185,0.04) 100%)',
          }}
        >
          <FileText size={14} className="text-[#7f15a8]" />
          <span
            className="mt-0.5 text-[10px] leading-none uppercase tracking-wide"
            style={{ color: '#7f15a8', fontWeight: 700 }}
          >
            Task
          </span>
        </div>
      )}
    </div>
  );
}


