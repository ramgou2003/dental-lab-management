-- Migration to sync all existing completed patient packets to medical_history table
-- This will create medical_history records for all patients who have completed patient packets

DO $$
DECLARE
  packet_record RECORD;
  existing_history_id UUID;
  new_history_id UUID;
BEGIN
  -- Loop through all completed patient packets that have a patient_id
  FOR packet_record IN
    SELECT
      id,
      patient_id,
      critical_conditions,
      system_specific,
      additional_conditions,
      recent_health_changes,
      allergies,
      current_medications,
      current_pharmacy_name,
      current_pharmacy_city,
      anxiety_control,
      pain_injection,
      communication,
      sensory_sensitivities,
      physical_comfort,
      service_preferences,
      other_concerns,
      created_at,
      updated_at
    FROM new_patient_packets
    WHERE patient_id IS NOT NULL
      AND form_status = 'completed'
    ORDER BY patient_id, created_at DESC
  LOOP
    -- Check if medical history already exists for this packet
    SELECT id INTO existing_history_id
    FROM medical_history
    WHERE patient_packet_id = packet_record.id;

    IF existing_history_id IS NULL THEN
      -- No existing record for this packet, check if patient has any active medical history
      SELECT id INTO existing_history_id
      FROM medical_history
      WHERE patient_id = packet_record.patient_id
        AND is_active = true;

      IF existing_history_id IS NOT NULL THEN
        -- Deactivate the existing active record
        UPDATE medical_history
        SET is_active = false
        WHERE id = existing_history_id;
        
        RAISE NOTICE 'Deactivated existing medical history % for patient %', existing_history_id, packet_record.patient_id;
      END IF;

      -- Create new medical history record from this packet
      INSERT INTO medical_history (
        patient_id,
        patient_packet_id,
        critical_conditions,
        system_specific,
        additional_conditions,
        recent_health_changes,
        allergies,
        current_medications,
        current_pharmacy,
        anxiety_control,
        pain_injection,
        communication,
        sensory_sensitivities,
        physical_comfort,
        service_preferences,
        other_concerns,
        source,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        packet_record.patient_id,
        packet_record.id,
        COALESCE(packet_record.critical_conditions, '{}'::jsonb),
        COALESCE(packet_record.system_specific, '{}'::jsonb),
        COALESCE(packet_record.additional_conditions, ARRAY[]::text[]),
        COALESCE(packet_record.recent_health_changes, '{}'::jsonb),
        COALESCE(packet_record.allergies, '{}'::jsonb),
        COALESCE(packet_record.current_medications, '{}'::jsonb),
        jsonb_build_object(
          'name', COALESCE(packet_record.current_pharmacy_name, ''),
          'city', COALESCE(packet_record.current_pharmacy_city, '')
        ),
        COALESCE(packet_record.anxiety_control, ARRAY[]::text[]),
        COALESCE(packet_record.pain_injection, ARRAY[]::text[]),
        COALESCE(packet_record.communication, ARRAY[]::text[]),
        COALESCE(packet_record.sensory_sensitivities, ARRAY[]::text[]),
        COALESCE(packet_record.physical_comfort, ARRAY[]::text[]),
        COALESCE(packet_record.service_preferences, ARRAY[]::text[]),
        COALESCE(packet_record.other_concerns, ''),
        'patient_packet',
        true,
        packet_record.created_at,
        packet_record.updated_at
      )
      RETURNING id INTO new_history_id;

      RAISE NOTICE 'Created medical history % for patient % from packet %', 
        new_history_id, packet_record.patient_id, packet_record.id;
    ELSE
      RAISE NOTICE 'Medical history already exists for packet %', packet_record.id;
    END IF;
  END LOOP;

  RAISE NOTICE 'Migration completed successfully';
END $$;

-- Add comment
COMMENT ON TABLE medical_history IS 'Stores patient medical history, allergies, medications, and comfort preferences. Synced from patient packets or entered manually.';

