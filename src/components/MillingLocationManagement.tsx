import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMillingLocations } from '@/hooks/useMillingLocations';
import { MapPin, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface MillingLocationManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MillingLocationManagement({ open, onOpenChange }: MillingLocationManagementProps) {
  const {
    millingLocations,
    loading,
    fetchMillingLocations,
    createMillingLocation,
    updateMillingLocation,
    deleteMillingLocation,
  } = useMillingLocations();

  const [newLocationName, setNewLocationName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (open) {
      fetchMillingLocations();
    }
  }, [open]);

  const handleAdd = async () => {
    if (!newLocationName.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    setIsSubmitting(true);
    try {
      await createMillingLocation(newLocationName.trim());
      setNewLocationName('');
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editingName.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMillingLocation(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (id: string, name: string) => {
    setLocationToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!locationToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteMillingLocation(locationToDelete.id);
      setDeleteConfirmOpen(false);
      setLocationToDelete(null);
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-600">
            <MapPin className="h-6 w-6" />
            Manage Milling Locations
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Add New Location */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <Label className="text-sm font-semibold text-blue-700 mb-2 block">
              Add New Milling Location
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter location name"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAdd();
                  }
                }}
                className="flex-1"
                disabled={isSubmitting}
              />
              <Button
                onClick={handleAdd}
                disabled={isSubmitting || !newLocationName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Existing Locations */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Existing Locations</Label>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : millingLocations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No milling locations found</p>
            ) : (
              <div className="space-y-2">
                {millingLocations
                  .filter((location) => location.is_active)
                  .map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center gap-2 p-3 rounded-lg border-2 bg-white border-gray-200"
                    >
                      {editingId === location.id ? (
                        <>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEdit(location.id);
                              } else if (e.key === 'Escape') {
                                cancelEditing();
                              }
                            }}
                            className="flex-1"
                            disabled={isSubmitting}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleEdit(location.id)}
                            disabled={isSubmitting || !editingName.trim()}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 font-medium text-gray-900">
                            {location.name}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(location.id, location.name)}
                            disabled={isSubmitting}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteConfirm(location.id, location.name)}
                            disabled={isSubmitting}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milling Location?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{locationToDelete?.name}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

