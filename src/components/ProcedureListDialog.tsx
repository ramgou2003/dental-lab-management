import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search,
  Stethoscope,
  X
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

  const handleProcedureToggle = (procedure: any) => {
    setSelectedProcedures(prev => {
      const isSelected = prev.some(p => p.id === procedure.id);
      if (isSelected) {
        return prev.filter(p => p.id !== procedure.id);
      } else {
        return [...prev, procedure];
      }
    });
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
          {/* Selected Procedures Summary */}
          {selectedProcedures.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-blue-800">
                  Selected Procedures ({selectedProcedures.length})
                </p>
                <p className="text-sm font-semibold text-green-700">
                  Total: ${selectedProcedures.reduce((total, proc) => total + parseFloat(proc.dental_cost || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedProcedures.map((procedure) => (
                  <Badge key={procedure.id} variant="outline" className="bg-white">
                    {procedure.name}
                    {procedure.dental_cost && (
                      <span className="ml-1 text-green-600">
                        ${parseFloat(procedure.dental_cost).toFixed(2)}
                      </span>
                    )}
                    <button
                      onClick={() => handleProcedureToggle(procedure)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProcedures.map((procedure) => {
                const isSelected = selectedProcedures.some(p => p.id === procedure.id);
                return (
                  <Card 
                    key={procedure.id} 
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                    onClick={() => handleProcedureToggle(procedure)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleProcedureToggle(procedure)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-gray-900 mb-2">
                            {procedure.name}
                          </CardTitle>
                          <div className="flex gap-2 mb-2">
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
                          </div>
                          {procedure.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {procedure.description}
                            </p>
                          )}
                          {procedure.dental_cost && (
                            <p className="text-sm font-semibold text-green-600">
                              ${parseFloat(procedure.dental_cost).toFixed(2)}
                            </p>
                          )}
                        </div>
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
            <p className="text-sm text-gray-600">
              {selectedProcedures.length} procedure{selectedProcedures.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-3">
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
      </DialogContent>
    </Dialog>
  );
}
