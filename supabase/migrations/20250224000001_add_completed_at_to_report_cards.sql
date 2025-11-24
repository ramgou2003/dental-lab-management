-- Add completed_at column to lab_report_cards table
ALTER TABLE lab_report_cards
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add completed_at, completed_by, and completed_by_name columns to clinical_report_cards table
ALTER TABLE clinical_report_cards
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS completed_by_name TEXT;

-- Add indexes for better performance when querying by completed_at and completed_by
CREATE INDEX IF NOT EXISTS idx_lab_report_cards_completed_at ON lab_report_cards(completed_at);
CREATE INDEX IF NOT EXISTS idx_clinical_report_cards_completed_at ON clinical_report_cards(completed_at);
CREATE INDEX IF NOT EXISTS idx_clinical_report_cards_completed_by ON clinical_report_cards(completed_by);

-- Add comments for documentation
COMMENT ON COLUMN lab_report_cards.completed_at IS 'Timestamp when the lab report card was completed (date and time in EST)';
COMMENT ON COLUMN clinical_report_cards.completed_at IS 'Timestamp when the clinical report card was completed (date and time in EST)';
COMMENT ON COLUMN clinical_report_cards.completed_by IS 'Foreign key to user_profiles table - ID of the user who completed this clinical report card';
COMMENT ON COLUMN clinical_report_cards.completed_by_name IS 'Full name of the user who completed this clinical report card (denormalized for performance)';

