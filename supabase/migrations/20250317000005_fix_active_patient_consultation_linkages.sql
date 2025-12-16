-- Fix consultation and appointment linkages for active patients
-- This migration fixes consultations that were created for active patients before the fix was implemented

-- Step 1: Update consultations that have appointment_id but no patient_id
-- by getting the patient_id from the appointment
UPDATE consultations c
SET patient_id = a.patient_id
FROM appointments a
WHERE c.appointment_id = a.id
  AND c.patient_id IS NULL
  AND a.patient_id IS NOT NULL;

-- Step 2: Update appointments that have no patient_id but the consultation has one
-- This handles cases where the consultation was updated but the appointment wasn't
UPDATE appointments a
SET patient_id = c.patient_id
FROM consultations c
WHERE c.appointment_id = a.id
  AND a.patient_id IS NULL
  AND c.patient_id IS NOT NULL;

-- Step 3: Delete duplicate consultation records that were created when treatment was accepted
-- These are consultations that have patient_id but no appointment_id, and there's already
-- a consultation with the same patient_id and an appointment_id
DELETE FROM consultations c1
WHERE c1.appointment_id IS NULL
  AND c1.patient_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM consultations c2
    WHERE c2.patient_id = c1.patient_id
      AND c2.appointment_id IS NOT NULL
      AND c2.patient_name = c1.patient_name
      AND c2.id != c1.id
  );

-- Log the results
DO $$
DECLARE
  consultations_updated INTEGER;
  appointments_updated INTEGER;
  duplicates_deleted INTEGER;
BEGIN
  -- Count consultations that were updated
  SELECT COUNT(*) INTO consultations_updated
  FROM consultations c
  JOIN appointments a ON c.appointment_id = a.id
  WHERE c.patient_id = a.patient_id
    AND c.patient_id IS NOT NULL;
  
  -- Count appointments that were updated
  SELECT COUNT(*) INTO appointments_updated
  FROM appointments a
  JOIN consultations c ON c.appointment_id = a.id
  WHERE a.patient_id = c.patient_id
    AND a.patient_id IS NOT NULL;
  
  RAISE NOTICE 'Consultations linked to patients: %', consultations_updated;
  RAISE NOTICE 'Appointments linked to patients: %', appointments_updated;
  RAISE NOTICE 'Migration completed successfully';
END $$;

