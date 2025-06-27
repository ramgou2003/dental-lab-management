-- Comprehensive User Deletion System
-- This script creates functions to completely remove a user from all tables and Supabase Auth

-- 1. Create function to delete user from all related tables
CREATE OR REPLACE FUNCTION delete_user_completely(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    deletion_summary JSON;
    deleted_counts JSON;
    auth_user_email TEXT;
BEGIN
    -- Check if current user has permission to delete users
    IF NOT user_has_permission('users.delete') THEN
        RAISE EXCEPTION 'Insufficient permissions to delete users';
    END IF;
    
    -- Get user email for auth deletion
    SELECT email INTO auth_user_email 
    FROM user_profiles 
    WHERE id = target_user_id;
    
    IF auth_user_email IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Initialize deletion counts
    deleted_counts := '{}'::JSON;
    
    -- Start transaction for data deletion
    BEGIN
        -- 1. Delete from user_status_logs (both as user and changed_by)
        WITH deleted AS (
            DELETE FROM user_status_logs 
            WHERE user_id = target_user_id OR changed_by = target_user_id
            RETURNING *
        )
        SELECT json_build_object('user_status_logs', count(*)) INTO deleted_counts
        FROM deleted;
        
        -- 2. Delete from user_roles
        WITH deleted AS (
            DELETE FROM user_roles 
            WHERE user_id = target_user_id
            RETURNING *
        )
        SELECT deleted_counts || json_build_object('user_roles', count(*)) INTO deleted_counts
        FROM deleted;
        
        -- 3. Delete from audit_logs
        WITH deleted AS (
            DELETE FROM audit_logs 
            WHERE user_id = target_user_id
            RETURNING *
        )
        SELECT deleted_counts || json_build_object('audit_logs', count(*)) INTO deleted_counts
        FROM deleted;
        
        -- 4. Update created_by references to NULL (preserve data but remove user reference)
        -- Update roles created_by
        UPDATE roles SET created_by = NULL WHERE created_by = target_user_id;
        
        -- Update surgical_recall_sheets created_by
        UPDATE surgical_recall_sheets SET created_by = NULL WHERE created_by = target_user_id;
        
        -- Update user_profiles created_by
        UPDATE user_profiles SET created_by = NULL WHERE created_by = target_user_id;
        
        -- 5. Delete from user_profiles (main user record)
        WITH deleted AS (
            DELETE FROM user_profiles 
            WHERE id = target_user_id
            RETURNING *
        )
        SELECT deleted_counts || json_build_object('user_profiles', count(*)) INTO deleted_counts
        FROM deleted;
        
        -- Log the deletion
        INSERT INTO audit_logs (
            user_id, 
            action, 
            table_name, 
            record_id, 
            old_values,
            new_values
        ) VALUES (
            auth.uid(),
            'DELETE_USER_COMPLETE',
            'user_profiles',
            target_user_id,
            json_build_object('email', auth_user_email, 'deleted_at', NOW()),
            json_build_object('status', 'completely_deleted')
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback and re-raise the exception
            RAISE;
    END;
    
    -- Prepare summary
    deletion_summary := json_build_object(
        'user_id', target_user_id,
        'email', auth_user_email,
        'deleted_at', NOW(),
        'deleted_by', auth.uid(),
        'deletion_counts', deleted_counts,
        'status', 'database_deletion_complete'
    );
    
    RETURN deletion_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create function to delete user from Supabase Auth (requires admin service key)
CREATE OR REPLACE FUNCTION delete_user_from_auth(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if current user has permission
    IF NOT user_has_permission('users.delete') THEN
        RAISE EXCEPTION 'Insufficient permissions to delete users from authentication';
    END IF;
    
    -- Note: This function marks the need for auth deletion
    -- The actual auth deletion must be done via the admin API from the application
    
    result := json_build_object(
        'user_id', target_user_id,
        'auth_deletion_required', true,
        'message', 'User marked for auth deletion - requires admin API call'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create comprehensive deletion function that handles both database and auth
CREATE OR REPLACE FUNCTION delete_user_and_auth(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    db_result JSON;
    auth_result JSON;
    final_result JSON;
BEGIN
    -- First delete from database
    SELECT delete_user_completely(target_user_id) INTO db_result;
    
    -- Mark for auth deletion
    SELECT delete_user_from_auth(target_user_id) INTO auth_result;
    
    -- Combine results
    final_result := json_build_object(
        'database_deletion', db_result,
        'auth_deletion', auth_result,
        'next_steps', 'Application must call Supabase Admin API to delete from auth.users'
    );
    
    RETURN final_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to check what would be deleted (dry run)
CREATE OR REPLACE FUNCTION preview_user_deletion(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    preview_data JSON;
    user_email TEXT;
BEGIN
    -- Check if current user has permission
    IF NOT user_has_permission('users.read') THEN
        RAISE EXCEPTION 'Insufficient permissions to preview user deletion';
    END IF;
    
    -- Get user email
    SELECT email INTO user_email FROM user_profiles WHERE id = target_user_id;
    
    IF user_email IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Count related records
    SELECT json_build_object(
        'user_id', target_user_id,
        'email', user_email,
        'records_to_delete', json_build_object(
            'user_profiles', (SELECT count(*) FROM user_profiles WHERE id = target_user_id),
            'user_roles', (SELECT count(*) FROM user_roles WHERE user_id = target_user_id),
            'user_status_logs', (SELECT count(*) FROM user_status_logs WHERE user_id = target_user_id OR changed_by = target_user_id),
            'audit_logs', (SELECT count(*) FROM audit_logs WHERE user_id = target_user_id)
        ),
        'references_to_nullify', json_build_object(
            'roles_created_by', (SELECT count(*) FROM roles WHERE created_by = target_user_id),
            'surgical_recall_sheets_created_by', (SELECT count(*) FROM surgical_recall_sheets WHERE created_by = target_user_id),
            'user_profiles_created_by', (SELECT count(*) FROM user_profiles WHERE created_by = target_user_id)
        )
    ) INTO preview_data;
    
    RETURN preview_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION delete_user_completely TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_from_auth TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_and_auth TO authenticated;
GRANT EXECUTE ON FUNCTION preview_user_deletion TO authenticated;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_status_logs_user_id ON user_status_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_status_logs_changed_by ON user_status_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Usage Examples:
-- 
-- Preview what would be deleted:
-- SELECT preview_user_deletion('user-uuid-here');
--
-- Delete user completely (database only):
-- SELECT delete_user_completely('user-uuid-here');
--
-- Delete user from both database and mark for auth deletion:
-- SELECT delete_user_and_auth('user-uuid-here');
