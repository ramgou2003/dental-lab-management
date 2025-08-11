-- Create informed_consent_smoking_forms table
CREATE TABLE informed_consent_smoking_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES new_patient_leads(id) ON DELETE SET NULL,
  new_patient_packet_id UUID REFERENCES new_patient_packets(id) ON DELETE SET NULL,
  
  -- Patient Information
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  nicotine_use TEXT,
  
  -- Patient Understanding and Agreement (checkboxes)
  understands_nicotine_effects BOOLEAN DEFAULT false,
  understands_risks BOOLEAN DEFAULT false,
  understands_timeline BOOLEAN DEFAULT false,
  understands_insurance BOOLEAN DEFAULT false,
  offered_resources BOOLEAN DEFAULT false,
  takes_responsibility BOOLEAN DEFAULT false,
  
  -- Signatures
  patient_signature TEXT,
  signature_date DATE,
  
  -- Staff Use
  signed_consent TEXT,
  refusal_reason TEXT,
  
  -- Status and Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'signed', 'void')),
  form_version TEXT DEFAULT '1.0',
  
  -- Timestamps and User Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Public Link Support
  public_link_id UUID UNIQUE,
  public_link_status TEXT DEFAULT 'inactive' CHECK (public_link_status IN ('active', 'inactive', 'expired')),
  public_link_expires_at TIMESTAMP WITH TIME ZONE,
  is_public_submission BOOLEAN DEFAULT false,
  
  -- Backup JSONB field for flexibility
  form_data JSONB
);

-- Add indexes for better query performance
CREATE INDEX idx_informed_consent_smoking_forms_patient_id ON informed_consent_smoking_forms(patient_id);
CREATE INDEX idx_informed_consent_smoking_forms_status ON informed_consent_smoking_forms(status);
CREATE INDEX idx_informed_consent_smoking_forms_created_at ON informed_consent_smoking_forms(created_at);
CREATE INDEX idx_informed_consent_smoking_forms_public_link_id ON informed_consent_smoking_forms(public_link_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_informed_consent_smoking_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Auto-update completed_at when status changes to completed/signed
  IF NEW.status IN ('submitted', 'signed') AND OLD.status != NEW.status THEN
    NEW.completed_at = NOW();
  END IF;

  -- Auto-update signed_at when status changes to signed
  IF NEW.status = 'signed' AND OLD.status != 'signed' THEN
    NEW.signed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_informed_consent_smoking_forms_updated_at
  BEFORE UPDATE ON informed_consent_smoking_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_informed_consent_smoking_forms_updated_at();

-- Enable RLS on informed_consent_smoking_forms table
ALTER TABLE informed_consent_smoking_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for informed_consent_smoking_forms
CREATE POLICY "Users can view all informed consent smoking forms" ON informed_consent_smoking_forms
  FOR SELECT USING (true);

CREATE POLICY "Users can insert informed consent smoking forms" ON informed_consent_smoking_forms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update informed consent smoking forms" ON informed_consent_smoking_forms
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete informed consent smoking forms" ON informed_consent_smoking_forms
  FOR DELETE USING (true);

-- Add comments to document the informed_consent_smoking_forms table
COMMENT ON TABLE informed_consent_smoking_forms IS 'Stores informed consent for nicotine use and surgery forms with separate columns for all form fields';

-- Add column comments for key fields
COMMENT ON COLUMN informed_consent_smoking_forms.patient_signature IS 'Base64 encoded patient signature image';
COMMENT ON COLUMN informed_consent_smoking_forms.status IS 'Current status: draft, submitted, signed, or void';
COMMENT ON COLUMN informed_consent_smoking_forms.form_version IS 'Version of the informed consent smoking form used';
COMMENT ON COLUMN informed_consent_smoking_forms.form_data IS 'Backup JSONB field containing complete form data for flexibility';
