/*
  # Add Quote Acceptance System

  1. New Features
    - Add customer acceptance tracking to designer quotes
    - Create history table for quote acceptance changes
    - Add policies for customers to accept/reject quotes
    - Create view for accepted quotes

  2. Security
    - Enable RLS on new tables
    - Add policies for customers and designers
    - Track quote acceptance changes
*/

-- Add new fields to designer_quotes table
ALTER TABLE designer_quotes 
ADD COLUMN IF NOT EXISTS customer_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS acceptance_date timestamptz,
ADD COLUMN IF NOT EXISTS customer_feedback text,
ADD COLUMN IF NOT EXISTS notification_sent boolean DEFAULT false;

-- Create quote acceptance history table to track status changes
CREATE TABLE IF NOT EXISTS quote_acceptance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES designer_quotes(id) ON DELETE CASCADE,
  previous_status text,
  new_status text,
  changed_by uuid REFERENCES auth.users(id),
  changed_by_type text NOT NULL, -- 'customer' or 'designer'
  feedback text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new table
ALTER TABLE quote_acceptance_history ENABLE ROW LEVEL SECURITY;

-- Add policies for quote_acceptance_history
CREATE POLICY "Designers can view acceptance history for their quotes"
  ON quote_acceptance_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM designer_quotes
      JOIN designers ON designers.id = designer_quotes.designer_id
      WHERE designer_quotes.id = quote_acceptance_history.quote_id
      AND designers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view acceptance history for their quotes"
  ON quote_acceptance_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM designer_quotes
      JOIN customers ON customers.id = designer_quotes.project_id
      WHERE designer_quotes.id = quote_acceptance_history.quote_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert acceptance history"
  ON quote_acceptance_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update designer_quotes policies to allow customers to update status
DROP POLICY IF EXISTS "Customers can view quotes for their projects" ON designer_quotes;

CREATE POLICY "Customers can view quotes for their projects"
  ON designer_quotes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = designer_quotes.project_id 
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can accept or reject quotes"
  ON designer_quotes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = designer_quotes.project_id 
      AND customers.user_id = auth.uid()
    )
  );

-- Create function to track quote acceptance changes
CREATE OR REPLACE FUNCTION track_quote_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  user_type_val TEXT;
BEGIN
  -- Only process for UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    -- Determine user type
    IF EXISTS (SELECT 1 FROM designers WHERE user_id = auth.uid()) THEN
      user_type_val := 'designer';
    ELSE
      user_type_val := 'customer';
    END IF;

    -- Only track changes to acceptance status
    IF (OLD.customer_accepted IS NULL AND NEW.customer_accepted = true) OR 
       (OLD.customer_accepted = false AND NEW.customer_accepted = true) OR
       (OLD.customer_accepted = true AND NEW.customer_accepted = false) OR
       OLD.status IS DISTINCT FROM NEW.status THEN
      
      -- Set acceptance date if newly accepted
      IF NEW.customer_accepted = true AND (OLD.customer_accepted IS NULL OR OLD.customer_accepted = false) THEN
        NEW.acceptance_date := now();
        
        -- Update status to 'accepted' if customer accepted
        IF user_type_val = 'customer' THEN
          NEW.status := 'accepted';
        END IF;
      END IF;
      
      -- If customer rejected, update status
      IF NEW.customer_accepted = false AND OLD.customer_accepted = true AND user_type_val = 'customer' THEN
        NEW.status := 'rejected';
      END IF;
      
      -- Record the change in history
      INSERT INTO quote_acceptance_history (
        quote_id,
        previous_status,
        new_status,
        changed_by,
        changed_by_type,
        feedback,
        created_at
      ) VALUES (
        NEW.id,
        OLD.status,
        NEW.status,
        auth.uid(),
        user_type_val,
        NEW.customer_feedback,
        now()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS track_quote_acceptance_trigger ON designer_quotes;

-- Create trigger for tracking quote acceptance
CREATE TRIGGER track_quote_acceptance_trigger
  BEFORE UPDATE ON designer_quotes
  FOR EACH ROW
  EXECUTE FUNCTION track_quote_acceptance();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_designer_quotes_customer_accepted 
ON designer_quotes(customer_accepted);

CREATE INDEX IF NOT EXISTS idx_quote_acceptance_history_quote_id 
ON quote_acceptance_history(quote_id);

CREATE INDEX IF NOT EXISTS idx_quote_acceptance_history_created_at 
ON quote_acceptance_history(created_at DESC);

-- Create view for accepted quotes
CREATE OR REPLACE VIEW accepted_quotes AS
SELECT 
  q.*,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  c.project_name,
  d.name as designer_name,
  d.email as designer_email,
  d.phone as designer_phone
FROM designer_quotes q
JOIN customers c ON c.id = q.project_id
JOIN designers d ON d.id = q.designer_id
WHERE q.customer_accepted = true
AND q.status = 'accepted';

-- Grant access to the view
GRANT SELECT ON accepted_quotes TO authenticated;