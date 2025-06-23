import React, { useState } from 'react';
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
  Clock,
  Eye,
  Camera
} from "lucide-react";

interface ViewSurgicalRecallSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sheetData: any | null;
}

export const ViewSurgicalRecallSheet: React.FC<ViewSurgicalRecallSheetProps> = ({
  isOpen,
  onClose,
  sheetData
}) => {
  // Sticker preview state
  const [stickerPreview, setStickerPreview] = useState<{
    url: string;
    title: string;
    type: 'implant' | 'mua';
  } | null>(null);

  if (!sheetData) return null;

  // Handle different data structures
  const sheet = sheetData.sheet || sheetData;
  const implants = sheetData.implants || sheetData.surgical_recall_implants || [];

  if (!sheet) return null;

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

  const upperImplants = (implants || []).filter((implant: any) => implant?.arch_type === 'upper');
  const lowerImplants = (implants || []).filter((implant: any) => implant?.arch_type === 'lower');

  // Handle sticker image preview
  const handleStickerPreview = (url: string, implant: any, type: 'implant' | 'mua') => {
    const title = `${type === 'implant' ? 'Implant' : 'MUA'} Sticker - Tooth ${implant.position}`;
    setStickerPreview({
      url,
      title,
      type
    });
  };

  const closeStickerPreview = () => {
    setStickerPreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <FileText className="h-6 w-6 text-blue-600" />
            Surgical Recall Sheet Preview
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Patient Information - Compact */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-600 rounded-md">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-blue-900">Patient Information</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-md p-3 border border-blue-200">
                  <div className="text-xs font-medium text-blue-600 mb-1">Patient</div>
                  <div className="text-sm font-semibold text-gray-900 truncate">{sheet?.patient_name || 'N/A'}</div>
                </div>
                <div className="bg-white rounded-md p-3 border border-blue-200">
                  <div className="text-xs font-medium text-blue-600 mb-1">Surgery Date</div>
                  <div className="text-sm font-semibold text-gray-900">{sheet?.surgery_date ? formatDate(sheet.surgery_date) : 'N/A'}</div>
                </div>
                <div className="bg-white rounded-md p-3 border border-blue-200">
                  <div className="text-xs font-medium text-blue-600 mb-1">Arch Type</div>
                  <div className="text-sm font-semibold text-gray-900 capitalize">{sheet?.arch_type || 'N/A'}</div>
                </div>
                <div className="bg-white rounded-md p-3 border border-blue-200">
                  <div className="text-xs font-medium text-blue-600 mb-1">Status</div>
                  <div className={`text-sm font-semibold ${
                    sheet?.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {formatFieldValue(sheet?.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Surgery Information */}
            {(sheet?.upper_surgery_type || sheet?.lower_surgery_type) && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900">Surgery Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sheet?.upper_surgery_type && (
                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Upper Surgery Type</div>
                      <div className="text-sm font-semibold text-gray-900">{formatFieldValue(sheet.upper_surgery_type)}</div>
                    </div>
                  )}
                  {sheet?.lower_surgery_type && (
                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Lower Surgery Type</div>
                      <div className="text-sm font-semibold text-gray-900">{formatFieldValue(sheet.lower_surgery_type)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Implants Information */}
            {(implants || []).length > 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-600 rounded-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Implants & Components ({(implants || []).length})</h3>
                </div>

                {/* Upper Implants */}
                {upperImplants.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      Upper Arch ({upperImplants.length} implants)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {upperImplants.map((implant: any) => (
                        <div key={implant?.id || Math.random()} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200">
                          {/* Header with Position */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {implant?.position || '?'}
                            </div>
                            <div>
                              <h4 className="font-bold text-blue-900 text-sm">Tooth {implant?.position || '?'}</h4>
                              <p className="text-xs text-blue-700">
                                {implant?.implant_brand ? implant.implant_brand.toUpperCase() : 'No Brand'}
                              </p>
                            </div>
                          </div>

                          {/* Implant Details */}
                          <div className="space-y-2 mb-3">
                            {implant?.implant_subtype && (
                              <div className="bg-white/70 rounded-lg px-2 py-1">
                                <p className="text-xs font-medium text-blue-800">Series: {implant.implant_subtype}</p>
                              </div>
                            )}
                            {implant?.implant_size && (
                              <div className="bg-white/70 rounded-lg px-2 py-1">
                                <p className="text-xs font-medium text-blue-800">Size: {implant.implant_size}</p>
                              </div>
                            )}
                          </div>

                          {/* Images Grid */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {/* Implant Image */}
                            <div>
                              <p className="text-xs font-bold text-blue-800 mb-1">Implant</p>
                              {implant?.implant_picture_url ? (
                                <div
                                  className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200"
                                  onClick={() => handleStickerPreview(implant.implant_picture_url, implant, 'implant')}
                                  title="Click to view full size"
                                >
                                  <img
                                    src={implant.implant_picture_url}
                                    alt="Implant sticker"
                                    className="w-full h-16 object-contain p-1 hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-blue-300 rounded-lg h-16 flex items-center justify-center bg-white/50">
                                  <Camera className="h-4 w-4 text-blue-400" />
                                </div>
                              )}
                            </div>

                            {/* MUA Image */}
                            <div>
                              <p className="text-xs font-bold text-blue-800 mb-1">MUA</p>
                              {implant?.mua_picture_url ? (
                                <div
                                  className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200"
                                  onClick={() => handleStickerPreview(implant.mua_picture_url, implant, 'mua')}
                                  title="Click to view full size"
                                >
                                  <img
                                    src={implant.mua_picture_url}
                                    alt="MUA sticker"
                                    className="w-full h-16 object-contain p-1 hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-blue-300 rounded-lg h-16 flex items-center justify-center bg-white/50">
                                  <Camera className="h-4 w-4 text-blue-400" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* MUA Details */}
                          {(implant?.mua_brand || implant?.mua_size) && (
                            <div className="bg-white/70 rounded-lg p-2 border border-blue-200">
                              <p className="text-xs font-bold text-blue-800 mb-1">MUA Details</p>
                              {implant?.mua_brand && (
                                <p className="text-xs text-blue-700">
                                  {implant.mua_brand && implant.mua_subtype ? `${implant.mua_brand} - ${implant.mua_subtype}` : implant.mua_brand}
                                </p>
                              )}
                              {implant?.mua_size && (
                                <p className="text-xs text-blue-700">Size: {implant.mua_size}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lower Implants */}
                {lowerImplants.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      Lower Arch ({lowerImplants.length} implants)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {lowerImplants.map((implant: any) => (
                        <div key={implant?.id || Math.random()} className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200">
                          {/* Header with Position */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {implant?.position || '?'}
                            </div>
                            <div>
                              <h4 className="font-bold text-green-900 text-sm">Tooth {implant?.position || '?'}</h4>
                              <p className="text-xs text-green-700">
                                {implant?.implant_brand ? implant.implant_brand.toUpperCase() : 'No Brand'}
                              </p>
                            </div>
                          </div>

                          {/* Implant Details */}
                          <div className="space-y-2 mb-3">
                            {implant?.implant_subtype && (
                              <div className="bg-white/70 rounded-lg px-2 py-1">
                                <p className="text-xs font-medium text-green-800">Series: {implant.implant_subtype}</p>
                              </div>
                            )}
                            {implant?.implant_size && (
                              <div className="bg-white/70 rounded-lg px-2 py-1">
                                <p className="text-xs font-medium text-green-800">Size: {implant.implant_size}</p>
                              </div>
                            )}
                          </div>

                          {/* Images Grid */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {/* Implant Image */}
                            <div>
                              <p className="text-xs font-bold text-green-800 mb-1">Implant</p>
                              {implant?.implant_picture_url ? (
                                <div
                                  className="border-2 border-green-300 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:border-green-500 hover:shadow-md transition-all duration-200"
                                  onClick={() => handleStickerPreview(implant.implant_picture_url, implant, 'implant')}
                                  title="Click to view full size"
                                >
                                  <img
                                    src={implant.implant_picture_url}
                                    alt="Implant sticker"
                                    className="w-full h-16 object-contain p-1 hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-green-300 rounded-lg h-16 flex items-center justify-center bg-white/50">
                                  <Camera className="h-4 w-4 text-green-400" />
                                </div>
                              )}
                            </div>

                            {/* MUA Image */}
                            <div>
                              <p className="text-xs font-bold text-green-800 mb-1">MUA</p>
                              {implant?.mua_picture_url ? (
                                <div
                                  className="border-2 border-green-300 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:border-green-500 hover:shadow-md transition-all duration-200"
                                  onClick={() => handleStickerPreview(implant.mua_picture_url, implant, 'mua')}
                                  title="Click to view full size"
                                >
                                  <img
                                    src={implant.mua_picture_url}
                                    alt="MUA sticker"
                                    className="w-full h-16 object-contain p-1 hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-green-300 rounded-lg h-16 flex items-center justify-center bg-white/50">
                                  <Camera className="h-4 w-4 text-green-400" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* MUA Details */}
                          {(implant?.mua_brand || implant?.mua_size) && (
                            <div className="bg-white/70 rounded-lg p-2 border border-green-200">
                              <p className="text-xs font-bold text-green-800 mb-1">MUA Details</p>
                              {implant?.mua_brand && (
                                <p className="text-xs text-green-700">
                                  {implant.mua_brand && implant.mua_subtype ? `${implant.mua_brand} - ${implant.mua_subtype}` : implant.mua_brand}
                                </p>
                              )}
                              {implant?.mua_size && (
                                <p className="text-xs text-green-700">Size: {implant.mua_size}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Report Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-600 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Report Summary</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Report Status</div>
                  <div className={`text-sm font-semibold ${
                    sheet?.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {formatFieldValue(sheet?.status)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Created Date</div>
                  <div className="text-sm font-semibold text-gray-900">{sheet?.created_at ? formatDate(sheet.created_at) : 'N/A'}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Total Implants</div>
                  <div className="text-sm font-semibold text-gray-900">{(implants || []).length} implants</div>
                </div>
              </div>

              {sheet?.updated_at && sheet?.created_at && sheet.updated_at !== sheet.created_at && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs font-medium text-blue-600 mb-1">Last Updated</div>
                  <div className="text-sm text-blue-800">{formatDate(sheet.updated_at)}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Sticker Preview Dialog */}
      <Dialog open={!!stickerPreview} onOpenChange={closeStickerPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              {stickerPreview?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            {stickerPreview && (
              <img
                src={stickerPreview.url}
                alt={stickerPreview.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                style={{ minHeight: '200px' }}
              />
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={closeStickerPreview}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
