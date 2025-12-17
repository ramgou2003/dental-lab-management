-- Fix patient_id and nightguard details not being set in manufacturing items created via UPDATE trigger
-- The UPDATE trigger (create_manufacturing_item_from_lab_report) was missing patient_id and is_nightguard_needed
-- This migration adds patient_id and nightguard details to the UPDATE trigger function

-- Update the trigger function to include patient_id and nightguard details when creating manufacturing items
CREATE OR REPLACE FUNCTION create_manufacturing_item_from_lab_report()
RETURNS TRIGGER AS $$
DECLARE
  existing_count INTEGER;
  v_patient_id UUID;
  v_is_nightguard_needed TEXT;
BEGIN
  -- Only create manufacturing item when lab report card is properly completed
  -- Must have status = 'completed' AND meaningful user-filled data
  IF NEW.status = 'completed' AND 
     (OLD.status IS NULL OR OLD.status != 'completed') AND
     (
       -- Must have at least one of these user-filled fields
       NEW.upper_appliance_number IS NOT NULL OR 
       NEW.lower_appliance_number IS NOT NULL OR
       NEW.implant_on_upper IS NOT NULL OR
       NEW.implant_on_lower IS NOT NULL OR
       NEW.tooth_library_upper IS NOT NULL OR
       NEW.tooth_library_lower IS NOT NULL OR
       (NEW.notes_and_remarks IS NOT NULL AND NEW.notes_and_remarks != '')
     ) AND
     -- Must have manufacturing method determined
     NEW.manufacturing_method IS NOT NULL THEN
    
    -- Check if a manufacturing item already exists for this lab report card
    SELECT COUNT(*) INTO existing_count 
    FROM manufacturing_items 
    WHERE lab_report_card_id = NEW.id;
    
    -- Only insert if no manufacturing item exists yet
    IF existing_count = 0 THEN
      -- Get patient_id and is_nightguard_needed from lab_scripts
      SELECT patient_id, is_nightguard_needed INTO v_patient_id, v_is_nightguard_needed
      FROM lab_scripts
      WHERE id = NEW.lab_script_id;

      INSERT INTO manufacturing_items (
        lab_report_card_id,
        lab_script_id,
        patient_id,
        patient_name,
        upper_appliance_type,
        lower_appliance_type,
        shade,
        arch_type,
        upper_appliance_number,
        lower_appliance_number,
        upper_nightguard_number,
        lower_nightguard_number,
        is_nightguard_needed,
        material,
        screw,
        implant_on_upper,
        implant_on_lower,
        tooth_library_upper,
        tooth_library_lower,
        notes_and_remarks,
        manufacturing_method,
        status
      ) VALUES (
        NEW.id,
        NEW.lab_script_id,
        v_patient_id,
        NEW.patient_name,
        NEW.upper_appliance_type,
        NEW.lower_appliance_type,
        NEW.shade,
        NEW.arch_type,
        NEW.upper_appliance_number,
        NEW.lower_appliance_number,
        NEW.upper_nightguard_number,
        NEW.lower_nightguard_number,
        v_is_nightguard_needed,
        NEW.material,
        NEW.screw,
        NEW.implant_on_upper,
        NEW.implant_on_lower,
        NEW.tooth_library_upper,
        NEW.tooth_library_lower,
        NEW.notes_and_remarks,
        NEW.manufacturing_method,
        CASE
          WHEN NEW.manufacturing_method = 'printing' THEN 'pending-printing'
          WHEN NEW.manufacturing_method = 'milling' THEN 'pending-milling'
          ELSE 'pending-printing'
        END
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update existing manufacturing items with NULL patient_id
UPDATE manufacturing_items mi
SET patient_id = ls.patient_id
FROM lab_scripts ls
WHERE mi.lab_script_id = ls.id
AND mi.patient_id IS NULL
AND ls.patient_id IS NOT NULL;

-- Update existing manufacturing items with NULL or mismatched is_nightguard_needed
UPDATE manufacturing_items mi
SET is_nightguard_needed = ls.is_nightguard_needed
FROM lab_scripts ls
WHERE mi.lab_script_id = ls.id
AND ls.is_nightguard_needed IS NOT NULL
AND (mi.is_nightguard_needed IS NULL OR mi.is_nightguard_needed != ls.is_nightguard_needed);

