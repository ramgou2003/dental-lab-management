-- Create lab_report_cards table to store Lab Report Card form data
CREATE TABLE lab_report_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_script_id UUID REFERENCES lab_scripts(id) ON DELETE CASCADE,
  
  -- Patient Information (synced from lab script)
  patient_name TEXT NOT NULL,
  arch_type TEXT NOT NULL,
  upper_appliance_type TEXT,
  lower_appliance_type TEXT,
  
  -- Lab Specifications (required fields)
  screw TEXT NOT NULL,
  shade TEXT NOT NULL,
  
  -- Implant Libraries (conditional based on arch type)
  implant_on_upper TEXT,
  implant_on_lower TEXT,
  
  -- Tooth Libraries (conditional based on arch type)
  tooth_library_upper TEXT,
  tooth_library_lower TEXT,
  
  -- Appliance Numbers (conditional based on arch type)
  upper_appliance_number TEXT,
  lower_appliance_number TEXT,
  
  -- Notes and Remarks (required)
  notes_and_remarks TEXT NOT NULL,
  
  -- Status and timestamps
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'submitted')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_lab_report_cards_lab_script_id ON lab_report_cards(lab_script_id);
CREATE INDEX idx_lab_report_cards_patient_name ON lab_report_cards(patient_name);
CREATE INDEX idx_lab_report_cards_status ON lab_report_cards(status);
CREATE INDEX idx_lab_report_cards_submitted_at ON lab_report_cards(submitted_at);
CREATE INDEX idx_lab_report_cards_created_at ON lab_report_cards(created_at);

-- Enable Row Level Security
ALTER TABLE lab_report_cards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on lab_report_cards" ON lab_report_cards
FOR ALL USING (true);

-- Add unique constraint to prevent duplicate lab reports for same lab script
ALTER TABLE lab_report_cards ADD CONSTRAINT unique_lab_script_lab_report UNIQUE (lab_script_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lab_report_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lab_report_cards_updated_at
  BEFORE UPDATE ON lab_report_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_report_cards_updated_at();

-- Create trigger function to automatically create lab report card when lab script is completed
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

-- Create trigger on lab_scripts table
CREATE TRIGGER trigger_create_lab_report_card_on_completion
  AFTER UPDATE ON lab_scripts
  FOR EACH ROW
  EXECUTE FUNCTION create_lab_report_card_on_completion();
