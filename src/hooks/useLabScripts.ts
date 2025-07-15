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
  material?: string;
  shade?: string;
  vdo_details?: string;
  is_nightguard_needed?: string;
  requested_date: string;
  due_date?: string;
  instructions?: string;
  notes?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed' | 'hold';
  comments?: Array<{id: string, comment_text: string, author_name: string | null, author_role: string | null, created_at: string, updated_at: string}>;
  lab_script_comments?: Array<{id: string, comment_text: string, author_name: string | null, author_role: string | null, created_at: string, updated_at: string}>;
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
        .select(`
          *,
          lab_script_comments (
            id,
            comment_text,
            author_name,
            author_role,
            created_at,
            updated_at
          )
        `)
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
            material: 'Zirconia',
            shade: 'A2',
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
            material: 'Titanium',
            shade: 'B1',
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
            material: 'Acrylic',
            shade: 'Clear',
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
            material: 'Ceramic',
            shade: 'A3',
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

      // Process the data to format comments properly
      const processedData = (data || []).map(script => ({
        ...script,
        comments: script.lab_script_comments || []
      }));

      setLabScripts(processedData);
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

      // Immediately update local state for the user who created it
      const newLabScript: LabScript = {
        ...data,
        comments: []
      };

      setLabScripts(prev => {
        // Check if script already exists to avoid duplicates
        if (prev.some(script => script.id === newLabScript.id)) {
          return prev;
        }
        // Insert at the beginning (most recent first)
        return [newLabScript, ...prev];
      });

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

      // Immediately update local state for the user who updated it
      setLabScripts(prev =>
        prev.map(script =>
          script.id === id
            ? { ...script, ...updates }
            : script
        )
      );

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

      // Immediately update local state for the user who deleted it
      setLabScripts(prev => prev.filter(script => script.id !== id));
    } catch (err) {
      console.error('Error deleting lab script:', err);
      throw err;
    }
  };

  // Load lab scripts and set up real-time subscription
  useEffect(() => {
    fetchLabScripts();

    // Subscribe to real-time changes only if supabase.channel is available
    let subscription: any = null;

    if (typeof supabase.channel === 'function') {
      subscription = supabase
        .channel('lab_scripts_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'lab_scripts'
          },
          (payload) => {
            console.log('🔄 Real-time lab script change received:', payload.eventType, payload);

            // Handle different types of changes efficiently
            if (payload.eventType === 'INSERT' && payload.new) {
              // Add new lab script to existing list
              setLabScripts(prev => {
                // Check if script already exists to avoid duplicates
                if (prev.some(script => script.id === payload.new.id)) {
                  return prev;
                }
                // Insert at the beginning (most recent first)
                return [{ ...payload.new, comments: [] } as LabScript, ...prev];
              });

            } else if (payload.eventType === 'UPDATE' && payload.new) {
              // Update specific lab script in the list
              setLabScripts(prev =>
                prev.map(script =>
                  script.id === payload.new.id
                    ? { ...payload.new, comments: script.comments || [] } as LabScript
                    : script
                )
              );

            } else if (payload.eventType === 'DELETE' && payload.old) {
              // Remove deleted lab script from the list
              setLabScripts(prev => prev.filter(script => script.id !== payload.old.id));
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Lab scripts real-time subscription status:', status);
        });
    } else {
      console.warn('⚠️ Supabase real-time not available - lab scripts will not update in real-time');
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
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
