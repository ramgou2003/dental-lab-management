-- Script to link Ram Test patient's appointments and consultations
-- Run this in Supabase SQL Editor

-- Step 1: Find Ram Test patient
SELECT 
  'Patient Info:' as step,
  id as patient_id, 
  first_name, 
  last_name, 
  full_name,
  created_at
FROM patients 
WHERE full_name ILIKE '%Ram%Test%' 
   OR (first_name ILIKE '%Ram%' AND last_name ILIKE '%Test%')
ORDER BY created_at DESC 
LIMIT 1;

-- Step 2: Update appointments for Ram Test
UPDATE appointments a
SET patient_id = p.id
FROM patients p
WHERE a.patient_id IS NULL
  AND (
    LOWER(REGEXP_REPLACE(TRIM(a.patient_name), '\s+', ' ', 'g')) = LOWER(TRIM(p.full_name))
    OR LOWER(REGEXP_REPLACE(TRIM(a.patient_name), '\s+', ' ', 'g')) = LOWER(TRIM(p.first_name || ' ' || p.last_name))
  )
  AND (
    p.full_name ILIKE '%Ram%Test%' 
    OR (p.first_name ILIKE '%Ram%' AND p.last_name ILIKE '%Test%')
  );

-- Step 3: Verify appointments are linked
SELECT 
  'Appointments Linked:' as step,
  a.id as appointment_id,
  a.patient_name,
  a.patient_id,
  a.appointment_type,
  a.date,
  p.full_name as linked_patient_name
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE p.full_name ILIKE '%Ram%Test%' 
   OR (p.first_name ILIKE '%Ram%' AND p.last_name ILIKE '%Test%')
ORDER BY a.created_at DESC;

-- Step 4: Verify consultations are linked
SELECT 
  'Consultations Linked:' as step,
  c.id as consultation_id,
  c.patient_name,
  c.patient_id,
  c.appointment_id,
  c.consultation_status,
  p.full_name as linked_patient_name
FROM consultations c
JOIN patients p ON c.patient_id = p.id
WHERE p.full_name ILIKE '%Ram%Test%' 
   OR (p.first_name ILIKE '%Ram%' AND p.last_name ILIKE '%Test%')
ORDER BY c.created_at DESC;

