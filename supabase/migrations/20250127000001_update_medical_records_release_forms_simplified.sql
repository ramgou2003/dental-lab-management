-- Migration to update medical_records_release_forms table to simplified structure
-- This migration drops the existing table and recreates it with the new simplified fields

-- Drop the existing table and its dependencies
DROP TABLE IF EXISTS medical_records_release_forms CASCADE;

-- Create the new simplified medical_records_release_forms table
CREATE TABLE medical_records_release_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES new_patient_leads(id) ON DELETE SET NULL,
  new_patient_packet_id UUID REFERENCES new_patient_packets(id) ON DELETE SET NULL,
  
  -- Patient Information (simplified)
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  
  -- Patient Name (computed from first_name and last_name)
  patient_name TEXT,
  
  -- Date and Time with EST sync
  signature_date DATE,
  signature_time TIME,

  -- Agreement and Signatures
  has_agreed BOOLEAN DEFAULT false,
  patient_signature TEXT,
  
  -- Status and Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'signed', 'void')),
  form_version TEXT DEFAULT '2.0',
  
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
CREATE INDEX idx_medical_records_release_forms_lead_id ON medical_records_release_forms(lead_id);
CREATE INDEX idx_medical_records_release_forms_new_patient_packet_id ON medical_records_release_forms(new_patient_packet_id);
CREATE INDEX idx_medical_records_release_forms_status ON medical_records_release_forms(status);
CREATE INDEX idx_medical_records_release_forms_created_at ON medical_records_release_forms(created_at);
CREATE INDEX idx_medical_records_release_forms_signature_date ON medical_records_release_forms(signature_date);
CREATE INDEX idx_medical_records_release_forms_public_link_id ON medical_records_release_forms(public_link_id);
CREATE INDEX idx_medical_records_release_forms_public_link_status ON medical_records_release_forms(public_link_status);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_medical_records_release_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Auto-update completed_at when status changes to completed/signed
  IF NEW.status IN ('submitted', 'signed') AND (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    NEW.completed_at = NOW();
  END IF;
  
  -- Auto-update signed_at when status changes to signed
  IF NEW.status = 'signed' AND (OLD.status IS NULL OR OLD.status != 'signed') THEN
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
COMMENT ON TABLE medical_records_release_forms IS 'Stores simplified medical records release authorization forms';

-- Add column comments for key fields
COMMENT ON COLUMN medical_records_release_forms.patient_signature IS 'Base64 encoded patient signature image';
COMMENT ON COLUMN medical_records_release_forms.status IS 'Current status: draft, submitted, signed, or void';
COMMENT ON COLUMN medical_records_release_forms.form_version IS 'Version of the medical records release form used (2.0 for simplified version)';
COMMENT ON COLUMN medical_records_release_forms.form_data IS 'Backup JSONB field containing complete form data for flexibility';
COMMENT ON COLUMN medical_records_release_forms.signature_date IS 'Date when the form was signed (EST timezone)';
COMMENT ON COLUMN medical_records_release_forms.signature_time IS 'Time when the form was signed (EST timezone)';
COMMENT ON COLUMN medical_records_release_forms.first_name IS 'Patient first name';
COMMENT ON COLUMN medical_records_release_forms.last_name IS 'Patient last name';
COMMENT ON COLUMN medical_records_release_forms.patient_name IS 'Full patient name (computed from first_name and last_name)';
COMMENT ON COLUMN medical_records_release_forms.has_agreed IS 'Whether patient has agreed to all terms above';
