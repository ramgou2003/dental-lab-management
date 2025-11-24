-- Add completion_date and completed_by columns to lab_scripts table
ALTER TABLE lab_scripts
ADD COLUMN completion_date DATE,
ADD COLUMN completed_by UUID REFERENCES user_profiles(id),
ADD COLUMN completed_by_name TEXT;

-- Add indexes for better performance when querying by completion date and completed_by
CREATE INDEX idx_lab_scripts_completion_date ON lab_scripts(completion_date);
CREATE INDEX idx_lab_scripts_completed_by ON lab_scripts(completed_by);

-- Add comments to document the columns
COMMENT ON COLUMN lab_scripts.completion_date IS 'Date when the lab script was marked as completed';
COMMENT ON COLUMN lab_scripts.completed_by IS 'User ID who marked the lab script as completed';
COMMENT ON COLUMN lab_scripts.completed_by_name IS 'Full name of the user who completed the lab script';

