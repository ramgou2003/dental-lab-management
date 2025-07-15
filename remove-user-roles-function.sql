-- Create a database function to completely remove user roles (delete rows)
-- This function will delete the user_roles rows instead of setting them inactive

-- 1. Create function to remove user roles completely
CREATE OR REPLACE FUNCTION remove_user_roles(
  target_user_id UUID,
  role_ids_to_remove UUID[]
)
RETURNS JSON AS $$
DECLARE
  current_role_id UUID;
  result JSON;
  success_count INTEGER := 0;
  error_count INTEGER := 0;
  errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Remove each role by deleting the row
  FOREACH current_role_id IN ARRAY role_ids_to_remove
  LOOP
    BEGIN
      -- Delete the user role row
      DELETE FROM user_roles 
      WHERE user_id = target_user_id 
        AND role_id = current_role_id;
      
      success_count := success_count + 1;
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      errors := array_append(errors, SQLERRM);
    END;
  END LOOP;

  -- Return result
  result := json_build_object(
    'success', error_count = 0,
    'removed_count', success_count,
    'error_count', error_count,
    'errors', errors
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION remove_user_roles TO authenticated;

-- 3. Create a comprehensive function to update user roles (add and remove)
CREATE OR REPLACE FUNCTION update_user_roles(
  target_user_id UUID,
  roles_to_add UUID[] DEFAULT ARRAY[]::UUID[],
  roles_to_remove UUID[] DEFAULT ARRAY[]::UUID[],
  roles_to_reactivate UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS JSON AS $$
DECLARE
  current_role_id UUID;
  add_result JSON;
  remove_result JSON;
  reactivate_result JSON;
  total_success_count INTEGER := 0;
  total_error_count INTEGER := 0;
  all_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Remove roles (delete rows)
  IF array_length(roles_to_remove, 1) > 0 THEN
    remove_result := remove_user_roles(target_user_id, roles_to_remove);
    total_success_count := total_success_count + (remove_result->>'removed_count')::INTEGER;
    total_error_count := total_error_count + (remove_result->>'error_count')::INTEGER;
    
    -- Merge errors if any
    IF (remove_result->>'error_count')::INTEGER > 0 THEN
      all_errors := all_errors || ARRAY(SELECT json_array_elements_text(remove_result->'errors'));
    END IF;
  END IF;

  -- Add new roles
  IF array_length(roles_to_add, 1) > 0 THEN
    add_result := assign_user_roles_simple(target_user_id, roles_to_add);
    total_success_count := total_success_count + (add_result->>'assigned_count')::INTEGER;
    total_error_count := total_error_count + (add_result->>'error_count')::INTEGER;
    
    -- Merge errors if any
    IF (add_result->>'error_count')::INTEGER > 0 THEN
      all_errors := all_errors || ARRAY(SELECT json_array_elements_text(add_result->'errors'));
    END IF;
  END IF;

  -- Reactivate roles
  IF array_length(roles_to_reactivate, 1) > 0 THEN
    FOREACH current_role_id IN ARRAY roles_to_reactivate
    LOOP
      BEGIN
        UPDATE user_roles 
        SET status = 'active' 
        WHERE user_id = target_user_id 
          AND role_id = current_role_id;
        
        total_success_count := total_success_count + 1;
      EXCEPTION WHEN OTHERS THEN
        total_error_count := total_error_count + 1;
        all_errors := array_append(all_errors, SQLERRM);
      END;
    END LOOP;
  END IF;

  -- Return combined result
  RETURN json_build_object(
    'success', total_error_count = 0,
    'total_operations', total_success_count + total_error_count,
    'success_count', total_success_count,
    'error_count', total_error_count,
    'errors', all_errors,
    'details', json_build_object(
      'add_result', add_result,
      'remove_result', remove_result,
      'roles_added', array_length(roles_to_add, 1),
      'roles_removed', array_length(roles_to_remove, 1),
      'roles_reactivated', array_length(roles_to_reactivate, 1)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION update_user_roles TO authenticated;

-- 5. Test the functions
SELECT 'Role management functions created successfully' as status;
