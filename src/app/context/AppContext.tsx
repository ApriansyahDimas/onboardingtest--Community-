import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type {
  AppState,
  User,
  Task,
  Page,
  Section,
  Assignment,
  Answer,
  SectionType,
  ColorTheme,
  TaskGroup,
  UserTaskGroups,
} from '../types';
import { SEED_DATA } from '../lib/seed';
import { generateId } from '../lib/utils';

const STORAGE_KEY = 'onboarding_app_state_v2';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // Ensure userTaskGroups exists (migration)
      if (!parsed.userTaskGroups) {
        parsed.userTaskGroups = [];
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return { ...SEED_DATA };
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Returns days elapsed since a given ISO date string */
export function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

/** Determines if a TaskGroup is effectively locked for a given user */
export function isGroupLocked(group: TaskGroup, user: User): boolean {
  if (!group.locked) return false;
  if (group.unlockAfterDays !== null && user.joinDate) {
    const elapsed = daysSince(user.joinDate);
    if (elapsed >= group.unlockAfterDays) return false; // auto-unlocked
  }
  return true;
}

interface AppContextType {
  state: AppState;
  // Auth
  login: (email: string, password: string) => boolean;
  logout: () => void;
  // Admin mode
  setAdminMode: (on: boolean) => void;
  // Tasks
  createTask: () => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  // Pages
  createPage: (taskId: string) => Page;
  deletePage: (pageId: string) => void;
  // Sections
  createSection: (pageId: string, type: SectionType) => Section;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;
  // Assignments
  assignTask: (userId: string, taskId: string) => void;
  removeAssignment: (userId: string, taskId: string) => void;
  setUserAssignments: (userId: string, taskIds: string[]) => void;
  // Task Groups
  setUserTaskGroups: (userId: string, groups: TaskGroup[]) => void;
  getUserTaskGroups: (userId: string) => TaskGroup[];
  // Answers
  saveAnswer: (assignmentId: string, sectionId: string, value: unknown) => void;
  // Task completion
  completeTask: (assignmentId: string) => void;
  updateAssignmentStatus: (assignmentId: string, status: Assignment['status']) => void;
  // User management
  addUser: (input: {
    name: string;
    email: string;
    password: string;
    role?: User['role'];
    joinDate?: string;
    department?: string;
    position?: string;
    phone?: string;
    image?: string;
  }) => { ok: boolean; error?: string; user?: User };
  updateUser: (userId: string, updates: Partial<User>) => void;
  // Current user
  currentUser: User | null;
  // Reset
  resetToSeed: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;

  const login = useCallback((email: string, password: string): boolean => {
    const s = loadState();
    const user = s.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return false;
    setState((prev) => ({
      ...prev,
      currentUserId: user.id,
      adminMode: user.role === 'ADMIN',
    }));
    return true;
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, currentUserId: null, adminMode: false }));
  }, []);

  const setAdminMode = useCallback((on: boolean) => {
    setState((prev) => ({ ...prev, adminMode: on }));
  }, []);

  const createTask = useCallback((): Task => {
    const task: Task = {
      id: generateId(),
      title: 'Untitled Task',
      createdById: '',
      includeOpeningPage: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const firstPage: Page = {
      id: generateId(),
      taskId: task.id,
      index: 0,
      title: 'Page 1',
    };
    setState((prev) => {
      const t = { ...task, createdById: prev.currentUserId ?? '' };
      return {
        ...prev,
        tasks: [...prev.tasks, t],
        pages: [...prev.pages, firstPage],
      };
    });
    return task;
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setState((prev) => {
      const pageIds = prev.pages.filter((p) => p.taskId === taskId).map((p) => p.id);
      const sectionIds = prev.sections.filter((s) => pageIds.includes(s.pageId)).map((s) => s.id);
      // Remove taskId from all user task groups
      const updatedGroups = prev.userTaskGroups.map((utg) => ({
        ...utg,
        groups: utg.groups.map((g) => ({
          ...g,
          taskIds: g.taskIds.filter((id) => id !== taskId),
        })),
      }));
      return {
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
        pages: prev.pages.filter((p) => p.taskId !== taskId),
        sections: prev.sections.filter((s) => !pageIds.includes(s.pageId)),
        answers: prev.answers.filter((a) => !sectionIds.includes(a.sectionId)),
        assignments: prev.assignments.filter((a) => a.taskId !== taskId),
        userTaskGroups: updatedGroups,
      };
    });
  }, []);

  const createPage = useCallback((taskId: string): Page => {
    let newPage: Page = { id: '', taskId, index: 0, title: '' };
    setState((prev) => {
      const taskPages = prev.pages.filter((p) => p.taskId === taskId);
      const maxIndex = taskPages.reduce((m, p) => Math.max(m, p.index), -1);
      const page: Page = {
        id: generateId(),
        taskId,
        index: maxIndex + 1,
        title: `Page ${maxIndex + 2}`,
      };
      newPage = page;
      return { ...prev, pages: [...prev.pages, page] };
    });
    return newPage;
  }, []);

  const deletePage = useCallback((pageId: string) => {
    setState((prev) => {
      const sectionIds = prev.sections.filter((s) => s.pageId === pageId).map((s) => s.id);
      return {
        ...prev,
        pages: prev.pages.filter((p) => p.id !== pageId),
        sections: prev.sections.filter((s) => s.pageId !== pageId),
        answers: prev.answers.filter((a) => !sectionIds.includes(a.sectionId)),
      };
    });
  }, []);

  const createSection = useCallback((pageId: string, type: SectionType): Section => {
    let newSection: Section = {
      id: '',
      pageId,
      index: 0,
      type,
      colorTheme: 'DEFAULT',
      data: {},
      required: false,
    };
    setState((prev) => {
      const pageSections = prev.sections.filter((s) => s.pageId === pageId);
      const maxIndex = pageSections.reduce((m, s) => Math.max(m, s.index), -1);
      const section: Section = {
        id: generateId(),
        pageId,
        index: maxIndex + 1,
        type,
        colorTheme: 'DEFAULT',
        data: getDefaultData(type),
        required: false,
      };
      newSection = section;
      return { ...prev, sections: [...prev.sections, section] };
    });
    return newSection;
  }, []);

  const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
      answers: prev.answers.filter((a) => a.sectionId !== sectionId),
    }));
  }, []);

  const assignTask = useCallback((userId: string, taskId: string) => {
    setState((prev) => {
      const exists = prev.assignments.find((a) => a.userId === userId && a.taskId === taskId);
      if (exists) return prev;
      const assignment: Assignment = {
        id: generateId(),
        userId,
        taskId,
        status: 'NOT_STARTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { ...prev, assignments: [...prev.assignments, assignment] };
    });
  }, []);

  const removeAssignment = useCallback((userId: string, taskId: string) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter(
        (a) => !(a.userId === userId && a.taskId === taskId)
      ),
    }));
  }, []);

  const setUserAssignments = useCallback((userId: string, taskIds: string[]) => {
    setState((prev) => {
      const otherAssignments = prev.assignments.filter((a) => a.userId !== userId);
      const newAssignments: Assignment[] = taskIds.map((taskId) => {
        const existing = prev.assignments.find(
          (a) => a.userId === userId && a.taskId === taskId
        );
        if (existing) return existing;
        return {
          id: generateId(),
          userId,
          taskId,
          status: 'NOT_STARTED' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...prev, assignments: [...otherAssignments, ...newAssignments] };
    });
  }, []);

  const setUserTaskGroups = useCallback((userId: string, groups: TaskGroup[]) => {
    setState((prev) => {
      // Update or insert userTaskGroups entry
      const exists = prev.userTaskGroups.find((u) => u.userId === userId);
      const updatedGroups = exists
        ? prev.userTaskGroups.map((u) => (u.userId === userId ? { userId, groups } : u))
        : [...prev.userTaskGroups, { userId, groups }];

      // Sync assignments: collect all taskIds across groups
      const allTaskIds = Array.from(new Set(groups.flatMap((g) => g.taskIds)));
      const otherAssignments = prev.assignments.filter((a) => a.userId !== userId);
      const newAssignments: Assignment[] = allTaskIds.map((taskId) => {
        const existing = prev.assignments.find(
          (a) => a.userId === userId && a.taskId === taskId
        );
        if (existing) return existing;
        return {
          id: generateId(),
          userId,
          taskId,
          status: 'NOT_STARTED' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      return {
        ...prev,
        userTaskGroups: updatedGroups,
        assignments: [...otherAssignments, ...newAssignments],
      };
    });
  }, []);

  const getUserTaskGroups = useCallback(
    (userId: string): TaskGroup[] => {
      return state.userTaskGroups.find((u) => u.userId === userId)?.groups ?? [];
    },
    [state.userTaskGroups]
  );

  const saveAnswer = useCallback((assignmentId: string, sectionId: string, value: unknown) => {
    setState((prev) => {
      const existing = prev.answers.find(
        (a) => a.assignmentId === assignmentId && a.sectionId === sectionId
      );
      let newAnswers: Answer[];
      if (existing) {
        newAnswers = prev.answers.map((a) =>
          a.assignmentId === assignmentId && a.sectionId === sectionId
            ? { ...a, value, updatedAt: new Date().toISOString() }
            : a
        );
      } else {
        newAnswers = [
          ...prev.answers,
          {
            id: generateId(),
            assignmentId,
            sectionId,
            value,
            updatedAt: new Date().toISOString(),
          },
        ];
      }
      // Auto-update assignment status to IN_PROGRESS
      const assignments = prev.assignments.map((a) =>
        a.id === assignmentId && a.status === 'NOT_STARTED'
          ? { ...a, status: 'IN_PROGRESS' as const, updatedAt: new Date().toISOString() }
          : a
      );
      return { ...prev, answers: newAnswers, assignments };
    });
  }, []);

  const completeTask = useCallback((assignmentId: string) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              status: 'COMPLETED',
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    }));
  }, []);

  const updateAssignmentStatus = useCallback(
    (assignmentId: string, status: Assignment['status']) => {
      setState((prev) => ({
        ...prev,
        assignments: prev.assignments.map((a) =>
          a.id === assignmentId ? { ...a, status, updatedAt: new Date().toISOString() } : a
        ),
      }));
    },
    []
  );

  const addUser = useCallback(
    (input: {
      name: string;
      email: string;
      password: string;
      role?: User['role'];
      joinDate?: string;
      department?: string;
      position?: string;
      phone?: string;
      image?: string;
    }): { ok: boolean; error?: string; user?: User } => {
      const name = input.name.trim();
      const email = input.email.trim().toLowerCase();
      const password = input.password.trim();
      const role = input.role ?? 'USER';
      const joinDate = input.joinDate?.trim() || undefined;
      const department = input.department?.trim() || undefined;
      const position = input.position?.trim() || undefined;
      const phone = input.phone?.trim() || undefined;
      const image = input.image?.trim() || undefined;

      if (!name) return { ok: false, error: 'Name is required.' };
      if (!email) return { ok: false, error: 'Email is required.' };
      if (!password) return { ok: false, error: 'Password is required.' };

      let result: { ok: boolean; error?: string; user?: User } = {
        ok: false,
        error: 'Failed to add user.',
      };

      setState((prev) => {
        const emailExists = prev.users.some((u) => u.email.toLowerCase() === email);
        if (emailExists) {
          result = { ok: false, error: 'Email is already used.' };
          return prev;
        }

        const newUser: User = {
          id: generateId(),
          name,
          email,
          password,
          role,
          image: image ?? '',
          joinDate,
          department,
          position,
          phone,
        };

        result = { ok: true, user: newUser };
        return {
          ...prev,
          users: [...prev.users, newUser],
        };
      });

      return result;
    },
    []
  );

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
    }));
  }, []);

  const resetToSeed = useCallback(() => {
    const seed = { ...SEED_DATA };
    setState(seed);
  }, []);

  const value: AppContextType = {
    state,
    login,
    logout,
    setAdminMode,
    createTask,
    updateTask,
    deleteTask,
    createPage,
    deletePage,
    createSection,
    updateSection,
    deleteSection,
    assignTask,
    removeAssignment,
    setUserAssignments,
    setUserTaskGroups,
    getUserTaskGroups,
    saveAnswer,
    completeTask,
    updateAssignmentStatus,
    addUser,
    updateUser,
    currentUser,
    resetToSeed,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

function getDefaultData(type: SectionType): Record<string, unknown> {
  switch (type) {
    case 'TEXT_BOX':
      return { content: '<p>Enter text here...</p>' };
    case 'IMAGE':
      return { url: '', caption: '', annotations: '' };
    case 'YOUTUBE':
      return { url: '' };
    case 'MAPS':
      return { location: '', embedUrl: '' };
    case 'MULTIPLE_CHOICE':
      return {
        question: '',
        options: [
          { id: generateId(), label: 'Option A' },
          { id: generateId(), label: 'Option B' },
        ],
        correctOptionId: null,
      };
    case 'YES_NO':
      return { question: '', correctAnswer: null };
    case 'ESSAY':
      return { prompt: '', placeholder: 'Write your answer here...', maxLength: null };
    case 'IMAGE_CHOICE':
      return {
        question: '',
        options: [
          { id: generateId(), imageUrl: '', label: 'Choice A' },
          { id: generateId(), imageUrl: '', label: 'Choice B' },
        ],
        correctOptionId: null,
      };
    case 'UPLOAD_FILE':
      return { prompt: '', allowedTypes: '', maxSizeMB: 10 };
    default:
      return {};
  }
}
