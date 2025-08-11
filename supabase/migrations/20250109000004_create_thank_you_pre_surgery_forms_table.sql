-- Create thank_you_pre_surgery_forms table
CREATE TABLE thank_you_pre_surgery_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES new_patient_leads(id) ON DELETE SET NULL,
  new_patient_packet_id UUID REFERENCES new_patient_packets(id) ON DELETE SET NULL,
  
  -- Patient Information
  patient_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  email TEXT,
  treatment_type TEXT,
  form_date DATE,
  
  -- Medical Screening (checkboxes)
  heart_conditions BOOLEAN DEFAULT false,
  blood_thinners BOOLEAN DEFAULT false,
  diabetes BOOLEAN DEFAULT false,
  high_blood_pressure BOOLEAN DEFAULT false,
  allergies BOOLEAN DEFAULT false,
  pregnancy_nursing BOOLEAN DEFAULT false,
  recent_illness BOOLEAN DEFAULT false,
  medication_changes BOOLEAN DEFAULT false,
  
  -- Timeline Acknowledgments - 3 Days Before (checkboxes)
  start_medrol BOOLEAN DEFAULT false,
  start_amoxicillin BOOLEAN DEFAULT false,
  no_alcohol_3days BOOLEAN DEFAULT false,
  arrange_ride BOOLEAN DEFAULT false,
  
  -- Timeline Acknowledgments - Night Before (checkboxes)
  take_diazepam BOOLEAN DEFAULT false,
  no_food_after_midnight BOOLEAN DEFAULT false,
  no_water_after_6am BOOLEAN DEFAULT false,
  confirm_ride BOOLEAN DEFAULT false,
  
  -- Timeline Acknowledgments - Morning Of (checkboxes)
  no_breakfast BOOLEAN DEFAULT false,
  no_pills BOOLEAN DEFAULT false,
  wear_comfortable BOOLEAN DEFAULT false,
  arrive_on_time BOOLEAN DEFAULT false,
  
  -- Timeline Acknowledgments - After Surgery (checkboxes)
  no_alcohol_24hrs BOOLEAN DEFAULT false,
  no_driving_24hrs BOOLEAN DEFAULT false,
  follow_instructions BOOLEAN DEFAULT false,
  call_if_concerns BOOLEAN DEFAULT false,
  
  -- Patient Acknowledgments (checkboxes)
  read_instructions BOOLEAN DEFAULT false,
  understand_medications BOOLEAN DEFAULT false,
  understand_sedation BOOLEAN DEFAULT false,
  arranged_transport BOOLEAN DEFAULT false,
  understand_restrictions BOOLEAN DEFAULT false,
  will_follow_instructions BOOLEAN DEFAULT false,
  understand_emergency BOOLEAN DEFAULT false,
  
  -- Signatures
  patient_signature TEXT,
  signature_date DATE,
  patient_print_name TEXT,
  
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
CREATE INDEX idx_thank_you_pre_surgery_forms_patient_id ON thank_you_pre_surgery_forms(patient_id);
CREATE INDEX idx_thank_you_pre_surgery_forms_status ON thank_you_pre_surgery_forms(status);
CREATE INDEX idx_thank_you_pre_surgery_forms_created_at ON thank_you_pre_surgery_forms(created_at);
CREATE INDEX idx_thank_you_pre_surgery_forms_public_link_id ON thank_you_pre_surgery_forms(public_link_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_thank_you_pre_surgery_forms_updated_at()
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

CREATE TRIGGER trigger_update_thank_you_pre_surgery_forms_updated_at
  BEFORE UPDATE ON thank_you_pre_surgery_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_thank_you_pre_surgery_forms_updated_at();

-- Enable RLS on thank_you_pre_surgery_forms table
ALTER TABLE thank_you_pre_surgery_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for thank_you_pre_surgery_forms
CREATE POLICY "Users can view all thank you pre surgery forms" ON thank_you_pre_surgery_forms
  FOR SELECT USING (true);

CREATE POLICY "Users can insert thank you pre surgery forms" ON thank_you_pre_surgery_forms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update thank you pre surgery forms" ON thank_you_pre_surgery_forms
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete thank you pre surgery forms" ON thank_you_pre_surgery_forms
  FOR DELETE USING (true);

-- Add comments to document the thank_you_pre_surgery_forms table
COMMENT ON TABLE thank_you_pre_surgery_forms IS 'Stores thank you and pre-surgery instruction forms with separate columns for all form fields';

-- Add column comments for key fields
COMMENT ON COLUMN thank_you_pre_surgery_forms.patient_signature IS 'Base64 encoded patient signature image';
COMMENT ON COLUMN thank_you_pre_surgery_forms.status IS 'Current status: draft, submitted, signed, or void';
COMMENT ON COLUMN thank_you_pre_surgery_forms.form_version IS 'Version of the thank you pre-surgery form used';
COMMENT ON COLUMN thank_you_pre_surgery_forms.form_data IS 'Backup JSONB field containing complete form data for flexibility';
