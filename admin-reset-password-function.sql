-- Function to allow admins to reset user passwords
-- This function should be run in your Supabase SQL editor

-- Drop the function if it exists
DROP FUNCTION IF EXISTS admin_reset_user_password(UUID, TEXT);

-- Create the function to reset user password
CREATE OR REPLACE FUNCTION admin_reset_user_password(
    target_user_id UUID,
    new_password TEXT
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    current_user_id UUID;
BEGIN
    -- Get the current user's ID
    current_user_id := auth.uid();
    
    -- Check if current user exists
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Check if current user has permission to update users
    IF NOT user_has_permission('users.update') THEN
        RAISE EXCEPTION 'Insufficient permissions to reset user passwords';
    END IF;
    
    -- Validate password length
    IF LENGTH(new_password) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters long';
    END IF;
    
    -- Update the user's password in auth.users
    -- Note: This uses the Supabase auth schema
    -- The password will be automatically hashed by Supabase
    UPDATE auth.users
    SET 
        encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = target_user_id;
    
    -- Check if user was found and updated
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Log the password reset action (optional - add to audit log if you have one)
    -- INSERT INTO audit_log (user_id, action, target_user_id, details)
    -- VALUES (current_user_id, 'password_reset', target_user_id, 
    --         json_build_object('reset_by', current_user_id, 'reset_at', NOW()));
    
    -- Return success result
    result := json_build_object(
        'success', true,
        'message', 'Password reset successfully',
        'user_id', target_user_id,
        'reset_by', current_user_id,
        'reset_at', NOW()
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Return error details
        result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'detail', SQLSTATE
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
-- The function itself checks for proper permissions
GRANT EXECUTE ON FUNCTION admin_reset_user_password(UUID, TEXT) TO authenticated;

-- Add comment to document the function
COMMENT ON FUNCTION admin_reset_user_password(UUID, TEXT) IS 
'Allows administrators with users.update permission to reset user passwords. 
Requires minimum 6 character password. Automatically hashes the password.';

