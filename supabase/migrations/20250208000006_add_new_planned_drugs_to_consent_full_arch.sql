-- Add new planned drug columns to consent_full_arch_forms table
-- Migration: 20250208000006_add_new_planned_drugs_to_consent_full_arch.sql

-- Add versed column
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS versed BOOLEAN DEFAULT false;

-- Add ketorolac column
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS ketorolac BOOLEAN DEFAULT false;

-- Add benadryl column
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS benadryl BOOLEAN DEFAULT false;

-- Add acetaminophen column
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS acetaminophen BOOLEAN DEFAULT false;

-- Add valium column
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS valium BOOLEAN DEFAULT false;

-- Add clindamycin column
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS clindamycin BOOLEAN DEFAULT false;

-- Add lidocaine column
ALTER TABLE consent_full_arch_forms 
ADD COLUMN IF NOT EXISTS lidocaine BOOLEAN DEFAULT false;

-- Add comments for the new columns
COMMENT ON COLUMN consent_full_arch_forms.versed IS 'Versed (midazolam) planned drug option';
COMMENT ON COLUMN consent_full_arch_forms.ketorolac IS 'Ketorolac planned drug option';
COMMENT ON COLUMN consent_full_arch_forms.benadryl IS 'Benadryl (diphenhydramine) planned drug option';
COMMENT ON COLUMN consent_full_arch_forms.acetaminophen IS 'Acetaminophen planned drug option';
COMMENT ON COLUMN consent_full_arch_forms.valium IS 'Valium (diazepam) planned drug option';
COMMENT ON COLUMN consent_full_arch_forms.clindamycin IS 'Clindamycin planned drug option';
COMMENT ON COLUMN consent_full_arch_forms.lidocaine IS 'Lidocaine planned drug option';
