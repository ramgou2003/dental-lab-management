import { supabase } from '@/integrations/supabase/client';

export interface SurgicalRecallSheet {
  id?: string;
  patient_id: string;
  patient_name: string;
  surgery_date: string;
  arch_type: 'upper' | 'lower' | 'dual';
  upper_surgery_type?: string;
  lower_surgery_type?: string;
  status: 'draft' | 'completed';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface SurgicalRecallImplant {
  id?: string;
  surgical_recall_sheet_id: string;
  arch_type: 'upper' | 'lower';
  position: string;
  implant_brand?: string;
  implant_subtype?: string;
  implant_size?: string;
  implant_picture_url?: string;
  mua_brand?: string;
  mua_subtype?: string;
  mua_size?: string;
  mua_picture_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavedImplant {
  id: string;
  position: string;
  brand?: string;
  subtype?: string;
  size?: string;
  implant_picture?: File;
  implant_picture_url?: string;
  mua_brand?: string;
  mua_subtype?: string;
  mua_size?: string;
  mua_picture?: File;
  mua_picture_url?: string;
  arch_type: 'upper' | 'lower';
}

// Upload image to Supabase Storage
export async function uploadImage(file: File, path: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('surgical-recall-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('surgical-recall-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Save surgical recall sheet
export async function saveSurgicalRecallSheet(
  sheetData: Omit<SurgicalRecallSheet, 'id'>,
  implants: SavedImplant[]
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // First, save the main sheet
    const { data: sheetResult, error: sheetError } = await supabase
      .from('surgical_recall_sheets')
      .insert(sheetData)
      .select()
      .single();

    if (sheetError) {
      console.error('Error saving surgical recall sheet:', sheetError);
      return { success: false, error: sheetError.message };
    }

    const sheetId = sheetResult.id;

    // Process and save implants
    const implantPromises = implants.map(async (implant) => {
      let implantPictureUrl = implant.implant_picture_url;
      let muaPictureUrl = implant.mua_picture_url;

      // Upload implant picture if it's a File
      if (implant.implant_picture instanceof File) {
        implantPictureUrl = await uploadImage(
          implant.implant_picture,
          `implants/${sheetId}`
        );
      }

      // Upload MUA picture if it's a File
      if (implant.mua_picture instanceof File) {
        muaPictureUrl = await uploadImage(
          implant.mua_picture,
          `mua/${sheetId}`
        );
      }

      const implantData: Omit<SurgicalRecallImplant, 'id'> = {
        surgical_recall_sheet_id: sheetId,
        arch_type: implant.arch_type,
        position: implant.position,
        implant_brand: implant.brand,
        implant_subtype: implant.subtype,
        implant_size: implant.size,
        implant_picture_url: implantPictureUrl,
        mua_brand: implant.mua_brand,
        mua_subtype: implant.mua_subtype,
        mua_size: implant.mua_size,
        mua_picture_url: muaPictureUrl
      };

      return supabase
        .from('surgical_recall_implants')
        .insert(implantData);
    });

    // Wait for all implant saves to complete
    const implantResults = await Promise.all(implantPromises);

    // Check for any implant save errors
    const implantErrors = implantResults.filter(result => result.error);
    if (implantErrors.length > 0) {
      console.error('Error saving implants:', implantErrors);
      return { 
        success: false, 
        error: `Failed to save ${implantErrors.length} implant(s)` 
      };
    }

    return { 
      success: true, 
      data: { 
        sheet: sheetResult, 
        implants: implantResults.map(r => r.data) 
      } 
    };

  } catch (error) {
    console.error('Error in saveSurgicalRecallSheet:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Get surgical recall sheets for a patient
export async function getSurgicalRecallSheets(patientId: string) {
  try {
    const { data, error } = await supabase
      .from('surgical_recall_sheets')
      .select(`
        *,
        surgical_recall_implants (*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching surgical recall sheets:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getSurgicalRecallSheets:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Update surgical recall sheet
export async function updateSurgicalRecallSheet(
  sheetId: string,
  sheetData: Partial<SurgicalRecallSheet>,
  implants?: SavedImplant[]
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Update the main sheet
    const { data: sheetResult, error: sheetError } = await supabase
      .from('surgical_recall_sheets')
      .update(sheetData)
      .eq('id', sheetId)
      .select()
      .single();

    if (sheetError) {
      console.error('Error updating surgical recall sheet:', sheetError);
      return { success: false, error: sheetError.message };
    }

    // If implants are provided, replace them
    if (implants) {
      // Delete existing implants
      await supabase
        .from('surgical_recall_implants')
        .delete()
        .eq('surgical_recall_sheet_id', sheetId);

      // Save new implants (reuse the save logic)
      const implantPromises = implants.map(async (implant) => {
        let implantPictureUrl = implant.implant_picture_url;
        let muaPictureUrl = implant.mua_picture_url;

        // Upload implant picture if it's a File
        if (implant.implant_picture instanceof File) {
          implantPictureUrl = await uploadImage(
            implant.implant_picture,
            `implants/${sheetId}`
          );
        }

        // Upload MUA picture if it's a File
        if (implant.mua_picture instanceof File) {
          muaPictureUrl = await uploadImage(
            implant.mua_picture,
            `mua/${sheetId}`
          );
        }

        const implantData: Omit<SurgicalRecallImplant, 'id'> = {
          surgical_recall_sheet_id: sheetId,
          arch_type: implant.arch_type,
          position: implant.position,
          implant_brand: implant.brand,
          implant_subtype: implant.subtype,
          implant_size: implant.size,
          implant_picture_url: implantPictureUrl,
          mua_brand: implant.mua_brand,
          mua_subtype: implant.mua_subtype,
          mua_size: implant.mua_size,
          mua_picture_url: muaPictureUrl
        };

        return supabase
          .from('surgical_recall_implants')
          .insert(implantData);
      });

      await Promise.all(implantPromises);
    }

    return { success: true, data: sheetResult };

  } catch (error) {
    console.error('Error in updateSurgicalRecallSheet:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Delete surgical recall sheet
export async function deleteSurgicalRecallSheet(sheetId: string) {
  try {
    const { error } = await supabase
      .from('surgical_recall_sheets')
      .delete()
      .eq('id', sheetId);

    if (error) {
      console.error('Error deleting surgical recall sheet:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteSurgicalRecallSheet:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
