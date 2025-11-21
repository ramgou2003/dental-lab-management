-- Add flow_entries column to iv_sedation_forms table
-- This migration adds the flow_entries field to store monitoring entries separately from monitoring_log

-- Add the flow_entries column to the iv_sedation_forms table
ALTER TABLE iv_sedation_forms 
ADD COLUMN IF NOT EXISTS flow_entries JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the new column
COMMENT ON COLUMN iv_sedation_forms.flow_entries IS 'Stores flow monitoring entries with timestamps, vital signs (BP, HR, RR, SpO2), and medications';

-- Add index for better query performance on flow entries data
CREATE INDEX IF NOT EXISTS idx_iv_sedation_forms_flow_entries ON iv_sedation_forms USING GIN (flow_entries);

-- Migrate existing data from monitoring_log to flow_entries if monitoring_log has data
UPDATE iv_sedation_forms 
SET flow_entries = monitoring_log 
WHERE monitoring_log IS NOT NULL 
  AND monitoring_log != '[]'::jsonb 
  AND (flow_entries IS NULL OR flow_entries = '[]'::jsonb);

