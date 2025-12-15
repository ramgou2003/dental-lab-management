import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface MillingLocation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useMillingLocations() {
  const [millingLocations, setMillingLocations] = useState<MillingLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMillingLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('milling_locations')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setMillingLocations(data || []);
    } catch (error: any) {
      console.error('Error fetching milling locations:', error);
      toast.error('Failed to load milling locations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMillingLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('milling_locations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setMillingLocations(data || []);
    } catch (error: any) {
      console.error('Error fetching all milling locations:', error);
      toast.error('Failed to load milling locations');
    } finally {
      setLoading(false);
    }
  };

  const createMillingLocation = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('milling_locations')
        .insert([{ name, is_active: true }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Milling location added successfully');
      await fetchAllMillingLocations();
      return data;
    } catch (error: any) {
      console.error('Error creating milling location:', error);
      if (error.code === '23505') {
        toast.error('A milling location with this name already exists');
      } else {
        toast.error('Failed to add milling location');
      }
      throw error;
    }
  };

  const updateMillingLocation = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('milling_locations')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Milling location updated successfully');
      await fetchAllMillingLocations();
      return data;
    } catch (error: any) {
      console.error('Error updating milling location:', error);
      if (error.code === '23505') {
        toast.error('A milling location with this name already exists');
      } else {
        toast.error('Failed to update milling location');
      }
      throw error;
    }
  };

  const deleteMillingLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('milling_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Milling location deleted successfully');
      await fetchMillingLocations();
    } catch (error: any) {
      console.error('Error deleting milling location:', error);
      toast.error('Failed to delete milling location');
      throw error;
    }
  };

  useEffect(() => {
    fetchMillingLocations();
  }, []);

  return {
    millingLocations,
    loading,
    fetchMillingLocations,
    fetchAllMillingLocations,
    createMillingLocation,
    updateMillingLocation,
    deleteMillingLocation,
  };
}

