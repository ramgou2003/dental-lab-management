-- Create consultation permissions and assign to all roles
-- This allows all users to access the consultation page

-- 1. Insert consultation permissions
INSERT INTO permissions (name, display_name, description, module, action)
VALUES
  ('consultation.read', 'View Consultations', 'View consultations', 'consultation', 'read'),
  ('consultation.create', 'Create Consultations', 'Create consultations', 'consultation', 'create'),
  ('consultation.update', 'Update Consultations', 'Update consultations', 'consultation', 'update'),
  ('consultation.delete', 'Delete Consultations', 'Delete consultations', 'consultation', 'delete')
ON CONFLICT (name) DO NOTHING;

-- 2. Get permission IDs
DO $$
DECLARE
  consultation_read_id UUID;
  consultation_create_id UUID;
  consultation_update_id UUID;
  consultation_delete_id UUID;
  super_admin_role_id UUID;
  admin_role_id UUID;
  dentist_role_id UUID;
  lab_technician_role_id UUID;
  cad_designer_role_id UUID;
  receptionist_role_id UUID;
  viewer_role_id UUID;
BEGIN
  -- Get permission IDs
  SELECT id INTO consultation_read_id FROM permissions WHERE name = 'consultation.read';
  SELECT id INTO consultation_create_id FROM permissions WHERE name = 'consultation.create';
  SELECT id INTO consultation_update_id FROM permissions WHERE name = 'consultation.update';
  SELECT id INTO consultation_delete_id FROM permissions WHERE name = 'consultation.delete';

  -- Get role IDs
  SELECT id INTO super_admin_role_id FROM roles WHERE name = 'super_admin';
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  SELECT id INTO dentist_role_id FROM roles WHERE name = 'dentist';
  SELECT id INTO lab_technician_role_id FROM roles WHERE name = 'lab_technician';
  SELECT id INTO cad_designer_role_id FROM roles WHERE name = 'cad_designer';
  SELECT id INTO receptionist_role_id FROM roles WHERE name = 'receptionist';
  SELECT id INTO viewer_role_id FROM roles WHERE name = 'viewer';

  -- 3. Assign all consultation permissions to super_admin
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES
    (super_admin_role_id, consultation_read_id),
    (super_admin_role_id, consultation_create_id),
    (super_admin_role_id, consultation_update_id),
    (super_admin_role_id, consultation_delete_id)
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- 4. Assign all consultation permissions to admin
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES
    (admin_role_id, consultation_read_id),
    (admin_role_id, consultation_create_id),
    (admin_role_id, consultation_update_id),
    (admin_role_id, consultation_delete_id)
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- 5. Assign consultation permissions to dentist (all permissions)
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES
    (dentist_role_id, consultation_read_id),
    (dentist_role_id, consultation_create_id),
    (dentist_role_id, consultation_update_id),
    (dentist_role_id, consultation_delete_id)
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- 6. Assign consultation permissions to receptionist (all permissions)
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES
    (receptionist_role_id, consultation_read_id),
    (receptionist_role_id, consultation_create_id),
    (receptionist_role_id, consultation_update_id),
    (receptionist_role_id, consultation_delete_id)
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- 7. Assign consultation permissions to lab_technician (read only)
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES
    (lab_technician_role_id, consultation_read_id)
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- 8. Assign consultation permissions to cad_designer (read only)
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES
    (cad_designer_role_id, consultation_read_id)
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- 9. Assign consultation permissions to viewer (read only)
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES
    (viewer_role_id, consultation_read_id)
  ON CONFLICT (role_id, permission_id) DO NOTHING;
END $$;

-- 10. Verify the permissions were assigned
SELECT 
  r.name as role_name,
  p.name as permission_name,
  p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.module = 'consultation'
ORDER BY r.name, p.name;

