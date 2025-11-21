-- Add discount column to treatment_plan_forms table
ALTER TABLE treatment_plan_forms 
ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2) DEFAULT 0;

COMMENT ON COLUMN treatment_plan_forms.discount IS 'Discount amount to be applied to the treatment plan total cost';

