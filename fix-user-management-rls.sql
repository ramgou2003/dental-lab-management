-- Fix RLS policies for user management
-- This will allow users with proper permissions to view all user profiles

-- 1. Create a function to check if user has users.read permission
CREATE OR REPLACE FUNCTION public.has_users_read_permission()
RETURNS boolean AS $$
BEGIN
  -- Check if the current user has users.read permission
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
      AND ur.status = 'active'
      AND p.name = 'users.read'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  -- Check if the current user has super_admin role
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.status = 'active'
      AND r.name = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add policy to allow users with users.read permission to view all profiles
CREATE POLICY "Allow users with users.read permission to view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  has_users_read_permission() OR is_super_admin()
);

-- 4. Add policy to allow users with users.read permission to view all user roles
CREATE POLICY "Allow users with users.read permission to view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  has_users_read_permission() OR is_super_admin()
);

-- 5. Verify the policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_roles')
ORDER BY tablename, policyname;

-- 6. Test the functions (should return true for super admin)
SELECT 
  'is_super_admin' as check_type,
  is_super_admin() as result
UNION ALL
SELECT 
  'has_users_read_permission' as check_type,
  has_users_read_permission() as result;
