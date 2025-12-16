-- Add patient_id column to manufacturing_items table
-- This allows direct relationship between manufacturing items and patients
-- in addition to the existing lab_script_id relationship

-- Add the patient_id column
ALTER TABLE manufacturing_items
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_manufacturing_items_patient_id ON manufacturing_items(patient_id);

-- Add comment to document the new column
COMMENT ON COLUMN manufacturing_items.patient_id IS 'Direct reference to the patient (in addition to lab_script_id)';

-- Update existing manufacturing_items to populate patient_id from lab_scripts
UPDATE manufacturing_items mi
SET patient_id = ls.patient_id
FROM lab_scripts ls
WHERE mi.lab_script_id = ls.id
AND mi.patient_id IS NULL;

-- Update the trigger function to include patient_id when creating manufacturing items
CREATE OR REPLACE FUNCTION create_manufacturing_item_on_lab_report_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_is_nightguard_needed TEXT;
  v_patient_id UUID;
BEGIN
  -- Only create manufacturing item if status is 'completed'
  IF NEW.status = 'completed' THEN
    -- Get is_nightguard_needed and patient_id from lab_scripts
    SELECT is_nightguard_needed, patient_id 
    INTO v_is_nightguard_needed, v_patient_id
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
      screw,
      material,
      arch_type,
      upper_appliance_number,
      lower_appliance_number,
      upper_nightguard_number,
      lower_nightguard_number,
      is_nightguard_needed,
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
      NEW.screw,
      NEW.material,
      NEW.arch_type,
      NEW.upper_appliance_number,
      NEW.lower_appliance_number,
      NEW.upper_nightguard_number,
      NEW.lower_nightguard_number,
      v_is_nightguard_needed,
      NEW.manufacturing_method,
      CASE
        WHEN NEW.manufacturing_method = 'milling' THEN 'pending-milling'
        ELSE 'pending-printing'
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify the trigger is still active
DROP TRIGGER IF EXISTS trigger_create_manufacturing_item ON lab_report_cards;
CREATE TRIGGER trigger_create_manufacturing_item
  AFTER INSERT ON lab_report_cards
  FOR EACH ROW
  EXECUTE FUNCTION create_manufacturing_item_on_lab_report_completion();

