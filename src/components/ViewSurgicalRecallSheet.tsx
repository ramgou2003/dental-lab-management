import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  User, 
  Calendar, 
  Activity,
  CheckCircle,
  Clock
} from "lucide-react";

interface ViewSurgicalRecallSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sheetData: {
    sheet: {
      id: string;
      patient_name: string;
      surgery_date: string;
      arch_type: 'upper' | 'lower' | 'dual';
      upper_surgery_type?: string;
      lower_surgery_type?: string;
      status: 'draft' | 'completed';
      created_at: string;
      updated_at: string;
    };
    implants: Array<{
      id: string;
      arch: 'upper' | 'lower';
      position: string;
      implant_brand: string;
      implant_series: string;
      implant_size: string;
      mua_brand?: string;
      mua_series?: string;
      mua_size?: string;
      implant_picture_url?: string;
      mua_picture_url?: string;
    }>;
  } | null;
}

export const ViewSurgicalRecallSheet: React.FC<ViewSurgicalRecallSheetProps> = ({
  isOpen,
  onClose,
  sheetData
}) => {
  if (!sheetData) return null;

  const { sheet, implants } = sheetData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFieldValue = (value: string | undefined) => {
    if (!value) return 'N/A';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const upperImplants = implants.filter(implant => implant.arch === 'upper');
  const lowerImplants = implants.filter(implant => implant.arch === 'lower');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            Surgical Recall Sheet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Patient:</span>
                <span className="ml-2 text-blue-700">{sheet.patient_name}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Surgery Date:</span>
                <span className="ml-2 text-blue-700">{formatDate(sheet.surgery_date)}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Arch Type:</span>
                <span className="ml-2 text-blue-700">{formatFieldValue(sheet.arch_type)}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Status:</span>
                <Badge className={`ml-2 ${
                  sheet.status === 'completed' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-orange-100 text-orange-800 border-orange-200'
                }`}>
                  {formatFieldValue(sheet.status)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Surgery Types */}
          {(sheet.upper_surgery_type || sheet.lower_surgery_type) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Surgery Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sheet.upper_surgery_type && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Upper Surgery:</span>
                      <Badge variant="outline">{formatFieldValue(sheet.upper_surgery_type)}</Badge>
                    </div>
                  )}
                  {sheet.lower_surgery_type && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Lower Surgery:</span>
                      <Badge variant="outline">{formatFieldValue(sheet.lower_surgery_type)}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Implants */}
          {implants.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Implants</h3>
                
                {/* Upper Implants */}
                {upperImplants.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-800">Upper Arch</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upperImplants.map((implant) => (
                        <div key={implant.id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Position:</span>
                              <span className="text-gray-900">{implant.position}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Implant:</span>
                              <span className="text-gray-900">{implant.implant_brand} {implant.implant_series}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Size:</span>
                              <span className="text-gray-900">{implant.implant_size}</span>
                            </div>
                            {implant.mua_brand && (
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">MUA:</span>
                                <span className="text-gray-900">{implant.mua_brand} {implant.mua_series} {implant.mua_size}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lower Implants */}
                {lowerImplants.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-800">Lower Arch</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lowerImplants.map((implant) => (
                        <div key={implant.id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Position:</span>
                              <span className="text-gray-900">{implant.position}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Implant:</span>
                              <span className="text-gray-900">{implant.implant_brand} {implant.implant_series}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Size:</span>
                              <span className="text-gray-900">{implant.implant_size}</span>
                            </div>
                            {implant.mua_brand && (
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">MUA:</span>
                                <span className="text-gray-900">{implant.mua_brand} {implant.mua_series} {implant.mua_size}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Report Status */}
          <Separator />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-700">Report Status:</span>
              <Badge className={`${
                sheet.status === 'completed'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-orange-100 text-orange-800 border-orange-200'
              }`}>
                {formatFieldValue(sheet.status)}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Created: {formatDate(sheet.created_at)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
