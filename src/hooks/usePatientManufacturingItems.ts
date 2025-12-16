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

      // Fetch manufacturing items by patient_id
      const { data, error } = await supabase
        .from('manufacturing_items')
        .select('*')
        .eq('patient_id', patientId)
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

  const updateManufacturingItemStatus = async (id: string, newStatus: 'pending-printing' | 'in-production' | 'milling' | 'in-transit' | 'quality-check' | 'completed') => {
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

  // Load patient manufacturing items and set up real-time subscription
  useEffect(() => {
    fetchPatientManufacturingItems();

    // Subscribe to real-time changes only if supabase.channel is available and patientId exists
    let subscription: any = null;

    if (patientId && typeof supabase.channel === 'function') {
      subscription = supabase
        .channel(`patient_manufacturing_items_${patientId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'manufacturing_items'
          },
          (payload) => {
            console.log('🔄 Real-time patient manufacturing item change received:', payload.eventType, payload);

            // We need to check if this change affects this patient
            // Since we filter by patient_name, we need to refetch to be safe
            // or implement more complex filtering logic
            fetchPatientManufacturingItems();
          }
        )
        .subscribe((status) => {
          console.log('📡 Patient manufacturing items real-time subscription status:', status);
        });
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [patientId]);

  return {
    manufacturingItems,
    loading,
    error,
    updateManufacturingItemStatus,
    refetch: fetchPatientManufacturingItems
  };
}
