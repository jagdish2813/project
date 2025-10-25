/*
  # Create Default Admin User

  1. Important Notes
    - Creates a default admin user with credentials:
      - Email: admin@interiordesign.com
      - Password: admin
    - The auth.users entry is created with the specified credentials
    - An admin_users entry is created with super_admin role
    - This migration checks if the admin already exists before creating

  2. Security Note
    - This is for initial setup only
    - The password should be changed immediately after first login in production
*/

-- Create admin user in auth.users if not exists
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@interiordesign.com';

  -- If admin doesn't exist, create it
  IF admin_user_id IS NULL THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@interiordesign.com',
      crypt('admin', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_user_id;

    -- Insert into admin_users table
    INSERT INTO admin_users (
      user_id,
      email,
      role,
      permissions,
      is_active
    )
    VALUES (
      admin_user_id,
      'admin@interiordesign.com',
      'super_admin',
      '{"manage_deals": true, "manage_designers": true, "view_earnings": true, "manage_users": true}'::jsonb,
      true
    );

    RAISE NOTICE 'Admin user created successfully with email: admin@interiordesign.com and password: admin';
  ELSE
    -- Check if admin_users entry exists
    IF NOT EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = admin_user_id
    ) THEN
      -- Create admin_users entry for existing auth user
      INSERT INTO admin_users (
        user_id,
        email,
        role,
        permissions,
        is_active
      )
      VALUES (
        admin_user_id,
        'admin@interiordesign.com',
        'super_admin',
        '{"manage_deals": true, "manage_designers": true, "view_earnings": true, "manage_users": true}'::jsonb,
        true
      );
      RAISE NOTICE 'Admin_users entry created for existing user';
    ELSE
      RAISE NOTICE 'Admin user already exists';
    END IF;
  END IF;
END $$;