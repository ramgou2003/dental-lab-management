-- Add encounter_completed field to appointments table
-- This tracks whether the encounter form has been completed for this appointment

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS encounter_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS encounter_completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS encounter_completed_by UUID REFERENCES user_profiles(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_encounter_completed ON appointments(encounter_completed);

-- Add comments to document the new columns
COMMENT ON COLUMN appointments.encounter_completed IS 'Whether the encounter form has been completed for this appointment';
COMMENT ON COLUMN appointments.encounter_completed_at IS 'When the encounter form was completed';
COMMENT ON COLUMN appointments.encounter_completed_by IS 'User who completed the encounter form';

