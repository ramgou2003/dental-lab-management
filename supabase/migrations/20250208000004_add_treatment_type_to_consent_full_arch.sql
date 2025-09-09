-- Add treatment type columns to consent_full_arch_forms table
-- Migration: 20250208000004_add_treatment_type_to_consent_full_arch.sql

-- Add upper_treatment_type column
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS upper_treatment_type TEXT;

-- Add lower_treatment_type column  
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS lower_treatment_type TEXT;

-- Add comments for the new columns
COMMENT ON COLUMN consent_full_arch_forms.upper_treatment_type IS 'Treatment type for upper arch (FULL ARCH FIXED, DENTURE, IMPLANT REMOVABLE DENTURE, SINGLE IMPLANT, MULTIPLE IMPLANTS, EXTRACTION, EXTRACTION AND GRAFT)';
COMMENT ON COLUMN consent_full_arch_forms.lower_treatment_type IS 'Treatment type for lower arch (FULL ARCH FIXED, DENTURE, IMPLANT REMOVABLE DENTURE, SINGLE IMPLANT, MULTIPLE IMPLANTS, EXTRACTION, EXTRACTION AND GRAFT)';
