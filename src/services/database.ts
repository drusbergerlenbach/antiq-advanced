import { supabase } from '../lib/supabase';
import { Task, Category } from '../types';

export const databaseService = {
  async getTasks(): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tasksError) throw tasksError;

    const { data: commentsData } = await supabase
      .from('comments')
      .select('*');

    const { data: attachmentsData } = await supabase
      .from('attachments')
      .select('*');

    const tasks: Task[] = (tasksData || []).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      categoryId: task.category_id || '',
      dueAt: task.due_at || null,
      status: task.status as 'open' | 'completed' | 'snoozed',
      priority: task.priority as 'low' | 'normal' | 'high',
      assignee: task.assignee,
      snoozedUntil: task.snoozed_until || undefined,
      isAllDay: task.is_all_day || false,
      interval: {
        type: task.interval_type as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
        mode: task.interval_mode as 'relative' | 'absolute',
      },
      comments: (commentsData || [])
        .filter((c) => c.task_id === task.id)
        .map((c) => ({
          id: c.id,
          author: c.author,
          text: c.text,
          createdAt: c.created_at,
        })),
      attachments: (attachmentsData || [])
        .filter((a) => a.task_id === task.id)
        .map((a) => ({
          id: a.id,
          name: a.name,
          size: a.size,
        })),
    }));

    return tasks;
  },

  async getTask(id: string): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (taskError) throw taskError;
    if (!taskData) throw new Error('Task not found');

    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', id);

    const { data: attachmentsData } = await supabase
      .from('attachments')
      .select('*')
      .eq('task_id', id);

    const task: Task = {
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      categoryId: taskData.category_id || '',
      dueAt: taskData.due_at || null,
      status: taskData.status as 'open' | 'completed' | 'snoozed',
      priority: taskData.priority as 'low' | 'normal' | 'high',
      assignee: taskData.assignee,
      snoozedUntil: taskData.snoozed_until || undefined,
      isAllDay: taskData.is_all_day || false,
      interval: {
        type: taskData.interval_type as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
        mode: taskData.interval_mode as 'relative' | 'absolute',
      },
      comments: (commentsData || []).map((c) => ({
        id: c.id,
        author: c.author,
        text: c.text,
        createdAt: c.created_at,
      })),
      attachments: (attachmentsData || []).map((a) => ({
        id: a.id,
        name: a.name,
        size: a.size,
      })),
    };

    return task;
  },

  async createTask(taskData: Omit<Task, 'id' | 'comments' | 'attachments'>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        category_id: taskData.categoryId || null,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        due_at: taskData.dueAt || null,
        snoozed_until: taskData.snoozedUntil || null,
        assignee: taskData.assignee,
        interval_type: taskData.interval.type,
        interval_mode: taskData.interval.mode,
        is_all_day: taskData.isAllDay || false,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create task');

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      categoryId: data.category_id || '',
      dueAt: data.due_at || null,
      status: data.status as 'open' | 'completed' | 'snoozed',
      priority: data.priority as 'low' | 'normal' | 'high',
      assignee: data.assignee,
      snoozedUntil: data.snoozed_until || undefined,
      isAllDay: data.is_all_day || false,
      interval: {
        type: data.interval_type as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
        mode: data.interval_mode as 'relative' | 'absolute',
      },
      comments: [],
      attachments: [],
    };
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updateData: Record<string, any> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId || null;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.dueAt !== undefined) updateData.due_at = updates.dueAt || null;
    if (updates.snoozedUntil !== undefined) updateData.snoozed_until = updates.snoozedUntil || null;
    if (updates.assignee !== undefined) updateData.assignee = updates.assignee;
    if (updates.isAllDay !== undefined) updateData.is_all_day = updates.isAllDay;
    if (updates.interval) {
      updateData.interval_type = updates.interval.type;
      updateData.interval_mode = updates.interval.mode;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Task not found');

    return await this.getTask(id);
  },

  async deleteTask(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async addComment(taskId: string, text: string, author: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('comments')
      .insert({
        task_id: taskId,
        user_id: user.id,
        author,
        text,
      });

    if (error) throw error;
  },

  async addAttachment(taskId: string, file: { name: string; size: number }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('attachments')
      .insert({
        task_id: taskId,
        user_id: user.id,
        name: file.name,
        size: file.size,
      });

    if (error) throw error;
  },

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async getCategories(): Promise<Category[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      active: cat.active,
    }));
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: category.name,
        color: category.color,
        active: category.active,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create category');

    return {
      id: data.id,
      name: data.name,
      color: data.color,
      active: data.active,
    };
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Category not found');

    return {
      id: data.id,
      name: data.name,
      color: data.color,
      active: data.active,
    };
  },

  async deleteCategory(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async getUserPreferences(): Promise<{ filterCategories: string[] } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_preferences')
      .select('filter_categories')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return {
      filterCategories: data.filter_categories || [],
    };
  },

  async saveUserPreferences(preferences: { filterCategories: string[] }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        filter_categories: preferences.filterCategories,
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;
  },
};
