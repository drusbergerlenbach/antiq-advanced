import { Task, Category, User } from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getTodayDate = () => {
  const today = new Date();
  today.setHours(14, 0, 0, 0);
  return today.toISOString();
};

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(16, 0, 0, 0);
  return tomorrow.toISOString();
};

const getNextWeekDate = () => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 6);
  nextWeek.setHours(9, 0, 0, 0);
  return nextWeek.toISOString();
};

const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(15, 0, 0, 0);
  return yesterday.toISOString();
};

const mockCategories: Category[] = [
  { id: 'cat-work', name: 'Arbeit', color: '#4A90E2', active: true },
  { id: 'cat-personal', name: 'Persönlich', color: '#FFC857', active: true },
  { id: 'cat-urgent', name: 'Dringend', color: '#E94F37', active: true },
  { id: 'cat-home', name: 'Zuhause', color: '#7BC950', active: true },
  { id: 'cat-ideas', name: 'Ideen', color: '#A066FF', active: true },
  { id: 'cat-other', name: 'Sonstiges', color: '#8E9AAF', active: true },
];

const mockTasks: Task[] = [
  {
    id: 't-101',
    title: 'Projekt-Präsentation vorbereiten',
    description: 'Folien für Kundentermin erstellen',
    categoryId: 'cat-work',
    dueAt: getTodayDate(),
    status: 'open',
    priority: 'normal',
    assignee: 'Team Lead',
    interval: { type: 'weekly', mode: 'relative' },
    attachments: [
      { id: 'a1', name: 'project-notes.pdf', size: 234567 }
    ],
    comments: [
      { id: 'c1', author: 'Manager', text: 'Meeting at 2 PM', createdAt: new Date(Date.now() - 3600000).toISOString() }
    ]
  },
  {
    id: 't-102',
    title: 'Wohnung aufräumen',
    description: 'Küche und Wohnzimmer putzen',
    categoryId: 'cat-home',
    dueAt: getTodayDate(),
    status: 'open',
    priority: 'high',
    interval: { type: 'none', mode: 'relative' },
    attachments: [],
    comments: []
  },
  {
    id: 't-103',
    title: 'Gitarre üben',
    description: 'Neue Akkorde lernen',
    categoryId: 'cat-personal',
    dueAt: getTomorrowDate(),
    status: 'open',
    priority: 'normal',
    interval: { type: 'none', mode: 'relative' },
    attachments: [],
    comments: []
  },
  {
    id: 't-104',
    title: 'Blog-Artikel schreiben',
    description: 'Ideen für Tech-Blog sammeln',
    categoryId: 'cat-ideas',
    dueAt: getNextWeekDate(),
    status: 'open',
    priority: 'low',
    interval: { type: 'monthly', mode: 'absolute' },
    attachments: [],
    comments: []
  },
  {
    id: 't-105',
    title: 'Arzttermin vereinbaren',
    description: 'Zahnarzt anrufen',
    categoryId: 'cat-urgent',
    dueAt: getYesterdayDate(),
    status: 'snoozed',
    priority: 'high',
    snoozedUntil: getTodayDate(),
    interval: { type: 'none', mode: 'relative' },
    attachments: [],
    comments: [
      { id: 'c2', author: 'Reminder', text: 'Dringend anrufen', createdAt: getYesterdayDate() }
    ]
  },
];

let currentUser: User | null = null;
let tasks = [...mockTasks];
let categories = [...mockCategories];

export const fakeApi = {
  async login(role: 'admin' | 'user', name: string): Promise<User> {
    await delay(400);
    currentUser = { role, name };
    return currentUser;
  },

  async getMe(): Promise<User> {
    await delay(300);
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    return currentUser;
  },

  async getTasks(): Promise<Task[]> {
    await delay(500);
    return [...tasks];
  },

  async getTask(id: string): Promise<Task> {
    await delay(400);
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      throw new Error('Task not found');
    }
    return { ...task };
  },

  async createTask(taskData: Omit<Task, 'id' | 'comments' | 'attachments'>): Promise<Task> {
    await delay(500);
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}`,
      comments: [],
      attachments: []
    };
    tasks.push(newTask);
    return newTask;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await delay(450);
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    tasks[index] = { ...tasks[index], ...updates };
    return { ...tasks[index] };
  },

  async deleteTask(id: string): Promise<void> {
    await delay(400);
    tasks = tasks.filter((t) => t.id !== id);
  },

  async addComment(taskId: string, text: string, author: string): Promise<Comment> {
    await delay(400);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    const newComment = {
      id: `c-${Date.now()}`,
      author,
      text,
      createdAt: new Date().toISOString()
    };
    task.comments.push(newComment);
    return newComment;
  },

  async addAttachment(taskId: string, file: { name: string; size: number }): Promise<Attachment> {
    await delay(600);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    const newAttachment = {
      id: `a-${Date.now()}`,
      name: file.name,
      size: file.size
    };
    task.attachments.push(newAttachment);
    return newAttachment;
  },

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    await delay(400);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    task.attachments = task.attachments.filter((a) => a.id !== attachmentId);
  },

  async getCategories(): Promise<Category[]> {
    await delay(400);
    return [...categories];
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    await delay(450);
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`
    };
    categories.push(newCategory);
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await delay(450);
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    categories[index] = { ...categories[index], ...updates };
    return { ...categories[index] };
  },

  async deleteCategory(id: string): Promise<void> {
    await delay(400);
    categories = categories.filter((c) => c.id !== id);
  },
};

export default fakeApi;
