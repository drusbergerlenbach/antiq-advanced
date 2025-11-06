/*
  # Add User Preferences Table

  ## Overview
  This migration creates a user preferences table to store per-user settings
  including category filter selections and other UI preferences.

  ## New Tables

  ### `user_preferences`
  Stores user-specific application preferences.
  - `id` (uuid, primary key) - Unique preference record identifier
  - `user_id` (uuid, foreign key to auth.users) - Owner of the preferences
  - `filter_categories` (text[]) - Array of selected category IDs for filtering
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security (Row Level Security)

  ### User Preferences
  - Users can only view their own preferences
  - Users can only insert preferences for themselves
  - Users can only update their own preferences
  - Users can only delete their own preferences

  ## Important Notes
  - One preferences row per user (enforced by unique constraint)
  - filter_categories stores an array of category IDs
  - RLS policies use auth.uid() to enforce per-user isolation
  - Auto-updates updated_at timestamp on changes
*/

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filter_categories text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at on user_preferences
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
