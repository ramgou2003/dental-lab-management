-- Create medical_records_release_forms table
CREATE TABLE medical_records_release_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES new_patient_leads(id) ON DELETE SET NULL,
  new_patient_packet_id UUID REFERENCES new_patient_packets(id) ON DELETE SET NULL,
  
  -- Patient Information
  patient_name TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  
  -- Release Information
  date_of_request DATE,
  records_from_date DATE,
  records_to_date DATE,
  
  -- Records to Release (checkboxes)
  complete_record BOOLEAN DEFAULT false,
  xrays BOOLEAN DEFAULT false,
  lab_results BOOLEAN DEFAULT false,
  consultation_notes BOOLEAN DEFAULT false,
  treatment_plans BOOLEAN DEFAULT false,
  surgical_reports BOOLEAN DEFAULT false,
  prescriptions BOOLEAN DEFAULT false,
  photographs BOOLEAN DEFAULT false,
  models BOOLEAN DEFAULT false,
  other_records BOOLEAN DEFAULT false,
  other_records_description TEXT,
  
  -- Release To Information
  release_to_name TEXT,
  release_to_title TEXT,
  release_to_organization TEXT,
  release_to_address TEXT,
  release_to_city TEXT,
  release_to_state TEXT,
  release_to_zip_code TEXT,
  release_to_phone TEXT,
  release_to_fax TEXT,
  
  -- Purpose of Release
  purpose_of_release TEXT,
  
  -- Authorization Details
  authorization_expiration DATE,
  right_to_revoke BOOLEAN DEFAULT true,
  copy_to_patient BOOLEAN DEFAULT false,
  
  -- Signatures
  patient_signature TEXT,
  patient_signature_date DATE,
  witness_signature TEXT,
  witness_signature_date DATE,
  witness_name TEXT,
  
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
CREATE INDEX idx_medical_records_release_forms_patient_id ON medical_records_release_forms(patient_id);
CREATE INDEX idx_medical_records_release_forms_status ON medical_records_release_forms(status);
CREATE INDEX idx_medical_records_release_forms_created_at ON medical_records_release_forms(created_at);
CREATE INDEX idx_medical_records_release_forms_public_link_id ON medical_records_release_forms(public_link_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_medical_records_release_forms_updated_at()
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

CREATE TRIGGER trigger_update_medical_records_release_forms_updated_at
  BEFORE UPDATE ON medical_records_release_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_records_release_forms_updated_at();

-- Enable RLS on medical_records_release_forms table
ALTER TABLE medical_records_release_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for medical_records_release_forms
CREATE POLICY "Users can view all medical records release forms" ON medical_records_release_forms
  FOR SELECT USING (true);

CREATE POLICY "Users can insert medical records release forms" ON medical_records_release_forms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update medical records release forms" ON medical_records_release_forms
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete medical records release forms" ON medical_records_release_forms
  FOR DELETE USING (true);

-- Add comments to document the medical_records_release_forms table
COMMENT ON TABLE medical_records_release_forms IS 'Stores medical records release authorization forms with separate columns for all form fields';

-- Add column comments for key fields
COMMENT ON COLUMN medical_records_release_forms.patient_signature IS 'Base64 encoded patient signature image';
COMMENT ON COLUMN medical_records_release_forms.witness_signature IS 'Base64 encoded witness signature image';
COMMENT ON COLUMN medical_records_release_forms.status IS 'Current status: draft, submitted, signed, or void';
COMMENT ON COLUMN medical_records_release_forms.form_version IS 'Version of the medical records release form used';
COMMENT ON COLUMN medical_records_release_forms.form_data IS 'Backup JSONB field containing complete form data for flexibility';
