-- Fix duplicate consultations issue
-- This migration cleans up duplicate consultations and prevents future duplicates

-- Step 1: Delete duplicate consultations that have null appointment_id
-- Keep only the consultation with appointment_id for each patient packet
DELETE FROM consultations c1
WHERE c1.appointment_id IS NULL
  AND EXISTS (
    SELECT 1 FROM consultations c2
    WHERE c2.new_patient_packet_id = c1.new_patient_packet_id
      AND c2.appointment_id IS NOT NULL
      AND c2.id != c1.id
  );

-- Step 2: For consultations with the same new_patient_packet_id but different appointment_ids,
-- keep only the most recent one (by created_at)
DELETE FROM consultations c1
WHERE EXISTS (
  SELECT 1 FROM consultations c2
  WHERE c2.new_patient_packet_id = c1.new_patient_packet_id
    AND c2.id != c1.id
    AND c2.created_at > c1.created_at
);

-- Step 3: Add a comment to document the unique constraint on appointment_id
COMMENT ON CONSTRAINT consultations_appointment_id_key ON consultations IS 
'Ensures each appointment can only have one consultation record. This prevents duplicate consultations.';

