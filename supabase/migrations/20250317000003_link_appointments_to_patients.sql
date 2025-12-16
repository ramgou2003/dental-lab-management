-- Link existing appointments to patients using patient_name
-- This migration updates appointments.patient_id by matching patient_name with patients table

-- Update appointments with patient_id by matching patient_name
-- We'll match by combining first_name and last_name from patients table
-- Using REGEXP_REPLACE to normalize multiple spaces to single space
UPDATE appointments a
SET patient_id = p.id
FROM patients p
WHERE a.patient_id IS NULL
  AND (
    -- Match full name with normalized spaces (handles extra spaces in appointment names)
    LOWER(REGEXP_REPLACE(TRIM(a.patient_name), '\s+', ' ', 'g')) = LOWER(TRIM(p.first_name || ' ' || p.last_name))
    OR
    -- Match with full_name if it exists
    (p.full_name IS NOT NULL AND LOWER(REGEXP_REPLACE(TRIM(a.patient_name), '\s+', ' ', 'g')) = LOWER(TRIM(p.full_name)))
  );

-- Log the results
DO $$
DECLARE
  updated_count INTEGER;
  null_count INTEGER;
BEGIN
  -- Count updated appointments
  SELECT COUNT(*) INTO updated_count
  FROM appointments
  WHERE patient_id IS NOT NULL;
  
  -- Count appointments still without patient_id
  SELECT COUNT(*) INTO null_count
  FROM appointments
  WHERE patient_id IS NULL;
  
  RAISE NOTICE 'Appointments linked to patients: %', updated_count;
  RAISE NOTICE 'Appointments without patient_id: %', null_count;
END $$;

