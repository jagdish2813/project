/*
  # Fix Project Updates Table Migration

  1. Changes
    - Create project_updates table if it doesn't exist
    - Add proper checks for existing policies before creating them
    - Add proper checks for existing trigger before creating it
    - Create appropriate indexes for better performance

  2. Security
    - Enable RLS on the table
    - Add policies for designers to manage updates for their assigned projects
    - Add policies for customers to view updates for their projects
*/

-- Create project updates table
CREATE TABLE IF NOT EXISTS project_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  designer_id uuid REFERENCES designers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  update_type text NOT NULL CHECK (update_type IN ('progress_report', 'photo_update', 'milestone')),
  photos text[] DEFAULT '{}',
  completion_percentage integer CHECK (completion_percentage BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_updates' 
    AND policyname = 'Designers can manage updates for their assigned projects'
  ) THEN
    DROP POLICY "Designers can manage updates for their assigned projects" ON project_updates;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_updates' 
    AND policyname = 'Customers can view updates for their projects'
  ) THEN
    DROP POLICY "Customers can view updates for their projects" ON project_updates;
  END IF;
END $$;

-- Create policies for project_updates
CREATE POLICY "Designers can manage updates for their assigned projects"
  ON project_updates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      JOIN designers ON designers.id = customers.assigned_designer_id
      WHERE customers.id = project_updates.project_id
      AND designers.user_id = auth.uid()
      AND designers.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      JOIN designers ON designers.id = customers.assigned_designer_id
      WHERE customers.id = project_updates.project_id
      AND designers.user_id = auth.uid()
      AND designers.is_active = true
    )
  );

CREATE POLICY "Customers can view updates for their projects"
  ON project_updates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = project_updates.project_id
      AND customers.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_project_updates_updated_at'
    AND tgrelid = 'project_updates'::regclass
  ) THEN
    CREATE TRIGGER update_project_updates_updated_at
      BEFORE UPDATE ON project_updates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id 
ON project_updates(project_id);

CREATE INDEX IF NOT EXISTS idx_project_updates_designer_id 
ON project_updates(designer_id);

CREATE INDEX IF NOT EXISTS idx_project_updates_created_at 
ON project_updates(created_at DESC);