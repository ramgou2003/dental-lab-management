-- Find Ram Test patient
SELECT id, first_name, last_name, full_name, created_at 
FROM patients 
WHERE first_name ILIKE '%Ram%' OR last_name ILIKE '%Test%' 
ORDER BY created_at DESC 
LIMIT 5;

-- Find Ram Test appointments
SELECT id, patient_name, patient_id, appointment_type, date, created_at
FROM appointments
WHERE patient_name ILIKE '%Ram%Test%' OR patient_name ILIKE '%Test%Ram%'
ORDER BY created_at DESC
LIMIT 5;

-- Find Ram Test consultations
SELECT id, patient_name, patient_id, appointment_id, consultation_status, created_at
FROM consultations
WHERE patient_name ILIKE '%Ram%Test%' OR patient_name ILIKE '%Test%Ram%'
ORDER BY created_at DESC
LIMIT 5;

