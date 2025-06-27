-- User Impersonation System for Super Admin
-- This allows super admins to "sign in as" other users for support and troubleshooting

-- 1. Create impersonation audit log table
CREATE TABLE IF NOT EXISTS user_impersonation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'start_impersonation', 'end_impersonation'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on impersonation logs
ALTER TABLE user_impersonation_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for impersonation logs
CREATE POLICY "Super admins can view all impersonation logs" ON user_impersonation_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND ur.status = 'active'
        AND r.name = 'super_admin'
    )
  );

CREATE POLICY "System can insert impersonation logs" ON user_impersonation_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 4. Function to check if user can impersonate others
CREATE OR REPLACE FUNCTION can_impersonate_users(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Only super admins can impersonate
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id
      AND ur.status = 'active'
      AND r.name = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to start user impersonation
CREATE OR REPLACE FUNCTION start_user_impersonation(
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
BEGIN
  -- Check if current user can impersonate
  IF NOT can_impersonate_users(admin_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions to impersonate users'
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

-- 6. Function to end user impersonation
CREATE OR REPLACE FUNCTION end_user_impersonation(
  impersonation_id UUID
)
RETURNS JSON AS $$
DECLARE
  admin_user_id UUID := auth.uid();
  log_record RECORD;
BEGIN
  -- Get the impersonation log record
  SELECT * INTO log_record
  FROM user_impersonation_logs
  WHERE id = impersonation_id
    AND admin_user_id = admin_user_id
    AND action = 'start_impersonation'
    AND ended_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Impersonation session not found or already ended'
    );
  END IF;

  -- Update the log record to mark end time
  UPDATE user_impersonation_logs
  SET ended_at = NOW()
  WHERE id = impersonation_id;

  -- Log the end of impersonation
  INSERT INTO user_impersonation_logs (
    admin_user_id,
    target_user_id,
    action,
    reason
  ) VALUES (
    log_record.admin_user_id,
    log_record.target_user_id,
    'end_impersonation',
    'Impersonation session ended'
  );

  RETURN json_build_object(
    'success', true,
    'ended_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION can_impersonate_users TO authenticated;
GRANT EXECUTE ON FUNCTION start_user_impersonation TO authenticated;
GRANT EXECUTE ON FUNCTION end_user_impersonation TO authenticated;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_admin_user ON user_impersonation_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_target_user ON user_impersonation_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_created_at ON user_impersonation_logs(created_at);

SELECT 'User impersonation functions created successfully' as status;
