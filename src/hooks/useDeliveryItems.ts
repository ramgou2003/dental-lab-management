import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DeliveryItem {
  id: string;
  manufacturing_item_id: string;
  lab_report_card_id: string;
  lab_script_id: string;
  patient_id: string | null;
  patient_name: string;
  upper_appliance_type: string | null;
  lower_appliance_type: string | null;
  shade: string;
  arch_type: string;
  upper_appliance_number: string | null;
  lower_appliance_number: string | null;
  delivery_status: 'ready-to-insert' | 'ready-for-delivery' | 'patient-scheduled' | 'inserted' | 'returned';
  delivery_address: string | null;
  delivery_notes: string | null;
  scheduled_delivery_date: string | null;
  scheduled_delivery_time: string | null;
  actual_delivery_date: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export function useDeliveryItems() {
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(false); // Start with false for faster UI
  const { toast } = useToast();

  const fetchDeliveryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('delivery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching delivery items:', error);
        toast({
          title: "Error",
          description: "Failed to fetch delivery items",
          variant: "destructive",
        });
        return;
      }

      setDeliveryItems(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch delivery items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load delivery items and set up real-time subscription
  useEffect(() => {
    fetchDeliveryItems();

    // Subscribe to real-time changes only if supabase.channel is available
    let subscription: any = null;

    if (typeof supabase.channel === 'function') {
      subscription = supabase
        .channel('delivery_items_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'delivery_items'
          },
          (payload) => {
            console.log('🔄 Real-time delivery item change received:', payload.eventType, payload);

            // Handle different types of changes efficiently
            if (payload.eventType === 'INSERT' && payload.new) {
              // Add new delivery item to existing list
              setDeliveryItems(prev => {
                // Check if item already exists to avoid duplicates
                if (prev.some(item => item.id === payload.new.id)) {
                  return prev;
                }
                // Insert at the beginning (most recent first)
                return [payload.new as DeliveryItem, ...prev];
              });

            } else if (payload.eventType === 'UPDATE' && payload.new) {
              // Update specific delivery item in the list
              setDeliveryItems(prev =>
                prev.map(item =>
                  item.id === payload.new.id ? payload.new as DeliveryItem : item
                )
              );

            } else if (payload.eventType === 'DELETE' && payload.old) {
              // Remove deleted delivery item from the list
              setDeliveryItems(prev => prev.filter(item => item.id !== payload.old.id));
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Delivery items real-time subscription status:', status);
        });
    } else {
      console.warn('⚠️ Supabase real-time not available - delivery items will not update in real-time');
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const updateDeliveryStatus = async (
    deliveryItemId: string,
    newStatus: DeliveryItem['delivery_status'],
    deliveryData?: {
      delivery_address?: string;
      delivery_notes?: string;
      scheduled_delivery_date?: string;
      scheduled_delivery_time?: string;
      tracking_number?: string;
    }
  ) => {
    try {
      const updateData: any = {
        delivery_status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Add delivery data if provided
      if (deliveryData) {
        if (deliveryData.delivery_address) updateData.delivery_address = deliveryData.delivery_address;
        if (deliveryData.delivery_notes) updateData.delivery_notes = deliveryData.delivery_notes;
        if (deliveryData.scheduled_delivery_date) updateData.scheduled_delivery_date = deliveryData.scheduled_delivery_date;
        if (deliveryData.scheduled_delivery_time) updateData.scheduled_delivery_time = deliveryData.scheduled_delivery_time;
        if (deliveryData.tracking_number) updateData.tracking_number = deliveryData.tracking_number;
      }

      // Set actual delivery date when status is 'inserted'
      if (newStatus === 'inserted') {
        updateData.actual_delivery_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('delivery_items')
        .update(updateData)
        .eq('id', deliveryItemId);

      if (error) {
        console.error('Error updating delivery status:', error);
        toast({
          title: "Error",
          description: "Failed to update delivery status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Delivery status updated to ${newStatus.replace('-', ' ')}`,
      });

      // Refresh the list
      await fetchDeliveryItems();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    }
  };

  const addDeliveryItem = async (deliveryData: Partial<DeliveryItem>) => {
    try {
      const { data, error } = await supabase
        .from('delivery_items')
        .insert([deliveryData])
        .select()
        .single();

      if (error) {
        console.error('Error adding delivery item:', error);
        toast({
          title: "Error",
          description: "Failed to add delivery item",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Delivery item added successfully",
      });

      // Refresh the list
      await fetchDeliveryItems();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const deleteDeliveryItem = async (deliveryItemId: string) => {
    try {
      const { error } = await supabase
        .from('delivery_items')
        .delete()
        .eq('id', deliveryItemId);

      if (error) {
        console.error('Error deleting delivery item:', error);
        toast({
          title: "Error",
          description: "Failed to delete delivery item",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Delivery item deleted successfully",
      });

      // Refresh the list
      await fetchDeliveryItems();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete delivery item",
        variant: "destructive",
      });
    }
  };

  return {
    deliveryItems,
    loading,
    fetchDeliveryItems,
    updateDeliveryStatus,
    addDeliveryItem,
    deleteDeliveryItem,
  };
}
