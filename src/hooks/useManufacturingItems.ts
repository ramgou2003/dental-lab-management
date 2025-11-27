import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ManufacturingItem {
  id: string;
  lab_report_card_id: string;
  lab_script_id: string;
  patient_name: string;
  upper_appliance_type: string | null;
  lower_appliance_type: string | null;
  shade: string;
  screw: string | null;
  material: string | null;
  arch_type: string;
  upper_appliance_number: string | null;
  lower_appliance_number: string | null;
  manufacturing_method: 'milling' | 'printing' | null;
  milling_location: string | null;
  gingiva_color: string | null;
  stained_and_glazed: string | null;
  cementation: string | null;
  additional_notes: string | null;
  status: 'pending-printing' | 'pending-milling' | 'in-production' | 'milling' | 'in-transit' | 'quality-check' | 'completed';
  printing_completed_at: string | null;
  printing_completed_by: string | null;
  printing_completed_by_name: string | null;
  inspection_print_quality: 'pass' | 'fail' | null;
  inspection_physical_defects: 'pass' | 'fail' | null;
  inspection_screw_access_channel: 'pass' | 'fail' | null;
  inspection_mua_platform: 'pass' | 'fail' | null;
  inspection_status: 'approved' | 'rejected' | null;
  inspection_completed_at: string | null;
  inspection_completed_by: string | null;
  inspection_completed_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export function useManufacturingItems() {
  const [manufacturingItems, setManufacturingItems] = useState<ManufacturingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchManufacturingItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('manufacturing_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching manufacturing items:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to load manufacturing items",
          variant: "destructive",
        });
        return;
      }

      setManufacturingItems(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateManufacturingItemStatus = async (itemId: string, newStatus: ManufacturingItem['status']) => {
    try {
      const { error } = await supabase
        .from('manufacturing_items')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating manufacturing item status:', error);
        throw error;
      }

      // Update local state
      setManufacturingItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
            : item
        )
      );

      toast({
        title: "Success",
        description: `Manufacturing status updated to ${newStatus.replace('-', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating manufacturing item status:', error);
      toast({
        title: "Error",
        description: "Failed to update manufacturing status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateManufacturingItemWithMillingDetails = async (
    itemId: string,
    newStatus: ManufacturingItem['status'],
    millingDetails: {
      milling_location: string;
      gingiva_color: string;
      stained_and_glazed: string;
      cementation: string;
      additional_notes: string;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('manufacturing_items')
        .update({
          status: newStatus,
          ...millingDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating manufacturing item with milling details:', error);
        throw error;
      }

      // Update local state
      setManufacturingItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, status: newStatus, ...millingDetails, updated_at: new Date().toISOString() }
            : item
        )
      );

      toast({
        title: "Success",
        description: "Milling process started successfully",
      });
    } catch (error) {
      console.error('Error updating manufacturing item with milling details:', error);
      toast({
        title: "Error",
        description: "Failed to start milling process",
        variant: "destructive",
      });
      throw error;
    }
  };

  const completePrinting = async (
    itemId: string,
    completionData: {
      completion_date: string;
      completion_time: string;
      completed_by: string;
      completed_by_name: string;
    }
  ) => {
    try {
      // Combine completion_date and completion_time to create timestamp
      const dateTimeString = `${completionData.completion_date}T${completionData.completion_time}:00`;
      const [datePart, timePart] = dateTimeString.split('T');
      const completedAtTimestamp = `${datePart}T${timePart}-05:00`;

      const { error } = await supabase
        .from('manufacturing_items')
        .update({
          status: 'inspection',
          printing_completed_at: completedAtTimestamp,
          printing_completed_by: completionData.completed_by,
          printing_completed_by_name: completionData.completed_by_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('Error completing printing:', error);
        throw error;
      }

      // Update local state
      setManufacturingItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                status: 'inspection',
                printing_completed_at: completedAtTimestamp,
                printing_completed_by: completionData.completed_by,
                printing_completed_by_name: completionData.completed_by_name,
                updated_at: new Date().toISOString()
              }
            : item
        )
      );

      toast({
        title: "Success",
        description: "Printing completed successfully",
      });
    } catch (error) {
      console.error('Error completing printing:', error);
      toast({
        title: "Error",
        description: "Failed to complete printing",
        variant: "destructive",
      });
      throw error;
    }
  };

  const completeInspection = async (
    itemId: string,
    inspectionData: {
      print_quality: 'pass' | 'fail';
      physical_defects: 'pass' | 'fail';
      screw_access_channel: 'pass' | 'fail';
      mua_platform: 'pass' | 'fail';
      inspection_status: 'approved' | 'rejected';
      completion_date: string;
      completion_time: string;
      completed_by: string;
      completed_by_name: string;
    }
  ) => {
    try {
      // Combine completion_date and completion_time to create timestamp
      const dateTimeString = `${inspectionData.completion_date}T${inspectionData.completion_time}:00`;
      const [datePart, timePart] = dateTimeString.split('T');
      const completedAtTimestamp = `${datePart}T${timePart}-05:00`;

      // Fetch the current item from database to get all details
      const { data: currentItem, error: fetchError } = await supabase
        .from('manufacturing_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (fetchError || !currentItem) {
        console.error('Error fetching manufacturing item:', fetchError);
        throw new Error('Manufacturing item not found');
      }

      // If rejected, create a new manufacturing item
      if (inspectionData.inspection_status === 'rejected') {
        // Create new manufacturing item with same details for reprinting
        // Multiple manufacturing items can now reference the same lab_report_card_id
        const { error: createError } = await supabase
          .from('manufacturing_items')
          .insert({
            lab_report_card_id: currentItem.lab_report_card_id,
            lab_script_id: currentItem.lab_script_id,
            patient_name: currentItem.patient_name,
            upper_appliance_type: currentItem.upper_appliance_type,
            lower_appliance_type: currentItem.lower_appliance_type,
            shade: currentItem.shade,
            screw: currentItem.screw,
            material: currentItem.material,
            arch_type: currentItem.arch_type,
            upper_appliance_number: currentItem.upper_appliance_number,
            lower_appliance_number: currentItem.lower_appliance_number,
            manufacturing_method: currentItem.manufacturing_method,
            status: 'pending-printing'
          });

        if (createError) {
          console.error('Error creating new manufacturing item:', createError);
          throw createError;
        }
      }

      // Update the current item with inspection data
      const newStatus = inspectionData.inspection_status === 'approved' ? 'completed' : 'completed';

      const { error: updateError } = await supabase
        .from('manufacturing_items')
        .update({
          status: newStatus,
          inspection_print_quality: inspectionData.print_quality,
          inspection_physical_defects: inspectionData.physical_defects,
          inspection_screw_access_channel: inspectionData.screw_access_channel,
          inspection_mua_platform: inspectionData.mua_platform,
          inspection_status: inspectionData.inspection_status,
          inspection_completed_at: completedAtTimestamp,
          inspection_completed_by: inspectionData.completed_by,
          inspection_completed_by_name: inspectionData.completed_by_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) {
        console.error('Error completing inspection:', updateError);
        throw updateError;
      }

      // Refresh the manufacturing items list
      await fetchManufacturingItems();

      const statusMessage = inspectionData.inspection_status === 'approved'
        ? 'Inspection approved - item moved to appliance delivery'
        : 'Inspection rejected - new manufacturing item created';

      toast({
        title: "Success",
        description: statusMessage,
      });
    } catch (error) {
      console.error('Error completing inspection:', error);
      toast({
        title: "Error",
        description: "Failed to complete inspection",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteManufacturingItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('manufacturing_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error deleting manufacturing item:', error);
        throw error;
      }

      // Update local state
      setManufacturingItems(prev => prev.filter(item => item.id !== itemId));

      toast({
        title: "Success",
        description: "Manufacturing item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting manufacturing item:', error);
      toast({
        title: "Error",
        description: "Failed to delete manufacturing item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getManufacturingItemByLabReportId = async (labReportCardId: string): Promise<ManufacturingItem | null> => {
    try {
      const { data, error } = await supabase
        .from('manufacturing_items')
        .select('*')
        .eq('lab_report_card_id', labReportCardId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching manufacturing item:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  // Set up real-time subscription for manufacturing items
  useEffect(() => {
    fetchManufacturingItems();

    // Subscribe to real-time changes only if supabase.channel is available
    let subscription: any = null;

    if (typeof supabase.channel === 'function') {
      subscription = supabase
        .channel('manufacturing_items_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'manufacturing_items'
          },
          (payload) => {
            console.log('🔄 Real-time manufacturing item change received:', payload.eventType, payload);

            // Handle different types of changes efficiently
            if (payload.eventType === 'INSERT' && payload.new) {
              // Add new manufacturing item to existing list
              setManufacturingItems(prev => {
                // Check if item already exists to avoid duplicates
                if (prev.some(item => item.id === payload.new.id)) {
                  return prev;
                }
                // Insert at the beginning (most recent first)
                return [payload.new as ManufacturingItem, ...prev];
              });

            } else if (payload.eventType === 'UPDATE' && payload.new) {
              // Update specific manufacturing item in the list
              setManufacturingItems(prev =>
                prev.map(item =>
                  item.id === payload.new.id ? payload.new as ManufacturingItem : item
                )
              );

            } else if (payload.eventType === 'DELETE' && payload.old) {
              // Remove deleted manufacturing item from the list
              setManufacturingItems(prev => prev.filter(item => item.id !== payload.old.id));
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Manufacturing items real-time subscription status:', status);
        });
    } else {
      console.warn('⚠️ Supabase real-time not available - manufacturing items will not update in real-time');
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  return {
    manufacturingItems,
    loading,
    error,
    fetchManufacturingItems,
    updateManufacturingItemStatus,
    updateManufacturingItemWithMillingDetails,
    completePrinting,
    completeInspection,
    deleteManufacturingItem,
    getManufacturingItemByLabReportId
  };
}
