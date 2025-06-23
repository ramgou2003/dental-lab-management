import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SurgicalRecallSheet {
  id: string;
  patient_id: string;
  patient_name: string;
  surgery_date: string;
  arch_type: 'upper' | 'lower' | 'dual';
  upper_surgery_type?: string;
  lower_surgery_type?: string;
  status: 'draft' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface SurgicalRecallImplant {
  id: string;
  sheet_id: string;
  arch: 'upper' | 'lower';
  position: string;
  implant_brand: string;
  implant_series: string;
  implant_size: string;
  mua_brand?: string;
  mua_series?: string;
  mua_size?: string;
  implant_picture_url?: string;
  mua_picture_url?: string;
  created_at: string;
}

export const useSurgicalRecallSheets = (patientId?: string) => {
  const [sheets, setSheets] = useState<SurgicalRecallSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSheets = async () => {
    if (!patientId) {
      setSheets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('surgical_recall_sheets')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setSheets(data || []);
    } catch (err) {
      console.error('Error fetching surgical recall sheets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch surgical recall sheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchSheetWithImplants = async (sheetId: string) => {
    try {
      // Fetch the sheet
      const { data: sheet, error: sheetError } = await supabase
        .from('surgical_recall_sheets')
        .select('*')
        .eq('id', sheetId)
        .single();

      if (sheetError) throw sheetError;

      // Fetch the implants
      const { data: implants, error: implantsError } = await supabase
        .from('surgical_recall_implants')
        .select('*')
        .eq('sheet_id', sheetId)
        .order('created_at', { ascending: true });

      if (implantsError) throw implantsError;

      return {
        sheet,
        implants: implants || []
      };
    } catch (err) {
      console.error('Error fetching sheet with implants:', err);
      throw err;
    }
  };

  const deleteSheet = async (sheetId: string) => {
    try {
      // First delete all implants
      const { error: implantsError } = await supabase
        .from('surgical_recall_implants')
        .delete()
        .eq('sheet_id', sheetId);

      if (implantsError) throw implantsError;

      // Then delete the sheet
      const { error: sheetError } = await supabase
        .from('surgical_recall_sheets')
        .delete()
        .eq('id', sheetId);

      if (sheetError) throw sheetError;

      // Refresh the list
      await fetchSheets();
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting surgical recall sheet:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete sheet' 
      };
    }
  };

  useEffect(() => {
    fetchSheets();
  }, [patientId]);

  return {
    sheets,
    loading,
    error,
    refetch: fetchSheets,
    fetchSheetWithImplants,
    deleteSheet
  };
};
