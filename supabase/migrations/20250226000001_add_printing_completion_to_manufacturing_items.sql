-- Add printing completion tracking fields to manufacturing_items table
ALTER TABLE manufacturing_items
ADD COLUMN IF NOT EXISTS printing_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS printing_completed_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS printing_completed_by_name TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manufacturing_items_printing_completed_at ON manufacturing_items(printing_completed_at);
CREATE INDEX IF NOT EXISTS idx_manufacturing_items_printing_completed_by ON manufacturing_items(printing_completed_by);

