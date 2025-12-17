-- Update the status CHECK constraint to include 'rejected', 'in-production', and 'quality-check' statuses
-- This allows manufacturing items to be marked as rejected when inspection fails

-- Drop the old constraint
ALTER TABLE manufacturing_items DROP CONSTRAINT IF EXISTS manufacturing_items_status_check;

-- Add the new constraint with all valid statuses
ALTER TABLE manufacturing_items ADD CONSTRAINT manufacturing_items_status_check 
CHECK (status = ANY (ARRAY[
  'pending-printing'::text, 
  'pending-milling'::text, 
  'in-production'::text,
  'printing'::text, 
  'milling'::text, 
  'in-transit'::text, 
  'quality-check'::text,
  'inspection'::text, 
  'completed'::text,
  'rejected'::text
]));

-- Add comment to document the new status
COMMENT ON CONSTRAINT manufacturing_items_status_check ON manufacturing_items IS 
'Valid statuses: pending-printing, pending-milling, in-production, printing, milling, in-transit, quality-check, inspection, completed, rejected';

