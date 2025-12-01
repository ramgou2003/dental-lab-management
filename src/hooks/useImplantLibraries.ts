import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ImplantLibrary {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useImplantLibraries() {
  const [implantLibraries, setImplantLibraries] = useState<ImplantLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImplantLibraries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('implant_libraries')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching implant libraries:', error);
        setError(error.message);
        return;
      }

      setImplantLibraries(data || []);
    } catch (err) {
      console.error('Error in fetchImplantLibraries:', err);
      setError('Failed to fetch implant libraries');
    } finally {
      setLoading(false);
    }
  };

  const addImplantLibrary = async (name: string, description?: string) => {
    try {
      // Get the max display_order
      const maxOrder = implantLibraries.length > 0 
        ? Math.max(...implantLibraries.map(il => il.display_order)) 
        : 0;

      const { data, error } = await supabase
        .from('implant_libraries')
        .insert({
          name,
          description: description || null,
          display_order: maxOrder + 1
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding implant library:', error);
        throw error;
      }

      setImplantLibraries(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error in addImplantLibrary:', err);
      throw err;
    }
  };

  const updateImplantLibrary = async (id: string, updates: Partial<Pick<ImplantLibrary, 'name' | 'description' | 'is_active' | 'display_order'>>) => {
    try {
      const { data, error } = await supabase
        .from('implant_libraries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating implant library:', error);
        throw error;
      }

      setImplantLibraries(prev => prev.map(il => il.id === id ? data : il));
      return data;
    } catch (err) {
      console.error('Error in updateImplantLibrary:', err);
      throw err;
    }
  };

  const deleteImplantLibrary = async (id: string) => {
    try {
      const { error } = await supabase
        .from('implant_libraries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting implant library:', error);
        throw error;
      }

      setImplantLibraries(prev => prev.filter(il => il.id !== id));
    } catch (err) {
      console.error('Error in deleteImplantLibrary:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchImplantLibraries();
  }, []);

  return {
    implantLibraries,
    loading,
    error,
    fetchImplantLibraries,
    addImplantLibrary,
    updateImplantLibrary,
    deleteImplantLibrary
  };
}

