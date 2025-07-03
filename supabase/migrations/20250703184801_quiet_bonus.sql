/*
  # Add Quotation Acceptance System

  1. New Features
    - Add acceptance tracking to designer_quotes table
    - Add customer acceptance date field
    - Add customer feedback field
    - Add notification system for quote acceptance

  2. Security
    - Update RLS policies to allow customers to update quote status
    - Maintain existing security for designers
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

CREATE POLICY "Customers can view and update quotes for their projects"
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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = designer_quotes.project_id 
      AND customers.user_id = auth.uid()
    )
    -- Only allow customers to update specific fields
    AND (
      (OLD.customer_accepted IS DISTINCT FROM NEW.customer_accepted) OR
      (OLD.customer_feedback IS DISTINCT FROM NEW.customer_feedback)
    )
    -- Don't allow changing other fields
    AND (
      OLD.designer_id = NEW.designer_id AND
      OLD.project_id = NEW.project_id AND
      OLD.quote_number = NEW.quote_number AND
      OLD.title = NEW.title AND
      OLD.description = NEW.description AND
      OLD.subtotal = NEW.subtotal AND
      OLD.discount_amount = NEW.discount_amount AND
      OLD.tax_rate = NEW.tax_rate AND
      OLD.tax_amount = NEW.tax_amount AND
      OLD.total_amount = NEW.total_amount
    )
  );

-- Create function to track quote acceptance changes
CREATE OR REPLACE FUNCTION track_quote_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  user_type_val TEXT;
BEGIN
  -- Determine user type
  IF EXISTS (SELECT 1 FROM designers WHERE user_id = auth.uid()) THEN
    user_type_val := 'designer';
  ELSE
    user_type_val := 'customer';
  END IF;

  -- Only track changes to acceptance status
  IF OLD.customer_accepted IS DISTINCT FROM NEW.customer_accepted OR 
     OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Set acceptance date if newly accepted
    IF NEW.customer_accepted = true AND OLD.customer_accepted = false THEN
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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