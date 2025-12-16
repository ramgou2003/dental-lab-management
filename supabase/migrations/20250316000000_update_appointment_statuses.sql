-- Update appointment status values to match new comprehensive status list
-- This migration updates the appointments table to support the new status values

-- First, update existing appointments to map old statuses to new ones
UPDATE appointments
SET status = CASE
  WHEN status = 'pending' THEN '?????'
  WHEN status = 'confirmed' THEN 'FIRM'
  WHEN status = 'not-confirmed' THEN '?????'
  WHEN status = 'completed' THEN 'FIRM'
  WHEN status = 'cancelled' THEN '?????'
  ELSE '?????'
END
WHERE status IN ('pending', 'confirmed', 'not-confirmed', 'completed', 'cancelled');

-- Add CHECK constraint to ensure only valid appointment status values
-- Drop existing constraint if it exists
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add new CHECK constraint with all valid status values
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
CHECK (
  status IN (
    '?????',              -- ????? Not Confirmed
    'FIRM',               -- FIRM Appointment Confirmed
    'EFIRM',              -- EFIRM Electronically Confirmed
    'EMER',               -- EMER Emergency Patient
    'HERE',               -- HERE Patient has Arrived
    'READY',              -- READY Ready for Operatory
    'LM1',                -- LM1 Left 1st Message
    'LM2',                -- LM2 Left 2nd Message
    'MULTI',              -- MULTI Multi-Appointment
    '2wk'                 -- 2wk 2 Week Calls
  )
);

-- Set default value for status column
ALTER TABLE appointments ALTER COLUMN status SET DEFAULT '?????';

-- Add comment to document the status values
COMMENT ON COLUMN appointments.status IS 'Appointment status: ????? (Not Confirmed), FIRM (Appointment Confirmed), EFIRM (Electronically Confirmed), EMER (Emergency Patient), HERE (Patient has Arrived), READY (Ready for Operatory), LM1 (Left 1st Message), LM2 (Left 2nd Message), MULTI (Multi-Appointment), 2wk (2 Week Calls)';

