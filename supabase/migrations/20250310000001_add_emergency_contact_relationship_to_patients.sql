-- Add emergency_contact_relationship column to patients table
-- This migration adds the emergency_contact_relationship field to store the relationship of the emergency contact

-- Add the emergency_contact_relationship column to the patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

-- Add a comment to document the new column
COMMENT ON COLUMN patients.emergency_contact_relationship IS 'Relationship of the emergency contact to the patient (e.g., Spouse, Parent, Sibling)';

