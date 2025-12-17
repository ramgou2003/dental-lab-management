-- Cleanup orphaned consultations that have patient_id but no appointment_id
-- These are duplicate consultations that were created incorrectly

-- Delete orphaned consultations where:
-- 1. They have patient_id but no appointment_id
-- 2. There exists another consultation for the same patient with an appointment_id
DELETE FROM consultations c1
WHERE c1.appointment_id IS NULL
  AND c1.patient_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM consultations c2
    WHERE c2.patient_id = c1.patient_id
      AND c2.appointment_id IS NOT NULL
      AND c2.id != c1.id
  );

-- Log the results
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Count remaining orphaned consultations
  SELECT COUNT(*) INTO deleted_count
  FROM consultations
  WHERE appointment_id IS NULL
    AND patient_id IS NOT NULL;
  
  RAISE NOTICE 'Orphaned consultations cleaned up';
  RAISE NOTICE 'Remaining orphaned consultations: %', deleted_count;
END $$;

