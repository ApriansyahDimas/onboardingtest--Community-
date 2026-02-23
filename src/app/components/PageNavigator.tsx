import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface PageNavigatorProps {
  currentIndex: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onAddPage?: () => void;
  /** Bottom offset in px (default 0) */
  bottomOffset?: number;
}

export function PageNavigator({
  currentIndex,
  totalPages,
  onPrev,
  onNext,
  onAddPage,
  bottomOffset = 0,
}: PageNavigatorProps) {
  return (
    <div
      className="fixed left-0 right-0 z-30 flex justify-center pointer-events-none"
      style={{ bottom: bottomOffset }}
    >
      <div
        className="w-full flex items-center justify-between bg-white border-t border-[#eeeeee] pointer-events-auto"
        style={{ maxWidth: 460, height: 64, paddingLeft: 16, paddingRight: 16 }}
      >
        {/* Prev */}
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-sm px-4 py-2 rounded-xl border border-[#eeeeee] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f5f5f5] transition-colors text-[#111111]"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        {/* Center: optional add page */}
        <div className="flex items-center gap-3">
          {onAddPage && (
            <button
              type="button"
              onClick={onAddPage}
              className="flex items-center gap-1 text-sm px-3 py-2 rounded-xl brand-gradient-bg text-white hover:opacity-95 transition-colors"
            >
              <Plus size={14} />
              Add page
            </button>
          )}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex >= totalPages - 1}
          className="flex items-center gap-1 text-sm px-4 py-2 rounded-xl border border-[#eeeeee] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f5f5f5] transition-colors text-[#111111]"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

