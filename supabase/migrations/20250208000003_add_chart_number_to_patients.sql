-- Add chart_number column to patients table
-- This migration adds the chart_number field to track patient chart numbers

-- Add the chart_number column to the patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS chart_number TEXT;

-- Add a unique index on chart_number to prevent duplicates (when not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_chart_number_unique 
ON patients(chart_number) 
WHERE chart_number IS NOT NULL AND chart_number != '';

-- Add a comment to document the new column
COMMENT ON COLUMN patients.chart_number IS 'Unique chart number assigned to the patient for identification and record keeping';
