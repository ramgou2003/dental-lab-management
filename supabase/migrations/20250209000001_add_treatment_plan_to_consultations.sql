-- Add treatment_plan column to consultations table
-- This migration adds the treatment_plan field to store treatment plan data in consultation records

-- Add the treatment_plan column to the consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS treatment_plan JSONB DEFAULT '{}'::jsonb;

-- Add a comment to document the new column
COMMENT ON COLUMN consultations.treatment_plan IS 'Stores treatment plan data including treatments and procedures as JSON';

-- Add index for better query performance on treatment plan data
CREATE INDEX IF NOT EXISTS idx_consultations_treatment_plan ON consultations USING GIN (treatment_plan);

-- Update the table comment to reflect the new column
COMMENT ON TABLE consultations IS 'Stores comprehensive consultation data including clinical assessment, treatment recommendations, treatment plans, financial decisions, and outcomes';
