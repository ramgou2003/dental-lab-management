-- Remove patient_packets_view to simplify patient packet data structure
-- We now use only the new_patient_packets table directly

-- Drop the view if it exists
DROP VIEW IF EXISTS patient_packets_view;

-- Add comment to document the change
COMMENT ON TABLE new_patient_packets IS 'Single table for all patient packet data. Previously had a view (patient_packets_view) that joined with patients and leads tables, but this has been removed to simplify the data structure. Application code now handles joins when needed.';
