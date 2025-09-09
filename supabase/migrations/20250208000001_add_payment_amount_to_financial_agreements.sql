-- Add payment_amount column to financial_agreements table
-- This migration adds the missing payment_amount field that is collected in the form but not stored

-- Add the payment_amount column to the financial_agreements table
ALTER TABLE financial_agreements 
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2);

-- Add a comment to document the new column
COMMENT ON COLUMN financial_agreements.payment_amount IS 'Payment amount for recurring payments (per month, twice a month, etc.)';

-- Update the table comment to reflect the new column
COMMENT ON TABLE financial_agreements IS 'Stores comprehensive financial agreement and payment terms data including payment amounts';
