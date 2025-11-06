import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Stethoscope,
  X,
  Plus,
  Check,
  Trash2
} from "lucide-react";

interface ProcedureListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProcedures: (procedures: any[]) => void;
}

export function ProcedureListDialog({
  isOpen,
  onClose,
  onSelectProcedures
}: ProcedureListDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [procedures, setProcedures] = useState([]);
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [costTypeDialog, setCostTypeDialog] = useState<{ isOpen: boolean; procedure: any | null }>({ isOpen: false, procedure: null });
  const [showSelectedDialog, setShowSelectedDialog] = useState(false);

  // Fetch procedures from Supabase
  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching procedures:', error);
        setProcedures([]);
      } else {
        setProcedures(data || []);
      }
    } catch (error) {
      console.error('Error fetching procedures:', error);
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProcedures();
      setSelectedProcedures([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  const filteredProcedures = useMemo(() => {
    return procedures.filter(procedure =>
      procedure.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procedure.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procedure.cdt_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procedure.cpt_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [procedures, searchTerm]);

  const handleAddProcedure = (procedure: any, costType: 'dental' | 'medical') => {
    setSelectedProcedures(prev => {
      const isSelected = prev.some(p => p.id === procedure.id);
      if (isSelected) {
        return prev.filter(p => p.id !== procedure.id);
      } else {
        return [...prev, { ...procedure, quantity: 1, cost_type: costType }];
      }
    });
    setCostTypeDialog({ isOpen: false, procedure: null });
  };

  const handleRemoveProcedure = (procedureId: string) => {
    setSelectedProcedures(prev => prev.filter(p => p.id !== procedureId));
  };

  const handleOpenCostTypeDialog = (e: React.MouseEvent, procedure: any) => {
    e.stopPropagation();

    // Check if procedure has only one cost type
    const hasDental = procedure.dental_cost;
    const hasMedical = procedure.medical_cost;

    if (hasDental && !hasMedical) {
      // Only dental cost available, select it directly
      handleAddProcedure(procedure, 'dental');
    } else if (hasMedical && !hasDental) {
      // Only medical cost available, select it directly
      handleAddProcedure(procedure, 'medical');
    } else {
      // Both costs available, show dialog
      setCostTypeDialog({ isOpen: true, procedure });
    }
  };

  const handleSelectProcedures = () => {
    onSelectProcedures(selectedProcedures);
    onClose();
  };

  const handleCancel = () => {
    setSelectedProcedures([]);
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col p-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              Select Procedures
            </DialogTitle>
            <Separator />
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search procedures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Procedures List */}
          {loading ? (
            <div className="text-center py-16 text-gray-500">
              <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300 animate-pulse" />
              <p className="text-xl font-medium mb-2">Loading procedures...</p>
            </div>
          ) : filteredProcedures.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium mb-2">No procedures found</p>
              <p className="text-base">Try adjusting your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProcedures.map((procedure) => {
                const isSelected = selectedProcedures.some(p => p.id === procedure.id);
                return (
                  <Card
                    key={procedure.id}
                    className={`transition-all duration-200 ${
                      isSelected
                        ? 'border-2 border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-sm font-bold text-gray-900">
                            {procedure.name}
                          </CardTitle>
                          <div className="flex gap-2 flex-wrap items-center">
                            {procedure.cdt_code && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                CDT: {procedure.cdt_code}
                              </Badge>
                            )}
                            {procedure.cpt_code && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                CPT: {procedure.cpt_code}
                              </Badge>
                            )}
                            {procedure.dental_cost && (
                              <Badge className="text-xs bg-green-100 text-green-800 border border-green-300">
                                Dental: ${parseFloat(procedure.dental_cost).toFixed(2)}
                              </Badge>
                            )}
                            {procedure.medical_cost && (
                              <Badge className="text-xs bg-blue-100 text-blue-800 border border-blue-300">
                                Medical: ${parseFloat(procedure.medical_cost).toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isSelected ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveProcedure(procedure.id);
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleOpenCostTypeDialog(e, procedure)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {selectedProcedures.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSelectedDialog(true)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {selectedProcedures.length} procedure{selectedProcedures.length !== 1 ? 's' : ''} selected
              </Button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSelectProcedures}
                disabled={selectedProcedures.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add {selectedProcedures.length} Procedure{selectedProcedures.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>

        {/* Selected Procedures Dialog */}
        {showSelectedDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96 max-h-96 shadow-lg flex flex-col">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-bold">
                  Selected Procedures ({selectedProcedures.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto py-4 space-y-2">
                {selectedProcedures.map((procedure) => (
                  <div
                    key={procedure.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {procedure.name}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge className="text-xs bg-gray-200 text-gray-800">
                          {procedure.cost_type === 'medical' ? 'Medical' : 'Dental'}
                        </Badge>
                        <Badge className={`text-xs ${
                          procedure.cost_type === 'medical'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          ${procedure.cost_type === 'medical'
                            ? parseFloat(procedure.medical_cost || 0).toFixed(2)
                            : parseFloat(procedure.dental_cost || 0).toFixed(2)
                          }
                        </Badge>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveProcedure(procedure.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
              <div className="border-t p-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSelectedDialog(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Cost Type Selection Dialog */}
        {costTypeDialog.isOpen && costTypeDialog.procedure && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-gray-900">
                  Select Cost Type
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  {costTypeDialog.procedure.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {costTypeDialog.procedure.dental_cost && (
                  <button
                    type="button"
                    onClick={() => handleAddProcedure(costTypeDialog.procedure, 'dental')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg p-3 text-left transition-colors"
                  >
                    <p className="font-semibold">Dental Cost</p>
                    <p className="font-bold text-lg">
                      ${parseFloat(costTypeDialog.procedure.dental_cost).toFixed(2)}
                    </p>
                  </button>
                )}
                {costTypeDialog.procedure.medical_cost && (
                  <button
                    type="button"
                    onClick={() => handleAddProcedure(costTypeDialog.procedure, 'medical')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-3 text-left transition-colors"
                  >
                    <p className="font-semibold">Medical Cost</p>
                    <p className="font-bold text-lg">
                      ${parseFloat(costTypeDialog.procedure.medical_cost).toFixed(2)}
                    </p>
                  </button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCostTypeDialog({ isOpen: false, procedure: null })}
                  className="w-full text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
