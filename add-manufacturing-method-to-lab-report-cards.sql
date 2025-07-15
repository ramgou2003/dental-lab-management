-- Add manufacturing_method column to lab_report_cards table
-- This field stores the manufacturing method (milling or printing) for each lab report

-- Add the manufacturing_method column
ALTER TABLE lab_report_cards 
ADD COLUMN manufacturing_method TEXT CHECK (manufacturing_method IN ('milling', 'printing'));

-- Add comment to document the column
COMMENT ON COLUMN lab_report_cards.manufacturing_method IS 'Manufacturing method for the appliance: milling for direct load zirconia/PMMA/tie bar/superstructure, printing for other appliances';

-- Create index for better performance when filtering by manufacturing method
CREATE INDEX idx_lab_report_cards_manufacturing_method ON lab_report_cards(manufacturing_method);

-- Update existing records with default manufacturing method based on appliance types
-- Direct Load Zirconia, Direct Load PMMA, and Ti-Bar Superstructure should use milling
-- All other appliances should use printing
UPDATE lab_report_cards 
SET manufacturing_method = CASE 
  WHEN upper_appliance_type IN ('direct-load-zirconia', 'direct-load-pmma', 'ti-bar-superstructure') 
    OR lower_appliance_type IN ('direct-load-zirconia', 'direct-load-pmma', 'ti-bar-superstructure') 
  THEN 'milling'
  ELSE 'printing'
END
WHERE manufacturing_method IS NULL;

-- Update the trigger function to include manufacturing_method when auto-creating lab report cards
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
      shade,
      manufacturing_method,
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
      'A2', -- Default shade
      -- Auto-determine manufacturing method based on appliance types
      CASE 
        WHEN NEW.upper_appliance_type IN ('direct-load-zirconia', 'direct-load-pmma', 'ti-bar-superstructure') 
          OR NEW.lower_appliance_type IN ('direct-load-zirconia', 'direct-load-pmma', 'ti-bar-superstructure') 
        THEN 'milling'
        ELSE 'printing'
      END,
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
      CASE
        WHEN NEW.arch_type IN ('upper', 'dual') THEN 'U-' || LPAD(EXTRACT(epoch FROM NOW())::text, 6, '0')
        ELSE NULL
      END,
      CASE
        WHEN NEW.arch_type IN ('lower', 'dual') THEN 'L-' || LPAD(EXTRACT(epoch FROM NOW())::text, 6, '0')
        ELSE NULL
      END,
      'Lab report card automatically created upon completion. Please review and update all specifications as needed.',
      'completed'
    )
    ON CONFLICT (lab_script_id) DO NOTHING; -- Prevent duplicates if somehow one already exists
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'lab_report_cards' 
  AND column_name = 'manufacturing_method';
