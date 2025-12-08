-- Add uploaded_by_id column to patient_documents table
-- This stores the user ID who uploaded the document (in addition to uploaded_by which stores the name)

ALTER TABLE patient_documents 
ADD COLUMN IF NOT EXISTS uploaded_by_id UUID REFERENCES user_profiles(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_patient_documents_uploaded_by_id ON patient_documents(uploaded_by_id);

-- Add comment for documentation
COMMENT ON COLUMN patient_documents.uploaded_by_id IS 'Foreign key to user_profiles table - ID of the user who uploaded this document';

