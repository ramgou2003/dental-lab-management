-- Migration to update treatment_recommendations to use arrays for upperTreatment and lowerTreatment
-- This migration converts existing string values to arrays for multiple selection support

-- Function to migrate treatment recommendations from string to array format
CREATE OR REPLACE FUNCTION migrate_treatment_recommendations_to_arrays()
RETURNS void AS $$
DECLARE
    consultation_record RECORD;
    updated_recommendations JSONB;
BEGIN
    -- Loop through all consultations with treatment_recommendations
    FOR consultation_record IN 
        SELECT id, treatment_recommendations 
        FROM consultations 
        WHERE treatment_recommendations IS NOT NULL
    LOOP
        -- Check if treatment_recommendations has the old format (string values)
        IF consultation_record.treatment_recommendations ? 'upperTreatment' 
           AND jsonb_typeof(consultation_record.treatment_recommendations->'upperTreatment') = 'string' THEN
            
            -- Create updated recommendations with array format
            updated_recommendations := consultation_record.treatment_recommendations;
            
            -- Convert upperTreatment from string to array
            IF consultation_record.treatment_recommendations->>'upperTreatment' != '' THEN
                updated_recommendations := jsonb_set(
                    updated_recommendations,
                    '{upperTreatment}',
                    jsonb_build_array(consultation_record.treatment_recommendations->>'upperTreatment')
                );
            ELSE
                updated_recommendations := jsonb_set(
                    updated_recommendations,
                    '{upperTreatment}',
                    '[]'::jsonb
                );
            END IF;
            
            -- Convert lowerTreatment from string to array
            IF consultation_record.treatment_recommendations->>'lowerTreatment' != '' THEN
                updated_recommendations := jsonb_set(
                    updated_recommendations,
                    '{lowerTreatment}',
                    jsonb_build_array(consultation_record.treatment_recommendations->>'lowerTreatment')
                );
            ELSE
                updated_recommendations := jsonb_set(
                    updated_recommendations,
                    '{lowerTreatment}',
                    '[]'::jsonb
                );
            END IF;
            
            -- Update the consultation record
            UPDATE consultations 
            SET treatment_recommendations = updated_recommendations,
                updated_at = NOW()
            WHERE id = consultation_record.id;
            
            RAISE NOTICE 'Migrated consultation % from string to array format', consultation_record.id;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Treatment recommendations migration to arrays completed';
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_treatment_recommendations_to_arrays();

-- Drop the migration function as it's no longer needed
DROP FUNCTION migrate_treatment_recommendations_to_arrays();

-- Add a comment to document this migration
COMMENT ON TABLE consultations IS 'Stores comprehensive consultation data including clinical assessment, treatment recommendations (with array-based upperTreatment and lowerTreatment for multiple selections), financial decisions, and outcomes';
