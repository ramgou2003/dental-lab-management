-- Create financial_agreements table to store comprehensive financial agreement data
CREATE TABLE financial_agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES new_patient_leads(id) ON DELETE SET NULL,
  new_patient_packet_id UUID REFERENCES new_patient_packets(id) ON DELETE SET NULL,
  
  -- Section 1: Patient & Treatment Identification
  patient_name TEXT NOT NULL,
  chart_number TEXT,
  date_of_birth DATE,
  date_of_execution DATE NOT NULL DEFAULT CURRENT_DATE,
  time_of_execution TIME NOT NULL DEFAULT CURRENT_TIME,
  
  -- Accepted Treatments (stored as JSONB array)
  accepted_treatments JSONB DEFAULT '[]', -- Array of {service, fee, cdtCode, cptCode, initials}
  total_cost_of_treatment DECIMAL(10,2),
  
  -- Section 2: Payment & Balance Terms
  patient_payment_today DECIMAL(10,2),
  remaining_balance DECIMAL(10,2),
  balance_due_date DATE,
  payment_amount DECIMAL(10,2),
  payment_terms_initials TEXT,
  
  -- Section 3: Non-Refundable & Lab Fees
  lab_fee_initials TEXT,
  
  -- Section 4: Warranty & Care Package Conditions
  care_package_fee DECIMAL(10,2),
  care_package_election TEXT CHECK (care_package_election IN ('enroll', 'defer')),
  warranty_initials TEXT,
  
  -- Section 5: Capacity, Language & HIPAA
  capacity_confirmed BOOLEAN DEFAULT false,
  hipaa_acknowledged BOOLEAN DEFAULT false,
  capacity_initials TEXT,
  
  -- Section 6: Dispute Resolution
  dispute_initials TEXT,
  
  -- Section 7: Signatures
  terms_agreed BOOLEAN DEFAULT false,
  patient_signature TEXT, -- Base64 encoded signature
  patient_signature_date DATE,
  patient_signature_time TIME,
  witness_name TEXT,
  witness_role TEXT,
  witness_signature TEXT, -- Base64 encoded signature
  witness_signature_date DATE,
  witness_signature_time TIME,
  
  -- Section 8: Office Use Only
  downloaded_to_dental_management_software BOOLEAN DEFAULT false,
  confirmed_by_staff_initials TEXT,
  
  -- Status and Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'signed', 'executed')),
  form_version TEXT DEFAULT '1.0',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_financial_agreements_patient_id ON financial_agreements(patient_id);
CREATE INDEX idx_financial_agreements_lead_id ON financial_agreements(lead_id);

CREATE INDEX idx_financial_agreements_new_patient_packet_id ON financial_agreements(new_patient_packet_id);
CREATE INDEX idx_financial_agreements_status ON financial_agreements(status);
CREATE INDEX idx_financial_agreements_date_of_execution ON financial_agreements(date_of_execution);
CREATE INDEX idx_financial_agreements_created_at ON financial_agreements(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_financial_agreements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Auto-update completed_at when status changes to completed/signed/executed
  IF NEW.status IN ('completed', 'signed', 'executed') AND OLD.status != NEW.status THEN
    NEW.completed_at = NOW();
  END IF;
  
  -- Auto-update executed_at when status changes to executed
  IF NEW.status = 'executed' AND OLD.status != 'executed' THEN
    NEW.executed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_financial_agreements_updated_at
  BEFORE UPDATE ON financial_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_agreements_updated_at();

-- Enable RLS on financial_agreements table
ALTER TABLE financial_agreements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financial_agreements
CREATE POLICY "Users can view all financial agreements" ON financial_agreements
  FOR SELECT USING (true);

CREATE POLICY "Users can insert financial agreements" ON financial_agreements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update financial agreements" ON financial_agreements
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete financial agreements" ON financial_agreements
  FOR DELETE USING (true);

-- Add comments to document the financial_agreements table
COMMENT ON TABLE financial_agreements IS 'Stores comprehensive financial agreement and payment terms data';

-- Add column comments for documentation
COMMENT ON COLUMN financial_agreements.accepted_treatments IS 'JSONB array of accepted treatments with service, fee, CDT code, CPT code, and initials';
COMMENT ON COLUMN financial_agreements.patient_signature IS 'Base64 encoded patient signature image';
COMMENT ON COLUMN financial_agreements.witness_signature IS 'Base64 encoded witness signature image';
COMMENT ON COLUMN financial_agreements.care_package_election IS 'Patient election for care package: enroll or defer';
COMMENT ON COLUMN financial_agreements.status IS 'Current status: draft, completed, signed, or executed';
COMMENT ON COLUMN financial_agreements.form_version IS 'Version of the financial agreement form used';
