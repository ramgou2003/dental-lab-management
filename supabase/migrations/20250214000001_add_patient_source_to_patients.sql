-- Add patient_source column to patients table
-- This migration adds the patient_source field to track where the patient was added from

-- Add the patient_source column to the patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS patient_source TEXT CHECK (patient_source IN ('Consult', 'Direct'));

-- Add a comment to document the new column
COMMENT ON COLUMN patients.patient_source IS 'Indicates the source of patient creation: Consult (from consultation) or Direct (from patient page)';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_patient_source ON patients(patient_source);

-- Update existing patients based on consultation relationship
-- If a patient has a consultation record, mark as 'Consult', otherwise 'Direct'
UPDATE patients
SET patient_source = CASE
  WHEN EXISTS (
    SELECT 1 FROM consultations c 
    WHERE c.patient_id = patients.id
  ) THEN 'Consult'
  ELSE 'Direct'
END
WHERE patient_source IS NULL;

-- Set default value for future inserts (optional, can be overridden)
ALTER TABLE patients 
ALTER COLUMN patient_source SET DEFAULT 'Direct';

