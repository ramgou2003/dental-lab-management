-- Add surgery type columns to consent_full_arch_forms table
-- Migration: 20260121000001_add_surgery_type_to_consent_full_arch.sql

-- Add upper_surgery_type column (can be 'surgery' or 'surgical_revision')
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS upper_surgery_type TEXT;

-- Add lower_surgery_type column (can be 'surgery' or 'surgical_revision')
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS lower_surgery_type TEXT;

-- Add comments for the new columns
COMMENT ON COLUMN consent_full_arch_forms.upper_surgery_type IS 'Type of surgery for upper arch: surgery or surgical_revision';
COMMENT ON COLUMN consent_full_arch_forms.lower_surgery_type IS 'Type of surgery for lower arch: surgery or surgical_revision';
