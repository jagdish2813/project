/*
  # Add Shared Status to Customer Projects

  1. Changes
    - This migration documents the addition of the 'shared' status value for customer projects
    - Status flow: 
      * 'pending' - Initial project creation
      * 'shared' - Project shared with designer(s) for first time
      * 'assigned' - Customer confirms and assigns project to specific designer after accepting quote
    - The assignment_status column in customers table will be used to track this workflow

  2. Workflow
    - When customer shares project with designer first time → assignment_status = 'shared'
    - Project appears in designer's "Shared Projects" section
    - Designer can submit quotes for shared projects
    - When customer accepts a quote → assignment_status = 'assigned'
    - Project moves to designer's "Assigned Projects" section

  3. Notes
    - No schema changes needed as assignment_status already exists as text type
    - This migration serves as documentation for the new status value
    - Existing 'pending', 'assigned', 'in_progress', 'completed' statuses remain valid
*/

-- No schema changes needed, this is a documentation migration
-- The assignment_status column already exists and accepts text values
-- We're simply adding 'shared' as a valid status value to the workflow

-- Add a comment to document the valid status values
COMMENT ON COLUMN customers.assignment_status IS 'Valid values: pending, shared, assigned, in_progress, completed. Flow: pending → shared (first assignment) → assigned (quote accepted) → in_progress → completed';
