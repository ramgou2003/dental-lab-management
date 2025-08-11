import React from 'react';

interface NewPatientPacketPrintProps {
  packetData: any;
}

export const NewPatientPacketPrint: React.FC<NewPatientPacketPrintProps> = ({ packetData }) => {
  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">First Name:</span> {packetData.first_name || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Last Name:</span> {packetData.last_name || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Date of Birth:</span> {packetData.date_of_birth ? new Date(packetData.date_of_birth).toLocaleDateString() : 'N/A'}
          </div>
          <div>
            <span className="font-medium">Gender:</span> {packetData.gender || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Email:</span> {packetData.email || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Phone (Cell):</span> {packetData.phone_cell || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Phone (Home):</span> {packetData.phone_home || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Phone (Work):</span> {packetData.phone_work || 'N/A'}
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          Address Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Street:</span> {packetData.street || 'N/A'}
          </div>
          <div>
            <span className="font-medium">City:</span> {packetData.city || 'N/A'}
          </div>
          <div>
            <span className="font-medium">State:</span> {packetData.state || 'N/A'}
          </div>
          <div>
            <span className="font-medium">ZIP Code:</span> {packetData.zip_code || 'N/A'}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          Emergency Contact
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Name:</span> {packetData.emergency_contact_name || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Relationship:</span> {packetData.emergency_contact_relationship || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {packetData.emergency_contact_phone || 'N/A'}
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          Insurance Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Has Medical Insurance:</span> {packetData.has_medical_insurance ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">PCP Name:</span> {packetData.pcp_name || 'N/A'}
          </div>
          <div>
            <span className="font-medium">PCP Practice:</span> {packetData.pcp_practice || 'N/A'}
          </div>
          <div>
            <span className="font-medium">PCP Phone:</span> {packetData.pcp_phone || 'N/A'}
          </div>
        </div>
      </div>

      {/* Medical History */}
      {packetData.medical_history && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Medical History
          </h3>
          <div className="text-sm">
            <div className="whitespace-pre-wrap">{packetData.medical_history}</div>
          </div>
        </div>
      )}

      {/* Current Medications */}
      {packetData.current_medications && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Current Medications
          </h3>
          <div className="text-sm">
            <div className="whitespace-pre-wrap">{packetData.current_medications}</div>
          </div>
        </div>
      )}

      {/* Allergies */}
      {packetData.allergies && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Allergies
          </h3>
          <div className="text-sm">
            <div className="whitespace-pre-wrap">{packetData.allergies}</div>
          </div>
        </div>
      )}

      {/* Dental History */}
      {packetData.dental_history && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Dental History
          </h3>
          <div className="text-sm">
            <div className="whitespace-pre-wrap">{packetData.dental_history}</div>
          </div>
        </div>
      )}

      {/* Signatures */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          Signatures
        </h3>
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div>
            <div className="text-sm font-medium mb-2">Patient Signature:</div>
            {packetData.patient_signature ? (
              <img src={packetData.patient_signature} alt="Patient Signature" className="max-h-16 border border-gray-300" />
            ) : (
              <div className="h-16 border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
                No signature provided
              </div>
            )}
            <div className="text-xs text-gray-600 mt-1">
              Date: {packetData.patient_signature_date ? new Date(packetData.patient_signature_date).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">Witness Signature:</div>
            {packetData.witness_signature ? (
              <img src={packetData.witness_signature} alt="Witness Signature" className="max-h-16 border border-gray-300" />
            ) : (
              <div className="h-16 border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
                No signature provided
              </div>
            )}
            <div className="text-xs text-gray-600 mt-1">
              Date: {packetData.witness_signature_date ? new Date(packetData.witness_signature_date).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Form Metadata */}
      <div className="mt-8 pt-4 border-t border-gray-300">
        <div className="text-xs text-gray-500 grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Form Status:</span> {packetData.form_status || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Submitted:</span> {packetData.submitted_at ? new Date(packetData.submitted_at).toLocaleString() : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};
