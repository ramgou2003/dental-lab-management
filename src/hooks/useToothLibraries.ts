import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ToothLibrary {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useToothLibraries() {
  const [toothLibraries, setToothLibraries] = useState<ToothLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToothLibraries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tooth_libraries')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching tooth libraries:', error);
        setError(error.message);
        return;
      }

      setToothLibraries(data || []);
    } catch (err) {
      console.error('Error in fetchToothLibraries:', err);
      setError('Failed to fetch tooth libraries');
    } finally {
      setLoading(false);
    }
  };

  const addToothLibrary = async (name: string, description?: string) => {
    try {
      // Get the max display_order
      const maxOrder = toothLibraries.length > 0 
        ? Math.max(...toothLibraries.map(tl => tl.display_order)) 
        : 0;

      const { data, error } = await supabase
        .from('tooth_libraries')
        .insert({
          name,
          description: description || null,
          display_order: maxOrder + 1
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding tooth library:', error);
        throw error;
      }

      setToothLibraries(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error in addToothLibrary:', err);
      throw err;
    }
  };

  const updateToothLibrary = async (id: string, updates: Partial<Pick<ToothLibrary, 'name' | 'description' | 'is_active' | 'display_order'>>) => {
    try {
      const { data, error } = await supabase
        .from('tooth_libraries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating tooth library:', error);
        throw error;
      }

      setToothLibraries(prev => prev.map(tl => tl.id === id ? data : tl));
      return data;
    } catch (err) {
      console.error('Error in updateToothLibrary:', err);
      throw err;
    }
  };

  const deleteToothLibrary = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tooth_libraries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tooth library:', error);
        throw error;
      }

      setToothLibraries(prev => prev.filter(tl => tl.id !== id));
    } catch (err) {
      console.error('Error in deleteToothLibrary:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchToothLibraries();
  }, []);

  return {
    toothLibraries,
    loading,
    error,
    fetchToothLibraries,
    addToothLibrary,
    updateToothLibrary,
    deleteToothLibrary
  };
}

