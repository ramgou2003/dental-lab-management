-- Additional Security Enhancements for User Impersonation System
-- This file adds extra security measures and restrictions

-- 1. Create function to check if a user is currently being impersonated
CREATE OR REPLACE FUNCTION is_user_being_impersonated(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_impersonation_logs
    WHERE target_user_id = user_id
      AND action = 'start_impersonation'
      AND ended_at IS NULL
      AND created_at > NOW() - INTERVAL '24 hours' -- Prevent stale sessions
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create function to get active impersonation sessions
CREATE OR REPLACE FUNCTION get_active_impersonation_sessions()
RETURNS TABLE (
  session_id UUID,
  admin_user_id UUID,
  admin_name TEXT,
  target_user_id UUID,
  target_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uil.id as session_id,
    uil.admin_user_id,
    admin_profile.full_name as admin_name,
    uil.target_user_id,
    target_profile.full_name as target_name,
    uil.started_at,
    EXTRACT(EPOCH FROM (NOW() - uil.started_at))::INTEGER / 60 as duration_minutes,
    uil.reason
  FROM user_impersonation_logs uil
  JOIN user_profiles admin_profile ON uil.admin_user_id = admin_profile.id
  JOIN user_profiles target_profile ON uil.target_user_id = target_profile.id
  WHERE uil.action = 'start_impersonation'
    AND uil.ended_at IS NULL
    AND uil.created_at > NOW() - INTERVAL '24 hours'
  ORDER BY uil.started_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to automatically end stale impersonation sessions
CREATE OR REPLACE FUNCTION cleanup_stale_impersonation_sessions()
RETURNS INTEGER AS $$
DECLARE
  sessions_ended INTEGER := 0;
  stale_session RECORD;
BEGIN
  -- Find sessions older than 24 hours that haven't been properly ended
  FOR stale_session IN 
    SELECT id, admin_user_id, target_user_id
    FROM user_impersonation_logs
    WHERE action = 'start_impersonation'
      AND ended_at IS NULL
      AND created_at < NOW() - INTERVAL '24 hours'
  LOOP
    -- Mark the session as ended
    UPDATE user_impersonation_logs
    SET ended_at = NOW()
    WHERE id = stale_session.id;
    
    -- Log the automatic cleanup
    INSERT INTO user_impersonation_logs (
      admin_user_id,
      target_user_id,
      action,
      reason
    ) VALUES (
      stale_session.admin_user_id,
      stale_session.target_user_id,
      'end_impersonation',
      'Automatically ended due to timeout (24 hours)'
    );
    
    sessions_ended := sessions_ended + 1;
  END LOOP;
  
  RETURN sessions_ended;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enhanced start_user_impersonation with additional security checks
CREATE OR REPLACE FUNCTION start_user_impersonation_secure(
  target_user_id UUID,
  reason TEXT DEFAULT 'Administrative support',
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  admin_user_id UUID := auth.uid();
  target_user_record RECORD;
  admin_user_record RECORD;
  impersonation_id UUID;
  active_sessions INTEGER;
BEGIN
  -- Check if current user can impersonate
  IF NOT can_impersonate_users(admin_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions to impersonate users'
    );
  END IF;

  -- Check if admin already has active impersonation sessions (limit to 1)
  SELECT COUNT(*) INTO active_sessions
  FROM user_impersonation_logs
  WHERE admin_user_id = admin_user_id
    AND action = 'start_impersonation'
    AND ended_at IS NULL
    AND created_at > NOW() - INTERVAL '24 hours';

  IF active_sessions > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You already have an active impersonation session. Please end it first.'
    );
  END IF;

  -- Check if target user is already being impersonated
  IF is_user_being_impersonated(target_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This user is already being impersonated by another admin'
    );
  END IF;

  -- Get target user details
  SELECT id, email, first_name, last_name, full_name, status
  INTO target_user_record
  FROM user_profiles
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Target user not found'
    );
  END IF;

  -- Check if target user is active
  IF target_user_record.status != 'active' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot impersonate inactive user'
    );
  END IF;

  -- Get admin user details
  SELECT email, first_name, last_name, full_name
  INTO admin_user_record
  FROM user_profiles
  WHERE id = admin_user_id;

  -- Prevent impersonating other super admins
  IF EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = target_user_id
      AND ur.status = 'active'
      AND r.name = 'super_admin'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot impersonate other super administrators'
    );
  END IF;

  -- Prevent self-impersonation
  IF admin_user_id = target_user_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot impersonate yourself'
    );
  END IF;

  -- Validate reason length
  IF LENGTH(TRIM(reason)) < 5 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Reason must be at least 5 characters long'
    );
  END IF;

  -- Log the impersonation start
  INSERT INTO user_impersonation_logs (
    admin_user_id,
    target_user_id,
    action,
    ip_address,
    user_agent,
    reason
  ) VALUES (
    admin_user_id,
    target_user_id,
    'start_impersonation',
    ip_address,
    user_agent,
    reason
  ) RETURNING id INTO impersonation_id;

  -- Return success with user details
  RETURN json_build_object(
    'success', true,
    'impersonation_id', impersonation_id,
    'admin_user', json_build_object(
      'id', admin_user_id,
      'email', admin_user_record.email,
      'full_name', admin_user_record.full_name
    ),
    'target_user', json_build_object(
      'id', target_user_record.id,
      'email', target_user_record.email,
      'full_name', target_user_record.full_name
    ),
    'started_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION is_user_being_impersonated TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_impersonation_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_stale_impersonation_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION start_user_impersonation_secure TO authenticated;

-- 6. Create a scheduled job to cleanup stale sessions (if pg_cron is available)
-- This would need to be run manually or via a cron job
-- SELECT cleanup_stale_impersonation_sessions();

SELECT 'Enhanced security functions created successfully' as status;
