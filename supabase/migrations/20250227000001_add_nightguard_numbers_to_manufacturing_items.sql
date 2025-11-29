-- Add nightguard number columns to manufacturing_items table
-- This migration adds upper_nightguard_number, lower_nightguard_number, and is_nightguard_needed fields
-- to match the lab_report_cards and lab_scripts table structure

-- Add the nightguard columns to the manufacturing_items table
ALTER TABLE manufacturing_items
ADD COLUMN IF NOT EXISTS upper_nightguard_number TEXT,
ADD COLUMN IF NOT EXISTS lower_nightguard_number TEXT,
ADD COLUMN IF NOT EXISTS is_nightguard_needed TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN manufacturing_items.upper_nightguard_number IS 'Nightguard number for upper arch (copied from lab_report_cards)';
COMMENT ON COLUMN manufacturing_items.lower_nightguard_number IS 'Nightguard number for lower arch (copied from lab_report_cards)';
COMMENT ON COLUMN manufacturing_items.is_nightguard_needed IS 'Whether nightguard is needed (copied from lab_scripts)';

-- Update the trigger function to include nightguard numbers when creating manufacturing items
CREATE OR REPLACE FUNCTION create_manufacturing_item_on_lab_report_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_is_nightguard_needed TEXT;
BEGIN
  -- Only create manufacturing item if status is 'completed'
  IF NEW.status = 'completed' THEN
    -- Get is_nightguard_needed from lab_scripts
    SELECT is_nightguard_needed INTO v_is_nightguard_needed
    FROM lab_scripts
    WHERE id = NEW.lab_script_id;

    INSERT INTO manufacturing_items (
      lab_report_card_id,
      lab_script_id,
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

