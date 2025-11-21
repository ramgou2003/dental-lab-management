-- Add procedures column to treatment_plan_forms table
-- This migration adds support for storing individual procedures separately from treatments

ALTER TABLE treatment_plan_forms 
ADD COLUMN IF NOT EXISTS procedures JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the new column
COMMENT ON COLUMN treatment_plan_forms.procedures IS 'Stores individual procedures added directly to the treatment plan (not part of a treatment group)';

-- Add index for better query performance on procedures data
CREATE INDEX IF NOT EXISTS idx_treatment_plan_forms_procedures ON treatment_plan_forms USING GIN (procedures);

