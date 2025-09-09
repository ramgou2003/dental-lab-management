-- Add PRF columns to consent_full_arch_forms table graft material options
-- Migration: 20250208000005_add_prf_to_consent_full_arch_graft_material.sql

-- Add upper_graft_prf column
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS upper_graft_prf BOOLEAN DEFAULT false;

-- Add lower_graft_prf column  
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS lower_graft_prf BOOLEAN DEFAULT false;

-- Add comments for the new columns
COMMENT ON COLUMN consent_full_arch_forms.upper_graft_prf IS 'PRF (Platelet-Rich Fibrin) graft material option for upper arch';
COMMENT ON COLUMN consent_full_arch_forms.lower_graft_prf IS 'PRF (Platelet-Rich Fibrin) graft material option for lower arch';
