-- Add public_link field to new_patient_leads table to store generated patient packet links
ALTER TABLE new_patient_leads 
ADD COLUMN IF NOT EXISTS public_link TEXT;

-- Add index for faster lookups by public link
CREATE INDEX IF NOT EXISTS idx_new_patient_leads_public_link 
ON new_patient_leads(public_link);

-- Add comment to document the field
COMMENT ON COLUMN new_patient_leads.public_link IS 'Generated public link for patient packet form submission';
