/*
  # Update Customer Quotes Function to Include Assigned Designer

  1. Changes
    - Update get_customer_quotes function to return assigned_designer_id
    - Update customer_quotes_with_items view to include assigned_designer_id
    - This allows customers to see which projects have assigned designers

  2. Notes
    - Used by CustomerQuotes page to conditionally show "Assign Designer" button
    - Only shows button if assigned_designer_id is NULL
*/

-- Drop and recreate the view with assigned_designer_id
DROP VIEW IF EXISTS customer_quotes_with_items;
CREATE VIEW customer_quotes_with_items AS
SELECT 
  q.*,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  c.project_name,
  c.assigned_designer_id,
  d.name as designer_name,
  d.email as designer_email,
  d.phone as designer_phone,
  d.profile_image as designer_profile_image,
  d.specialization as designer_specialization,
  (
    SELECT json_agg(i.*)
    FROM quote_items i
    WHERE i.quote_id = q.id
  ) as items
FROM designer_quotes q
JOIN customers c ON c.id = q.project_id
JOIN designers d ON d.id = q.designer_id;

-- Grant access to the view
GRANT SELECT ON customer_quotes_with_items TO authenticated;

-- Drop the old function
DROP FUNCTION IF EXISTS get_customer_quotes(uuid);

-- Update the function to return assigned_designer_id
CREATE OR REPLACE FUNCTION get_customer_quotes(customer_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  id uuid,
  designer_id uuid,
  project_id uuid,
  quote_number text,
  title text,
  description text,
  subtotal numeric,
  discount_amount numeric,
  tax_rate numeric,
  tax_amount numeric,
  total_amount numeric,
  status text,
  valid_until date,
  terms_and_conditions text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  customer_accepted boolean,
  acceptance_date timestamptz,
  customer_feedback text,
  notification_sent boolean,
  customer_name text,
  customer_email text,
  customer_phone text,
  project_name text,
  assigned_designer_id uuid,
  designer_name text,
  designer_email text,
  designer_phone text,
  designer_profile_image text,
  designer_specialization text,
  items json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.designer_id,
    q.project_id,
    q.quote_number,
    q.title,
    q.description,
    q.subtotal,
    q.discount_amount,
    q.tax_rate,
    q.tax_amount,
    q.total_amount,
    q.status,
    q.valid_until,
    q.terms_and_conditions,
    q.notes,
    q.created_at,
    q.updated_at,
    q.customer_accepted,
    q.acceptance_date,
    q.customer_feedback,
    q.notification_sent,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    c.project_name,
    c.assigned_designer_id,
    d.name as designer_name,
    d.email as designer_email,
    d.phone as designer_phone,
    d.profile_image as designer_profile_image,
    d.specialization as designer_specialization,
    (
      SELECT json_agg(i.*)
      FROM quote_items i
      WHERE i.quote_id = q.id
    ) as items
  FROM designer_quotes q
  JOIN customers c ON c.id = q.project_id
  JOIN designers d ON d.id = q.designer_id
  WHERE c.user_id = customer_user_id
  ORDER BY q.created_at DESC;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_customer_quotes(uuid) TO authenticated;