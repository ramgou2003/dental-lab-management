import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreateTreatmentDialog } from "@/components/CreateTreatmentDialog";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Stethoscope,
  FileText,
  Eye
} from "lucide-react";

interface TreatmentListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTreatment: (treatment: any) => void;
}

export function TreatmentListDialog({
  isOpen,
  onClose,
  onSelectTreatment
}: TreatmentListDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateTreatmentDialog, setShowCreateTreatmentDialog] = useState(false);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [previewTreatment, setPreviewTreatment] = useState<any>(null);

  // Fetch treatments from Supabase
  const fetchTreatments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select(`
          *,
          treatment_procedures (
            procedure_id,
            quantity,
            procedures (
              id,
              name,
              cdt_code,
              cpt_code,
              dental_cost
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching treatments:', error);
        setTreatments([]);
      } else {
        // Transform data to include procedures array
        const treatmentsWithProcedures = data.map(treatment => ({
          ...treatment,
          procedures: treatment.treatment_procedures?.map(tp => ({
            ...tp.procedures,
            quantity: tp.quantity || 1
          })) || []
        }));
        setTreatments(treatmentsWithProcedures);
      }
    } catch (error) {
      console.error('Error fetching treatments:', error);
      setTreatments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTreatments();

      // Subscribe to real-time changes in procedures table
      const proceduresSubscription = supabase
        .channel('procedures-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'procedures'
          },
          (payload) => {
            console.log('Procedure updated:', payload);
            // Refresh treatments when any procedure changes
            fetchTreatments();
          }
        )
        .subscribe();

      // Cleanup subscription on unmount or when dialog closes
      return () => {
        supabase.removeChannel(proceduresSubscription);
      };
    }
  }, [isOpen]);

  const filteredTreatments = treatments.filter(treatment =>
    treatment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    treatment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTreatment = (treatment: any) => {
    onSelectTreatment(treatment);
    onClose();
  };

  const handleCreateTreatment = (treatmentData: any) => {
    // Refresh the treatments list from database
    fetchTreatments();
    setShowCreateTreatmentDialog(false);
    setEditingTreatment(null);
  };

  // Calculate total cost dynamically based on current procedure prices
  const calculateTreatmentCost = (treatment: any) => {
    if (!treatment.procedures || treatment.procedures.length === 0) {
      return 0;
    }
    return treatment.procedures.reduce((total, procedure) => {
      const unitPrice = parseFloat(procedure.dental_cost || 0);
      const quantity = procedure.quantity || 1;
      return total + (unitPrice * quantity);
    }, 0);
  };

  const handleEditTreatment = (treatment: any) => {
    setEditingTreatment(treatment);
    setShowCreateTreatmentDialog(true);
  };

  const handleDeleteTreatment = async (treatmentId: string, treatmentName: string) => {
    if (!confirm(`Are you sure you want to delete "${treatmentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete treatment from Supabase
      const { error } = await supabase
        .from('treatments')
        .delete()
        .eq('id', treatmentId);

      if (error) {
        console.error('Error deleting treatment:', error);
        alert('Failed to delete treatment. Please try again.');
        return;
      }

      // Refresh the treatments list
      fetchTreatments();
    } catch (error) {
      console.error('Error deleting treatment:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col p-0">
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  Treatment Library
                </DialogTitle>
                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setShowCreateTreatmentDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Treatment
                </Button>
              </div>
              <Separator />
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search treatments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-16 text-gray-500">
                <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300 animate-pulse" />
                <p className="text-xl font-medium mb-2">Loading treatments...</p>
              </div>
            ) : filteredTreatments.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-medium mb-2">No treatments found</p>
                <p className="text-base">Try adjusting your search or create a new treatment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTreatments.map((treatment) => (
                  <Card key={treatment.id} className="border-2 hover:border-blue-300 transition-colors cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                            {treatment.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs text-green-600">
                              ${calculateTreatmentCost(treatment).toFixed(2)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {treatment.procedure_count || 0} procedures
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTreatment(treatment);
                            }}
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            title="Preview procedures"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTreatment(treatment);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTreatment(treatment.id, treatment.name);
                            }}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {treatment.description && (
                        <p className="text-sm text-gray-600 mb-3">{treatment.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-green-600">
                          ${calculateTreatmentCost(treatment).toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSelectTreatment(treatment)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Select Treatment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Treatment Dialog */}
      <CreateTreatmentDialog
        isOpen={showCreateTreatmentDialog}
        onClose={() => {
          setShowCreateTreatmentDialog(false);
          setEditingTreatment(null);
        }}
        onSubmit={handleCreateTreatment}
        editingTreatment={editingTreatment}
      />

      {/* Treatment Preview Dialog */}
      <Dialog open={!!previewTreatment} onOpenChange={(open) => !open && setPreviewTreatment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              Treatment Preview: {previewTreatment?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {previewTreatment?.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{previewTreatment.description}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Procedures ({previewTreatment?.procedures?.length || 0})</h4>
              {previewTreatment?.procedures && previewTreatment.procedures.length > 0 ? (
                <div className="space-y-2">
                  {previewTreatment.procedures.map((procedure, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{procedure.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            {procedure.cdt_code && (
                              <Badge variant="outline" className="text-xs">
                                CDT: {procedure.cdt_code}
                              </Badge>
                            )}
                            {procedure.cpt_code && (
                              <Badge variant="outline" className="text-xs">
                                CPT: {procedure.cpt_code}
                              </Badge>
                            )}
                            {procedure.quantity && procedure.quantity > 1 && (
                              <Badge variant="outline" className="text-xs">
                                Qty: {procedure.quantity}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {procedure.dental_cost && (
                          <span className="text-sm font-medium text-green-600">
                            ${parseFloat(procedure.dental_cost).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No procedures defined for this treatment.</p>
              )}
            </div>

            {previewTreatment && (
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Total Cost:</span>
                  <span className="text-lg font-semibold text-green-600">
                    ${calculateTreatmentCost(previewTreatment).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewTreatment(null)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleSelectTreatment(previewTreatment);
                setPreviewTreatment(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Select Treatment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
