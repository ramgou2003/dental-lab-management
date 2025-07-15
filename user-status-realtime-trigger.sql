-- Real-time user status monitoring trigger
-- This will help notify the application when a user's status changes

-- 1. Create a function to handle user status changes
CREATE OR REPLACE FUNCTION notify_user_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Insert into a notification table or use pg_notify
    PERFORM pg_notify(
      'user_status_changed',
      json_build_object(
        'user_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'timestamp', NOW()
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger on user_profiles table
DROP TRIGGER IF EXISTS user_status_change_trigger ON user_profiles;
CREATE TRIGGER user_status_change_trigger
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_status_change();

-- 3. Create a table to log user status changes for audit purposes
CREATE TABLE IF NOT EXISTS user_status_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT,
  changed_by UUID REFERENCES user_profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- 4. Enable RLS on user_status_logs
ALTER TABLE user_status_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for user_status_logs
CREATE POLICY "Admins can view all status logs" ON user_status_logs
  FOR SELECT TO authenticated
  USING (user_has_permission('system.audit_logs'));

CREATE POLICY "System can insert status logs" ON user_status_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 6. Create function to log status changes with reason
CREATE OR REPLACE FUNCTION log_user_status_change(
  target_user_id UUID,
  old_status TEXT,
  new_status TEXT,
  reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_status_logs (user_id, old_status, new_status, changed_by, reason)
  VALUES (target_user_id, old_status, new_status, auth.uid(), reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update the trigger function to also log changes
CREATE OR REPLACE FUNCTION notify_user_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Log the change
    INSERT INTO user_status_logs (user_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    
    -- Notify via pg_notify
    PERFORM pg_notify(
      'user_status_changed',
      json_build_object(
        'user_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'timestamp', NOW()
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create a function to force logout a specific user (for admin use)
CREATE OR REPLACE FUNCTION force_user_logout(target_user_id UUID, reason TEXT DEFAULT 'Account status changed')
RETURNS VOID AS $$
BEGIN
  -- Check if current user has permission
  IF NOT user_has_permission('users.change_status') THEN
    RAISE EXCEPTION 'Insufficient permissions to force user logout';
  END IF;
  
  -- Log the forced logout
  INSERT INTO user_status_logs (user_id, old_status, new_status, changed_by, reason)
  VALUES (target_user_id, 'active', 'forced_logout', auth.uid(), reason);
  
  -- Notify the specific user
  PERFORM pg_notify(
    'force_logout_' || target_user_id::text,
    json_build_object(
      'reason', reason,
      'timestamp', NOW()
    )::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant necessary permissions
GRANT EXECUTE ON FUNCTION log_user_status_change TO authenticated;
GRANT EXECUTE ON FUNCTION force_user_logout TO authenticated;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_status_logs_user_id ON user_status_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_status_logs_changed_at ON user_status_logs(changed_at);

-- Usage examples:
-- 
-- To manually log a status change with reason:
-- SELECT log_user_status_change('user-uuid-here', 'active', 'inactive', 'Violated terms of service');
--
-- To force logout a specific user:
-- SELECT force_user_logout('user-uuid-here', 'Account suspended for security review');
--
-- To view status change logs:
-- SELECT * FROM user_status_logs WHERE user_id = 'user-uuid-here' ORDER BY changed_at DESC;
