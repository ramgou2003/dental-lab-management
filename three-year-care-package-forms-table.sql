-- Create table for 3-Year Care Package Enrollment Agreement forms
CREATE TABLE IF NOT EXISTS three_year_care_package_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Patient Information
    patient_name TEXT NOT NULL,
    date_of_birth TEXT,
    enrollment_date TEXT,
    enrollment_time TEXT,
    
    -- Daily Care Requirements Acknowledgment
    chlorhexidine_rinse BOOLEAN DEFAULT FALSE,
    water_flosser BOOLEAN DEFAULT FALSE,
    electric_toothbrush BOOLEAN DEFAULT FALSE,
    attend_checkups BOOLEAN DEFAULT FALSE,
    
    -- Enrollment Choice
    enrollment_choice TEXT, -- "enroll" or "defer"
    
    -- Payment Method
    payment_method TEXT,
    
    -- Legal Acknowledgments
    cancellation_policy BOOLEAN DEFAULT FALSE,
    governing_law BOOLEAN DEFAULT FALSE,
    arbitration_clause BOOLEAN DEFAULT FALSE,
    hipaa_consent BOOLEAN DEFAULT FALSE,
    
    -- Signatures
    patient_signature TEXT,
    patient_signature_date TEXT,
    witness_name TEXT,
    witness_signature TEXT,
    witness_signature_date TEXT,
    
    -- Age/Language Confirmation
    age_confirmation BOOLEAN DEFAULT FALSE,
    language_confirmation BOOLEAN DEFAULT FALSE,
    
    -- Acknowledgment
    acknowledgment_read BOOLEAN DEFAULT FALSE,
    
    -- Staff Use
    staff_processed_by TEXT,
    staff_processed_date TEXT,

    -- Status
    status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'signed'

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE three_year_care_package_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view three year care package forms for their organization" ON three_year_care_package_forms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = three_year_care_package_forms.patient_id 
            AND p.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

CREATE POLICY "Users can insert three year care package forms for their organization" ON three_year_care_package_forms
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = three_year_care_package_forms.patient_id 
            AND p.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

CREATE POLICY "Users can update three year care package forms for their organization" ON three_year_care_package_forms
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = three_year_care_package_forms.patient_id 
            AND p.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

CREATE POLICY "Users can delete three year care package forms for their organization" ON three_year_care_package_forms
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = three_year_care_package_forms.patient_id 
            AND p.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_three_year_care_package_forms_patient_id ON three_year_care_package_forms(patient_id);
CREATE INDEX IF NOT EXISTS idx_three_year_care_package_forms_created_at ON three_year_care_package_forms(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_three_year_care_package_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_three_year_care_package_forms_updated_at
    BEFORE UPDATE ON three_year_care_package_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_three_year_care_package_forms_updated_at();
