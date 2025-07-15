-- Fix RLS policy for user role assignment during user creation
-- This allows users with users.create permission to assign roles when creating new users

-- 1. Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;

-- 2. Create a new policy that allows both users.create and users.manage_roles permissions
CREATE POLICY "Allow users with users.create or users.manage_roles permission to insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_has_permission('users.create') OR 
  user_has_permission('users.manage_roles') OR 
  is_super_admin()
);

-- 3. Verify the new policy was created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'user_roles' AND cmd = 'INSERT'
ORDER BY policyname;

-- 4. Test the policy by checking if current user can insert roles
SELECT 
  'users.create' as permission_type,
  user_has_permission('users.create') as has_permission
UNION ALL
SELECT 
  'users.manage_roles' as permission_type,
  user_has_permission('users.manage_roles') as has_permission
UNION ALL
SELECT 
  'is_super_admin' as permission_type,
  is_super_admin() as has_permission;
