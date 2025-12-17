-- Migration to capitalize first letter of first_name and last_name in patients table
-- This ensures proper name capitalization: "john doe" -> "John Doe"

-- Step 1: Create a function to capitalize the first letter of a string
CREATE OR REPLACE FUNCTION capitalize_first_letter(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF input_text IS NULL OR input_text = '' THEN
    RETURN input_text;
  END IF;
  
  -- Capitalize first letter, lowercase the rest
  RETURN UPPER(SUBSTRING(input_text FROM 1 FOR 1)) || LOWER(SUBSTRING(input_text FROM 2));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 2: Create a trigger function to capitalize names before insert/update
CREATE OR REPLACE FUNCTION capitalize_patient_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Capitalize first_name
  IF NEW.first_name IS NOT NULL THEN
    NEW.first_name := capitalize_first_letter(TRIM(NEW.first_name));
  END IF;
  
  -- Capitalize last_name
  IF NEW.last_name IS NOT NULL THEN
    NEW.last_name := capitalize_first_letter(TRIM(NEW.last_name));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to run before insert or update
DROP TRIGGER IF EXISTS trigger_capitalize_patient_names ON patients;
CREATE TRIGGER trigger_capitalize_patient_names
  BEFORE INSERT OR UPDATE OF first_name, last_name ON patients
  FOR EACH ROW
  EXECUTE FUNCTION capitalize_patient_names();

-- Step 4: Update existing patient names to be capitalized
UPDATE patients
SET 
  first_name = capitalize_first_letter(TRIM(first_name)),
  last_name = capitalize_first_letter(TRIM(last_name))
WHERE 
  first_name IS NOT NULL 
  OR last_name IS NOT NULL;

-- Step 5: Drop and recreate the full_name generated column with capitalization
-- First, drop the existing generated column
ALTER TABLE patients DROP COLUMN IF EXISTS full_name;

-- Recreate it with capitalized names
ALTER TABLE patients 
ADD COLUMN full_name TEXT 
GENERATED ALWAYS AS (
  capitalize_first_letter(TRIM(first_name)) || ' ' || capitalize_first_letter(TRIM(last_name))
) STORED;

-- Add comment for documentation
COMMENT ON FUNCTION capitalize_first_letter(TEXT) IS 'Capitalizes the first letter of a string and lowercases the rest';
COMMENT ON FUNCTION capitalize_patient_names() IS 'Trigger function to automatically capitalize patient first_name and last_name';
COMMENT ON COLUMN patients.full_name IS 'Auto-generated full name from first_name and last_name with proper capitalization';

