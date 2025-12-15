-- Add received tracking fields to manufacturing_items table
-- These fields track when appliances are received from external milling locations
ALTER TABLE manufacturing_items
ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS received_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS received_by_name TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manufacturing_items_received_at ON manufacturing_items(received_at);
CREATE INDEX IF NOT EXISTS idx_manufacturing_items_received_by ON manufacturing_items(received_by);

-- Add comments to document the new columns
COMMENT ON COLUMN manufacturing_items.received_at IS 'Timestamp when the appliance was received (for in-transit items)';
COMMENT ON COLUMN manufacturing_items.received_by IS 'User ID who received the appliance';
COMMENT ON COLUMN manufacturing_items.received_by_name IS 'Name of the user who received the appliance';

