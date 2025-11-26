-- Add inspection tracking fields to manufacturing_items table
ALTER TABLE manufacturing_items
ADD COLUMN IF NOT EXISTS inspection_print_quality TEXT CHECK (inspection_print_quality IN ('pass', 'fail')),
ADD COLUMN IF NOT EXISTS inspection_physical_defects TEXT CHECK (inspection_physical_defects IN ('pass', 'fail')),
ADD COLUMN IF NOT EXISTS inspection_screw_access_channel TEXT CHECK (inspection_screw_access_channel IN ('pass', 'fail')),
ADD COLUMN IF NOT EXISTS inspection_mua_platform TEXT CHECK (inspection_mua_platform IN ('pass', 'fail')),
ADD COLUMN IF NOT EXISTS inspection_status TEXT CHECK (inspection_status IN ('approved', 'rejected')),
ADD COLUMN IF NOT EXISTS inspection_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS inspection_completed_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS inspection_completed_by_name TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manufacturing_items_inspection_status ON manufacturing_items(inspection_status);
CREATE INDEX IF NOT EXISTS idx_manufacturing_items_inspection_completed_at ON manufacturing_items(inspection_completed_at);
CREATE INDEX IF NOT EXISTS idx_manufacturing_items_inspection_completed_by ON manufacturing_items(inspection_completed_by);

