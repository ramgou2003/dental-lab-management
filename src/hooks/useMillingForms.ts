import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface MillingForm {
  id: string;
  manufacturing_item_id: string;
  patient_name: string;
  milling_location: 'in-house' | 'micro-dental-lab' | 'haus-milling' | 'evolution';
  gingiva_color: 'light' | 'medium' | 'dark' | 'custom' | null;
  stained_and_glazed: 'yes' | 'no' | null;
  cementation: 'yes' | 'no' | null;
  additional_notes: string | null;
  upper_appliance_type: string | null;
  lower_appliance_type: string | null;
  upper_appliance_number: string | null;
  lower_appliance_number: string | null;
  shade: string | null;
  screw: string | null;
  material: string | null;
  arch_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMillingFormData {
  manufacturing_item_id: string;
  patient_name: string;
  milling_location: 'in-house' | 'micro-dental-lab' | 'haus-milling' | 'evolution';
  gingiva_color?: 'light' | 'medium' | 'dark' | 'custom';
  stained_and_glazed?: 'yes' | 'no';
  cementation?: 'yes' | 'no';
  additional_notes?: string;
  upper_appliance_type?: string;
  lower_appliance_type?: string;
  upper_appliance_number?: string;
  lower_appliance_number?: string;
  shade?: string;
  screw?: string;
  material?: string;
  arch_type?: string;
}

export function useMillingForms() {
  const [millingForms, setMillingForms] = useState<MillingForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMillingForms = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('milling_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        console.error('Failed to load milling forms:', error);
        return;
      }

      setMillingForms(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createMillingForm = async (formData: CreateMillingFormData): Promise<MillingForm | null> => {
    try {
      const { data, error } = await supabase
        .from('milling_forms')
        .insert([formData])
        .select()
        .single();

      if (error) {
        console.error('Error creating milling form:', error);
        throw error;
      }

      // Update local state
      setMillingForms(prev => [data, ...prev]);

      console.log('Milling form created successfully');
      return data;
    } catch (error) {
      console.error('Error creating milling form:', error);
      throw error;
    }
  };

  const getMillingFormByManufacturingItemId = async (manufacturingItemId: string): Promise<MillingForm | null> => {
    try {
      const { data, error } = await supabase
        .from('milling_forms')
        .select('*')
        .eq('manufacturing_item_id', manufacturingItemId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching milling form:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const updateMillingForm = async (id: string, updates: Partial<CreateMillingFormData>): Promise<MillingForm | null> => {
    try {
      const { data, error } = await supabase
        .from('milling_forms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating milling form:', error);
        throw error;
      }

      // Update local state
      setMillingForms(prev =>
        prev.map(form =>
          form.id === id ? data : form
        )
      );

      console.log('Milling form updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating milling form:', error);
      throw error;
    }
  };

  const deleteMillingForm = async (id: string) => {
    try {
      const { error } = await supabase
        .from('milling_forms')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting milling form:', error);
        throw error;
      }

      // Update local state
      setMillingForms(prev => prev.filter(form => form.id !== id));

      console.log('Milling form deleted successfully');
    } catch (error) {
      console.error('Error deleting milling form:', error);
      throw error;
    }
  };

  // Set up real-time subscription for milling forms
  useEffect(() => {
    fetchMillingForms();

    // Subscribe to real-time changes only if supabase.channel is available
    let subscription: any = null;

    if (typeof supabase.channel === 'function') {
      subscription = supabase
        .channel('milling_forms_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'milling_forms'
          },
          (payload) => {
            console.log('Milling forms change received:', payload);
            fetchMillingForms(); // Refetch data when changes occur
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  return {
    millingForms,
    loading,
    error,
    fetchMillingForms,
    createMillingForm,
    getMillingFormByManufacturingItemId,
    updateMillingForm,
    deleteMillingForm
  };
}
