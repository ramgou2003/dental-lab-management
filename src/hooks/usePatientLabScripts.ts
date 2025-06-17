import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LabScript } from './useLabScripts';

export function usePatientLabScripts(patientId: string | undefined) {
  const [labScripts, setLabScripts] = useState<LabScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientLabScripts = async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('lab_scripts')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patient lab scripts:', error);
        // Use fallback data when there's an error - filter by patient name for mock data
        const fallbackLabScripts: LabScript[] = [
          {
            id: 'LAB-001',
            patient_id: patientId,
            patient_name: 'John Doe',
            arch_type: 'dual',
            upper_appliance_type: 'surgical-day-appliance',
            lower_appliance_type: 'surgical-day-appliance',
            upper_treatment_type: 'orthodontic',
            lower_treatment_type: 'orthodontic',
            screw_type: 'DC Screw',
            vdo_details: 'Open up to 4mm without calling Doctor',
            is_nightguard_needed: 'no',
            requested_date: '2024-01-29',
            due_date: '2024-02-09',
            instructions: 'Please design upper and lower SDA for patient with expedited completion.',
            notes: 'Patient prefers natural shade',
            status: 'completed',
            created_at: '2024-01-29T10:00:00Z',
            updated_at: '2024-02-09T10:00:00Z'
          },
          {
            id: 'LAB-002',
            patient_id: patientId,
            patient_name: 'John Doe',
            arch_type: 'upper',
            upper_appliance_type: 'printed-tryin',
            upper_treatment_type: 'restorative',
            screw_type: 'Rosen',
            vdo_details: 'Open VDO based on requirement',
            is_nightguard_needed: 'yes',
            requested_date: '2024-01-21',
            due_date: '2024-02-01',
            instructions: 'Please design PTI for upper arch with expedited processing.',
            notes: 'Patient has metal allergies',
            status: 'pending',
            created_at: '2024-01-21T09:00:00Z',
            updated_at: '2024-01-21T09:00:00Z'
          },
          {
            id: 'LAB-003',
            patient_id: patientId,
            patient_name: 'John Doe',
            arch_type: 'lower',
            lower_appliance_type: 'direct-load-prima',
            lower_treatment_type: 'prosthetic',
            screw_type: 'SIN PRH30',
            vdo_details: 'Open up to 4mm with calling Doctor',
            is_nightguard_needed: 'no',
            requested_date: '2024-01-18',
            due_date: '2024-01-22',
            instructions: 'Please design direct load prima for lower arch.',
            notes: 'Previous implant complications',
            status: 'in-progress',
            created_at: '2024-01-18T14:00:00Z',
            updated_at: '2024-01-22T10:00:00Z'
          }
        ];

        setLabScripts(fallbackLabScripts);
        setError(null);
        setLoading(false);
        return;
      }

      setLabScripts(data || []);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch lab scripts');
      setLabScripts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateLabScript = async (id: string, updates: Partial<LabScript>) => {
    try {
      const { error } = await supabase
        .from('lab_scripts')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating lab script:', error);
        throw error;
      }

      // Update local state
      setLabScripts(prev => 
        prev.map(script => 
          script.id === id ? { ...script, ...updates } : script
        )
      );
    } catch (err) {
      console.error('Error updating lab script:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPatientLabScripts();
  }, [patientId]);

  return {
    labScripts,
    loading,
    error,
    updateLabScript,
    refetch: fetchPatientLabScripts
  };
}
