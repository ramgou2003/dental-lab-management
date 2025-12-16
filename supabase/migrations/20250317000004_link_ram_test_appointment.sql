-- Link Ram Test appointment to the patient
-- This updates the appointment for Ram Test to connect it to the patient_id

-- Update appointments for Ram Test by matching with patients table
UPDATE appointments a
SET patient_id = p.id
FROM patients p
WHERE a.patient_id IS NULL
  AND LOWER(REGEXP_REPLACE(TRIM(a.patient_name), '\s+', ' ', 'g')) = LOWER(TRIM(p.first_name || ' ' || p.last_name))
  AND (p.first_name ILIKE '%Ram%' OR p.last_name ILIKE '%Test%' OR p.full_name ILIKE '%Ram%Test%');

-- Log the results
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Count updated appointments for Ram Test
  SELECT COUNT(*) INTO updated_count
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  WHERE p.first_name ILIKE '%Ram%' OR p.last_name ILIKE '%Test%' OR p.full_name ILIKE '%Ram%Test%';
  
  RAISE NOTICE 'Ram Test appointments linked: %', updated_count;
END $$;

