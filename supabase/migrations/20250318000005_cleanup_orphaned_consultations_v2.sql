-- Cleanup orphaned consultations that have patient_id but no appointment_id
-- These are duplicate consultations that were created incorrectly by createConsultationFromPacket

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

-- Log the cleanup
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % orphaned consultations with null appointment_id', deleted_count;
END $$;

