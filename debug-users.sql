-- Debug query to check all users in the database
-- Run this in your Supabase SQL editor to see all users

-- 1. Check all user profiles
SELECT 
  id,
  email,
  first_name,
  last_name,
  full_name,
  status,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 2. Check user roles assignments
SELECT 
  up.id,
  up.email,
  up.full_name,
  ur.role_id,
  r.name as role_name,
  r.display_name as role_display_name,
  ur.status as role_status
FROM user_profiles up
LEFT JOIN user_roles ur ON up.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
ORDER BY up.created_at DESC, ur.role_id;

-- 3. Check for users without any roles
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.status,
  up.created_at
FROM user_profiles up
LEFT JOIN user_roles ur ON up.id = ur.user_id
WHERE ur.user_id IS NULL
ORDER BY up.created_at DESC;

-- 4. Check auth.users table (if accessible)
-- This shows users created in Supabase Auth
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
