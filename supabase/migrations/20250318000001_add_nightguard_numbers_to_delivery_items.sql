-- Add nightguard number columns to delivery_items table
-- These columns track nightguard numbers for delivery items

ALTER TABLE delivery_items
ADD COLUMN IF NOT EXISTS upper_nightguard_number TEXT,
ADD COLUMN IF NOT EXISTS lower_nightguard_number TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_delivery_items_upper_nightguard_number ON delivery_items(upper_nightguard_number);
CREATE INDEX IF NOT EXISTS idx_delivery_items_lower_nightguard_number ON delivery_items(lower_nightguard_number);

-- Add comments to document the new columns
COMMENT ON COLUMN delivery_items.upper_nightguard_number IS 'Nightguard number for upper arch (if applicable)';
COMMENT ON COLUMN delivery_items.lower_nightguard_number IS 'Nightguard number for lower arch (if applicable)';

-- Update existing delivery items with nightguard numbers from manufacturing_items
UPDATE delivery_items di
SET 
  upper_nightguard_number = mi.upper_nightguard_number,
  lower_nightguard_number = mi.lower_nightguard_number
FROM manufacturing_items mi
WHERE di.manufacturing_item_id = mi.id
AND (
  (di.upper_nightguard_number IS NULL AND mi.upper_nightguard_number IS NOT NULL) OR
  (di.lower_nightguard_number IS NULL AND mi.lower_nightguard_number IS NOT NULL)
);

