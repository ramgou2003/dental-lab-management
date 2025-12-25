-- Add subtype column to appointments table
-- This allows appointments to have subtypes for better categorization

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS subtype TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_subtype ON appointments(subtype);

-- Add comment to document the new column
COMMENT ON COLUMN appointments.subtype IS 'Subtype of the appointment (e.g., 7-day-followup, 30-day-followup, 82-day-appliance-delivery, etc.)';

