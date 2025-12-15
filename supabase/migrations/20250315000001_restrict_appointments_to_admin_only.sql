-- Restrict Appointments Access to Super Admin and Admin Only
-- This migration removes appointment permissions from all roles except super_admin and admin
-- Other users can be granted access through the role management interface

-- Step 1: Remove appointment permissions from all roles except super_admin and admin
DELETE FROM role_permissions
WHERE permission_id IN (
  SELECT id FROM permissions WHERE module = 'appointments'
)
AND role_id NOT IN (
  SELECT id FROM roles WHERE name IN ('super_admin', 'admin')
);

-- Step 2: Verify the changes
-- This query shows which roles now have appointment permissions (should only be super_admin and admin)
-- SELECT 
--   r.name as role_name,
--   r.display_name,
--   p.name as permission_name,
--   p.display_name as permission_display
-- FROM roles r
-- JOIN role_permissions rp ON r.id = rp.role_id
-- JOIN permissions p ON rp.permission_id = p.id
-- WHERE p.module = 'appointments'
-- ORDER BY r.name, p.action;

-- Note: Appointment permissions can still be granted to other roles through the Role Management interface
-- This just sets the default state where only super_admin and admin have access

