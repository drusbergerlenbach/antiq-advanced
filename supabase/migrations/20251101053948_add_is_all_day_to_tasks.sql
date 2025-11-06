/*
  # Add is_all_day column to tasks table

  1. Changes
    - Add `is_all_day` boolean column to `tasks` table
    - Set default value to `false`
    - Update existing tasks where time is 12:00 to be all-day tasks

  2. Notes
    - This allows tasks to be marked as all-day events
    - Existing tasks with 12:00 time will be automatically marked as all-day
*/

-- Add is_all_day column to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'is_all_day'
  ) THEN
    ALTER TABLE tasks ADD COLUMN is_all_day boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Update existing tasks where time is 12:00 to be all-day tasks
UPDATE tasks
SET is_all_day = true
WHERE EXTRACT(HOUR FROM due_at) = 12 
  AND EXTRACT(MINUTE FROM due_at) = 0
  AND EXTRACT(SECOND FROM due_at) = 0;