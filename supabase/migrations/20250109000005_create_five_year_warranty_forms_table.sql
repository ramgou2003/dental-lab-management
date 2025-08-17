-- Create five_year_warranty_forms table
CREATE TABLE IF NOT EXISTS five_year_warranty_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Patient Information
    patient_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    
    -- Patient Acknowledgment
    understand_optional_plan BOOLEAN DEFAULT FALSE,
    understand_monthly_cost BOOLEAN DEFAULT FALSE,
    understand_coverage_details BOOLEAN DEFAULT FALSE,
    understand_payment_process BOOLEAN DEFAULT FALSE,
    questions_answered BOOLEAN DEFAULT FALSE,
    voluntarily_enrolling BOOLEAN DEFAULT FALSE,
    coverage_begins_after_payment BOOLEAN DEFAULT FALSE,
    
    -- Payment Authorization
    authorize_payment BOOLEAN DEFAULT FALSE,
    
    -- Signatures
    patient_signature TEXT,
    patient_signature_date DATE,
    practice_representative_name TEXT,
    practice_representative_title TEXT,
    practice_signature_date DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_five_year_warranty_forms_patient_id ON five_year_warranty_forms(patient_id);
CREATE INDEX IF NOT EXISTS idx_five_year_warranty_forms_created_at ON five_year_warranty_forms(created_at);
CREATE INDEX IF NOT EXISTS idx_five_year_warranty_forms_patient_name ON five_year_warranty_forms(patient_name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_five_year_warranty_forms_updated_at 
    BEFORE UPDATE ON five_year_warranty_forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE five_year_warranty_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for all users" ON five_year_warranty_forms
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON five_year_warranty_forms
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON five_year_warranty_forms
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON five_year_warranty_forms
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE five_year_warranty_forms IS 'Stores 5-Year Extended Warranty Plan forms for dental implant patients';
COMMENT ON COLUMN five_year_warranty_forms.patient_id IS 'Foreign key reference to patients table';
COMMENT ON COLUMN five_year_warranty_forms.patient_name IS 'Name of the patient enrolling in warranty plan';
COMMENT ON COLUMN five_year_warranty_forms.date_of_birth IS 'Patient date of birth';
COMMENT ON COLUMN five_year_warranty_forms.phone IS 'Patient contact phone number';
COMMENT ON COLUMN five_year_warranty_forms.email IS 'Patient email address';
COMMENT ON COLUMN five_year_warranty_forms.understand_optional_plan IS 'Patient acknowledges plan is optional';
COMMENT ON COLUMN five_year_warranty_forms.understand_monthly_cost IS 'Patient understands monthly cost and fees';
COMMENT ON COLUMN five_year_warranty_forms.understand_coverage_details IS 'Patient understands coverage details';
COMMENT ON COLUMN five_year_warranty_forms.understand_payment_process IS 'Patient understands payment process';
COMMENT ON COLUMN five_year_warranty_forms.questions_answered IS 'All patient questions answered satisfactorily';
COMMENT ON COLUMN five_year_warranty_forms.voluntarily_enrolling IS 'Patient is voluntarily enrolling';
COMMENT ON COLUMN five_year_warranty_forms.coverage_begins_after_payment IS 'Patient understands coverage begins after payment';
COMMENT ON COLUMN five_year_warranty_forms.authorize_payment IS 'Patient authorizes automatic payments';
COMMENT ON COLUMN five_year_warranty_forms.patient_signature IS 'Patient digital signature';
COMMENT ON COLUMN five_year_warranty_forms.patient_signature_date IS 'Date of patient signature';
COMMENT ON COLUMN five_year_warranty_forms.practice_representative_name IS 'Name of practice representative';
COMMENT ON COLUMN five_year_warranty_forms.practice_representative_title IS 'Title of practice representative';
COMMENT ON COLUMN five_year_warranty_forms.practice_signature_date IS 'Date of practice representative signature';
