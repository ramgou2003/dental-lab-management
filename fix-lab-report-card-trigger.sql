-- Fix Lab Report Card Auto-Generation Issues
-- This script fixes two issues:
-- 1. Removes auto-generation of appliance numbers (should be user input)
-- 2. Ensures material field is properly synced from lab scripts

-- First, let's update the trigger function to not auto-generate appliance numbers
CREATE OR REPLACE FUNCTION create_lab_report_card_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if status changed to 'completed' and no lab report card exists yet
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Insert new lab report card entry with default/placeholder values
    INSERT INTO lab_report_cards (
      lab_script_id,
      patient_name,
      arch_type,
      upper_appliance_type,
      lower_appliance_type,
      screw,
      material,
      shade,
      implant_on_upper,
      implant_on_lower,
      tooth_library_upper,
      tooth_library_lower,
      upper_appliance_number,
      lower_appliance_number,
      notes_and_remarks,
      status
    ) VALUES (
      NEW.id,
      NEW.patient_name,
      NEW.arch_type,
      NEW.upper_appliance_type,
      NEW.lower_appliance_type,
      COALESCE(NEW.screw_type, 'DC Screw'), -- Default screw if not specified
      NEW.material, -- Use material from lab script
      COALESCE(NEW.shade, 'A2'), -- Use shade from lab script or default
      CASE
        WHEN NEW.arch_type IN ('upper', 'dual') THEN 'Nobel Biocare'
        ELSE NULL
      END,
      CASE
        WHEN NEW.arch_type IN ('lower', 'dual') THEN 'Straumann'
        ELSE NULL
      END,
      CASE
        WHEN NEW.arch_type IN ('upper', 'dual') THEN 'Anterior Teeth'
        ELSE NULL
      END,
      CASE
        WHEN NEW.arch_type IN ('lower', 'dual') THEN 'Posterior Teeth'
        ELSE NULL
      END,
      NULL, -- upper_appliance_number - should be filled by user
      NULL, -- lower_appliance_number - should be filled by user
      'Lab report card automatically created upon completion. Please review and update all specifications as needed.',
      'completed'
    )
    ON CONFLICT (lab_script_id) DO NOTHING; -- Prevent duplicates if somehow one already exists
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Clear existing auto-generated appliance numbers if you want to reset them
-- Uncomment the lines below if you want to clear existing auto-generated numbers
-- UPDATE lab_report_cards 
-- SET 
--   upper_appliance_number = NULL,
--   lower_appliance_number = NULL
-- WHERE 
--   upper_appliance_number LIKE 'U-%' 
--   OR lower_appliance_number LIKE 'L-%';

-- Add material column to lab_report_cards if it doesn't exist
-- (This should already exist, but just in case)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'lab_report_cards' 
                   AND column_name = 'material') THEN
        ALTER TABLE lab_report_cards ADD COLUMN material TEXT;
    END IF;
END $$;

-- Update existing lab report cards to sync material from lab scripts where missing
UPDATE lab_report_cards 
SET material = lab_scripts.material
FROM lab_scripts 
WHERE lab_report_cards.lab_script_id = lab_scripts.id 
  AND (lab_report_cards.material IS NULL OR lab_report_cards.material = '')
  AND lab_scripts.material IS NOT NULL;
