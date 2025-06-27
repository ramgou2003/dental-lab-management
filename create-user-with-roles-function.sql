-- Create a database function to handle user creation with role assignment
-- This bypasses RLS issues by using SECURITY DEFINER

-- 1. Create function to assign roles to a user (with proper permission checking)
CREATE OR REPLACE FUNCTION assign_user_roles(
  target_user_id UUID,
  role_ids UUID[],
  assigned_by_user_id UUID DEFAULT auth.uid()
)
RETURNS JSON AS $$
DECLARE
  role_id UUID;
  result JSON;
  success_count INTEGER := 0;
  error_count INTEGER := 0;
  errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check if the user assigning roles has permission
  IF NOT (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = assigned_by_user_id
        AND ur.status = 'active'
        AND r.status = 'active'
        AND p.name IN ('users.create', 'users.manage_roles')
    ) OR
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = assigned_by_user_id
        AND ur.status = 'active'
        AND r.name = 'super_admin'
    )
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions to assign roles',
      'assigned_count', 0,
      'error_count', 0
    );
  END IF;

  -- Assign each role
  FOREACH role_id IN ARRAY role_ids
  LOOP
    BEGIN
      -- Insert or update the user role
      INSERT INTO user_roles (user_id, role_id, status)
      VALUES (target_user_id, role_id, 'active')
      ON CONFLICT (user_id, role_id) 
      DO UPDATE SET status = 'active';
      
      success_count := success_count + 1;
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      errors := array_append(errors, SQLERRM);
    END;
  END LOOP;

  -- Return result
  result := json_build_object(
    'success', error_count = 0,
    'assigned_count', success_count,
    'error_count', error_count,
    'errors', errors
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION assign_user_roles TO authenticated;

-- 3. Create a comprehensive function for user creation with roles
CREATE OR REPLACE FUNCTION create_user_with_roles(
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT DEFAULT NULL,
  role_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS JSON AS $$
DECLARE
  full_name_value TEXT;
  profile_result RECORD;
  roles_result JSON;
BEGIN
  -- Create full name
  full_name_value := TRIM(CONCAT(last_name, ', ', first_name));
  
  -- Create user profile
  INSERT INTO user_profiles (
    id, email, first_name, last_name, full_name, phone, status
  ) VALUES (
    user_id, email, first_name, last_name, full_name_value, phone, 'active'
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    status = EXCLUDED.status;

  -- Assign roles if provided
  IF array_length(role_ids, 1) > 0 THEN
    roles_result := assign_user_roles(user_id, role_ids);
  ELSE
    roles_result := json_build_object(
      'success', true,
      'assigned_count', 0,
      'error_count', 0,
      'message', 'No roles to assign'
    );
  END IF;

  -- Return combined result
  RETURN json_build_object(
    'success', true,
    'user_created', true,
    'roles_assignment', roles_result
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'user_created', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION create_user_with_roles TO authenticated;

-- 5. Test the functions
SELECT 'Functions created successfully' as status;
