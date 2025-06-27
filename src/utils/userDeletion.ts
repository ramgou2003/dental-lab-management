import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserDeletionPreview {
  user_id: string;
  email: string;
  records_to_delete: {
    user_profiles: number;
    user_roles: number;
    user_status_logs: number;
    audit_logs: number;
  };
  references_to_nullify: {
    roles_created_by: number;
    surgical_recall_sheets_created_by: number;
    user_profiles_created_by: number;
  };
}

export interface UserDeletionResult {
  user_id: string;
  email: string;
  deleted_at: string;
  deleted_by: string;
  deletion_counts: {
    user_profiles: number;
    user_roles: number;
    user_status_logs: number;
    audit_logs: number;
  };
  status: string;
}

/**
 * Preview what would be deleted when removing a user
 */
export async function previewUserDeletion(userId: string): Promise<UserDeletionPreview> {
  try {
    const { data, error } = await supabase.rpc('preview_user_deletion', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error previewing user deletion:', error);
      throw new Error(error.message);
    }

    return data as UserDeletionPreview;
  } catch (error) {
    console.error('Error in previewUserDeletion:', error);
    throw error;
  }
}

/**
 * Delete user from all database tables
 */
export async function deleteUserFromDatabase(userId: string): Promise<UserDeletionResult> {
  try {
    const { data, error } = await supabase.rpc('delete_user_completely', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error deleting user from database:', error);
      throw new Error(error.message);
    }

    return data as UserDeletionResult;
  } catch (error) {
    console.error('Error in deleteUserFromDatabase:', error);
    throw error;
  }
}

/**
 * Delete user from Supabase Auth using Admin API
 * Note: This requires the service role key and should be done server-side in production
 */
export async function deleteUserFromAuth(userId: string): Promise<boolean> {
  try {
    // In a production environment, this should be done via a secure server endpoint
    // For now, we'll use the management API directly
    
    // Note: This requires admin privileges and service role key
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user from auth:', error);
      throw new Error(`Auth deletion failed: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteUserFromAuth:', error);
    throw error;
  }
}

/**
 * Complete user deletion - removes from both database and authentication
 */
export async function deleteUserCompletely(
  userId: string,
  userEmail: string
): Promise<{
  databaseResult: UserDeletionResult;
  authResult: boolean;
}> {
  try {
    // Step 1: Delete from database first
    console.log('Deleting user from database...');
    const databaseResult = await deleteUserFromDatabase(userId);
    
    // Step 2: Delete from Supabase Auth
    console.log('Deleting user from authentication...');
    const authResult = await deleteUserFromAuth(userId);

    // Step 3: Show success message
    toast.success(
      `User ${userEmail} has been completely deleted from the system.`,
      {
        description: 'All user data and authentication records have been removed.',
        duration: 5000
      }
    );

    return {
      databaseResult,
      authResult
    };
  } catch (error) {
    console.error('Error in complete user deletion:', error);
    
    // If database deletion succeeded but auth failed, log it
    if (error instanceof Error && error.message.includes('Auth deletion failed')) {
      toast.error(
        'User deleted from database but authentication deletion failed.',
        {
          description: 'The user may still be able to login. Contact system administrator.',
          duration: 8000
        }
      );
    } else {
      toast.error(
        'Failed to delete user completely.',
        {
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          duration: 5000
        }
      );
    }
    
    throw error;
  }
}

/**
 * Show confirmation dialog before deleting user
 */
export function showUserDeletionConfirmation(
  userEmail: string,
  onConfirm: () => void
): void {
  // This would typically use a proper modal/dialog component
  const confirmed = window.confirm(
    `⚠️ PERMANENT DELETION WARNING ⚠️\n\n` +
    `You are about to PERMANENTLY DELETE the user:\n` +
    `Email: ${userEmail}\n\n` +
    `This action will:\n` +
    `• Remove the user from all database tables\n` +
    `• Delete their authentication account\n` +
    `• Remove all associated data and logs\n` +
    `• Cannot be undone\n\n` +
    `Are you absolutely sure you want to proceed?`
  );

  if (confirmed) {
    onConfirm();
  }
}

/**
 * Validate if user can be deleted (check for critical dependencies)
 */
export async function validateUserDeletion(userId: string): Promise<{
  canDelete: boolean;
  warnings: string[];
  blockers: string[];
}> {
  try {
    const preview = await previewUserDeletion(userId);
    
    const warnings: string[] = [];
    const blockers: string[] = [];

    // Check for data that will be affected
    if (preview.records_to_delete.audit_logs > 0) {
      warnings.push(`${preview.records_to_delete.audit_logs} audit log entries will be deleted`);
    }

    if (preview.references_to_nullify.roles_created_by > 0) {
      warnings.push(`${preview.references_to_nullify.roles_created_by} roles created by this user will lose their creator reference`);
    }

    if (preview.references_to_nullify.surgical_recall_sheets_created_by > 0) {
      warnings.push(`${preview.references_to_nullify.surgical_recall_sheets_created_by} surgical recall sheets will lose their creator reference`);
    }

    // Add any business logic blockers here
    // For example, if user has active lab scripts, appointments, etc.

    return {
      canDelete: blockers.length === 0,
      warnings,
      blockers
    };
  } catch (error) {
    console.error('Error validating user deletion:', error);
    return {
      canDelete: false,
      warnings: [],
      blockers: ['Unable to validate user deletion due to system error']
    };
  }
}
