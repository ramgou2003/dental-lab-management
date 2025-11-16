-- Add treatment_status column to patients table
-- This column tracks the treatment progress status of each patient

-- Add the treatment_status column with NULL as default
ALTER TABLE patients 
ADD COLUMN treatment_status TEXT DEFAULT NULL;

-- Add CHECK constraint to ensure only valid treatment status values
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

-- Update all existing patients to 'Treatment In Progress'
UPDATE patients 
SET treatment_status = 'Treatment In Progress'
WHERE treatment_status IS NULL;

-- Add comment to the column for documentation
COMMENT ON COLUMN patients.treatment_status IS 'Current treatment status of the patient. Allowed values: Treatment Not Started, Treatment In Progress, Treatment Completed, Patient Deceased, Dismissed DNC';

