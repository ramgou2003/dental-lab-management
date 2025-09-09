-- Rename implant_fixtures columns to endosteal_implants in consent_full_arch_forms table
-- Migration: 20250208000007_rename_implant_fixtures_to_endosteal_implants.sql

-- Rename implant_fixtures_count to endosteal_implants_count
ALTER TABLE consent_full_arch_forms 
RENAME COLUMN implant_fixtures_count TO endosteal_implants_count;

-- Rename implant_fixtures_fee to endosteal_implants_fee
ALTER TABLE consent_full_arch_forms 
RENAME COLUMN implant_fixtures_fee TO endosteal_implants_fee;

-- Rename implant_fixtures_covered to endosteal_implants_covered
ALTER TABLE consent_full_arch_forms 
RENAME COLUMN implant_fixtures_covered TO endosteal_implants_covered;

-- Add comments for the renamed columns
COMMENT ON COLUMN consent_full_arch_forms.endosteal_implants_count IS 'Count of endosteal implants for financial disclosure';
COMMENT ON COLUMN consent_full_arch_forms.endosteal_implants_fee IS 'Fee for endosteal implants';
COMMENT ON COLUMN consent_full_arch_forms.endosteal_implants_covered IS 'Insurance coverage status for endosteal implants';
