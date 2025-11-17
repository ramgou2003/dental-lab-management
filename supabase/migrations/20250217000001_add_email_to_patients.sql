-- Add email column to patients table
-- This migration adds the email field to store patient email addresses

-- Add the email column to the patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS email TEXT DEFAULT NULL;

-- Add a comment to document the new column
COMMENT ON COLUMN patients.email IS 'Patient email address for communication and notifications';

-- Add index for better query performance when searching by email
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

