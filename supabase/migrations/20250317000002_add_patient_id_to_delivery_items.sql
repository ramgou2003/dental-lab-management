-- Add patient_id column to delivery_items table
-- This allows direct relationship between delivery items and patients
-- in addition to the existing lab_script_id relationship

-- Add the patient_id column
ALTER TABLE delivery_items
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_delivery_items_patient_id ON delivery_items(patient_id);

-- Add comment to document the new column
COMMENT ON COLUMN delivery_items.patient_id IS 'Direct reference to the patient (in addition to lab_script_id)';

-- Update existing delivery_items to populate patient_id from lab_scripts
UPDATE delivery_items di
SET patient_id = ls.patient_id
FROM lab_scripts ls
WHERE di.lab_script_id = ls.id
AND di.patient_id IS NULL;

-- Update the trigger function to include patient_id when creating delivery items
-- First, let's check if the trigger function exists and update it
CREATE OR REPLACE FUNCTION create_delivery_item_on_manufacturing_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_patient_id UUID;
BEGIN
  -- Trigger when manufacturing item is completed (status changes to 'completed')
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get patient_id from lab_scripts
    SELECT patient_id INTO v_patient_id
    FROM lab_scripts
    WHERE id = NEW.lab_script_id;

    INSERT INTO delivery_items (
      manufacturing_item_id,
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
      delivery_status
    ) VALUES (
      NEW.id,
      NEW.lab_report_card_id,
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
      'ready-to-insert'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to ensure it's active
DROP TRIGGER IF EXISTS trigger_create_delivery_item ON manufacturing_items;
CREATE TRIGGER trigger_create_delivery_item
  AFTER INSERT OR UPDATE ON manufacturing_items
  FOR EACH ROW
  EXECUTE FUNCTION create_delivery_item_on_manufacturing_completion();

