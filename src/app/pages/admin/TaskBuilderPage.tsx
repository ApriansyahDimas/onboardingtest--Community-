import { useState, useCallback, useRef, useEffect, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Type, Image, Youtube, Map, Plus, MoreVertical,
  ArrowLeft, Trash2, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SectionEditor } from '../../components/sections/SectionEditor';
import { PageNavigator } from '../../components/PageNavigator';
import type { SectionType } from '../../types';
import { debounce, readFileAsDataUrl } from '../../lib/utils';

const TOOLBAR_SECTIONS: { type: SectionType; label: string; icon: React.ReactNode }[] = [
  { type: 'TEXT_BOX', label: 'Text', icon: <Type size={16} /> },
  { type: 'IMAGE', label: 'Image', icon: <Image size={16} /> },
  { type: 'YOUTUBE', label: 'YouTube', icon: <Youtube size={16} /> },
  { type: 'MAPS', label: 'Maps', icon: <Map size={16} /> },
];

const MORE_SECTIONS: { type: SectionType; label: string }[] = [
  { type: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { type: 'YES_NO', label: 'Yes / No' },
  { type: 'ESSAY', label: 'Essay Field' },
  { type: 'IMAGE_CHOICE', label: 'Image Choice' },
  { type: 'UPLOAD_FILE', label: 'Upload File' },
];

export function TaskBuilderPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { state, updateTask, createPage, deletePage, createSection, updateSection, deleteSection } =
    useApp();

  const task = state.tasks.find((t) => t.id === taskId);
  const pages = state.pages
    .filter((p) => p.taskId === taskId)
    .sort((a, b) => a.index - b.index);

  const [pageIndex, setPageIndex] = useState(0);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(task?.title ?? '');
  const [coverUploadError, setCoverUploadError] = useState('');
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task) setTitleValue(task.title);
  }, [task?.id]);

  const saveTitle = useCallback(
    debounce((val: string) => {
      if (taskId) updateTask(taskId, { title: val });
    }, 600),
    [taskId]
  );

  const debouncedUpdateSection = useCallback(
    (sectionId: string, updates: Parameters<typeof updateSection>[1]) => {
      updateSection(sectionId, updates);
    },
    [updateSection]
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#666666]">Task not found.</p>
      </div>
    );
  }

  const handleOpeningCoverUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploadError('');

    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateTask(task.id, { openingCoverUrl: dataUrl });
    } catch {
      setCoverUploadError('Failed to read image file.');
    } finally {
      e.target.value = '';
    }
  };

  const currentPage = pages[pageIndex];
  const currentSections = currentPage
    ? state.sections
        .filter((s) => s.pageId === currentPage.id)
        .sort((a, b) => a.index - b.index)
    : [];

  const addSection = (type: SectionType) => {
    if (!currentPage) return;
    createSection(currentPage.id, type);
    setShowMoreMenu(false);
  };

  const handleAddPage = () => {
    createPage(task.id);
    setPageIndex(pages.length);
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) {
      alert('A task must have at least one page.');
      return;
    }
    if (!confirm('Delete this page and all its sections?')) return;
    deletePage(currentPage.id);
    setPageIndex(Math.max(0, pageIndex - 1));
    setShowMoreMenu(false);
  };

  const selectedSection = currentSections.find((s) => s.id === selectedSectionId);

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed toolbar */}
      <div
        className="fixed top-0 left-0 right-0 z-30 flex justify-center bg-white border-b border-[#eeeeee]"
      >
        <div className="w-full" style={{ maxWidth: 460 }}>
          {/* Row 1: back + title */}
          <div className="flex items-center px-3" style={{ height: 52 }}>
            <button
              type="button"
              onClick={() => navigate('/admin/tasks')}
              className="p-2 rounded-lg text-[#666666] hover:bg-[#f5f5f5] mr-1 flex-shrink-0"
            >
              <ArrowLeft size={18} />
            </button>

            {titleEditing ? (
              <input
                autoFocus
                value={titleValue}
                onChange={(e) => {
                  setTitleValue(e.target.value);
                  saveTitle(e.target.value);
                }}
                onBlur={() => setTitleEditing(false)}
                className="flex-1 text-[#111111] outline-none border-b border-[#6365b9] px-1 bg-transparent"
                style={{ fontWeight: 700, fontSize: '1rem' }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setTitleEditing(true)}
                className="flex-1 text-left text-[#111111] truncate px-1"
                style={{ fontWeight: 700, fontSize: '1rem' }}
              >
                {titleValue || 'Untitled Task'}
              </button>
            )}

            <span className="text-xs text-[#999999] ml-2 flex-shrink-0">Saved</span>
          </div>

          {/* Row 2: section type toolbar */}
          <div className="flex items-center px-2 pb-2 gap-1">
            <div
              className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Quick-add buttons */}
              {TOOLBAR_SECTIONS.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  onClick={() => addSection(s.type)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#eeeeee] text-xs text-[#111111] hover:bg-[#f5f5f5] transition-colors flex-shrink-0"
                  style={{ minHeight: 36 }}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>

            {/* More menu */}
            <div className="relative flex-shrink-0" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setShowMoreMenu((v) => !v)}
                className="flex items-center justify-center p-2 rounded-xl border border-[#eeeeee] text-[#111111] hover:bg-[#f5f5f5] transition-colors"
                style={{ width: 36, height: 36 }}
              >
                <MoreVertical size={16} />
              </button>

              {showMoreMenu && (
                <MoreMenuPanel
                  task={task}
                  selectedSection={selectedSection ?? null}
                  onClose={() => setShowMoreMenu(false)}
                  onAddSection={addSection}
                  onDeletePage={handleDeletePage}
                  onUpdateTask={(updates) => updateTask(task.id, updates)}
                  onUpdateSection={(updates) =>
                    selectedSectionId && updateSection(selectedSectionId, updates)
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="overflow-y-auto px-4"
        style={{ paddingTop: 108, paddingBottom: 80 }}
      >
        {/* Opening Page editor */}
        {task.includeOpeningPage && (
          <div className="mb-4 rounded-xl border border-[#6365b9]/30 p-4 brand-gradient-bg-soft">
            <p className="text-xs text-[#6365b9] mb-3" style={{ fontWeight: 600 }}>
              Opening Page
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#666666]">Cover image</label>
                <div className="mt-1 rounded-lg border border-[#eeeeee] bg-white p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm text-white cursor-pointer"
                      style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
                    >
                      Upload image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleOpeningCoverUpload}
                      />
                    </label>
                    {task.openingCoverUrl && (
                      <button
                        type="button"
                        onClick={() => updateTask(task.id, { openingCoverUrl: '' })}
                        className="px-3 py-2 rounded-lg text-sm border border-[#eeeeee] text-[#666666] hover:bg-[#fafafa] transition-colors"
                      >
                        Remove image
                      </button>
                    )}
                    <span className="text-xs text-[#999999]">
                      PNG, JPG, WebP
                    </span>
                  </div>
                </div>
                {coverUploadError && (
                  <p className="mt-2 text-xs text-red-500">{coverUploadError}</p>
                )}
                {task.openingCoverUrl && (
                  <img
                    src={task.openingCoverUrl}
                    alt="cover preview"
                    className="mt-2 rounded-lg w-full object-cover"
                    style={{ height: 120 }}
                  />
                )}
              </div>
              <div>
                <label className="text-xs text-[#666666]">Caption</label>
                <input
                  type="text"
                  value={task.openingCaption ?? ''}
                  onChange={(e) => updateTask(task.id, { openingCaption: e.target.value })}
                  placeholder="Welcome message..."
                  className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#6365b9] mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sections */}
        {currentSections.map((section) => (
          <SectionEditor
            key={section.id}
            section={section}
            isSelected={selectedSectionId === section.id}
            onSelect={() => setSelectedSectionId(section.id)}
            onUpdate={(updates) => debouncedUpdateSection(section.id, updates)}
            onDelete={() => {
              deleteSection(section.id);
              if (selectedSectionId === section.id) setSelectedSectionId(null);
            }}
          />
        ))}

        {/* Add section row */}
        <button
          type="button"
          onClick={() => setShowMoreMenu(true)}
          className="w-full flex items-center justify-center border-2 border-dashed border-[#eeeeee] rounded-xl hover:border-[#6365b9] hover-brand-gradient-bg-soft transition-colors"
          style={{ height: 56 }}
        >
          <Plus size={16} className="text-[#6365b9] mr-2" />
          <span className="text-sm text-[#6365b9]">Add section</span>
        </button>
      </div>

      {/* Page navigator – no bottom bar in builder */}
      <PageNavigator
        currentIndex={pageIndex}
        totalPages={pages.length}
        onPrev={() => setPageIndex((i) => Math.max(0, i - 1))}
        onNext={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
        onAddPage={handleAddPage}
        bottomOffset={0}
      />
    </div>
  );
}

// ── More menu panel ──────────────────────────────────────────────────────────
interface MoreMenuPanelProps {
  task: ReturnType<typeof useApp>['state']['tasks'][number];
  selectedSection: ReturnType<typeof useApp>['state']['sections'][number] | null;
  onClose: () => void;
  onAddSection: (type: SectionType) => void;
  onDeletePage: () => void;
  onUpdateTask: (updates: Partial<typeof task>) => void;
  onUpdateSection: (updates: { colorTheme?: string }) => void;
}

function MoreMenuPanel({
  task,
  selectedSection,
  onClose,
  onAddSection,
  onDeletePage,
  onUpdateTask,
  onUpdateSection,
}: MoreMenuPanelProps) {
  return (
    <div
      className="absolute top-10 right-0 z-50 bg-white border border-[#eeeeee] rounded-2xl shadow-xl"
      style={{ width: 260 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#eeeeee]">
        <span className="text-sm text-[#111111]" style={{ fontWeight: 600 }}>
          Options
        </span>
        <button type="button" onClick={onClose} className="text-[#999999] hover:text-[#111111]">
          <X size={16} />
        </button>
      </div>

      {/* A: Opening page toggle */}
      <div className="px-4 py-3 border-b border-[#eeeeee]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#111111]">Include opening page</span>
          <button
            type="button"
            role="switch"
            aria-checked={task.includeOpeningPage}
            onClick={() => onUpdateTask({ includeOpeningPage: !task.includeOpeningPage })}
            className="relative inline-flex items-center flex-shrink-0 rounded-full transition-colors"
            style={{
              width: 40,
              height: 22,
              background: task.includeOpeningPage ? 'var(--brand-gradient)' : '#cccccc',
            }}
          >
            <span
              className="inline-block bg-white rounded-full shadow transition-transform"
              style={{
                width: 18,
                height: 18,
                transform: task.includeOpeningPage ? 'translateX(20px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>
        <p className="text-xs text-[#999999] mt-1">
          Users will see a cover page before Page 1.
        </p>
      </div>

      {/* B: Insert sections */}
      <div className="px-4 py-3 border-b border-[#eeeeee]">
        <p
          className="text-xs text-[#666666] mb-2"
          style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          Insert section
        </p>
        <div className="space-y-1">
          {[...TOOLBAR_SECTIONS, ...MORE_SECTIONS].map((s) => (
            <button
              key={s.type}
              type="button"
              onClick={() => onAddSection(s.type)}
              className="w-full text-left px-2 py-2 text-sm text-[#111111] rounded-lg hover:bg-[#f5f5f5]"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* C: Section color */}
      <div className="px-4 py-3 border-b border-[#eeeeee]">
        <p
          className="text-xs text-[#666666] mb-2"
          style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          Section color
        </p>
        {selectedSection ? (
          <div className="flex gap-2">
            {[
              { value: 'DEFAULT', label: 'Default', bg: '#ffffff', border: '#cccccc' },
              { value: 'PRIMARY_TINT', label: 'Primary', bg: '#6365b9', border: '#6365b9' },
              { value: 'ACCENT_TINT', label: 'Accent', bg: '#ffde55', border: '#cccc00' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdateSection({ colorTheme: opt.value })}
                title={opt.label}
                className="flex items-center justify-center rounded-full border-2 transition-all"
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: opt.bg,
                  borderColor:
                    selectedSection.colorTheme === opt.value ? '#6365b9' : opt.border,
                  boxShadow:
                    selectedSection.colorTheme === opt.value
                      ? '0 0 0 2px #6365b9'
                      : 'none',
                }}
              >
                {selectedSection.colorTheme === opt.value && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path
                      d="M1 5L4.5 8.5L11 1"
                      stroke={
                        opt.value === 'DEFAULT'
                          ? '#6365b9'
                          : opt.value === 'ACCENT_TINT'
                          ? '#333'
                          : 'white'
                      }
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#999999]">Select a section to set its color.</p>
        )}
      </div>

      {/* Delete page */}
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={onDeletePage}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
        >
          <Trash2 size={14} />
          Delete this page
        </button>
      </div>
    </div>
  );
}





