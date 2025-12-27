-- Migration to allow 'CMPLT' status code in appointments table
-- This is required for the "Appointment Completed" feature to work

-- Drop the existing constraint
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add the recreated constraint including 'CMPLT'
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status_code IN (
  '?????', 
  'FIRM', 
  'EFIRM', 
  'EMER', 
  'HERE', 
  'READY', 
  'LM1', 
  'LM2', 
  'MULTI', 
  '2wk', 
  'NSHOW', 
  'RESCH', 
  'CANCL', 
  'CMPLT'
));
