-- Create consultations table to store comprehensive consultation data
CREATE TABLE consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES new_patient_leads(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  new_patient_packet_id UUID REFERENCES new_patient_packets(id) ON DELETE SET NULL,
  
  -- Patient Information (for quick reference)
  patient_name TEXT NOT NULL,
  consultation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Section 1: Clinical Assessment (Diagnosis)
  clinical_assessment TEXT, -- Free text field for clinical assessment and diagnosis details
  
  -- Section 2: Treatment Recommendation (checkboxes)
  -- Treatment options as boolean fields
  treatment_implant_placement BOOLEAN DEFAULT false,
  treatment_implant_restoration BOOLEAN DEFAULT false,
  treatment_implant_supported BOOLEAN DEFAULT false,
  treatment_extraction BOOLEAN DEFAULT false,
  treatment_bon_graft BOOLEAN DEFAULT false,
  treatment_sinus_lift BOOLEAN DEFAULT false,
  treatment_denture BOOLEAN DEFAULT false,
  treatment_bridge BOOLEAN DEFAULT false,
  treatment_crown BOOLEAN DEFAULT false,
  
  -- Section 3: Additional Information (Consultation Notes)
  consultation_notes TEXT, -- Free text field for additional consultation notes
  
  -- Section 4: Treatment Decision
  treatment_decision TEXT CHECK (treatment_decision IN ('accepted', 'not_accepted', 'follow_up_required')),
  
  -- Section 5: Treatment Cost
  treatment_cost DECIMAL(10,2), -- Treatment Cost ($)
  global_treatment_value DECIMAL(10,2), -- Global Treatment Value ($)
  
  -- Section 6: Financing Options
  financing_approved BOOLEAN DEFAULT false,
  financing_not_approved BOOLEAN DEFAULT false,
  financing_did_not_apply BOOLEAN DEFAULT false,
  
  -- Section 7: Additional Notes
  additional_notes TEXT, -- Free text field for additional notes about consultation outcome
  
  -- Status and Progress
  consultation_status TEXT DEFAULT 'draft' CHECK (consultation_status IN ('draft', 'in_progress', 'completed', 'cancelled')),
  progress_step INTEGER DEFAULT 1 CHECK (progress_step IN (1, 2)), -- 1 = Treatment, 2 = Financial
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_lead_id ON consultations(lead_id);
CREATE INDEX idx_consultations_appointment_id ON consultations(appointment_id);
CREATE INDEX idx_consultations_consultation_date ON consultations(consultation_date);
CREATE INDEX idx_consultations_status ON consultations(consultation_status);
CREATE INDEX idx_consultations_treatment_decision ON consultations(treatment_decision);
CREATE INDEX idx_consultations_created_at ON consultations(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_consultations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_consultations_updated_at();

-- Enable RLS on consultations table
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for consultations
CREATE POLICY "Users can view all consultations" ON consultations
  FOR SELECT USING (true);

CREATE POLICY "Users can insert consultations" ON consultations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update consultations" ON consultations
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete consultations" ON consultations
  FOR DELETE USING (true);

-- Add comments to document the consultations table
COMMENT ON TABLE consultations IS 'Stores comprehensive consultation data including clinical assessment, treatment recommendations, financial decisions, and outcomes';

-- Add column comments
COMMENT ON COLUMN consultations.clinical_assessment IS 'Free text field for clinical assessment and diagnosis details';
COMMENT ON COLUMN consultations.consultation_notes IS 'Free text field for additional consultation notes and special considerations';
COMMENT ON COLUMN consultations.treatment_decision IS 'Patient decision on treatment: accepted, not_accepted, or follow_up_required';
COMMENT ON COLUMN consultations.treatment_cost IS 'Treatment cost in dollars';
COMMENT ON COLUMN consultations.global_treatment_value IS 'Total value including all treatment phases';
COMMENT ON COLUMN consultations.additional_notes IS 'Additional notes about consultation outcome, patient concerns, or next steps';
COMMENT ON COLUMN consultations.progress_step IS 'Current step in consultation process: 1=Treatment, 2=Financial';
COMMENT ON COLUMN consultations.consultation_status IS 'Overall status of the consultation process';
