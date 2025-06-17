import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ManufacturingItem } from './useManufacturingItems';

export function usePatientManufacturingItems(patientId: string | undefined) {
  const [manufacturingItems, setManufacturingItems] = useState<ManufacturingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientManufacturingItems = async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // First get the patient name from the patient ID
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('first_name, last_name')
        .eq('id', patientId)
        .single();

      if (patientError) {
        console.error('Error fetching patient data:', patientError);
        setManufacturingItems([]);
        setError(null);
        setLoading(false);
        return;
      }

      const patientFullName = `${patientData.first_name} ${patientData.last_name}`;

      const { data, error } = await supabase
        .from('manufacturing_items')
        .select('*')
        .eq('patient_name', patientFullName)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patient manufacturing items:', error);
        // No fallback data - if there's an error or no data, show empty state
        setManufacturingItems([]);
        setError(null);
        setLoading(false);
        return;
      }

      setManufacturingItems(data || []);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch manufacturing items');
      setManufacturingItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateManufacturingItemStatus = async (id: string, newStatus: 'pending-printing' | 'in-production' | 'quality-check' | 'completed') => {
    try {
      const { error } = await supabase
        .from('manufacturing_items')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating manufacturing item status:', error);
        throw error;
      }

      // Update local state
      setManufacturingItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status: newStatus, updated_at: new Date().toISOString() } : item
        )
      );
    } catch (err) {
      console.error('Error updating manufacturing item status:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPatientManufacturingItems();
  }, [patientId]);

  return {
    manufacturingItems,
    loading,
    error,
    updateManufacturingItemStatus,
    refetch: fetchPatientManufacturingItems
  };
}
