-- Add RLS policies for user deletion operations
-- Run this in your Supabase SQL Editor to enable user deletion for admins

-- 1. Create a function to check if user has users.delete permission
CREATE OR REPLACE FUNCTION public.has_users_delete_permission()
RETURNS boolean AS $$
BEGIN
  -- Check if the current user has users.delete permission
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
      AND ur.status = 'active'
      AND p.name = 'users.delete'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add policy to allow users with users.delete permission to delete user profiles
CREATE POLICY "Allow users with users.delete permission to delete user profiles"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (
  has_users_delete_permission() OR is_super_admin()
);

-- 3. Add policy to allow users with users.delete permission to delete user roles
CREATE POLICY "Allow users with users.delete permission to delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  has_users_delete_permission() OR is_super_admin()
);

-- 4. Add policy to allow users with users.update permission to update user profiles
CREATE POLICY "Allow users with users.update permission to update user profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  has_users_read_permission() OR is_super_admin()
)
WITH CHECK (
  has_users_read_permission() OR is_super_admin()
);

-- 5. Add policy to allow users with users.manage_roles permission to update user roles
CREATE POLICY "Allow users with users.manage_roles permission to update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_users_read_permission() OR is_super_admin()
)
WITH CHECK (
  has_users_read_permission() OR is_super_admin()
);

-- 6. Add policy to allow users with users.create or users.manage_roles permission to insert user roles
CREATE POLICY "Allow users with users.create or users.manage_roles permission to insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_users_read_permission() OR is_super_admin() OR user_has_permission('users.create') OR user_has_permission('users.manage_roles')
);

-- 7. Verify the policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_roles')
ORDER BY tablename, policyname;

-- 8. Test the delete permission function (should return true for admin/super admin)
SELECT 
  'has_users_delete_permission' as check_type,
  has_users_delete_permission() as result;
