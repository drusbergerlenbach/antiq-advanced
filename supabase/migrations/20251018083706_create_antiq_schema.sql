/*
  # Create Antiq Multi-User Schema

  ## Overview
  This migration creates the complete database schema for Antiq task management app
  with strict per-user data isolation using Row Level Security (RLS).

  ## New Tables

  ### `categories`
  User-specific task categories with color coding.
  - `id` (uuid, primary key) - Unique category identifier
  - `user_id` (uuid, foreign key to auth.users) - Owner of the category
  - `name` (text) - Category name (e.g., "Arbeit", "Persönlich")
  - `color` (text) - Hex color code for UI display
  - `active` (boolean) - Whether category is active/visible
  - `created_at` (timestamptz) - Creation timestamp

  ### `tasks`
  User's tasks with full details and relationships.
  - `id` (uuid, primary key) - Unique task identifier
  - `user_id` (uuid, foreign key to auth.users) - Owner of the task
  - `category_id` (uuid, foreign key to categories) - Task category
  - `title` (text) - Task title
  - `description` (text) - Detailed description
  - `status` (text) - Task status: 'open', 'completed', 'snoozed'
  - `priority` (text) - Priority level: 'low', 'normal', 'high'
  - `due_at` (timestamptz) - Due date and time
  - `snoozed_until` (timestamptz) - When snoozed task should reappear
  - `assignee` (text) - Person assigned to task
  - `interval_type` (text) - Recurrence: 'none', 'daily', 'weekly', 'monthly', 'yearly'
  - `interval_mode` (text) - Recurrence mode: 'relative', 'absolute'
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `comments`
  Comments on tasks for collaboration and notes.
  - `id` (uuid, primary key) - Unique comment identifier
  - `task_id` (uuid, foreign key to tasks) - Associated task
  - `user_id` (uuid, foreign key to auth.users) - Comment author
  - `author` (text) - Author display name
  - `text` (text) - Comment content
  - `created_at` (timestamptz) - Creation timestamp

  ### `attachments`
  File attachments associated with tasks.
  - `id` (uuid, primary key) - Unique attachment identifier
  - `task_id` (uuid, foreign key to tasks) - Associated task
  - `user_id` (uuid, foreign key to auth.users) - Uploader
  - `name` (text) - File name
  - `size` (integer) - File size in bytes
  - `created_at` (timestamptz) - Upload timestamp

  ## Security (Row Level Security)

  All tables have RLS enabled with strict per-user policies:

  ### Categories
  - Users can only view their own categories
  - Users can only insert categories for themselves
  - Users can only update their own categories
  - Users can only delete their own categories

  ### Tasks
  - Users can only view their own tasks
  - Users can only insert tasks for themselves
  - Users can only update their own tasks
  - Users can only delete their own tasks

  ### Comments
  - Users can only view comments on their own tasks
  - Users can only insert comments on their own tasks
  - Users can only update their own comments
  - Users can only delete their own comments

  ### Attachments
  - Users can only view attachments on their own tasks
  - Users can only insert attachments on their own tasks
  - Users can only update their own attachments
  - Users can only delete their own attachments

  ## Important Notes
  - All user_id fields reference auth.users(id) with CASCADE delete
  - When a user is deleted, all their data is automatically removed
  - RLS policies use auth.uid() to enforce per-user isolation
  - No user can access another user's data through any operation
  - Indexes are created on foreign keys for query performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6b7280',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  due_at timestamptz,
  snoozed_until timestamptz,
  assignee text DEFAULT '',
  interval_type text NOT NULL DEFAULT 'none',
  interval_mode text NOT NULL DEFAULT 'relative',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author text NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on own tasks"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = comments.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert comments on own tasks"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  size integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments on own tasks"
  ON attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = attachments.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attachments on own tasks"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own attachments"
  ON attachments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
