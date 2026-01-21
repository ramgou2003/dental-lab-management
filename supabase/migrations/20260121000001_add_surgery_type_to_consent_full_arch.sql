-- Add surgery type columns to consent_full_arch_forms table
-- Migration: 20260121000001_add_surgery_type_to_consent_full_arch.sql

-- Add surgery_type column (can be 'surgery' or 'surgical_revision')
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS surgery_type TEXT;

-- Add comment for the new column
COMMENT ON COLUMN consent_full_arch_forms.surgery_type IS 'Type of surgery: surgery or surgical_revision';
