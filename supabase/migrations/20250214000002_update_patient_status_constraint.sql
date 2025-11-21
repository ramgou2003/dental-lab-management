-- Drop the existing CHECK constraint on patient status
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_status_check;

-- Add new CHECK constraint to allow only ACTIVE and INACTIVE
ALTER TABLE patients ADD CONSTRAINT patients_status_check 
  CHECK (status IS NULL OR status IN ('ACTIVE', 'INACTIVE'));

-- Update existing patient statuses to match new values
-- Map old statuses to new ones
UPDATE patients 
SET status = CASE 
  WHEN status IN ('New patient', 'Treatment not started', 'Treatment in progress', 'ACTIVE') THEN 'ACTIVE'
  WHEN status IN ('Treatment completed', 'Patient deceased') THEN 'INACTIVE'
  ELSE 'ACTIVE'
END
WHERE status IS NOT NULL;

-- Set default value for status column
ALTER TABLE patients ALTER COLUMN status SET DEFAULT 'ACTIVE';

