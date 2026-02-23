export type UserRole = 'ADMIN' | 'USER';

export type SectionType =
  | 'TEXT_BOX'
  | 'IMAGE'
  | 'YOUTUBE'
  | 'MAPS'
  | 'MULTIPLE_CHOICE'
  | 'YES_NO'
  | 'ESSAY'
  | 'IMAGE_CHOICE'
  | 'UPLOAD_FILE';

export type ColorTheme = 'DEFAULT' | 'PRIMARY_TINT' | 'ACCENT_TINT';

export type AssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  password?: string;
  joinDate?: string;       // ISO date string (e.g. "2025-12-01")
  department?: string;
  position?: string;
  phone?: string;
}

export interface Task {
  id: string;
  title: string;
  createdById: string;
  includeOpeningPage: boolean;
  openingCoverUrl?: string;
  openingCaption?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  taskId: string;
  index: number;
  title?: string;
}

export interface Section {
  id: string;
  pageId: string;
  index: number;
  type: SectionType;
  colorTheme: ColorTheme;
  data: Record<string, unknown>;
  required: boolean;
}

export interface Assignment {
  id: string;
  userId: string;
  taskId: string;
  status: AssignmentStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  assignmentId: string;
  sectionId: string;
  value: unknown;
  updatedAt: string;
}

/** A named group of tasks assigned to a user, with optional time-based locking */
export interface TaskGroup {
  id: string;
  name: string;              // e.g. "Your First Day"
  taskIds: string[];
  locked: boolean;           // admin has enabled locking
  unlockAfterDays: number | null; // auto-unlock after N days from user's joinDate
}

export interface UserTaskGroups {
  userId: string;
  groups: TaskGroup[];
}

export interface AppState {
  users: User[];
  tasks: Task[];
  pages: Page[];
  sections: Section[];
  assignments: Assignment[];
  answers: Answer[];
  userTaskGroups: UserTaskGroups[];
  currentUserId: string | null;
  adminMode: boolean;
}
