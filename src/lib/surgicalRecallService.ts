import { supabase } from '@/integrations/supabase/client';

export interface SurgicalRecallSheet {
  id?: string;
  patient_id: string;
  patient_name: string;
  surgery_date: string;
  arch_type: 'upper' | 'lower' | 'dual';
  upper_surgery_type?: string;
  lower_surgery_type?: string;
  is_graft_used?: boolean;
  is_membrane_used?: boolean;
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
  implant_brand?: string;
  implant_subtype?: string;
  implant_size?: string;
  implant_picture?: File | undefined;  // ✅ Made explicitly optional for database saving
  implant_picture_url?: string;
  mua_brand?: string;
  mua_subtype?: string;
  mua_size?: string;
  mua_picture?: File | undefined;      // ✅ Made explicitly optional for database saving
  mua_picture_url?: string;
  arch_type: 'upper' | 'lower';
}

export interface SavedGraftMembrane {
  id: string;
  type: 'graft' | 'membrane';
  brand_type: string;
  file?: File | null;
  picture_url?: string | null;
}

// Manual test function to delete specific URLs
export async function testDeleteSpecificFiles(): Promise<void> {
  const testUrls = [
    'https://tofoatpggdudjvgoixwp.supabase.co/storage/v1/object/public/surgical-recall-images/implants/1750696049313/1750696049313-q2v9r6zngu.webp',
    'https://tofoatpggdudjvgoixwp.supabase.co/storage/v1/object/public/surgical-recall-images/mua/1750696049313/1750696050949-ksimq4mz0hh.jpg'
  ];

  console.log('🧪 MANUAL TEST: Deleting specific files...');
  console.log('🧪 Files to delete:', testUrls);

  // First, list all files to see what's there
  console.log('📋 Listing all files before deletion...');
  await listStorageFiles();

  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`\n🎯 Testing deletion ${i + 1}/${testUrls.length}:`, url);

    // Extract expected path
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part !== '');
    const bucketIndex = pathParts.findIndex(part => part === 'surgical-recall-images');
    const expectedPath = pathParts.slice(bucketIndex + 1).join('/');
    console.log('🔍 Expected path:', expectedPath);

    // Check if file exists before deletion
    const existsBefore = await checkFileExists(expectedPath);
    console.log('📄 File exists before deletion:', existsBefore);

    // Attempt deletion
    const result = await deleteImage(url);
    console.log('📊 Deletion result:', result);

    // Check if file exists after deletion
    const existsAfter = await checkFileExists(expectedPath);
    console.log('📄 File exists after deletion:', existsAfter);

    if (existsBefore && !existsAfter) {
      console.log('✅ SUCCESS: File was deleted');
    } else if (!existsBefore) {
      console.log('⚠️ WARNING: File did not exist before deletion');
    } else if (existsAfter) {
      console.log('❌ FAILED: File still exists after deletion');
    }
  }

  // List all files after deletion
  console.log('\n📋 Listing all files after deletion...');
  await listStorageFiles();
}

// Test function to delete a specific surgical recall sheet by ID
export async function testDeleteSurgicalRecallSheet(sheetId: string): Promise<void> {
  console.log('🧪 MANUAL TEST: Deleting surgical recall sheet:', sheetId);

  // First, list all files to see what's there
  console.log('📋 Listing all files before deletion...');
  await listStorageFiles();

  // Attempt deletion
  const result = await deleteSurgicalRecallSheet(sheetId);
  console.log('📊 Sheet deletion result:', result);

  // List all files after deletion
  console.log('\n📋 Listing all files after deletion...');
  await listStorageFiles();

  if (result.success) {
    console.log('✅ SUCCESS: Surgical recall sheet and images deleted');
  } else {
    console.log('❌ FAILED: Sheet deletion failed -', result.error);
  }
}

// Force check if a specific file exists (bypasses caching)
export async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    console.log('🔍 Force checking if file exists:', filePath);

    const { data, error } = await supabase.storage
      .from('surgical-recall-images')
      .download(filePath);

    if (error) {
      console.log('📄 File does not exist (download failed):', error.message);
      return false;
    } else {
      console.log('📄 File exists (download successful):', data);
      return true;
    }
  } catch (error) {
    console.log('📄 File does not exist (exception):', error);
    return false;
  }
}

// Test function to list all files in storage (for debugging)
export async function listStorageFiles(): Promise<void> {
  try {
    console.log('📋 Listing all files in surgical-recall-images bucket...');

    // List root level
    const { data: rootData, error: rootError } = await supabase.storage
      .from('surgical-recall-images')
      .list('', { limit: 100 });

    if (rootError) {
      console.error('❌ Error listing root files:', rootError);
    } else {
      console.log('📋 Root level files/folders:', rootData?.map(item => `${item.name} (${item.metadata?.size || 'folder'})`));
    }

    // List implants folder
    const { data: implantsData, error: implantsError } = await supabase.storage
      .from('surgical-recall-images')
      .list('implants', { limit: 100 });

    if (implantsError) {
      console.error('❌ Error listing implants folder:', implantsError);
    } else {
      console.log('📋 Implants folder contents:', implantsData?.map(item => `${item.name} (${item.metadata?.size || 'folder'})`));
    }

    // List mua folder
    const { data: muaData, error: muaError } = await supabase.storage
      .from('surgical-recall-images')
      .list('mua', { limit: 100 });

    if (muaError) {
      console.error('❌ Error listing mua folder:', muaError);
    } else {
      console.log('📋 MUA folder contents:', muaData?.map(item => `${item.name} (${item.metadata?.size || 'folder'})`));
    }
  } catch (error) {
    console.error('❌ Exception listing files:', error);
  }
}

// Delete all images associated with a surgical recall sheet
export async function deleteSurgicalRecallImages(sheetId: string): Promise<boolean> {
  try {
    console.log('🗑️ Deleting all images for surgical recall sheet:', sheetId);

    // Get the sheet with its implants
    const { data: sheet, error } = await supabase
      .from('surgical_recall_sheets')
      .select(`
        *,
        surgical_recall_implants (*)
      `)
      .eq('id', sheetId)
      .single();

    if (error) {
      console.error('❌ Error fetching sheet for image deletion:', error);
      return false;
    }

    if (!sheet?.surgical_recall_implants) {
      console.log('ℹ️ No implants found for sheet:', sheetId);
      return true;
    }

    console.log('📋 Found', sheet.surgical_recall_implants.length, 'implants to process');

    // Collect all image URLs
    const imageUrls: string[] = [];

    sheet.surgical_recall_implants.forEach((implant: any) => {
      if (implant.implant_picture_url) {
        imageUrls.push(implant.implant_picture_url);
      }
      if (implant.mua_picture_url) {
        imageUrls.push(implant.mua_picture_url);
      }
    });

    // Add Graft and Membrane images
    if (sheet.graft_picture_url) imageUrls.push(sheet.graft_picture_url);
    if (sheet.membrane_picture_url) imageUrls.push(sheet.membrane_picture_url);

    console.log('🖼️ Found', imageUrls.length, 'images to delete:', imageUrls);

    // Delete all images
    const deletePromises = imageUrls.map(url => deleteImage(url));
    const results = await Promise.all(deletePromises);

    const successCount = results.filter(result => result).length;
    const failCount = results.length - successCount;

    console.log(`✅ Successfully deleted ${successCount} images`);
    if (failCount > 0) {
      console.warn(`⚠️ Failed to delete ${failCount} images`);
    }

    return failCount === 0;
  } catch (error) {
    console.error('❌ Error deleting surgical recall images:', error);
    return false;
  }
}

// Delete image from Supabase Storage
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) return true;

    console.log('🗑️ Attempting to delete image:', imageUrl);

    // Extract file path from URL
    const url = new URL(imageUrl);
    console.log('🔍 URL pathname:', url.pathname);
    console.log('🔍 URL hostname:', url.hostname);

    // For Supabase storage URLs, the path structure is: /storage/v1/object/public/bucket-name/path/to/file
    const pathParts = url.pathname.split('/').filter(part => part !== '');
    console.log('🔍 Path parts:', pathParts);

    // Find the bucket name and get everything after it
    const bucketIndex = pathParts.findIndex(part => part === 'surgical-recall-images');
    console.log('🔍 Bucket index:', bucketIndex);

    if (bucketIndex === -1) {
      console.error('❌ Could not find bucket name in URL:', imageUrl);
      console.log('🔍 Available parts:', pathParts);
      return false;
    }

    // Get the file path (everything after the bucket name)
    let filePath = pathParts.slice(bucketIndex + 1).join('/');
    console.log('🎯 Extracted file path for deletion:', filePath);

    // Alternative method: try to extract from the full URL pattern
    if (!filePath) {
      console.log('🔄 Trying alternative path extraction...');
      // Pattern: https://project.supabase.co/storage/v1/object/public/bucket-name/path/to/file
      const urlPattern = /\/storage\/v1\/object\/public\/surgical-recall-images\/(.+)$/;
      const match = url.pathname.match(urlPattern);
      if (match) {
        filePath = match[1];
        console.log('🎯 Alternative extracted path:', filePath);
      }
    }

    if (!filePath) {
      console.error('❌ Empty file path extracted from URL:', imageUrl);
      console.log('❌ URL pathname:', url.pathname);
      console.log('❌ Path parts:', pathParts);
      return false;
    }

    // First, let's check if the file exists
    console.log('🔍 Checking if file exists before deletion...');
    const folderPath = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '';
    const fileName = filePath.includes('/') ? filePath.substring(filePath.lastIndexOf('/') + 1) : filePath;

    console.log('🔍 Folder path:', folderPath);
    console.log('🔍 File name:', fileName);

    const { data: listData, error: listError } = await supabase.storage
      .from('surgical-recall-images')
      .list(folderPath, { limit: 100 });

    console.log('📋 File list data:', listData);
    console.log('📋 File list error:', listError);

    if (listData) {
      const fileExists = listData.find(file => file.name === fileName);
      console.log('🔍 Target file exists:', !!fileExists);
      if (fileExists) {
        console.log('🔍 File details:', fileExists);
      }
    }

    console.log('🚀 Calling Supabase storage.remove() with path:', filePath);

    const { data, error } = await supabase.storage
      .from('surgical-recall-images')
      .remove([filePath]);

    console.log('📊 Supabase delete response data:', data);
    console.log('📊 Supabase delete response error:', error);

    if (error) {
      console.error('❌ Error deleting image from storage:', error);
      console.error('❌ Error details:', {
        message: error.message,
        statusCode: (error as any).statusCode,
        error: (error as any).error
      });
      return false;
    }

    // Verify deletion by checking if file still exists
    console.log('🔍 Verifying deletion...');
    const { data: verifyData, error: verifyError } = await supabase.storage
      .from('surgical-recall-images')
      .list(folderPath, { limit: 100 });

    console.log('✅ Verification data:', verifyData);
    console.log('✅ Verification error:', verifyError);

    if (verifyData) {
      const fileStillExists = verifyData.find(file => file.name === fileName);
      console.log('🔍 File still exists after deletion:', !!fileStillExists);
      if (fileStillExists) {
        console.log('❌ WARNING: File was not actually deleted!', fileStillExists);
        return false;
      } else {
        console.log('✅ CONFIRMED: File was successfully deleted');
      }
    }

    // Double-check by trying to download the file
    console.log('🔍 Double-checking with download attempt...');
    const stillExists = await checkFileExists(filePath);
    if (stillExists) {
      console.log('❌ CRITICAL: File still exists after deletion!');
      return false;
    } else {
      console.log('✅ DOUBLE-CONFIRMED: File is truly deleted');
    }

    console.log('✅ Image deleted successfully from storage:', filePath);
    console.log('✅ Delete operation data:', data);
    return true;
  } catch (error) {
    console.error('❌ Exception while deleting image:', error);
    return false;
  }
}

// Upload image to Supabase Storage
export async function uploadImage(file: File, path: string): Promise<string | null> {
  try {
    console.log('Starting image upload:', { fileName: file.name, size: file.size, path });

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    console.log('Uploading to path:', filePath);

    const { data, error } = await supabase.storage
      .from('surgical-recall-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg'
      });

    if (error) {
      console.error('Supabase storage error:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: (error as any).statusCode,
        error: (error as any).error
      });
      return null;
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('surgical-recall-images')
      .getPublicUrl(filePath);

    console.log('Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Save surgical recall sheet
export async function saveSurgicalRecallSheet(
  sheetData: Omit<SurgicalRecallSheet, 'id'>,
  implants: SavedImplant[],
  graftsMembranes?: SavedGraftMembrane[]
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

    // Handle Graft and Membrane array uploads if provided
    if (graftsMembranes && graftsMembranes.length > 0) {
      console.log('📤 Processing', graftsMembranes.length, 'grafts/membranes...');

      const gmPromises = graftsMembranes.map(async (gm) => {
        let pictureUrl = gm.picture_url;

        if (gm.file instanceof File) {
          pictureUrl = await uploadImage(gm.file, `${gm.type}/${sheetId}/${gm.id}`);
        }

        return supabase
          .from('surgical_recall_grafts_membranes')
          .insert({
            surgical_recall_sheet_id: sheetId,
            type: gm.type,
            brand_type: gm.brand_type,
            picture_url: pictureUrl
          });
      });

      await Promise.all(gmPromises);
    }

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
        implant_brand: implant.implant_brand,
        implant_subtype: implant.implant_subtype,
        implant_size: implant.implant_size,
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

// Delete surgical recall sheet and all associated images
export async function deleteSurgicalRecallSheet(sheetId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Starting deletion of surgical recall sheet:', sheetId);

    // ✅ STEP 1: Get all image URLs BEFORE deleting anything from database
    console.log('📋 Step 1: Fetching sheet and implant data with image URLs...');

    // ⚠️ CRITICAL: Get ALL implant and graft/membrane image URLs BEFORE any database deletion
    // This must happen before cascade delete removes the records
    const { data: sheetData, error: fetchError } = await supabase
      .from('surgical_recall_sheets')
      .select(`
        id, patient_name, surgery_date,
        surgical_recall_implants (id, position, implant_picture_url, mua_picture_url),
        surgical_recall_grafts_membranes (id, picture_url, type)
      `)
      .eq('id', sheetId)
      .single();

    if (fetchError || !sheetData) {
      console.error('❌ Error fetching sheet details for deletion:', fetchError);
      return { success: false, error: `Failed to fetch sheet details: ${fetchError?.message || 'Sheet not found'}` };
    }

    const sheet = sheetData as any;
    const implants = sheet.surgical_recall_implants || [];
    const graftsMembranes = sheet.surgical_recall_grafts_membranes || [];

    console.log('📋 Found sheet:', {
      id: sheet.id,
      patient: sheet.patient_name,
      date: sheet.surgery_date,
      implantCount: implants.length,
      gmCount: graftsMembranes.length
    });

    // ✅ STEP 2: Collect ALL image URLs that need to be deleted
    console.log('📋 Step 2: Collecting all image URLs from implants...');
    const imageUrls: string[] = [];

    if (implants && Array.isArray(implants)) {
      implants.forEach((implant: any, index: number) => {
        console.log(`📋 Processing implant ${index + 1}/${implants.length}:`, {
          id: implant.id,
          position: implant.position,
          hasImplantImage: !!implant.implant_picture_url,
          hasMuaImage: !!implant.mua_picture_url
        });

        if (implant.implant_picture_url) {
          imageUrls.push(implant.implant_picture_url);
          console.log('📸 Found implant image:', implant.implant_picture_url);
        }
        if (implant.mua_picture_url) {
          imageUrls.push(implant.mua_picture_url);
          console.log('📸 Found MUA image:', implant.mua_picture_url);
        }
      });
    } else {
      console.log('ℹ️ No implants found for this sheet');
    }

    // Add multiple Graft and Membrane images to deletion list
    if (graftsMembranes && Array.isArray(graftsMembranes)) {
      graftsMembranes.forEach((gm: any, index: number) => {
        if (gm.picture_url) {
          imageUrls.push(gm.picture_url);
          console.log(`📸 Found ${gm.type} image:`, gm.picture_url);
        }
      });
    }

    console.log(`🖼️ Total images to delete: ${imageUrls.length}`);

    // ✅ Verification: Log all collected image URLs for debugging
    if (imageUrls.length > 0) {
      console.log('📋 Complete list of images to be deleted:');
      imageUrls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
    } else {
      console.log('⚠️ No images found to delete - this might indicate an issue if images were expected');
    }

    // ✅ STEP 3: Delete all images from storage BEFORE database deletion
    if (imageUrls.length > 0) {
      console.log('🗑️ Step 3: Deleting all images from storage...');
      console.log('📋 Images to delete:', imageUrls);

      const deleteResults = await Promise.allSettled(
        imageUrls.map(async (url, index) => {
          console.log(`🗑️ Deleting image ${index + 1}/${imageUrls.length}:`, url);
          try {
            const result = await deleteImage(url);
            console.log(`${result ? '✅' : '❌'} Image ${index + 1} deletion:`, result ? 'SUCCESS' : 'FAILED', url);
            return { success: result, url, error: null };
          } catch (error) {
            console.error(`❌ Exception deleting image ${index + 1}:`, error, url);
            return { success: false, url, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        })
      );

      const successCount = deleteResults.filter(result =>
        result.status === 'fulfilled' && result.value.success === true
      ).length;

      const failCount = deleteResults.length - successCount;

      console.log(`📊 Image deletion summary: ${successCount} success, ${failCount} failed out of ${imageUrls.length} total`);

      if (failCount > 0) {
        console.warn(`⚠️ ${failCount} images failed to delete, but continuing with sheet deletion`);
        // Log failed deletions for debugging
        deleteResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`❌ Failed to delete image ${index + 1} (rejected):`, imageUrls[index], result.reason);
          } else if (result.status === 'fulfilled' && !result.value.success) {
            console.error(`❌ Failed to delete image ${index + 1} (failed):`, result.value.url, result.value.error);
          }
        });
      } else {
        console.log('✅ All images deleted successfully from storage');
      }
    } else {
      console.log('ℹ️ No images to delete from storage');
    }

    // ✅ STEP 4: Delete the sheet (this will cascade delete implants due to foreign key constraint)
    console.log('🗑️ Step 4: Deleting sheet from database (implants will be cascade deleted)...');
    const { error: deleteError } = await supabase
      .from('surgical_recall_sheets')
      .delete()
      .eq('id', sheetId);

    if (deleteError) {
      console.error('❌ Error deleting surgical recall sheet:', deleteError);
      return { success: false, error: `Failed to delete sheet: ${deleteError.message}` };
    }

    console.log('✅ Successfully deleted surgical recall sheet and all associated data');
    return { success: true };

  } catch (error) {
    console.error('❌ Exception during surgical recall sheet deletion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}



// Update surgical recall sheet
export async function updateSurgicalRecallSheet(
  sheetId: string,
  sheetData: Partial<SurgicalRecallSheet>,
  implants?: SavedImplant[],
  graftsMembranes?: SavedGraftMembrane[]
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    let updates: Partial<SurgicalRecallSheet> = { ...sheetData };

    // If graftsMembranes are provided, replace them
    if (graftsMembranes) {
      // Delete existing
      await supabase
        .from('surgical_recall_grafts_membranes')
        .delete()
        .eq('surgical_recall_sheet_id', sheetId);

      // Upload and save new
      const gmPromises = graftsMembranes.map(async (gm) => {
        let pictureUrl = gm.picture_url;
        if (gm.file instanceof File) {
          pictureUrl = await uploadImage(gm.file, `${gm.type}/${sheetId}/${gm.id}`);
        }

        return supabase
          .from('surgical_recall_grafts_membranes')
          .insert({
            surgical_recall_sheet_id: sheetId,
            type: gm.type,
            brand_type: gm.brand_type,
            picture_url: pictureUrl
          });
      });

      await Promise.all(gmPromises);
    }

    // Update the main sheet
    const { data: sheetResult, error: sheetError } = await supabase
      .from('surgical_recall_sheets')
      .update(updates)
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

      // Save new implants (images should already be uploaded by form submission)
      const implantPromises = implants.map(async (implant) => {
        // ✅ Images should already be uploaded and URLs provided
        // No need to upload again here to prevent duplicates
        // UNLESS provided as File objects (e.g. new implants added during edit)
        let implantPictureUrl = implant.implant_picture_url;
        let muaPictureUrl = implant.mua_picture_url;

        if (implant.implant_picture instanceof File) {
          implantPictureUrl = await uploadImage(implant.implant_picture, `implants/${sheetId}`);
        }
        if (implant.mua_picture instanceof File) {
          muaPictureUrl = await uploadImage(implant.mua_picture, `mua/${sheetId}`);
        }

        console.log('💾 Saving implant to database:', {
          id: implant.id,
          implantPictureUrl,
          muaPictureUrl
        });

        const implantData: Omit<SurgicalRecallImplant, 'id'> = {
          surgical_recall_sheet_id: sheetId,
          arch_type: implant.arch_type,
          position: implant.position,
          implant_brand: implant.implant_brand,
          implant_subtype: implant.implant_subtype,
          implant_size: implant.implant_size,
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
