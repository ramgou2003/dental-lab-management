-- Create new_patient_packets table to store comprehensive patient packet data
CREATE TABLE new_patient_packets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Metadata
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES new_patient_leads(id) ON DELETE SET NULL,
  submission_source TEXT NOT NULL CHECK (submission_source IN ('public_link', 'patient_profile')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
  
  -- Section 1: Patient Identification & Contacts
  first_name TEXT,
  last_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'prefer-not-to-answer')),
  date_of_birth DATE,
  height TEXT,
  weight TEXT,
  bmi DECIMAL(5,2),
  
  -- Address
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  
  -- Phone numbers
  phone_cell TEXT,
  phone_work TEXT,
  
  -- Contact info
  email TEXT,
  
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  
  -- Primary care physician
  has_pcp BOOLEAN DEFAULT false,
  pcp_name TEXT,
  pcp_practice TEXT,
  pcp_phone TEXT,
  
  -- Section 2: Complete Medical History
  -- Critical conditions
  critical_acid_reflux BOOLEAN DEFAULT false,
  critical_cancer_has BOOLEAN DEFAULT false,
  critical_cancer_type TEXT,
  critical_depression_anxiety BOOLEAN DEFAULT false,
  critical_diabetes_has BOOLEAN DEFAULT false,
  critical_diabetes_type TEXT CHECK (critical_diabetes_type IN ('1', '2')),
  critical_heart_disease BOOLEAN DEFAULT false,
  critical_periodontal_disease BOOLEAN DEFAULT false,
  critical_substance_abuse BOOLEAN DEFAULT false,
  critical_high_blood_pressure BOOLEAN DEFAULT false,
  critical_other TEXT,
  critical_none BOOLEAN DEFAULT false,
  
  -- System specific conditions (stored as JSON arrays)
  respiratory_conditions JSONB DEFAULT '[]',
  cardiovascular_conditions JSONB DEFAULT '[]',
  gastrointestinal_conditions JSONB DEFAULT '[]',
  neurological_conditions JSONB DEFAULT '[]',
  endocrine_renal_conditions JSONB DEFAULT '[]',
  
  -- Additional conditions
  additional_conditions JSONB DEFAULT '[]',
  
  -- Recent health changes
  recent_health_changes_has BOOLEAN DEFAULT false,
  recent_health_changes_description TEXT,
  
  -- Section 3: Allergies & Medications
  -- Allergies
  allergies_dental_related JSONB DEFAULT '[]',
  allergies_medications JSONB DEFAULT '[]',
  allergies_other JSONB DEFAULT '[]',
  allergies_food TEXT,
  allergies_none BOOLEAN DEFAULT false,
  
  -- Current medications
  medications_emergency JSONB DEFAULT '[]',
  medications_bone_osteoporosis JSONB DEFAULT '[]',
  medications_specialized JSONB DEFAULT '[]',
  medications_complete TEXT,
  medications_none BOOLEAN DEFAULT false,
  
  -- Current pharmacy
  pharmacy_name TEXT,
  pharmacy_city TEXT,
  
  -- Section 4: Current Oral Health Status
  dental_status_upper_jaw TEXT CHECK (dental_status_upper_jaw IN ('all-teeth', 'some-missing', 'no-teeth')),
  dental_status_lower_jaw TEXT CHECK (dental_status_lower_jaw IN ('all-teeth', 'some-missing', 'no-teeth')),
  
  -- Previous solutions
  previous_solutions JSONB DEFAULT '[]',
  
  -- Current symptoms
  symptoms_facial_oral_pain BOOLEAN DEFAULT false,
  symptoms_jaw_pain_opening BOOLEAN DEFAULT false,
  symptoms_jaw_clicking BOOLEAN DEFAULT false,
  symptoms_digestive_problems BOOLEAN DEFAULT false,
  symptoms_duration TEXT,
  
  -- Healing issues
  healing_bleeding_bruising BOOLEAN DEFAULT false,
  healing_delayed_healing BOOLEAN DEFAULT false,
  healing_recurrent_infections BOOLEAN DEFAULT false,
  healing_none BOOLEAN DEFAULT false,
  
  -- Section 5: Lifestyle Factors
  -- Pregnancy
  pregnancy_status TEXT CHECK (pregnancy_status IN ('pregnant', 'nursing', 'not-applicable')),
  pregnancy_weeks INTEGER,
  
  -- Tobacco use
  tobacco_type TEXT CHECK (tobacco_type IN ('none', 'few-cigarettes', 'half-pack', 'one-pack', 'more-than-pack', 'vaping', 'recreational-marijuana', 'medicinal-marijuana')),
  tobacco_duration TEXT CHECK (tobacco_duration IN ('less-than-1', '1-year', '2-years', '3-years', '4-years', '5-years', '5-plus-years')),
  
  -- Alcohol consumption
  alcohol_frequency TEXT CHECK (alcohol_frequency IN ('none', 'casual', 'regular', 'heavy')),
  alcohol_duration TEXT CHECK (alcohol_duration IN ('less-than-1', '1-year', '2-years', '3-years', '4-years', '5-years', '5-plus-years')),
  
  -- Section 6: Patient Comfort Preferences
  anxiety_control JSONB DEFAULT '[]',
  pain_injection JSONB DEFAULT '[]',
  communication JSONB DEFAULT '[]',
  sensory_sensitivities JSONB DEFAULT '[]',
  physical_comfort JSONB DEFAULT '[]',
  service_preferences JSONB DEFAULT '[]',
  other_concerns TEXT,
  
  -- Section 7: Office Policies
  ack_treatment_based_on_health BOOLEAN DEFAULT false,
  ack_financial_responsibility BOOLEAN DEFAULT false,
  ack_insurance_courtesy BOOLEAN DEFAULT false,
  ack_punctuality_importance BOOLEAN DEFAULT false,
  ack_late_fee_policy BOOLEAN DEFAULT false,
  ack_deposit_requirement BOOLEAN DEFAULT false,
  ack_emergency_definition BOOLEAN DEFAULT false,
  ack_emergency_procedure BOOLEAN DEFAULT false,
  wants_financial_info BOOLEAN DEFAULT false,
  
  -- Section 8: Legal Documentation
  photo_video_auth TEXT CHECK (photo_video_auth IN ('agree', 'disagree')),
  hipaa_received_notice BOOLEAN DEFAULT false,
  hipaa_understands_rights BOOLEAN DEFAULT false,
  
  -- Section 9: Signatures
  attestation_reviewed_all BOOLEAN DEFAULT false,
  attestation_no_omissions BOOLEAN DEFAULT false,
  attestation_will_notify_changes BOOLEAN DEFAULT false,
  attestation_information_accurate BOOLEAN DEFAULT false,
  patient_name_signature TEXT,
  signature_data TEXT, -- Base64 encoded signature image
  signature_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_new_patient_packets_patient_id ON new_patient_packets(patient_id);
CREATE INDEX idx_new_patient_packets_lead_id ON new_patient_packets(lead_id);
CREATE INDEX idx_new_patient_packets_status ON new_patient_packets(status);
CREATE INDEX idx_new_patient_packets_submission_source ON new_patient_packets(submission_source);
CREATE INDEX idx_new_patient_packets_created_at ON new_patient_packets(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_new_patient_packets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_new_patient_packets_updated_at
  BEFORE UPDATE ON new_patient_packets
  FOR EACH ROW
  EXECUTE FUNCTION update_new_patient_packets_updated_at();

-- Add RLS policies
ALTER TABLE new_patient_packets ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all packets
CREATE POLICY "Authenticated users can read new patient packets" ON new_patient_packets
  FOR SELECT TO authenticated USING (true);

-- Policy for authenticated users to insert packets
CREATE POLICY "Authenticated users can insert new patient packets" ON new_patient_packets
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policy for authenticated users to update packets
CREATE POLICY "Authenticated users can update new patient packets" ON new_patient_packets
  FOR UPDATE TO authenticated USING (true);

-- Policy for authenticated users to delete packets
CREATE POLICY "Authenticated users can delete new patient packets" ON new_patient_packets
  FOR DELETE TO authenticated USING (true);

-- Add comments for documentation
COMMENT ON TABLE new_patient_packets IS 'Stores comprehensive new patient packet data including all form sections and signatures';
COMMENT ON COLUMN new_patient_packets.submission_source IS 'Indicates whether the packet was submitted via public link or patient profile';
COMMENT ON COLUMN new_patient_packets.signature_data IS 'Base64 encoded signature image data';
COMMENT ON COLUMN new_patient_packets.status IS 'Current status of the packet: draft, completed, or reviewed';
