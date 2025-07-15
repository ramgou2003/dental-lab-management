-- Add CBCT field to data_collection_sheets table
-- This field tracks whether a CBCT scan was taken for the patient

ALTER TABLE data_collection_sheets 
ADD COLUMN cbct_taken BOOLEAN DEFAULT NULL;

-- Add comment to document the field
COMMENT ON COLUMN data_collection_sheets.cbct_taken IS 'Tracks whether a CBCT scan was taken for the patient. NULL = not selected, TRUE = yes, FALSE = no';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_data_collection_sheets_cbct_taken ON data_collection_sheets(cbct_taken);
