-- Add clinical_notes field to encounters table
-- This field will store additional clinical notes and observations for all encounter types

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS clinical_notes TEXT;

-- Add surgery document checklist fields to encounters table
ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS surgery_data_collection_sheet TEXT;

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS surgery_iv_sedation_flow_chart TEXT;

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS surgery_surgical_recall_sheet TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN encounters.clinical_notes IS 'Additional clinical notes and observations from the encounter';
COMMENT ON COLUMN encounters.surgery_data_collection_sheet IS 'Surgery: Data Collection sheet completed (yes/no/na)';
COMMENT ON COLUMN encounters.surgery_iv_sedation_flow_chart IS 'Surgery: IV Sedation flow chart completed (yes/no/na)';
COMMENT ON COLUMN encounters.surgery_surgical_recall_sheet IS 'Surgery: Surgical recall sheet completed (yes/no/na)';

