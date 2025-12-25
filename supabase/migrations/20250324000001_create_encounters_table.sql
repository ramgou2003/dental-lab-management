-- Create encounters table to store encounter form data for appointments
CREATE TABLE IF NOT EXISTS encounters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  
  -- Common fields for all encounter types
  bite_adjustment TEXT, -- 'yes', 'no', or ''
  follow_up_pictures_taken TEXT, -- 'yes', 'no', or ''
  data_collection TEXT, -- 'yes', 'no', or ''
  new_design_required TEXT, -- 'yes', 'no', or ''
  
  -- Smoking consent fields
  is_patient_smoker TEXT, -- 'yes', 'no', or ''
  smoker_disclaimer_acknowledged BOOLEAN DEFAULT false,
  smoker_consent_declined BOOLEAN DEFAULT false,
  smoker_signature_date DATE,
  smoker_signature TEXT,
  
  -- 7-day and 30-day follow-up specific fields
  how_is_the_bite TEXT, -- 'good', 'needs-adjustment', or ''
  speech_issue TEXT, -- 'yes', 'no', or ''
  intaglio_gap TEXT, -- 'yes', 'no', or ''
  functional_issue TEXT, -- 'yes', 'no', or ''
  
  -- 75-day follow-up staff checklist fields
  extra_intra_oral_pictures TEXT, -- 'yes', 'no', 'na', or ''
  facial_scan TEXT, -- 'yes', 'no', 'na', or ''
  post_surgery_jaw_records TEXT, -- 'yes', 'no', 'na', or ''
  tissue_scan TEXT, -- 'yes', 'no', 'na', or ''
  icam_required TEXT, -- 'yes', 'no', 'na', or ''
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_encounters_appointment_id ON encounters(appointment_id);
CREATE INDEX IF NOT EXISTS idx_encounters_patient_name ON encounters(patient_name);
CREATE INDEX IF NOT EXISTS idx_encounters_created_at ON encounters(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_encounters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_encounters_updated_at
  BEFORE UPDATE ON encounters
  FOR EACH ROW
  EXECUTE FUNCTION update_encounters_updated_at();

-- Enable RLS on encounters table
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for encounters
CREATE POLICY "Users can view all encounters" ON encounters
  FOR SELECT USING (true);

CREATE POLICY "Users can insert encounters" ON encounters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update encounters" ON encounters
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete encounters" ON encounters
  FOR DELETE USING (true);

-- Add comments to document the encounters table
COMMENT ON TABLE encounters IS 'Stores encounter form data for appointments including follow-up information, smoking consent, and staff checklists';
COMMENT ON COLUMN encounters.appointment_id IS 'Reference to the appointment this encounter is for';
COMMENT ON COLUMN encounters.patient_name IS 'Name of the patient for quick reference';
COMMENT ON COLUMN encounters.bite_adjustment IS 'Whether bite adjustment was performed (yes/no)';
COMMENT ON COLUMN encounters.follow_up_pictures_taken IS 'Whether follow-up pictures were taken (yes/no)';
COMMENT ON COLUMN encounters.data_collection IS 'Whether data collection was completed (yes/no)';
COMMENT ON COLUMN encounters.new_design_required IS 'Whether a new design is required (yes/no)';
COMMENT ON COLUMN encounters.is_patient_smoker IS 'Whether the patient is a smoker (yes/no)';
COMMENT ON COLUMN encounters.smoker_disclaimer_acknowledged IS 'Whether the patient acknowledged the smoking disclaimer';
COMMENT ON COLUMN encounters.smoker_consent_declined IS 'Whether the patient declined to sign the smoking consent';
COMMENT ON COLUMN encounters.smoker_signature_date IS 'Date when the patient signed the smoking consent';
COMMENT ON COLUMN encounters.smoker_signature IS 'Patient signature for smoking consent (base64 image)';
COMMENT ON COLUMN encounters.how_is_the_bite IS '7-day/30-day follow-up: How is the bite (good/needs-adjustment)';
COMMENT ON COLUMN encounters.speech_issue IS '7-day/30-day follow-up: Whether there are speech issues (yes/no)';
COMMENT ON COLUMN encounters.intaglio_gap IS '7-day/30-day follow-up: Whether there is an intaglio gap (yes/no)';
COMMENT ON COLUMN encounters.functional_issue IS '7-day/30-day follow-up: Whether there are functional issues (yes/no)';
COMMENT ON COLUMN encounters.extra_intra_oral_pictures IS '75-day follow-up: Extra and intra oral pictures collected (yes/no/na)';
COMMENT ON COLUMN encounters.facial_scan IS '75-day follow-up: Facial scan collected (yes/no/na)';
COMMENT ON COLUMN encounters.post_surgery_jaw_records IS '75-day follow-up: Post surgery jaw records collected (yes/no/na)';
COMMENT ON COLUMN encounters.tissue_scan IS '75-day follow-up: Tissue scan collected (yes/no/na)';
COMMENT ON COLUMN encounters.icam_required IS '75-day follow-up: ICAM collected if required (yes/no/na)';

