-- IV Sedation Forms Table
-- This table stores all IV sedation form data for patients

CREATE TABLE IF NOT EXISTS iv_sedation_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  patient_name TEXT NOT NULL,
  sedation_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  
  -- Step 1: Patient Information & Treatment Selection
  upper_treatment TEXT,
  lower_treatment TEXT,
  upper_surgery_type TEXT,
  lower_surgery_type TEXT,
  height_feet INTEGER,
  height_inches INTEGER,
  weight INTEGER,
  
  -- Step 2: Pre-Assessment
  npo_status TEXT,
  morning_medications TEXT,
  allergies TEXT[], -- Array of allergy strings
  allergies_other TEXT,
  pregnancy_risk TEXT,
  last_menstrual_cycle DATE NULL, -- Optional field for female patients only
  anesthesia_history TEXT,
  anesthesia_history_other TEXT,
  respiratory_problems TEXT[], -- Array of respiratory problem strings
  respiratory_problems_other TEXT,
  cardiovascular_problems TEXT[], -- Array of cardiovascular problem strings
  cardiovascular_problems_other TEXT,
  gastrointestinal_problems TEXT[], -- Array of gastrointestinal problem strings
  gastrointestinal_problems_other TEXT,
  neurologic_problems TEXT[], -- Array of neurologic problem strings
  neurologic_problems_other TEXT,
  endocrine_renal_problems TEXT[], -- Array of endocrine/renal problem strings
  endocrine_renal_problems_other TEXT,
  last_a1c_level TEXT,
  miscellaneous TEXT[], -- Array of miscellaneous condition strings
  miscellaneous_other TEXT,
  social_history TEXT[], -- Array of social history strings
  social_history_other TEXT,
  well_developed_nourished TEXT,
  patient_anxious TEXT,
  asa_classification TEXT,
  airway_evaluation TEXT[], -- Array of airway evaluation strings
  airway_evaluation_other TEXT,
  mallampati_score TEXT,
  heart_lung_evaluation TEXT[], -- Array of heart/lung evaluation strings
  heart_lung_evaluation_other TEXT,
  
  -- Step 3: Sedation Plan
  instruments_checklist JSONB, -- Object with instrument keys and boolean values
  sedation_type TEXT,
  medications_planned TEXT[], -- Array of planned medication strings
  medications_other TEXT,
  administration_route TEXT[], -- Array of administration route strings
  emergency_protocols JSONB, -- Object with protocol keys and boolean values
  level_of_sedation TEXT,
  
  -- Step 4: Monitoring & Time Tracking
  time_in_room TIME,
  sedation_start_time TIME,
  monitoring_log JSONB, -- Array of monitoring entries with timestamps and vital signs
  sedation_end_time TIME,
  out_of_room_time TIME,
  
  -- Step 5: Post-Procedure & Discharge
  post_procedure_notes TEXT,
  discharge_criteria_met JSONB, -- Object with criteria keys and boolean values
  follow_up_instructions TEXT,
  follow_up_instructions_given_to TEXT,
  discharged_to TEXT,
  pain_level_discharge TEXT,
  other_remarks TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_iv_sedation_forms_patient_id ON iv_sedation_forms(patient_id);
CREATE INDEX IF NOT EXISTS idx_iv_sedation_forms_patient_name ON iv_sedation_forms(patient_name);
CREATE INDEX IF NOT EXISTS idx_iv_sedation_forms_sedation_date ON iv_sedation_forms(sedation_date);
CREATE INDEX IF NOT EXISTS idx_iv_sedation_forms_status ON iv_sedation_forms(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_iv_sedation_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_iv_sedation_forms_updated_at
  BEFORE UPDATE ON iv_sedation_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_iv_sedation_forms_updated_at();

-- Enable Row Level Security (RLS) - currently disabled as per user preference
-- ALTER TABLE iv_sedation_forms ENABLE ROW LEVEL SECURITY;

-- Grant permissions (adjust as needed based on your auth setup)
-- GRANT ALL ON iv_sedation_forms TO authenticated;
-- GRANT ALL ON iv_sedation_forms TO anon;
