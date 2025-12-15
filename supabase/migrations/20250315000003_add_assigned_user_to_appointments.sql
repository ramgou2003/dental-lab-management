-- Add assigned_user_id column to appointments table
-- This allows appointments to be assigned to specific users (dentists, staff, etc.)

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_assigned_user_id ON appointments(assigned_user_id);

-- Add comment to document the new column
COMMENT ON COLUMN appointments.assigned_user_id IS 'ID of the user (dentist/staff) assigned to this appointment';

