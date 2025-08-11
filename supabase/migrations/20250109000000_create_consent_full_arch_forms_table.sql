-- Create consent_full_arch_forms table with separate columns for all form fields
CREATE TABLE consent_full_arch_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES new_patient_leads(id) ON DELETE SET NULL,
  new_patient_packet_id UUID REFERENCES new_patient_packets(id) ON DELETE SET NULL,
  
  -- Section 1: Patient & Interpreter Information
  patient_name TEXT NOT NULL,
  chart_number TEXT,
  consent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  consent_time TIME,
  primary_language TEXT DEFAULT 'english',
  other_language_text TEXT,
  interpreter_required TEXT DEFAULT 'no' CHECK (interpreter_required IN ('yes', 'no')),
  interpreter_name TEXT,
  interpreter_credential TEXT,
  patient_info_initials TEXT,
  
  -- Section 2: Treatment Description & Alternatives
  arch_type TEXT CHECK (arch_type IN ('upper', 'lower', 'dual')),
  upper_jaw TEXT,
  upper_teeth_regions TEXT,
  upper_implants TEXT,
  upper_graft_allograft BOOLEAN DEFAULT false,
  upper_graft_xenograft BOOLEAN DEFAULT false,
  upper_graft_autograft BOOLEAN DEFAULT false,
  upper_prosthesis_zirconia BOOLEAN DEFAULT false,
  upper_prosthesis_overdenture BOOLEAN DEFAULT false,
  upper_same_day_load TEXT,
  lower_jaw TEXT,
  lower_teeth_regions TEXT,
  lower_implants TEXT,
  lower_graft_allograft BOOLEAN DEFAULT false,
  lower_graft_xenograft BOOLEAN DEFAULT false,
  lower_graft_autograft BOOLEAN DEFAULT false,
  lower_prosthesis_zirconia BOOLEAN DEFAULT false,
  lower_prosthesis_overdenture BOOLEAN DEFAULT false,
  lower_same_day_load TEXT,
  
  -- Sedation Plan
  sedation_local_only BOOLEAN DEFAULT false,
  sedation_nitrous BOOLEAN DEFAULT false,
  sedation_iv_conscious BOOLEAN DEFAULT false,
  sedation_general_hospital BOOLEAN DEFAULT false,
  asa_physical_status TEXT,
  
  -- Planned Drugs
  midazolam_dose TEXT,
  midazolam_unit TEXT DEFAULT 'mg',
  fentanyl_dose TEXT,
  fentanyl_unit TEXT DEFAULT 'µg',
  ketamine_dose TEXT,
  ketamine_unit TEXT DEFAULT 'mg',
  dexamethasone_dose TEXT,
  dexamethasone_unit TEXT DEFAULT 'mg',
  
  -- Alternatives Initials
  alternatives_no_treatment_initials TEXT,
  alternatives_conventional_dentures_initials TEXT,
  alternatives_segmented_extraction_initials TEXT,
  alternatives_removable_overdentures_initials TEXT,
  alternatives_zygomatic_implants_initials TEXT,
  treatment_description_initials TEXT,
  
  -- Section 3: Material Risks
  risks_understood BOOLEAN DEFAULT false,
  material_risks_initials TEXT,
  
  -- Section 4: Sedation & Anesthesia Consent
  escort_name TEXT,
  escort_phone TEXT,
  medications_disclosed BOOLEAN DEFAULT false,
  decline_iv_sedation BOOLEAN DEFAULT false,
  sedation_initials TEXT,
  anesthesia_provider_initials TEXT,
  
  -- Section 5: Financial Disclosure
  surgical_extractions_count TEXT,
  surgical_extractions_fee TEXT,
  surgical_extractions_covered TEXT,
  implant_fixtures_count TEXT,
  implant_fixtures_fee TEXT,
  implant_fixtures_covered TEXT,
  zirconia_bridge_fee TEXT,
  zirconia_bridge_covered TEXT,
  iv_sedation_fee TEXT,
  iv_sedation_covered TEXT,
  financial_initials TEXT,
  
  -- Section 6: Photo/Video Authorization
  internal_record_keeping TEXT,
  professional_education TEXT,
  marketing_social_media TEXT,
  hipaa_email_sms BOOLEAN DEFAULT false,
  hipaa_email TEXT,
  hipaa_phone TEXT,
  photo_video_initials TEXT,
  
  -- Section 7: Opioid Consent
  opioid_initials TEXT,
  smallest_opioid_supply BOOLEAN DEFAULT false,
  
  -- Section 8: Final Acknowledgment & Signatures
  surgeon_name TEXT,
  surgeon_signature TEXT, -- Base64 encoded signature
  surgeon_date DATE,
  anesthesia_provider_name TEXT,
  anesthesia_provider_signature TEXT, -- Base64 encoded signature
  anesthesia_provider_date DATE,
  patient_signature TEXT, -- Base64 encoded signature
  patient_signature_date DATE,
  witness_name TEXT,
  witness_signature TEXT, -- Base64 encoded signature
  witness_signature_date DATE,
  final_initials TEXT,
  
  -- Section 9: Patient Acknowledgment Checkboxes
  acknowledgment_read BOOLEAN DEFAULT false,
  acknowledgment_outcome BOOLEAN DEFAULT false,
  acknowledgment_authorize BOOLEAN DEFAULT false,
  
  -- Status and Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'signed', 'void')),
  form_version TEXT DEFAULT '1.0',
  
  -- Public Link Support
  public_link_id UUID,
  public_link_status TEXT DEFAULT 'not_sent' CHECK (public_link_status IN ('not_sent', 'sent', 'opened', 'completed', 'expired')),
  public_link_expires_at TIMESTAMP WITH TIME ZONE,
  is_public_submission BOOLEAN DEFAULT false,
  
  -- Audit Fields
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better query performance
CREATE INDEX idx_consent_full_arch_forms_patient_id ON consent_full_arch_forms(patient_id);
CREATE INDEX idx_consent_full_arch_forms_status ON consent_full_arch_forms(status);
CREATE INDEX idx_consent_full_arch_forms_created_at ON consent_full_arch_forms(created_at);
CREATE INDEX idx_consent_full_arch_forms_public_link_id ON consent_full_arch_forms(public_link_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_consent_full_arch_forms_updated_at()
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

CREATE TRIGGER trigger_update_consent_full_arch_forms_updated_at
  BEFORE UPDATE ON consent_full_arch_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_full_arch_forms_updated_at();

-- Enable RLS on consent_full_arch_forms table
ALTER TABLE consent_full_arch_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for consent_full_arch_forms
CREATE POLICY "Users can view all consent forms" ON consent_full_arch_forms
  FOR SELECT USING (true);

CREATE POLICY "Users can insert consent forms" ON consent_full_arch_forms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update consent forms" ON consent_full_arch_forms
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete consent forms" ON consent_full_arch_forms
  FOR DELETE USING (true);

-- Add comments to document the consent_full_arch_forms table
COMMENT ON TABLE consent_full_arch_forms IS 'Stores comprehensive consent packet data for full arch implant procedures with separate columns for all form fields';

-- Add column comments for key fields
COMMENT ON COLUMN consent_full_arch_forms.patient_signature IS 'Base64 encoded patient signature image';
COMMENT ON COLUMN consent_full_arch_forms.witness_signature IS 'Base64 encoded witness signature image';
COMMENT ON COLUMN consent_full_arch_forms.surgeon_signature IS 'Base64 encoded surgeon signature image';
COMMENT ON COLUMN consent_full_arch_forms.anesthesia_provider_signature IS 'Base64 encoded anesthesia provider signature image';
COMMENT ON COLUMN consent_full_arch_forms.status IS 'Current status: draft, submitted, signed, or void';
COMMENT ON COLUMN consent_full_arch_forms.arch_type IS 'Type of arch treatment: upper, lower, or dual';
COMMENT ON COLUMN consent_full_arch_forms.form_version IS 'Version of the consent form used';
