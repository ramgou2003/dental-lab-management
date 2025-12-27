-- Add form_status field to encounters table
-- This tracks the completion status of the encounter form

-- Create enum type for form status
DO $$ BEGIN
    CREATE TYPE encounter_form_status AS ENUM ('draft', 'complete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add form_status column
ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS form_status encounter_form_status DEFAULT 'draft';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_encounters_form_status ON encounters(form_status);

-- Add comment to document the new column
COMMENT ON COLUMN encounters.form_status IS 'Status of the encounter form: draft or complete';

