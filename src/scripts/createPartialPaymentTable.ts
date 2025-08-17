import { supabase } from '@/lib/supabase';

export async function createPartialPaymentAgreementTable() {
  try {
    console.log('Creating partial_payment_agreement_forms table...');

    // First, let's test if the table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('partial_payment_agreement_forms')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('Table already exists!');
      return { success: true, message: 'Table already exists!' };
    }

    // If we get here, the table doesn't exist, so we need to create it
    // Since we can't use RPC, we'll need to show instructions to the user
    console.log('Table does not exist. Please create it manually in Supabase.');

    const sqlScript = `-- Create partial_payment_agreement_forms table
CREATE TABLE IF NOT EXISTS partial_payment_agreement_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

    -- Agreement Details
    agreement_date DATE NOT NULL,
    provider_license_number TEXT,

    -- Patient Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,

    -- Payment Details
    payment_amount TEXT NOT NULL,
    payment_date DATE NOT NULL,
    estimated_total_cost TEXT NOT NULL,
    remaining_balance TEXT,
    final_payment_due_date DATE NOT NULL,

    -- Treatment Selection
    selected_treatments TEXT[] DEFAULT '{}',

    -- Patient Acknowledgments
    read_and_understood BOOLEAN DEFAULT FALSE,
    understand_refund_policy BOOLEAN DEFAULT FALSE,
    understand_full_payment_required BOOLEAN DEFAULT FALSE,
    agree_no_disputes BOOLEAN DEFAULT FALSE,
    understand_one_year_validity BOOLEAN DEFAULT FALSE,
    understand_no_cash_payments BOOLEAN DEFAULT FALSE,
    entering_voluntarily BOOLEAN DEFAULT FALSE,

    -- Signatures
    patient_signature TEXT,
    patient_signature_date DATE,
    patient_full_name TEXT,
    provider_representative_name TEXT,
    provider_representative_title TEXT,
    practice_signature_date DATE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partial_payment_agreement_forms_patient_id ON partial_payment_agreement_forms(patient_id);
CREATE INDEX IF NOT EXISTS idx_partial_payment_agreement_forms_created_at ON partial_payment_agreement_forms(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE partial_payment_agreement_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view partial payment agreement forms" ON partial_payment_agreement_forms
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Users can insert partial payment agreement forms" ON partial_payment_agreement_forms
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Users can update partial payment agreement forms" ON partial_payment_agreement_forms
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Users can delete partial payment agreement forms" ON partial_payment_agreement_forms
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_partial_payment_agreement_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_partial_payment_agreement_forms_updated_at
    BEFORE UPDATE ON partial_payment_agreement_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_partial_payment_agreement_forms_updated_at();`;

    console.log('SQL Script to run in Supabase:');
    console.log(sqlScript);

    return {
      success: false,
      message: 'Please run the SQL script manually in Supabase SQL Editor',
      sqlScript: sqlScript
    };
    
  } catch (error) {
    console.error('Failed to create table:', error);
    return { success: false, error: error };
  }
}
