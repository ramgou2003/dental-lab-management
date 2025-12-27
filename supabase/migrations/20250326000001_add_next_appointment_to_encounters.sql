-- Add next appointment fields to encounters table
-- This allows staff to specify what the next appointment should be and when it should be scheduled

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_type TEXT;

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_subtype TEXT;

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_date DATE;

-- Add comments to document the new columns
COMMENT ON COLUMN encounters.next_appointment_type IS 'Type of the next appointment (e.g., consultation, follow-up, data-collection, printed-try-in, surgery, surgical-revision, emergency)';
COMMENT ON COLUMN encounters.next_appointment_subtype IS 'Subtype of the next appointment (e.g., 7-day-followup, 75-day-data-collection, etc.)';
COMMENT ON COLUMN encounters.next_appointment_date IS 'Suggested date for the next appointment';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_encounters_next_appointment_date ON encounters(next_appointment_date);

