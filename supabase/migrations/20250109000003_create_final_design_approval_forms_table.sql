-- Create final_design_approval_forms table
CREATE TABLE final_design_approval_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES new_patient_leads(id) ON DELETE SET NULL,
  new_patient_packet_id UUID REFERENCES new_patient_packets(id) ON DELETE SET NULL,
  
  -- Patient Information
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  date_of_service DATE,
  
  -- Treatment Details
  treatment TEXT, -- "UPPER", "LOWER", "DUAL"
  material TEXT,
  shade_selected TEXT,
  
  -- Design Approval & Fee Agreement Acknowledgments (checkboxes)
  design_review_acknowledged BOOLEAN DEFAULT false,
  final_fabrication_approved BOOLEAN DEFAULT false,
  post_approval_changes_understood BOOLEAN DEFAULT false,
  warranty_reminder_understood BOOLEAN DEFAULT false,
  
  -- Signatures
  patient_full_name TEXT,
  patient_signature TEXT,
  patient_signature_date DATE,
  witness_name TEXT,
  witness_signature TEXT,
  witness_signature_date DATE,
  
  -- Office Use Only (checkboxes)
  design_added_to_chart BOOLEAN DEFAULT false,
  fee_agreement_scanned BOOLEAN DEFAULT false,
  
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
CREATE INDEX idx_final_design_approval_forms_patient_id ON final_design_approval_forms(patient_id);
CREATE INDEX idx_final_design_approval_forms_status ON final_design_approval_forms(status);
CREATE INDEX idx_final_design_approval_forms_created_at ON final_design_approval_forms(created_at);
CREATE INDEX idx_final_design_approval_forms_public_link_id ON final_design_approval_forms(public_link_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_final_design_approval_forms_updated_at()
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

CREATE TRIGGER trigger_update_final_design_approval_forms_updated_at
  BEFORE UPDATE ON final_design_approval_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_final_design_approval_forms_updated_at();

-- Enable RLS on final_design_approval_forms table
ALTER TABLE final_design_approval_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for final_design_approval_forms
CREATE POLICY "Users can view all final design approval forms" ON final_design_approval_forms
  FOR SELECT USING (true);

CREATE POLICY "Users can insert final design approval forms" ON final_design_approval_forms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update final design approval forms" ON final_design_approval_forms
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete final design approval forms" ON final_design_approval_forms
  FOR DELETE USING (true);

-- Add comments to document the final_design_approval_forms table
COMMENT ON TABLE final_design_approval_forms IS 'Stores final design approval forms with separate columns for all form fields';

-- Add column comments for key fields
COMMENT ON COLUMN final_design_approval_forms.patient_signature IS 'Base64 encoded patient signature image';
COMMENT ON COLUMN final_design_approval_forms.witness_signature IS 'Base64 encoded witness signature image';
COMMENT ON COLUMN final_design_approval_forms.status IS 'Current status: draft, submitted, signed, or void';
COMMENT ON COLUMN final_design_approval_forms.form_version IS 'Version of the final design approval form used';
COMMENT ON COLUMN final_design_approval_forms.form_data IS 'Backup JSONB field containing complete form data for flexibility';
