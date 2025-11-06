import { create } from 'zustand';
import { Task, Category, User, FilterStatus, FilterDueRange } from '../types';
import { authService } from '../services/auth';
import { databaseService } from '../services/database';

interface AppState {
  user: User | null;
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  filterStatus: FilterStatus;
  filterCategories: string[];
  filterDueRange: FilterDueRange;
  searchQuery: string;
  categoryPanelOpen: boolean;
  calendarViewState: { mode: 'day' | 'week' | 'month'; date: Date } | null;

  setUser: (user: User | null) => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;

  fetchTasks: () => Promise<void>;
  fetchTask: (id: string) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  createTask: (taskData: Omit<Task, 'id' | 'comments' | 'attachments'>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  snoozeTask: (id: string, minutes: number) => Promise<void>;
  addComment: (taskId: string, text: string) => Promise<void>;
  addAttachment: (taskId: string, file: { name: string; size: number }) => Promise<void>;
  deleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;

  fetchCategories: () => Promise<void>;
  createCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  loadUserPreferences: () => Promise<void>;
  saveFilterCategories: (categoryIds: string[]) => Promise<void>;

  setFilterStatus: (status: FilterStatus) => void;
  setFilterCategories: (categoryIds: string[]) => void;
  toggleCategoryFilter: (categoryId: string) => void;
  clearCategoryFilters: () => void;
  selectAllCategories: () => void;
  setFilterDueRange: (range: FilterDueRange) => void;
  setSearchQuery: (query: string) => void;
  setCategoryPanelOpen: (open: boolean) => void;
  toggleCategoryPanel: () => void;
  setError: (error: string | null) => void;
  setCalendarViewState: (state: { mode: 'day' | 'week' | 'month'; date: Date } | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  tasks: [],
  categories: [],
  loading: false,
  error: null,
  filterStatus: 'all',
  filterCategories: [],
  filterDueRange: 'all',
  searchQuery: '',
  categoryPanelOpen: false,
  calendarViewState: null,

  setUser: (user) => set({ user }),

  setError: (error) => set({ error }),

  initAuth: async () => {
    try {
      const user = await authService.getCurrentUser();
      set({ user });

      if (user) {
        await get().fetchCategories();
        await get().loadUserPreferences();
        await get().fetchTasks();
      }

      authService.onAuthStateChange(async (user) => {
        set({ user });
        if (user) {
          await get().fetchCategories();
          await get().loadUserPreferences();
          await get().fetchTasks();
        } else {
          set({ tasks: [], categories: [], filterCategories: [] });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null });
    }
  },

  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      await authService.signUp(email, password, name);
      const user = await authService.getCurrentUser();
      set({ user });
      if (user) {
        await get().fetchCategories();
        await get().loadUserPreferences();
        await get().fetchTasks();
      }
    } catch (error: any) {
      set({ error: error.message || 'Sign up failed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await authService.signIn(email, password);
      const user = await authService.getCurrentUser();
      set({ user });
      if (user) {
        await get().fetchCategories();
        await get().loadUserPreferences();
        await get().fetchTasks();
      }
    } catch (error: any) {
      set({ error: error.message || 'Sign in failed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authService.signOut();
      set({ user: null, tasks: [], categories: [] });
    } catch (error: any) {
      set({ error: error.message || 'Sign out failed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await databaseService.getTasks();
      set({ tasks });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch tasks' });
    } finally {
      set({ loading: false });
    }
  },

  fetchTask: async (id) => {
    try {
      const task = await databaseService.getTask(id);
      return task;
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch task' });
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const updatedTask = await databaseService.updateTask(id, updates);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t))
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update task' });
      throw error;
    }
  },

  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const newTask = await databaseService.createTask(taskData);
      set((state) => ({
        tasks: [...state.tasks, newTask],
        loading: false,
      }));
      return newTask;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create task', loading: false });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await databaseService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete task' });
      throw error;
    }
  },

  snoozeTask: async (id, minutes) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const now = new Date();
    const snoozedUntil = new Date(now.getTime() + minutes * 60000).toISOString();

    try {
      await databaseService.updateTask(id, {
        status: 'snoozed',
        snoozedUntil
      });

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, status: 'snoozed', snoozedUntil } : t
        )
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to snooze task' });
      throw error;
    }
  },

  addComment: async (taskId, text) => {
    const user = get().user;
    if (!user) return;

    try {
      await databaseService.addComment(taskId, text, user.name);
      const updatedTask = await databaseService.getTask(taskId);

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t))
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to add comment' });
      throw error;
    }
  },

  addAttachment: async (taskId, file) => {
    try {
      await databaseService.addAttachment(taskId, file);
      const updatedTask = await databaseService.getTask(taskId);

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t))
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to add attachment' });
      throw error;
    }
  },

  deleteAttachment: async (taskId, attachmentId) => {
    try {
      await databaseService.deleteAttachment(taskId, attachmentId);
      const updatedTask = await databaseService.getTask(taskId);

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t))
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete attachment' });
      throw error;
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await databaseService.getCategories();
      set({ categories });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch categories' });
    }
  },

  createCategory: async (category) => {
    try {
      const newCategory = await databaseService.createCategory(category);
      set((state) => ({
        categories: [...state.categories, newCategory]
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create category' });
      throw error;
    }
  },

  updateCategory: async (id, updates) => {
    try {
      const updatedCategory = await databaseService.updateCategory(id, updates);
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? updatedCategory : c))
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update category' });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await databaseService.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete category' });
      throw error;
    }
  },

  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterCategories: (categoryIds) => {
    set({ filterCategories: categoryIds });
    get().saveFilterCategories(categoryIds);
  },
  toggleCategoryFilter: (categoryId) => {
    const current = get().filterCategories;
    const newFilter = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    set({ filterCategories: newFilter });
    get().saveFilterCategories(newFilter);
  },
  clearCategoryFilters: () => {
    set({ filterCategories: [] });
    get().saveFilterCategories([]);
  },
  selectAllCategories: () => {
    const allIds = get().categories.filter((c) => c.active).map((c) => c.id);
    set({ filterCategories: allIds });
    get().saveFilterCategories(allIds);
  },
  setFilterDueRange: (range) => set({ filterDueRange: range }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryPanelOpen: (open) => set({ categoryPanelOpen: open }),
  toggleCategoryPanel: () => set((state) => ({ categoryPanelOpen: !state.categoryPanelOpen })),
  setCalendarViewState: (state) => set({ calendarViewState: state }),

  loadUserPreferences: async () => {
    try {
      const preferences = await databaseService.getUserPreferences();
      if (preferences) {
        set({ filterCategories: preferences.filterCategories });
      }
    } catch (error: any) {
      console.error('Failed to load user preferences:', error);
    }
  },

  saveFilterCategories: async (categoryIds: string[]) => {
    try {
      await databaseService.saveUserPreferences({
        filterCategories: categoryIds,
      });
    } catch (error: any) {
      console.error('Failed to save filter preferences:', error);
    }
  },
}));
