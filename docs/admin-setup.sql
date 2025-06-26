-- Admin User Setup Script for Dental Lab Management System
-- Run this script in Supabase SQL Editor to create the first admin user

-- Note: This script creates a user profile entry, but you still need to create 
-- the actual auth user through Supabase Auth (either through the dashboard or signup)

-- Step 1: Create a function to set up admin user after auth user is created
CREATE OR REPLACE FUNCTION setup_admin_user(
  auth_user_id UUID,
  user_email TEXT,
  user_first_name TEXT,
  user_last_name TEXT
)
RETURNS TEXT AS $$
DECLARE
  admin_role_id UUID;
  super_admin_role_id UUID;
BEGIN
  -- Update user profile with admin info
  UPDATE user_profiles 
  SET 
    first_name = user_first_name,
    last_name = user_last_name,
    status = 'active'
  WHERE id = auth_user_id;

  -- Get admin and super admin role IDs
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;
  SELECT id INTO super_admin_role_id FROM roles WHERE name = 'super_admin' LIMIT 1;
  
  -- Assign super admin role
  INSERT INTO user_roles (user_id, role_id, status)
  VALUES (auth_user_id, super_admin_role_id, 'active')
  ON CONFLICT (user_id, role_id) DO UPDATE SET status = 'active';
  
  -- Also assign admin role for redundancy
  INSERT INTO user_roles (user_id, role_id, status)
  VALUES (auth_user_id, admin_role_id, 'active')
  ON CONFLICT (user_id, role_id) DO UPDATE SET status = 'active';
  
  RETURN 'Admin user setup completed for: ' || user_email;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Example usage (replace with actual user ID after creating auth user)
-- SELECT setup_admin_user(
--   'YOUR_AUTH_USER_ID_HERE'::UUID,
--   'admin@dentallab.com',
--   'Admin',
--   'User'
-- );

-- Step 3: Verify roles and permissions
-- Check all roles
SELECT 
  r.name,
  r.display_name,
  r.description,
  r.is_system_role,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name, r.display_name, r.description, r.is_system_role
ORDER BY r.name;

-- Check permissions for a specific role (replace 'super_admin' with desired role)
SELECT 
  r.display_name as role_name,
  p.name as permission_name,
  p.display_name as permission_display_name,
  p.module,
  p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'super_admin'
ORDER BY p.module, p.action;

-- Step 4: Check user roles (replace with actual user ID)
-- SELECT 
--   up.full_name,
--   up.email,
--   r.display_name as role_name,
--   ur.status as role_status
-- FROM user_profiles up
-- JOIN user_roles ur ON up.id = ur.user_id
-- JOIN roles r ON ur.role_id = r.id
-- WHERE up.id = 'YOUR_USER_ID_HERE'::UUID;

-- Step 5: Manual admin user creation (if needed)
-- If you need to manually create a user profile entry:
-- INSERT INTO user_profiles (
--   id,
--   email,
--   first_name,
--   last_name,
--   status
-- ) VALUES (
--   'YOUR_AUTH_USER_ID_HERE'::UUID,
--   'admin@dentallab.com',
--   'Admin',
--   'User',
--   'active'
-- );

-- Then assign roles:
-- INSERT INTO user_roles (user_id, role_id, status)
-- SELECT 
--   'YOUR_AUTH_USER_ID_HERE'::UUID,
--   id,
--   'active'
-- FROM roles 
-- WHERE name IN ('super_admin', 'admin');

-- Step 6: Create additional helper functions

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions_summary(user_uuid UUID)
RETURNS TABLE(
  user_name TEXT,
  user_email TEXT,
  role_name TEXT,
  permission_count BIGINT,
  permissions TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.full_name,
    up.email,
    r.display_name,
    COUNT(p.id),
    ARRAY_AGG(p.name ORDER BY p.name)
  FROM user_profiles up
  JOIN user_roles ur ON up.id = ur.user_id
  JOIN roles r ON ur.role_id = r.id
  JOIN role_permissions rp ON r.id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE up.id = user_uuid
    AND ur.status = 'active'
    AND r.status = 'active'
  GROUP BY up.full_name, up.email, r.display_name
  ORDER BY r.display_name;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_uuid
      AND p.name = permission_name
      AND ur.status = 'active'
      AND r.status = 'active'
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT user_has_permission('YOUR_USER_ID'::UUID, 'users.create');

-- Step 7: Audit and monitoring queries

-- Get all active users with their roles
SELECT 
  up.full_name,
  up.email,
  up.status,
  up.last_login,
  STRING_AGG(r.display_name, ', ' ORDER BY r.display_name) as roles
FROM user_profiles up
LEFT JOIN user_roles ur ON up.id = ur.user_id AND ur.status = 'active'
LEFT JOIN roles r ON ur.role_id = r.id AND r.status = 'active'
GROUP BY up.id, up.full_name, up.email, up.status, up.last_login
ORDER BY up.created_at DESC;

-- Get role distribution
SELECT 
  r.display_name,
  COUNT(ur.user_id) as user_count
FROM roles r
LEFT JOIN user_roles ur ON r.id = ur.role_id AND ur.status = 'active'
WHERE r.status = 'active'
GROUP BY r.id, r.display_name
ORDER BY user_count DESC;

-- Get permission usage statistics
SELECT 
  p.module,
  p.action,
  p.display_name,
  COUNT(DISTINCT ur.user_id) as users_with_permission
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
JOIN user_roles ur ON r.id = ur.role_id
WHERE ur.status = 'active' AND r.status = 'active'
GROUP BY p.id, p.module, p.action, p.display_name
ORDER BY p.module, p.action;

-- Instructions:
-- 1. First, create an auth user through Supabase Auth (Dashboard > Authentication > Users > Add User)
-- 2. Copy the user ID from the auth.users table
-- 3. Run the setup_admin_user function with the copied user ID
-- 4. Test login with the created user credentials
-- 5. Verify permissions using the helper functions above
