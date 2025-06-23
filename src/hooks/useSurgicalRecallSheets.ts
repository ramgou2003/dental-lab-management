import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { deleteSurgicalRecallSheet as deleteSurgicalRecallSheetWithImages } from '@/lib/surgicalRecallService';

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
  surgical_recall_sheet_id: string;
  arch_type: 'upper' | 'lower';
  position: string;
  implant_brand: string;
  implant_subtype: string;
  implant_size: string;
  mua_brand?: string;
  mua_subtype?: string;
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
        .eq('surgical_recall_sheet_id', sheetId)
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
      console.log('🗑️ Hook: Starting deletion of surgical recall sheet:', sheetId);

      // ✅ Use the proper deletion function that includes image cleanup
      const result = await deleteSurgicalRecallSheetWithImages(sheetId);

      if (result.success) {
        // Refresh the list after successful deletion
        await fetchSheets();
        console.log('✅ Hook: Successfully deleted sheet and refreshed list');
        return { success: true };
      } else {
        console.error('❌ Hook: Deletion failed:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to delete sheet'
        };
      }
    } catch (err) {
      console.error('❌ Hook: Exception during deletion:', err);
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
