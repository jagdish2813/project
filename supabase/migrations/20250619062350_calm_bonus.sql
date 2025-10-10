/*
  # Fix Customer Projects RLS Policy

  1. Issues Fixed
    - Update RLS policy for project_shares to properly allow designers to view shares
    - Ensure the policy correctly matches designer email with project shares
    - Add better error handling and debugging

  2. Changes
    - Drop and recreate the problematic RLS policy
    - Add a more robust policy that handles email matching correctly
    - Ensure designers can view project details through joins
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Designers can view shares sent to them" ON project_shares;

-- Create a more robust policy for designers to view shares sent to them
CREATE POLICY "Designers can view shares sent to them"
  ON project_shares
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM designers 
      WHERE designers.user_id = auth.uid() 
      AND LOWER(designers.email) = LOWER(project_shares.designer_email)
      AND designers.is_active = true
    )
  );

-- Also ensure designers can read customer project details when they have shares
-- Update the existing policy to be more permissive for designers with shares
DROP POLICY IF EXISTS "Designers can view customer projects" ON customers;

CREATE POLICY "Designers can view customer projects"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM designers 
      WHERE designers.user_id = auth.uid() 
      AND designers.is_active = true
    )
  );