-- Fix the delivery item creation trigger to prevent duplicate key violations
-- Add a check to see if a delivery item already exists before inserting

CREATE OR REPLACE FUNCTION create_delivery_item_on_manufacturing_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_patient_id UUID;
  v_existing_delivery_item_id UUID;
BEGIN
  -- Trigger when manufacturing item is completed (status changes to 'completed')
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Check if a delivery item already exists for this manufacturing item
    SELECT id INTO v_existing_delivery_item_id
    FROM delivery_items
    WHERE manufacturing_item_id = NEW.id;

    -- Only create a new delivery item if one doesn't already exist
    IF v_existing_delivery_item_id IS NULL THEN
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

