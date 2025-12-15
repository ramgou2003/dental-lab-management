-- Create field_visibility_rules table
CREATE TABLE IF NOT EXISTS field_visibility_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'hide_when' or 'show_when'
  condition_field TEXT NOT NULL, -- 'treatment_type' or 'appliance_type'
  condition_values TEXT[] NOT NULL, -- Array of values that trigger the rule
  arch_type TEXT, -- 'upper', 'lower', 'dual', or NULL for all
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_field_visibility_rules_field_name ON field_visibility_rules(field_name);
CREATE INDEX IF NOT EXISTS idx_field_visibility_rules_is_active ON field_visibility_rules(is_active);

-- Insert default rules for Screw Type field
-- Hide screw type when treatment type is denture or nightguard
INSERT INTO field_visibility_rules (field_name, rule_type, condition_field, condition_values, arch_type, display_order) VALUES 
  ('screw_type', 'hide_when', 'treatment_type', ARRAY['denture', 'nightguard'], NULL, 1),
  ('screw_type', 'hide_when', 'appliance_type', ARRAY['night-guard'], NULL, 2)
ON CONFLICT DO NOTHING;

-- Insert default rules for VDO Details field
-- Hide VDO details when treatment type is nightguard or appliance is night-guard
INSERT INTO field_visibility_rules (field_name, rule_type, condition_field, condition_values, arch_type, display_order) VALUES 
  ('vdo_details', 'hide_when', 'treatment_type', ARRAY['nightguard'], NULL, 1),
  ('vdo_details', 'hide_when', 'appliance_type', ARRAY['night-guard'], NULL, 2)
ON CONFLICT DO NOTHING;

-- Insert default rules for Nightguard Question field
-- Hide nightguard question when appliance type is denture or night-guard
INSERT INTO field_visibility_rules (field_name, rule_type, condition_field, condition_values, arch_type, display_order) VALUES 
  ('nightguard_question', 'hide_when', 'appliance_type', ARRAY['denture', 'night-guard'], NULL, 1)
ON CONFLICT DO NOTHING;

-- Add comments
COMMENT ON TABLE field_visibility_rules IS 'Dynamic field visibility rules for lab script forms';
COMMENT ON COLUMN field_visibility_rules.field_name IS 'Name of the field to control (e.g., screw_type, vdo_details, nightguard_question)';
COMMENT ON COLUMN field_visibility_rules.rule_type IS 'Type of rule: hide_when or show_when';
COMMENT ON COLUMN field_visibility_rules.condition_field IS 'Field to check for condition (treatment_type or appliance_type)';
COMMENT ON COLUMN field_visibility_rules.condition_values IS 'Array of values that trigger this rule';
COMMENT ON COLUMN field_visibility_rules.arch_type IS 'Specific arch type this rule applies to, or NULL for all arches';

