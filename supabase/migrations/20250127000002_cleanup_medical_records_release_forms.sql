-- Migration to clean up medical_records_release_forms table
-- Remove unnecessary columns and ensure only required fields exist

-- First, let's check what columns exist and remove unnecessary ones
-- This migration will clean up the table to match our simplified form structure

-- Drop unnecessary columns if they exist
DO $$ 
BEGIN
    -- Remove columns that are not needed for the simplified form
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records_release_forms' AND column_name = 'form_version') THEN
        ALTER TABLE medical_records_release_forms DROP COLUMN form_version;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records_release_forms' AND column_name = 'completed_at') THEN
        ALTER TABLE medical_records_release_forms DROP COLUMN completed_at;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records_release_forms' AND column_name = 'signed_at') THEN
        ALTER TABLE medical_records_release_forms DROP COLUMN signed_at;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records_release_forms' AND column_name = 'created_by') THEN
        ALTER TABLE medical_records_release_forms DROP COLUMN created_by;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records_release_forms' AND column_name = 'updated_by') THEN
        ALTER TABLE medical_records_release_forms DROP COLUMN updated_by;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records_release_forms' AND column_name = 'public_link_id') THEN
        ALTER TABLE medical_records_release_forms DROP COLUMN public_link_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records_release_forms' AND column_name = 'public_link_status') THEN
        ALTER TABLE medical_records_release_forms DROP COLUMN public_link_status;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records_release_forms' AND column_name = 'public_link_expires_at') THEN
        ALTER TABLE medical_records_release_forms DROP COLUMN public_link_expires_at;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records_release_forms' AND column_name = 'is_public_submission') THEN
        ALTER TABLE medical_records_release_forms DROP COLUMN is_public_submission;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records_release_forms' AND column_name = 'form_data') THEN
        ALTER TABLE medical_records_release_forms DROP COLUMN form_data;
    END IF;
END $$;

-- Ensure the has_agreed column exists (it should from the previous migration)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records_release_forms' AND column_name = 'has_agreed') THEN
        ALTER TABLE medical_records_release_forms ADD COLUMN has_agreed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update the trigger function to be simpler since we removed some columns
CREATE OR REPLACE FUNCTION update_medical_records_release_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_update_medical_records_release_forms_updated_at ON medical_records_release_forms;
CREATE TRIGGER trigger_update_medical_records_release_forms_updated_at
  BEFORE UPDATE ON medical_records_release_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_records_release_forms_updated_at();

-- Drop unnecessary indexes
DROP INDEX IF EXISTS idx_medical_records_release_forms_public_link_id;
DROP INDEX IF EXISTS idx_medical_records_release_forms_public_link_status;

-- Update table comment
COMMENT ON TABLE medical_records_release_forms IS 'Stores simplified medical records release authorization forms with essential fields only';

-- Update column comments
COMMENT ON COLUMN medical_records_release_forms.has_agreed IS 'Whether patient has agreed to all terms above (checkbox confirmation)';
COMMENT ON COLUMN medical_records_release_forms.status IS 'Current status: draft or submitted';

-- Update status constraint to only allow draft and submitted
ALTER TABLE medical_records_release_forms DROP CONSTRAINT IF EXISTS medical_records_release_forms_status_check;
ALTER TABLE medical_records_release_forms ADD CONSTRAINT medical_records_release_forms_status_check 
  CHECK (status IN ('draft', 'submitted'));
