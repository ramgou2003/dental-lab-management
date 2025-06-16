-- Create lab_scripts table
CREATE TABLE lab_scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  appliance_type TEXT NOT NULL,
  arch_type TEXT NOT NULL,
  upper_treatment_type TEXT,
  lower_treatment_type TEXT,
  screw_type TEXT,
  custom_screw_type TEXT,
  vdo_details TEXT,
  requested_date DATE NOT NULL,
  due_date DATE,
  instructions TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'delayed', 'hold')),
  lab_name TEXT DEFAULT 'Dental Lab Pro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_lab_scripts_patient_id ON lab_scripts(patient_id);
CREATE INDEX idx_lab_scripts_status ON lab_scripts(status);
CREATE INDEX idx_lab_scripts_due_date ON lab_scripts(due_date);
CREATE INDEX idx_lab_scripts_created_at ON lab_scripts(created_at);

-- Enable Row Level Security
ALTER TABLE lab_scripts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on lab_scripts" ON lab_scripts
FOR ALL USING (true);

-- Create lab_script_comments table
CREATE TABLE lab_script_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_script_id UUID REFERENCES lab_scripts(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT DEFAULT 'System User'
);

-- Create indexes for comments
CREATE INDEX idx_lab_script_comments_lab_script_id ON lab_script_comments(lab_script_id);
CREATE INDEX idx_lab_script_comments_created_at ON lab_script_comments(created_at);

-- Enable Row Level Security for comments
ALTER TABLE lab_script_comments ENABLE ROW LEVEL SECURITY;

-- Create policy for comments
CREATE POLICY "Allow all operations on lab_script_comments" ON lab_script_comments
FOR ALL USING (true);

-- Insert dummy data using existing patients
INSERT INTO lab_scripts (
  patient_name, 
  appliance_type, 
  arch_type, 
  upper_treatment_type, 
  lower_treatment_type, 
  screw_type, 
  vdo_details, 
  requested_date, 
  due_date, 
  instructions, 
  notes, 
  status, 
  lab_name
) VALUES 
(
  'Emily Johnson',
  'surgical-day-appliance',
  'upper',
  'orthodontic',
  NULL,
  'DC Screw',
  'Open up to 4mm without calling Doctor',
  '2024-01-15',
  '2024-01-20',
  'Please design upper SDA for patient with expedited completion. Verify occlusal contacts during design and utilize high-quality materials. Thank you.',
  'Patient prefers natural shade',
  'in-progress',
  'Dental Lab Pro'
),
(
  'Michael Chen',
  'printed-tryin',
  'dual',
  'restorative',
  'cosmetic',
  'Rosen',
  'Open VDO based on requirement',
  '2024-01-14',
  '2024-01-18',
  'Please design PTI for dual arch with restorative upper treatment and cosmetic lower treatment. Expedited processing required. Thank you.',
  'Patient has metal allergies',
  'completed',
  'Premium Dental'
),
(
  'Sarah Williams',
  'night-guard',
  'upper',
  'preventive',
  NULL,
  'Powerball',
  'No changes required in VDO',
  '2024-01-20',
  '2024-01-25',
  'Please fabricate night guard for upper arch with preventive treatment approach. Standard processing timeline acceptable. Thank you.',
  'Patient grinds teeth at night',
  'pending',
  'Smile Tech Lab'
),
(
  'David Brown',
  'direct-load-zirconia',
  'lower',
  'prosthetic',
  NULL,
  'SIN PRH30',
  'Open up to 4mm with calling Doctor',
  '2024-01-18',
  '2024-01-22',
  'Please design direct load zirconia for lower arch with prosthetic treatment. Contact doctor before opening VDO beyond 4mm. Expedited completion needed. Thank you.',
  'Previous implant complications',
  'delayed',
  'Dental Lab Pro'
),
(
  'Emily Johnson',
  'ti-bar-superstructure',
  'dual',
  'surgical',
  'prosthetic',
  'Dess',
  'Open VDO based on requirement',
  '2024-01-22',
  '2024-01-28',
  'Please fabricate Ti-Bar and superstructure for dual arch with surgical upper and prosthetic lower treatments. Complex case requiring careful attention to VDO adjustments. Thank you.',
  'Follow-up case for previous SDA',
  'pending',
  'Dental Lab Pro'
),
(
  'Michael Chen',
  'crown',
  'upper',
  'restorative',
  NULL,
  'Neodent',
  'No changes required in VDO',
  '2024-01-25',
  '2024-01-30',
  'Please fabricate crown for upper arch with restorative treatment approach. Standard VDO maintenance required. High-quality materials essential. Thank you.',
  'Patient satisfied with previous work',
  'in-progress',
  'Premium Dental'
);
