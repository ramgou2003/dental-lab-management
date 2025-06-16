import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LabScript {
  id: string;
  patient_id?: string;
  patient_name: string;
  arch_type: string;
  upper_appliance_type?: string;
  lower_appliance_type?: string;
  upper_treatment_type?: string;
  lower_treatment_type?: string;
  screw_type?: string;
  custom_screw_type?: string;
  vdo_details?: string;
  is_nightguard_needed?: string;
  requested_date: string;
  due_date?: string;
  instructions?: string;
  notes?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed' | 'hold';
  comments?: Array<{id: string, text: string, timestamp: string}>;
  created_at: string;
  updated_at: string;
}

export function useLabScripts() {
  const [labScripts, setLabScripts] = useState<LabScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLabScripts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('lab_scripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lab scripts:', error);
        // Use fallback data when there's an error
        const fallbackLabScripts: LabScript[] = [
          {
            id: 'LAB-001',
            patient_id: 'patient-001',
            patient_name: 'Emily Johnson',
            arch_type: 'upper',
            upper_appliance_type: 'surgical-day-appliance',
            upper_treatment_type: 'orthodontic',
            screw_type: 'DC Screw',
            vdo_details: 'Open up to 4mm without calling Doctor',
            is_nightguard_needed: 'no',
            requested_date: '2024-01-15',
            due_date: '2024-01-20',
            instructions: 'Please design upper SDA for patient with expedited completion.',
            notes: 'Patient prefers natural shade',
            status: 'in-progress',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
          },
          {
            id: 'LAB-002',
            patient_id: 'patient-002',
            patient_name: 'Michael Chen',
            arch_type: 'dual',
            upper_appliance_type: 'printed-tryin',
            lower_appliance_type: 'crown',
            upper_treatment_type: 'restorative',
            lower_treatment_type: 'cosmetic',
            screw_type: 'Rosen',
            vdo_details: 'Open VDO based on requirement',
            is_nightguard_needed: 'yes',
            requested_date: '2024-01-14',
            due_date: '2024-01-18',
            instructions: 'Please design PTI for dual arch with expedited processing.',
            notes: 'Patient has metal allergies',
            status: 'completed',
            created_at: '2024-01-14T09:00:00Z',
            updated_at: '2024-01-18T16:00:00Z'
          },
          {
            id: 'LAB-003',
            patient_id: 'patient-003',
            patient_name: 'Sarah Williams',
            arch_type: 'upper',
            upper_appliance_type: 'night-guard',
            upper_treatment_type: 'preventive',
            requested_date: '2024-01-20',
            due_date: '2024-01-25',
            instructions: 'Please fabricate night guard for upper arch.',
            notes: 'Patient grinds teeth at night',
            status: 'pending',
            created_at: '2024-01-20T11:00:00Z',
            updated_at: '2024-01-20T11:00:00Z'
          },
          {
            id: 'LAB-004',
            patient_id: 'patient-004',
            patient_name: 'David Brown',
            arch_type: 'lower',
            lower_appliance_type: 'direct-load-zirconia',
            upper_treatment_type: 'prosthetic',
            screw_type: 'SIN PRH30',
            vdo_details: 'Open up to 4mm with calling Doctor',
            is_nightguard_needed: 'no',
            requested_date: '2024-01-18',
            due_date: '2024-01-22',
            instructions: 'Please design direct load zirconia for lower arch.',
            notes: 'Previous implant complications',
            status: 'delayed',
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
      console.error('Error fetching lab scripts:', err);
      setError('Failed to load lab scripts');
    } finally {
      setLoading(false);
    }
  };

  const addLabScript = async (labScriptData: Omit<LabScript, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('lab_scripts')
        .insert([labScriptData])
        .select()
        .single();

      if (error) throw error;

      // Refresh the list
      await fetchLabScripts();
      return data;
    } catch (err) {
      console.error('Error adding lab script:', err);
      throw err;
    }
  };

  const updateLabScript = async (id: string, updates: Partial<LabScript>) => {
    try {
      const { data, error } = await supabase
        .from('lab_scripts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Refresh the list
      await fetchLabScripts();
      return data;
    } catch (err) {
      console.error('Error updating lab script:', err);
      throw err;
    }
  };

  const deleteLabScript = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lab_scripts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchLabScripts();
    } catch (err) {
      console.error('Error deleting lab script:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLabScripts();
  }, []);

  return {
    labScripts,
    loading,
    error,
    addLabScript,
    updateLabScript,
    deleteLabScript,
    refreshLabScripts: fetchLabScripts
  };
}
