export interface Attachment {
  id: string;
  name: string;
  size: number;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Interval {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
  mode: 'relative' | 'absolute';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  dueAt: string | null;
  status: 'open' | 'snoozed' | 'completed';
  priority: 'low' | 'normal' | 'high';
  assignee?: string;
  interval: Interval;
  attachments: Attachment[];
  comments: Comment[];
  snoozedUntil?: string;
  isAllDay?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

export interface User {
  role: 'admin' | 'user';
  name: string;
}

export type FilterStatus = 'all' | 'open' | 'snoozed' | 'completed';
export type FilterDueRange = 'all' | 'today' | 'week' | 'overdue';
