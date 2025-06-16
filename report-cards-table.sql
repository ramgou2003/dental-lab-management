-- Create report_cards table to track report card statuses
CREATE TABLE report_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_script_id UUID REFERENCES lab_scripts(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  lab_report_status TEXT DEFAULT 'pending' CHECK (lab_report_status IN ('pending', 'completed')),
  clinical_report_status TEXT DEFAULT 'pending' CHECK (clinical_report_status IN ('pending', 'completed')),
  lab_report_data JSONB,
  clinical_report_data JSONB,
  lab_report_completed_at TIMESTAMP WITH TIME ZONE,
  clinical_report_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_report_cards_lab_script_id ON report_cards(lab_script_id);
CREATE INDEX idx_report_cards_lab_report_status ON report_cards(lab_report_status);
CREATE INDEX idx_report_cards_clinical_report_status ON report_cards(clinical_report_status);
CREATE INDEX idx_report_cards_created_at ON report_cards(created_at);

-- Enable Row Level Security
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on report_cards" ON report_cards
FOR ALL USING (true);

-- Create trigger to automatically create report card entries when lab script is completed
CREATE OR REPLACE FUNCTION create_report_card_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if status changed to 'completed' and no report card exists yet
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Insert new report card entry
    INSERT INTO report_cards (lab_script_id, patient_name)
    VALUES (NEW.id, NEW.patient_name)
    ON CONFLICT (lab_script_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on lab_scripts table
CREATE TRIGGER trigger_create_report_card_on_completion
  AFTER UPDATE ON lab_scripts
  FOR EACH ROW
  EXECUTE FUNCTION create_report_card_on_completion();

-- Add unique constraint to prevent duplicate report cards for same lab script
ALTER TABLE report_cards ADD CONSTRAINT unique_lab_script_report_card UNIQUE (lab_script_id);

-- Insert report cards for existing completed lab scripts
INSERT INTO report_cards (lab_script_id, patient_name)
SELECT id, patient_name 
FROM lab_scripts 
WHERE status = 'completed'
ON CONFLICT (lab_script_id) DO NOTHING;
