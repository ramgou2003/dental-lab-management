-- Remove next appointment fields from encounters table
-- These fields are no longer needed in the encounter form

ALTER TABLE encounters
DROP COLUMN IF EXISTS next_appointment_type,
DROP COLUMN IF EXISTS next_appointment_subtype,
DROP COLUMN IF EXISTS next_appointment_date,
DROP COLUMN IF EXISTS next_appointment_scheduled,
DROP COLUMN IF EXISTS next_appointment_scheduled_at,
DROP COLUMN IF EXISTS next_appointment_scheduled_by,
DROP COLUMN IF EXISTS scheduled_appointment_id;

-- Add comment to document the change
COMMENT ON TABLE encounters IS 'Encounter form data - next appointment scheduling removed and handled separately';

