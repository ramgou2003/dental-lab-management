-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shades table
CREATE TABLE IF NOT EXISTS shades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treatment_types table
CREATE TABLE IF NOT EXISTS treatment_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appliance_types table
CREATE TABLE IF NOT EXISTS appliance_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_materials_is_active ON materials(is_active);
CREATE INDEX IF NOT EXISTS idx_materials_display_order ON materials(display_order);
CREATE INDEX IF NOT EXISTS idx_shades_is_active ON shades(is_active);
CREATE INDEX IF NOT EXISTS idx_shades_display_order ON shades(display_order);
CREATE INDEX IF NOT EXISTS idx_treatment_types_is_active ON treatment_types(is_active);
CREATE INDEX IF NOT EXISTS idx_treatment_types_display_order ON treatment_types(display_order);
CREATE INDEX IF NOT EXISTS idx_appliance_types_is_active ON appliance_types(is_active);
CREATE INDEX IF NOT EXISTS idx_appliance_types_display_order ON appliance_types(display_order);

-- Insert default materials
INSERT INTO materials (name, value, display_order) VALUES
  ('Flexera Smile Ultra Plus', 'flexera-smile-ultra-plus', 1),
  ('Sprint Ray ONX', 'sprint-ray-onx', 2),
  ('Sprint Ray Nightguard Flex', 'sprint-ray-nightguard-flex', 3),
  ('Flexera Model X', 'flexera-model-x', 4),
  ('Zirconia', 'zirconia', 5),
  ('PMMA', 'pmma', 6),
  ('ONX Tough', 'onx-tough', 7),
  ('Titanium & Zirconia', 'titanium-zirconia', 8),
  ('Titanium', 'titanium', 9)
ON CONFLICT (value) DO NOTHING;

-- Insert default shades
INSERT INTO shades (name, value, display_order) VALUES
  ('N/A', 'na', 1),
  ('A1', 'a1', 2), ('A2', 'a2', 3), ('A3', 'a3', 4), ('A3.5', 'a3.5', 5), ('A4', 'a4', 6),
  ('B1', 'b1', 7), ('B2', 'b2', 8), ('B3', 'b3', 9), ('B4', 'b4', 10),
  ('C1', 'c1', 11), ('C2', 'c2', 12), ('C3', 'c3', 13), ('C4', 'c4', 14),
  ('D2', 'd2', 15), ('D3', 'd3', 16), ('D4', 'd4', 17),
  ('BL1', 'bl1', 18), ('BL2', 'bl2', 19), ('BL3', 'bl3', 20), ('BL4', 'bl4', 21),
  ('BLEACH', 'bleach', 22), ('NW', 'nw', 23), ('Clear', 'clear', 24), ('Custom', 'custom', 25)
ON CONFLICT (value) DO NOTHING;

-- Insert default treatment types
INSERT INTO treatment_types (name, value, display_order) VALUES
  ('Full arch fixed', 'full-arch-fixed', 1),
  ('Denture', 'denture', 2),
  ('Single implant', 'single-implant', 3),
  ('Multiple implants', 'multiple-implants', 4),
  ('Nightguard', 'nightguard', 5)
ON CONFLICT (value) DO NOTHING;

-- Insert default appliance types
INSERT INTO appliance_types (name, value, display_order) VALUES
  ('Surgical Day Appliance', 'surgical-day-appliance', 1),
  ('Printed Tryin', 'printed-tryin', 2),
  ('Night Guard', 'night-guard', 3),
  ('Direct Load PMMA', 'direct-load-pmma', 4),
  ('Direct Load Zirconia', 'direct-load-zirconia', 5),
  ('Ti-Bar and Superstructure', 'ti-bar-superstructure', 6),
  ('Crown', 'crown', 7),
  ('Bridge', 'bridge', 8),
  ('Custom Abutment & Crown', 'custom-abutment-crown', 9)
ON CONFLICT (value) DO NOTHING;

-- Add comments
COMMENT ON TABLE materials IS 'Lab script materials configuration';
COMMENT ON TABLE shades IS 'Lab script shades configuration';
COMMENT ON TABLE treatment_types IS 'Lab script treatment types configuration';
COMMENT ON TABLE appliance_types IS 'Lab script appliance types configuration';

