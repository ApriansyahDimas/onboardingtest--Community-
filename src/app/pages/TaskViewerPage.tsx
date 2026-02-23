import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionRenderer } from '../components/sections/SectionRenderer';
import { PageNavigator } from '../components/PageNavigator';
import type { Section } from '../types';

type ViewStage = 'opening' | 'pages';

export function TaskViewerPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { state, currentUser, saveAnswer, completeTask } = useApp();
  const navigate = useNavigate();

  const task = state.tasks.find((t) => t.id === taskId);
  const assignment = state.assignments.find(
    (a) => a.taskId === taskId && a.userId === currentUser?.id
  );

  const pages = state.pages
    .filter((p) => p.taskId === taskId)
    .sort((a, b) => a.index - b.index);

  const [stage, setStage] = useState<ViewStage>(
    task?.includeOpeningPage ? 'opening' : 'pages'
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (assignment?.status === 'COMPLETED') {
      setCompleted(true);
    }
  }, [assignment?.status]);

  if (!task || !assignment) {
    return (
      <div className="min-h-screen bg-white flex justify-center">
        <div className="relative w-full" style={{ maxWidth: 460 }}>
          {/* Back header */}
          <div
            className="fixed top-0 left-0 right-0 z-30 flex justify-center bg-white"
            style={{ borderBottom: '1px solid #eeeeee' }}
          >
            <div
              className="w-full flex items-center px-3 gap-2"
              style={{ maxWidth: 460, height: 56 }}
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl text-[#666666] hover:bg-[#f5f5f5] transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-[#111111] flex-1 truncate" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                Task
              </h1>
            </div>
          </div>
          <div className="px-4 pt-20">
            <p className="text-[#666666] text-sm">Task not found or not assigned to you.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPage = pages[pageIndex];
  const currentSections: Section[] = currentPage
    ? state.sections
        .filter((s) => s.pageId === currentPage.id)
        .sort((a, b) => a.index - b.index)
    : [];

  const getAnswer = (sectionId: string) => {
    const ans = state.answers.find(
      (a) => a.assignmentId === assignment.id && a.sectionId === sectionId
    );
    return ans?.value;
  };

  const handleAnswer = (sectionId: string, value: unknown) => {
    saveAnswer(assignment.id, sectionId, value);
  };

  const allRequiredFilled = () => {
    const allSections = state.sections.filter((s) =>
      pages.some((p) => p.id === s.pageId)
    );
    const required = allSections.filter((s) => s.required);
    return required.every((s) => {
      const ans = getAnswer(s.id);
      if (ans === undefined || ans === null || ans === '') return false;
      return true;
    });
  };

  const handleComplete = () => {
    setCompleting(true);
    setTimeout(() => {
      completeTask(assignment.id);
      setCompleted(true);
      setCompleting(false);
    }, 400);
  };

  // ── Full-screen layout (no AppShell bars) ──────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="relative w-full bg-white" style={{ maxWidth: 460 }}>

        {/* Fixed back header */}
        <div
          className="fixed top-0 left-0 right-0 z-30 flex justify-center bg-white"
          style={{ borderBottom: '1px solid #eeeeee' }}
        >
          <div
            className="w-full flex items-center px-3 gap-2"
            style={{ maxWidth: 460, height: 56 }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-[#666666] hover:bg-[#f5f5f5] transition-colors flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <h1
              className="text-[#111111] flex-1 truncate"
              style={{ fontWeight: 700, fontSize: '1.05rem' }}
            >
              {task.title}
            </h1>
          </div>
        </div>

        {/* ── Opening page ── */}
        {stage === 'opening' && (
          <div className="flex flex-col" style={{ paddingTop: 56, minHeight: '100vh' }}>
            {task.openingCoverUrl && (
              <div className="w-full" style={{ height: 260 }}>
                <img
                  src={task.openingCoverUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 flex flex-col px-6 pt-8 pb-8">
              <h2
                className="text-[#111111]"
                style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 12 }}
              >
                {task.title}
              </h2>
              {task.openingCaption && (
                <p className="text-[#666666] text-sm leading-relaxed mb-8">
                  {task.openingCaption}
                </p>
              )}
              <div className="mt-auto">
                <button
                  type="button"
                  onClick={() => setStage('pages')}
                  className="w-full rounded-xl py-3 text-white text-sm"
                  style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Completed state ── */}
        {stage === 'pages' && completed && (
          <div
            className="flex flex-col items-center justify-center px-6 text-center"
            style={{ paddingTop: 56, minHeight: '100vh' }}
          >
            <div
              className="flex items-center justify-center rounded-full bg-green-100 mb-4"
              style={{ width: 72, height: 72 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2
              className="text-[#111111]"
              style={{ fontWeight: 700, fontSize: '1.375rem', marginBottom: 8 }}
            >
              Task Complete!
            </h2>
            <p className="text-[#666666] text-sm mb-8">
              You have successfully completed "{task.title}".
            </p>
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="px-8 py-3 rounded-xl text-white text-sm"
              style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
            >
              Back to Tasks
            </button>
          </div>
        )}

        {/* ── Pages view ── */}
        {stage === 'pages' && !completed && (
          <>
            <div className="px-4 pt-4" style={{ paddingTop: 72, paddingBottom: 144 }}>
              {currentPage?.title && (
                <p className="text-xs text-[#666666] mb-4 uppercase tracking-wider">
                  {currentPage.title}
                </p>
              )}

              <div>
                {currentSections.map((section) => (
                  <SectionRenderer
                    key={section.id}
                    section={section}
                    answer={getAnswer(section.id)}
                    onAnswer={(val) => handleAnswer(section.id, val)}
                  />
                ))}
              </div>

              {currentSections.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[#999999] text-sm">No content on this page.</p>
                </div>
              )}

              {/* Complete button on last page */}
              {pageIndex >= pages.length - 1 && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={!allRequiredFilled() || completing}
                    className="w-full rounded-xl py-3 text-white text-sm transition-opacity disabled:opacity-40"
                    style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
                  >
                    {completing ? 'Completing...' : 'Complete Task'}
                  </button>
                  {!allRequiredFilled() && (
                    <p className="text-xs text-[#999999] text-center mt-2">
                      Complete all required fields to finish.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Page navigator – no bottom nav, so bottomOffset = 0 */}
            <PageNavigator
              currentIndex={pageIndex}
              totalPages={pages.length}
              onPrev={() => setPageIndex((i) => Math.max(0, i - 1))}
              onNext={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
              bottomOffset={0}
            />
          </>
        )}
      </div>
    </div>
  );
}
