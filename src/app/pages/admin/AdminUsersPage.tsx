import { useState, useRef, useEffect, FormEvent } from 'react';
import { useApp, daysSince } from '../../context/AppContext';
import { getInitials, formatDate } from '../../lib/utils';
import { generateId } from '../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  GripVertical,
} from 'lucide-react';
import type { TaskGroup, User } from '../../types';

export function AdminUsersPage() {
  const { state, setUserTaskGroups, getUserTaskGroups, addUser } = useApp();
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [localGroups, setLocalGroups] = useState<Record<string, TaskGroup[]>>({});
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: 'user123',
    department: '',
    position: '',
    joinDate: new Date().toISOString().slice(0, 10),
  });

  const nonAdminUsers = state.users.filter((u) => u.role === 'USER');

  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    const result = addUser({
      name: newUserForm.name,
      email: newUserForm.email,
      password: newUserForm.password,
      department: newUserForm.department,
      position: newUserForm.position,
      joinDate: newUserForm.joinDate,
      role: 'USER',
    });

    if (!result.ok || !result.user) {
      setCreateError(result.error ?? 'Failed to create user.');
      return;
    }

    setCreateSuccess(`User "${result.user.name}" added.`);
    setNewUserForm((prev) => ({
      ...prev,
      name: '',
      email: '',
      department: '',
      position: '',
    }));
    setIsCreateDialogOpen(false);
    setExpandedUserId(result.user.id);
  };

  const getGroups = (userId: string): TaskGroup[] => {
    if (localGroups[userId] !== undefined) return localGroups[userId];
    const saved = getUserTaskGroups(userId);
    if (saved.length > 0) return saved;
    // Default: one empty group
    return [
      {
        id: generateId(),
        name: 'Your First Day',
        taskIds: [],
        locked: false,
        unlockAfterDays: null,
      },
    ];
  };

  const updateGroups = (userId: string, groups: TaskGroup[]) => {
    setLocalGroups((prev) => ({ ...prev, [userId]: groups }));
  };

  const handleSave = (userId: string) => {
    const groups = getGroups(userId);
    setUserTaskGroups(userId, groups);
    setSavedUserId(userId);
    setTimeout(() => setSavedUserId(null), 2000);
  };

  const addGroup = (userId: string) => {
    const groups = getGroups(userId);
    updateGroups(userId, [
      ...groups,
      {
        id: generateId(),
        name: 'New Section',
        taskIds: [],
        locked: false,
        unlockAfterDays: null,
      },
    ]);
  };

  const removeGroup = (userId: string, groupId: string) => {
    updateGroups(
      userId,
      getGroups(userId).filter((g) => g.id !== groupId)
    );
  };

  const updateGroup = (userId: string, groupId: string, updates: Partial<TaskGroup>) => {
    updateGroups(
      userId,
      getGroups(userId).map((g) => (g.id === groupId ? { ...g, ...updates } : g))
    );
  };

  const toggleTaskInGroup = (userId: string, groupId: string, taskId: string) => {
    const groups = getGroups(userId);
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    const hasTask = group.taskIds.includes(taskId);
    updateGroup(userId, groupId, {
      taskIds: hasTask
        ? group.taskIds.filter((id) => id !== taskId)
        : [...group.taskIds, taskId],
    });
  };

  // Expand and init local groups for a user
  const handleExpand = (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }
    setExpandedUserId(userId);
    // Init local groups if not yet set
    if (localGroups[userId] === undefined) {
      const saved = getUserTaskGroups(userId);
      if (saved.length > 0) {
        setLocalGroups((prev) => ({ ...prev, [userId]: saved }));
      } else {
        setLocalGroups((prev) => ({
          ...prev,
          [userId]: [
            {
              id: generateId(),
              name: 'Your First Day',
              taskIds: [],
              locked: false,
              unlockAfterDays: null,
            },
          ],
        }));
      }
    }
  };

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[#111111]" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Employees
          </h2>
          <p className="text-sm text-[#666666] mt-0.5">
            Assign and organise tasks for each employee.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateError('');
            setIsCreateDialogOpen(true);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white flex-shrink-0"
          style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
        >
          <Plus size={14} />
          Add employee
        </button>
      </div>

      {createSuccess && (
        <p
          className="mb-4 rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: '#dcfce7', backgroundColor: '#f0fdf4', color: '#15803d' }}
          role="status"
        >
          {createSuccess}
        </p>
      )}

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (open) setCreateError('');
        }}
      >
        <DialogContent className="sm:max-w-[560px] p-0 gap-0 border-[#eeeeee]">
          <form onSubmit={handleCreateUser} className="bg-white">
            <DialogHeader className="px-5 pt-5 pb-3 text-left">
              <div className="flex items-center justify-between gap-3 pr-8">
                <div>
                  <DialogTitle className="text-[#111111]" style={{ fontWeight: 700 }}>
                    Add employee
                  </DialogTitle>
                  <DialogDescription className="text-xs text-[#666666] mt-1">
                    Create a new user account (role: Employee).
                  </DialogDescription>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ background: 'var(--brand-gradient-soft)', color: '#6365b9', fontWeight: 600 }}
                >
                  USER
                </span>
              </div>
            </DialogHeader>

            <div className="px-5 pb-5 grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Full name"
                value={newUserForm.name}
                onChange={(e) =>
                  setNewUserForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUserForm.email}
                onChange={(e) =>
                  setNewUserForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newUserForm.password}
                onChange={(e) =>
                  setNewUserForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Department (optional)"
                  value={newUserForm.department}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({ ...prev, department: e.target.value }))
                  }
                  className="w-full border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                />
                <input
                  type="text"
                  placeholder="Position (optional)"
                  value={newUserForm.position}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({ ...prev, position: e.target.value }))
                  }
                  className="w-full border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                />
              </div>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="new-user-join-date"
                  className="text-xs text-[#666666] whitespace-nowrap"
                  style={{ fontWeight: 600 }}
                >
                  Join date
                </label>
                <input
                  id="new-user-join-date"
                  type="date"
                  value={newUserForm.joinDate}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({ ...prev, joinDate: e.target.value }))
                  }
                  className="flex-1 border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                />
              </div>

              {createError && (
                <p className="text-sm text-red-500" role="alert">
                  {createError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1 py-3 rounded-xl text-sm border border-[#eeeeee] text-[#666666] hover:bg-[#fafafa] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-white transition-colors"
                  style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
                >
                  <Plus size={14} />
                  Add user
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {nonAdminUsers.length === 0 && (
        <p className="text-center text-sm text-[#999999] py-8">No users found.</p>
      )}

      <div className="space-y-3">
        {nonAdminUsers.map((user) => {
          const isExpanded = expandedUserId === user.id;
          const groups = getGroups(user.id);
          const totalTasks = Array.from(new Set(groups.flatMap((g) => g.taskIds))).length;
          const isSaved = savedUserId === user.id;
          const daysOnboarded = user.joinDate ? daysSince(user.joinDate) : null;

          return (
            <div key={user.id} className="rounded-xl border border-[#eeeeee] overflow-hidden">
              {/* User row */}
              <button
                type="button"
                onClick={() => handleExpand(user.id)}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#fafafa] transition-colors"
              >
                <div
                  className="flex items-center justify-center rounded-full brand-gradient-bg text-white flex-shrink-0"
                  style={{ width: 40, height: 40, fontSize: '0.8rem', fontWeight: 700 }}
                >
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[#111111] text-sm" style={{ fontWeight: 600 }}>
                    {user.name}
                  </p>
                  <p className="text-[#666666] text-xs">{user.position || user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {daysOnboarded !== null && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'var(--brand-gradient-soft)', color: '#6365b9', fontWeight: 600 }}
                    >
                      Day {daysOnboarded}
                    </span>
                  )}
                  <span className="text-xs text-[#999999] flex-shrink-0">
                    {totalTasks} task{totalTasks !== 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-[#666666]" />
                  ) : (
                    <ChevronDown size={16} className="text-[#666666]" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-[#eeeeee] bg-[#fafafa]">
                  {/* User info bar */}
                  <UserInfoBar user={user} />

                  {/* Groups */}
                  <div className="px-4 py-4">
                    <div className="space-y-4">
                      {groups.map((group, gIdx) => {
                        const isLocked = group.locked;
                        const autoUnlocked =
                          isLocked &&
                          group.unlockAfterDays !== null &&
                          user.joinDate &&
                          daysSince(user.joinDate) >= group.unlockAfterDays;

                        return (
                          <TaskGroupEditor
                            key={group.id}
                            group={group}
                            groupIndex={gIdx}
                            user={user}
                            allTasks={state.tasks}
                            autoUnlocked={!!autoUnlocked}
                            onRename={(name) => updateGroup(user.id, group.id, { name })}
                            onToggleLock={() =>
                              updateGroup(user.id, group.id, { locked: !group.locked })
                            }
                            onUnlockDaysChange={(days) =>
                              updateGroup(user.id, group.id, { unlockAfterDays: days })
                            }
                            onToggleTask={(taskId) =>
                              toggleTaskInGroup(user.id, group.id, taskId)
                            }
                            onDelete={
                              groups.length > 1
                                ? () => removeGroup(user.id, group.id)
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>

                    {/* Add section */}
                    <button
                      type="button"
                      onClick={() => addGroup(user.id)}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-[#eeeeee] text-sm text-[#6365b9] hover:border-[#6365b9] hover-brand-gradient-bg-soft transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      <Plus size={14} />
                      Add section
                    </button>

                    {/* Save */}
                    <button
                      type="button"
                      onClick={() => handleSave(user.id)}
                      className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-white transition-colors"
                      style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
                    >
                      {isSaved ? (
                        <>
                          <Check size={14} />
                          Saved!
                        </>
                      ) : (
                        'Save changes'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── User info bar ────────────────────────────────────────────────────────────
function UserInfoBar({ user }: { user: User }) {
  const { state, updateUser } = useApp();
  const daysOnboarded = user.joinDate ? daysSince(user.joinDate) : null;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSaved, setEditSaved] = useState(false);
  const [editForm, setEditForm] = useState(() => createUserEditForm(user));

  useEffect(() => {
    setEditForm(createUserEditForm(user));
  }, [user]);

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEditError('');

    const name = editForm.name.trim();
    const email = editForm.email.trim().toLowerCase();
    const password = editForm.password.trim();

    if (!name) {
      setEditError('Name is required.');
      return;
    }

    if (!email) {
      setEditError('Email is required.');
      return;
    }

    const duplicateEmail = state.users.some(
      (u) => u.id !== user.id && u.email.toLowerCase() === email
    );
    if (duplicateEmail) {
      setEditError('Email is already used by another user.');
      return;
    }

    const updates: Partial<User> = {
      name,
      email,
      department: editForm.department.trim() || undefined,
      position: editForm.position.trim() || undefined,
      joinDate: editForm.joinDate || undefined,
      phone: editForm.phone.trim() || undefined,
    };

    if (password) {
      updates.password = password;
    }

    updateUser(user.id, updates);
    setIsEditDialogOpen(false);
    setEditSaved(true);
    setTimeout(() => setEditSaved(false), 2000);
  };

  return (
    <>
      <div
        className="px-4 py-4"
        style={{ borderBottom: '1px solid #eeeeee', backgroundColor: '#ffffff' }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-[#111111]" style={{ fontWeight: 700 }}>
              Employee details
            </p>
            <p className="text-xs text-[#666666] mt-0.5">
              Contact and onboarding metadata for this employee.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {editSaved && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }}
              >
                Updated
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setEditError('');
                setEditForm(createUserEditForm(user));
                setIsEditDialogOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#eeeeee] text-sm text-[#111111] hover:bg-[#fafafa] transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Pencil size={14} />
              Edit details
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <InfoTile label="Dept" value={user.department || '-'} />
          <InfoTile label="Position" value={user.position || '-'} />
          <InfoTile label="Joined" value={user.joinDate ? formatDate(user.joinDate) : '-'} />
          <InfoTile
            label="Day"
            value={daysOnboarded !== null ? `Day ${daysOnboarded}` : '-'}
            accent={daysOnboarded !== null}
          />
          <InfoTile label="Email" value={user.email || '-'} fullWidth />
          <InfoTile label="Password" value={user.password ? '••••••••' : 'Not set'} />
        </div>
      </div>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (open) setEditError('');
        }}
      >
        <DialogContent className="sm:max-w-[620px] p-0 gap-0 border-[#eeeeee]">
          <form onSubmit={handleEditSubmit} className="bg-white">
            <DialogHeader className="px-5 pt-5 pb-3 text-left">
              <DialogTitle className="text-[#111111]" style={{ fontWeight: 700 }}>
                Edit employee details
              </DialogTitle>
              <DialogDescription className="text-xs text-[#666666] mt-1">
                Update profile information and change password if needed.
              </DialogDescription>
            </DialogHeader>

            <div className="px-5 pb-5 grid grid-cols-1 gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Department"
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, department: e.target.value }))
                  }
                  className="w-full border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={editForm.position}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, position: e.target.value }))
                  }
                  className="w-full border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor={`edit-join-date-${user.id}`}
                    className="text-xs text-[#666666] whitespace-nowrap"
                    style={{ fontWeight: 600 }}
                  >
                    Join date
                  </label>
                  <input
                    id={`edit-join-date-${user.id}`}
                    type="date"
                    value={editForm.joinDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, joinDate: e.target.value }))
                    }
                    className="flex-1 border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="New password (optional)"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full border border-[#eeeeee] rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#6365b9]"
                />
                <p className="mt-1 text-xs text-[#999999]">
                  Leave blank to keep the current password.
                </p>
              </div>

              {editError && (
                <p className="text-sm text-red-500" role="alert">
                  {editError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 py-3 rounded-xl text-sm border border-[#eeeeee] text-[#666666] hover:bg-[#fafafa] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl text-sm text-white transition-colors"
                  style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
                >
                  Save details
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoTile({
  label,
  value,
  accent = false,
  fullWidth = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`${fullWidth ? 'sm:col-span-2 lg:col-span-2' : ''} rounded-xl border px-3 py-2.5`}
      style={{
        borderColor: accent ? '#d7d9ff' : '#eeeeee',
        background: accent ? 'var(--brand-gradient-soft-08)' : '#fafafa',
      }}
    >
      <p className="text-[11px] text-[#999999]" style={{ fontWeight: 600 }}>
        {label}
      </p>
      <p
        className="text-sm mt-0.5 break-words"
        style={{ color: accent ? '#6365b9' : '#111111', fontWeight: accent ? 700 : 600 }}
      >
        {value}
      </p>
    </div>
  );
}

function createUserEditForm(user: User) {
  return {
    name: user.name ?? '',
    email: user.email ?? '',
    department: user.department ?? '',
    position: user.position ?? '',
    joinDate: user.joinDate ?? '',
    phone: user.phone ?? '',
    password: '',
  };
}

// ── Task Group Editor ─────────────────────────────────────────────────────────
interface TaskGroupEditorProps {
  group: TaskGroup;
  groupIndex: number;
  user: User;
  allTasks: ReturnType<typeof useApp>['state']['tasks'];
  autoUnlocked: boolean;
  onRename: (name: string) => void;
  onToggleLock: () => void;
  onUnlockDaysChange: (days: number | null) => void;
  onToggleTask: (taskId: string) => void;
  onDelete?: () => void;
}

function TaskGroupEditor({
  group,
  user,
  allTasks,
  autoUnlocked,
  onRename,
  onToggleLock,
  onUnlockDaysChange,
  onToggleTask,
  onDelete,
}: TaskGroupEditorProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(group.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameValue(group.name);
  }, [group.name]);

  const commitName = () => {
    setEditingName(false);
    if (nameValue.trim()) onRename(nameValue.trim());
    else setNameValue(group.name);
  };

  // Calculate lock status display
  const daysElapsed = user.joinDate ? daysSince(user.joinDate) : null;
  let lockStatusText = '';
  if (group.locked && group.unlockAfterDays !== null && daysElapsed !== null) {
    if (autoUnlocked) {
      lockStatusText = `Auto-unlocked (day ${daysElapsed})`;
    } else {
      const remaining = group.unlockAfterDays - daysElapsed;
      lockStatusText = `Unlocks in ${remaining} day${remaining !== 1 ? 's' : ''} (day ${group.unlockAfterDays})`;
    }
  }

  return (
    <div
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: group.locked ? '#eeeeee' : '#eeeeee' }}
    >
      {/* Group header */}
      <div
        className="flex items-center gap-2 px-3 py-3"
        style={{
          borderBottom: '1px solid #eeeeee',
          backgroundColor: group.locked && !autoUnlocked ? '#f9f9f9' : '#fff',
        }}
      >
        <GripVertical size={14} className="text-[#cccccc] flex-shrink-0" />

        {/* Editable section name */}
        {editingName ? (
          <input
            ref={nameInputRef}
            autoFocus
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitName();
              if (e.key === 'Escape') {
                setEditingName(false);
                setNameValue(group.name);
              }
            }}
            className="flex-1 text-sm text-[#111111] border-b border-[#6365b9] outline-none bg-transparent py-0.5"
            style={{ fontWeight: 700 }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="flex-1 text-left text-[#111111] text-sm hover:text-[#6365b9] transition-colors"
            style={{ fontWeight: 700 }}
            title="Click to rename"
          >
            {group.name}
          </button>
        )}

        {/* Lock toggle */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {autoUnlocked && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 600 }}
            >
              Auto-unlocked
            </span>
          )}
          <button
            type="button"
            onClick={onToggleLock}
            className="flex items-center justify-center rounded-lg transition-colors hover:bg-[#f5f5f5]"
            style={{ width: 32, height: 32 }}
            title={group.locked ? 'Unlock section' : 'Lock section'}
          >
            {group.locked ? (
              <Lock size={15} className={autoUnlocked ? 'text-green-500' : 'text-[#6365b9]'} />
            ) : (
              <Unlock size={15} className="text-[#cccccc]" />
            )}
          </button>

          {/* Lock toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={group.locked}
            onClick={onToggleLock}
            className="relative inline-flex items-center flex-shrink-0 rounded-full transition-colors focus:outline-none"
            style={{
              width: 36,
              height: 20,
              background: group.locked ? 'var(--brand-gradient)' : '#cccccc',
            }}
          >
            <span
              className="inline-block bg-white rounded-full shadow transition-transform"
              style={{
                width: 16,
                height: 16,
                transform: group.locked ? 'translateX(18px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>

        {/* Delete group */}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-[#cccccc] hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Unlock after X days (shown when locked) */}
      {group.locked && (
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            borderBottom: '1px solid #eeeeee',
            backgroundColor: '#fafafa',
          }}
        >
          <span className="text-xs text-[#666666]">Auto-unlock after</span>
          <input
            type="number"
            min={0}
            placeholder="—"
            value={group.unlockAfterDays ?? ''}
            onChange={(e) =>
              onUnlockDaysChange(e.target.value ? parseInt(e.target.value) : null)
            }
            className="w-16 border border-[#eeeeee] rounded-lg px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#6365b9] text-center"
          />
          <span className="text-xs text-[#666666]">days from join date</span>
          {lockStatusText && (
            <span
              className="ml-auto text-xs"
              style={{ color: autoUnlocked ? '#16a34a' : '#999999' }}
            >
              {lockStatusText}
            </span>
          )}
        </div>
      )}

      {/* Task list for this group */}
      <div className="px-3 py-3">
        {allTasks.length === 0 ? (
          <p className="text-xs text-[#999999] text-center py-2">
            No tasks yet. Create tasks in the Tasks tab.
          </p>
        ) : (
          <div className="space-y-2">
            {allTasks.map((task) => {
              const isSelected = group.taskIds.includes(task.id);
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors text-left"
                  style={{
                    borderColor: isSelected ? '#6365b9' : '#eeeeee',
                    background: isSelected ? 'var(--brand-gradient-soft)' : '#ffffff',
                  }}
                >
                  <div
                    className="flex-shrink-0 rounded-full border-2 flex items-center justify-center"
                    style={{
                      width: 20,
                      height: 20,
                      borderColor: isSelected ? '#6365b9' : '#cccccc',
                      background: isSelected ? 'var(--brand-gradient)' : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm text-[#111111] flex-1 truncate"
                    style={{ fontWeight: isSelected ? 600 : 400 }}
                  >
                    {task.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}





