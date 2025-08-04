import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Heart, 
  Pill, 
  Shield,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";
import { NewPatientFormData } from "@/types/newPatientPacket";

interface PatientPacketViewerProps {
  packetData: NewPatientFormData;
  submittedAt?: string;
  className?: string;
}

export function PatientPacketViewer({ packetData, submittedAt, className = "" }: PatientPacketViewerProps) {
  const formatDate = (date: Date | string) => {
    if (!date) return 'Not provided';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'Not provided';
    // Format phone number as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatAddress = (address: any) => {
    if (!address || typeof address !== 'object') return 'Not provided';
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zip
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Patient Packet</h3>
        </div>
        {submittedAt && (
          <Badge variant="outline" className="text-green-600 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Submitted {new Date(submittedAt).toLocaleDateString()}
          </Badge>
        )}
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Name</label>
              <p className="text-sm">{packetData.firstName} {packetData.lastName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Gender</label>
              <p className="text-sm capitalize">{packetData.gender?.replace('-', ' ') || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Date of Birth</label>
              <p className="text-sm">{formatDate(packetData.dateOfBirth)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">BMI</label>
              <p className="text-sm">{packetData.bmi || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Email</label>
              <p className="text-sm">{packetData.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Cell Phone</label>
              <p className="text-sm">{formatPhone(packetData.phone?.cell || '')}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Work Phone</label>
              <p className="text-sm">{formatPhone(packetData.phone?.work || '')}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Address</label>
              <p className="text-sm">{formatAddress(packetData.address)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      {packetData.emergencyContact?.name && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Name</label>
                <p className="text-sm">{packetData.emergencyContact.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Relationship</label>
                <p className="text-sm">{packetData.emergencyContact.relationship}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500">Phone</label>
                <p className="text-sm">{formatPhone(packetData.emergencyContact.phone || '')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {packetData.medicalHistory?.conditions && packetData.medicalHistory.conditions.length > 0 ? (
            <div>
              <label className="text-xs font-medium text-gray-500">Medical Conditions</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {packetData.medicalHistory.conditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No medical conditions reported</p>
          )}
        </CardContent>
      </Card>

      {/* Current Medications */}
      {packetData.medications && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {packetData.medications.none ? (
              <p className="text-sm text-gray-500">No current medications</p>
            ) : (
              <div className="space-y-2">
                {packetData.medications.complete && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Medication List</label>
                    <p className="text-sm">{packetData.medications.complete}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dental Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Current Oral Health Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Upper Jaw</label>
              <p className="text-sm capitalize">{packetData.dentalStatus?.upperJaw?.replace('-', ' ') || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Lower Jaw</label>
              <p className="text-sm capitalize">{packetData.dentalStatus?.lowerJaw?.replace('-', ' ') || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures */}
      {packetData.signature && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Signatures & Attestations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Patient Name (Signature)</label>
              <p className="text-sm">{packetData.patientNameSignature || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Signature Date</label>
              <p className="text-sm">{formatDate(packetData.date)}</p>
            </div>
            {packetData.signature && (
              <div>
                <label className="text-xs font-medium text-gray-500">Digital Signature</label>
                <div className="mt-1 p-2 border rounded bg-gray-50">
                  <img 
                    src={packetData.signature} 
                    alt="Patient Signature" 
                    className="max-h-16 max-w-full"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
