-- Add completed_by and completed_by_name columns to lab_report_cards table
ALTER TABLE lab_report_cards
ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS completed_by_name TEXT;

-- Add indexes for better performance when querying by completed_by
CREATE INDEX IF NOT EXISTS idx_lab_report_cards_completed_by ON lab_report_cards(completed_by);

-- Add comments for documentation
COMMENT ON COLUMN lab_report_cards.completed_by IS 'Foreign key to user_profiles table - ID of the user who completed this lab report card';
COMMENT ON COLUMN lab_report_cards.completed_by_name IS 'Full name of the user who completed this lab report card (denormalized for performance)';

