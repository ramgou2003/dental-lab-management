-- Add consultation_patient_id column to new_patient_packets table
-- This creates a direct link between consultation patients and their patient packets

ALTER TABLE new_patient_packets 
ADD COLUMN consultation_patient_id UUID REFERENCES consultation_patients(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_new_patient_packets_consultation_patient_id ON new_patient_packets(consultation_patient_id);

-- Add comment for documentation
COMMENT ON COLUMN new_patient_packets.consultation_patient_id IS 'Links patient packet to consultation patient record for direct consultation appointments';
