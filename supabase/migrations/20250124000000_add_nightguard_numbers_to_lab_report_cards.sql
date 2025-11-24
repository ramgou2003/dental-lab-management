-- Add nightguard number columns to lab_report_cards table
-- This migration adds upper_nightguard_number and lower_nightguard_number fields

-- Add the nightguard number columns to the lab_report_cards table
ALTER TABLE lab_report_cards 
ADD COLUMN IF NOT EXISTS upper_nightguard_number TEXT,
ADD COLUMN IF NOT EXISTS lower_nightguard_number TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN lab_report_cards.upper_nightguard_number IS 'Nightguard number for upper arch (if nightguard is needed)';
COMMENT ON COLUMN lab_report_cards.lower_nightguard_number IS 'Nightguard number for lower arch (if nightguard is needed)';

