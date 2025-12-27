-- Add scheduled status field to encounters table for next appointment tracking
-- This allows tracking whether the suggested next appointment has been scheduled

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_scheduled BOOLEAN DEFAULT FALSE;

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_scheduled_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_scheduled_by UUID REFERENCES user_profiles(id);

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS scheduled_appointment_id UUID REFERENCES appointments(id);

-- Add comments to document the new columns
COMMENT ON COLUMN encounters.next_appointment_scheduled IS 'Whether the suggested next appointment has been scheduled';
COMMENT ON COLUMN encounters.next_appointment_scheduled_at IS 'Timestamp when the next appointment was scheduled';
COMMENT ON COLUMN encounters.next_appointment_scheduled_by IS 'User who scheduled the next appointment';
COMMENT ON COLUMN encounters.scheduled_appointment_id IS 'Reference to the scheduled appointment that was created';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_encounters_next_appointment_scheduled ON encounters(next_appointment_scheduled);
CREATE INDEX IF NOT EXISTS idx_encounters_scheduled_appointment_id ON encounters(scheduled_appointment_id);

