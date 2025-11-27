-- Remove unique constraint on lab_report_card_id to allow multiple manufacturing items for reprints
-- This is necessary when an inspection is rejected and a new manufacturing item needs to be created
-- for the same lab report card

-- Drop the unique constraint
ALTER TABLE manufacturing_items DROP CONSTRAINT IF EXISTS manufacturing_items_lab_report_card_id_key;

-- Add comment to document why the constraint was removed
COMMENT ON COLUMN manufacturing_items.lab_report_card_id IS 'Foreign key to lab_report_cards table - Multiple manufacturing items can reference the same lab report card (e.g., for reprints after rejected inspections)';

