import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LabReportCard {
  id: string;
  lab_script_id: string | null;
  patient_name: string;
  arch_type: string;
  upper_appliance_type: string | null;
  lower_appliance_type: string | null;
  screw: string;
  shade: string;
  implant_on_upper: string | null;
  implant_on_lower: string | null;
  tooth_library_upper: string | null;
  tooth_library_lower: string | null;
  upper_appliance_number: string | null;
  lower_appliance_number: string | null;
  notes_and_remarks: string;
  status: 'completed' | 'submitted';
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface LabReportCardFormData {
  patient_name: string;
  arch_type: string;
  upper_appliance_type: string;
  lower_appliance_type: string;
  screw: string;
  shade: string;
  implant_on_upper: string;
  implant_on_lower: string;
  tooth_library_upper: string;
  tooth_library_lower: string;
  upper_appliance_number: string;
  lower_appliance_number: string;
  notes_and_remarks: string;
}

export function useLabReportCards() {
  const [labReportCards, setLabReportCards] = useState<LabReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLabReportCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('lab_report_cards')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching lab report cards:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to load lab report cards",
          variant: "destructive",
        });
        return;
      }

      setLabReportCards(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addLabReportCard = async (formData: LabReportCardFormData, labScriptId: string) => {
    try {
      const { data, error } = await supabase
        .from('lab_report_cards')
        .upsert([{
          lab_script_id: labScriptId,
          patient_name: formData.patient_name,
          arch_type: formData.arch_type,
          upper_appliance_type: formData.upper_appliance_type || null,
          lower_appliance_type: formData.lower_appliance_type || null,
          screw: formData.screw,
          shade: formData.shade,
          implant_on_upper: formData.implant_on_upper || null,
          implant_on_lower: formData.implant_on_lower || null,
          tooth_library_upper: formData.tooth_library_upper || null,
          tooth_library_lower: formData.tooth_library_lower || null,
          upper_appliance_number: formData.upper_appliance_number || null,
          lower_appliance_number: formData.lower_appliance_number || null,
          notes_and_remarks: formData.notes_and_remarks,
          status: 'completed'
        }], {
          onConflict: 'lab_script_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding lab report card:', error);
        toast({
          title: "Error",
          description: "Failed to submit lab report card",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Lab report card submitted successfully",
      });

      // Refresh the list
      await fetchLabReportCards();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const updateLabReportCard = async (id: string, updates: Partial<LabReportCardFormData>) => {
    try {
      const { data, error } = await supabase
        .from('lab_report_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lab report card:', error);
        toast({
          title: "Error",
          description: "Failed to update lab report card",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Lab report card updated successfully",
      });

      // Refresh the list
      await fetchLabReportCards();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const deleteLabReportCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lab_report_cards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting lab report card:', error);
        toast({
          title: "Error",
          description: "Failed to delete lab report card",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Lab report card deleted successfully",
      });

      // Refresh the list
      await fetchLabReportCards();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const getLabReportCardByLabScriptId = async (labScriptId: string): Promise<LabReportCard | null> => {
    try {
      const { data, error } = await supabase
        .from('lab_report_cards')
        .select('*')
        .eq('lab_script_id', labScriptId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching lab report card:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchLabReportCards();
  }, []);

  return {
    labReportCards,
    loading,
    error,
    fetchLabReportCards,
    addLabReportCard,
    updateLabReportCard,
    deleteLabReportCard,
    getLabReportCardByLabScriptId
  };
}
