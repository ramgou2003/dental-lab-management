import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { deleteSurgicalRecallSheet } from "@/lib/surgicalRecallService";
import { toast } from "sonner";

interface DeleteSurgicalRecallSheetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sheet: {
    id: string;
    patient_name: string;
    surgery_date: string;
    arch_type: string;
    implantCount?: number;
  } | null;
}

export function DeleteSurgicalRecallSheetDialog({
  isOpen,
  onClose,
  onSuccess,
  sheet
}: DeleteSurgicalRecallSheetDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!sheet) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Starting deletion of surgical recall sheet:', sheet.id);
      
      const result = await deleteSurgicalRecallSheet(sheet.id);
      
      if (result.success) {
        toast.success('Surgical recall sheet and all images deleted successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting surgical recall sheet:', error);
      toast.error('An unexpected error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!sheet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Surgical Recall Sheet
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="text-sm text-red-700">
              <p className="font-medium">This action cannot be undone!</p>
              <p>All data and images will be permanently deleted.</p>
            </div>
          </div>

          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this surgical recall sheet? This will:
          </p>
          
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
            <li>Delete the surgical recall sheet record</li>
            <li>Delete all associated implant records</li>
            <li>Delete all implant sticker images from storage</li>
            <li>Delete all MUA sticker images from storage</li>
            <li>Remove all related data permanently</li>
          </ul>

          <div className="bg-gray-50 rounded-lg p-3 border">
            <h4 className="font-medium text-gray-900 mb-2">Sheet Details:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Patient:</span> {sheet.patient_name}</p>
              <p><span className="font-medium">Surgery Date:</span> {new Date(sheet.surgery_date).toLocaleDateString()}</p>
              <p><span className="font-medium">Arch Type:</span> {sheet.arch_type.charAt(0).toUpperCase() + sheet.arch_type.slice(1)}</p>
              {sheet.implantCount !== undefined && (
                <p><span className="font-medium">Implants:</span> {sheet.implantCount} implant{sheet.implantCount !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Sheet
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
