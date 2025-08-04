-- Create patient_packets table to store submitted patient packet forms
CREATE TABLE IF NOT EXISTS patient_packets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES new_patient_leads(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  patient_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_packets_lead_id ON patient_packets(lead_id);
CREATE INDEX IF NOT EXISTS idx_patient_packets_submitted_at ON patient_packets(submitted_at);
CREATE INDEX IF NOT EXISTS idx_patient_packets_patient_email ON patient_packets(patient_email);

-- Add RLS (Row Level Security) policies
ALTER TABLE patient_packets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all patient packets
CREATE POLICY "Allow authenticated users to read patient packets" ON patient_packets
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anyone to insert patient packets (for public form submission)
CREATE POLICY "Allow public insert of patient packets" ON patient_packets
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to update patient packets
CREATE POLICY "Allow authenticated users to update patient packets" ON patient_packets
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete patient packets
CREATE POLICY "Allow authenticated users to delete patient packets" ON patient_packets
  FOR DELETE
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_packets_updated_at
  BEFORE UPDATE ON patient_packets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment type for packet_completed
-- This will be used in the lead_comments table
COMMENT ON TABLE patient_packets IS 'Stores submitted new patient packet forms from public links';
