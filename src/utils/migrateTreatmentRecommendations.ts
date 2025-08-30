import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Migration utility to update old treatment recommendations format to new arch-based format
export async function migrateTreatmentRecommendations(): Promise<void> {
  try {
    console.log('🔄 Starting migration of treatment recommendations...');

    // Get all consultations with old format treatment recommendations
    const { data: consultations, error: fetchError } = await supabase
      .from('consultations')
      .select('id, treatment_recommendations')
      .not('treatment_recommendations', 'is', null);

    if (fetchError) {
      console.error('❌ Error fetching consultations:', fetchError);
      return;
    }

    if (!consultations || consultations.length === 0) {
      console.log('✅ No consultations found to migrate');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const consultation of consultations) {
      const recommendations = consultation.treatment_recommendations;

      // Check if it's already in new format (has archType)
      if (recommendations && typeof recommendations === 'object' && recommendations.archType !== undefined) {
        console.log(`⏭️ Consultation ${consultation.id} already in new format, skipping`);
        skippedCount++;
        continue;
      }

      // Check if it's old format (has boolean fields)
      if (recommendations && typeof recommendations === 'object' && hasOldFormatFields(recommendations)) {
        console.log(`🔄 Migrating consultation ${consultation.id} from old format`);

        // Convert old format to new format
        const newRecommendations = {
          archType: '',
          upperTreatment: [],
          lowerTreatment: [],
        };

        // Update the consultation record
        const { error: updateError } = await supabase
          .from('consultations')
          .update({
            treatment_recommendations: newRecommendations,
            updated_at: new Date().toISOString()
          })
          .eq('id', consultation.id);

        if (updateError) {
          console.error(`❌ Error updating consultation ${consultation.id}:`, updateError);
        } else {
          console.log(`✅ Successfully migrated consultation ${consultation.id}`);
          migratedCount++;
        }
      } else {
        console.log(`⏭️ Consultation ${consultation.id} has unknown format, skipping`);
        skippedCount++;
      }
    }

    console.log(`🎉 Migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);
    
    if (migratedCount > 0) {
      toast.success(`Successfully migrated ${migratedCount} consultation records to new format`);
    }

  } catch (error) {
    console.error('❌ Error during migration:', error);
    toast.error('Failed to migrate treatment recommendations');
  }
}

// Helper function to check if recommendations object has old format fields
function hasOldFormatFields(recommendations: any): boolean {
  const oldFormatFields = [
    'implantPlacement',
    'implantRestoration', 
    'implantSupported',
    'extraction',
    'bonGraft',
    'sinusLift',
    'denture',
    'bridge',
    'crown'
  ];

  return oldFormatFields.some(field => recommendations.hasOwnProperty(field));
}

// Function to run migration on app startup (optional)
export async function runMigrationIfNeeded(): Promise<void> {
  try {
    // Check if there are any consultations with old format
    const { data: oldFormatConsultations, error } = await supabase
      .from('consultations')
      .select('id')
      .not('treatment_recommendations', 'is', null)
      .limit(1);

    if (error) {
      console.error('❌ Error checking for old format consultations:', error);
      return;
    }

    if (oldFormatConsultations && oldFormatConsultations.length > 0) {
      // Check if any have old format
      const { data: sampleConsultation } = await supabase
        .from('consultations')
        .select('treatment_recommendations')
        .not('treatment_recommendations', 'is', null)
        .limit(1)
        .single();

      if (sampleConsultation?.treatment_recommendations) {
        const recommendations = sampleConsultation.treatment_recommendations;
        
        // If it doesn't have archType but has old format fields, run migration
        if (recommendations.archType === undefined && hasOldFormatFields(recommendations)) {
          console.log('🔄 Old format detected, running migration...');
          await migrateTreatmentRecommendations();
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking migration status:', error);
  }
}

// Manual migration function for admin use
export async function manualMigration(): Promise<void> {
  const confirmed = window.confirm(
    'This will migrate all consultation records from the old treatment recommendations format to the new arch-based format. This action cannot be undone. Continue?'
  );

  if (confirmed) {
    await migrateTreatmentRecommendations();
  }
}
