-- Create medical_history table
-- This table stores patient medical history, allergies, medications, and comfort preferences
-- It syncs with new_patient_packets and can also be created/edited independently

CREATE TABLE IF NOT EXISTS medical_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  patient_packet_id UUID REFERENCES new_patient_packets(id) ON DELETE SET NULL,
  
  -- Medical Conditions
  critical_conditions JSONB DEFAULT '{}'::jsonb,
  system_specific JSONB DEFAULT '{}'::jsonb,
  additional_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
  recent_health_changes JSONB DEFAULT '{}'::jsonb,
  
  -- Allergies
  allergies JSONB DEFAULT '{}'::jsonb,
  
  -- Current Medications
  current_medications JSONB DEFAULT '{}'::jsonb,
  current_pharmacy JSONB DEFAULT '{}'::jsonb,
  
  -- Comfort Preferences
  anxiety_control TEXT[] DEFAULT ARRAY[]::TEXT[],
  pain_injection TEXT[] DEFAULT ARRAY[]::TEXT[],
  communication TEXT[] DEFAULT ARRAY[]::TEXT[],
  sensory_sensitivities TEXT[] DEFAULT ARRAY[]::TEXT[],
  physical_comfort TEXT[] DEFAULT ARRAY[]::TEXT[],
  service_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
  other_concerns TEXT,
  
  -- Metadata
  source VARCHAR(50) DEFAULT 'manual', -- 'patient_packet' or 'manual'
  is_active BOOLEAN DEFAULT true, -- Only one active record per patient
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_id UUID REFERENCES users(id),
  updated_by_id UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT unique_active_medical_history_per_patient 
    UNIQUE NULLS NOT DISTINCT (patient_id, is_active)
);

-- Create indexes for better query performance
CREATE INDEX idx_medical_history_patient_id ON medical_history(patient_id);
CREATE INDEX idx_medical_history_patient_packet_id ON medical_history(patient_packet_id);
CREATE INDEX idx_medical_history_is_active ON medical_history(is_active);
CREATE INDEX idx_medical_history_created_at ON medical_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view medical history for their organization's patients"
  ON medical_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medical_history.patient_id
      AND p.organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert medical history for their organization's patients"
  ON medical_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medical_history.patient_id
      AND p.organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update medical history for their organization's patients"
  ON medical_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medical_history.patient_id
      AND p.organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete medical history for their organization's patients"
  ON medical_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medical_history.patient_id
      AND p.organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_medical_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_medical_history_updated_at_trigger
  BEFORE UPDATE ON medical_history
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_history_updated_at();

-- Add comment to table
COMMENT ON TABLE medical_history IS 'Stores patient medical history, allergies, medications, and comfort preferences. Syncs with new_patient_packets and can be created/edited independently.';
COMMENT ON COLUMN medical_history.patient_packet_id IS 'Reference to the patient packet this record was synced from. NULL if created manually.';
COMMENT ON COLUMN medical_history.source IS 'Source of the data: patient_packet or manual';
COMMENT ON COLUMN medical_history.is_active IS 'Only one active medical history record per patient. When a new record is created, previous records are set to is_active=false for history tracking.';

