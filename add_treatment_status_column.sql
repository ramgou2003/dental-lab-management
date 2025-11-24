-- ============================================
-- Add treatment_status column to patients table
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add the treatment_status column with NULL as default
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS treatment_status TEXT DEFAULT NULL;

-- Step 2: Add CHECK constraint to ensure only valid treatment status values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'patients_treatment_status_check'
  ) THEN
    ALTER TABLE patients 
    ADD CONSTRAINT patients_treatment_status_check 
    CHECK (
      treatment_status IS NULL OR 
      treatment_status IN (
        'Treatment Not Started',
        'Treatment In Progress',
        'Treatment Completed',
        'Patient Deceased',
        'Dismissed DNC'
      )
    );
  END IF;
END $$;

-- Step 3: Update all existing patients to 'Treatment In Progress'
UPDATE patients 
SET treatment_status = 'Treatment In Progress'
WHERE treatment_status IS NULL;

-- Step 4: Add comment to the column for documentation
COMMENT ON COLUMN patients.treatment_status IS 'Current treatment status of the patient. Allowed values: Treatment Not Started, Treatment In Progress, Treatment Completed, Patient Deceased, Dismissed DNC';

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'patients' 
  AND column_name = 'treatment_status';

-- Show count of patients by treatment status
SELECT 
  treatment_status, 
  COUNT(*) as count
FROM patients
GROUP BY treatment_status
ORDER BY count DESC;

