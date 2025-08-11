import React from 'react';

interface GenericFormPrintProps {
  formData: any;
  formType: string;
}

export const GenericFormPrint: React.FC<GenericFormPrintProps> = ({ formData, formType }) => {
  // Function to format field names for display
  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Function to format field values for display
  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
      // Likely a date string
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : 'None';
      }
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Function to determine if a field should be excluded from display
  const shouldExcludeField = (fieldName: string): boolean => {
    const excludedFields = [
      'id',
      'patient_id',
      'created_at',
      'updated_at',
      'form_status'
    ];
    return excludedFields.includes(fieldName);
  };

  // Function to determine if a field contains signature data
  const isSignatureField = (fieldName: string, value: any): boolean => {
    return fieldName.toLowerCase().includes('signature') && 
           typeof value === 'string' && 
           (value.startsWith('data:image/') || value.startsWith('http'));
  };

  // Group fields by category
  const groupFields = (data: any) => {
    const groups: { [key: string]: Array<{ key: string; value: any }> } = {
      'Form Information': [],
      'Patient Information': [],
      'Signatures': [],
      'Other Information': []
    };

    Object.entries(data).forEach(([key, value]) => {
      if (shouldExcludeField(key)) return;

      if (isSignatureField(key, value)) {
        groups['Signatures'].push({ key, value });
      } else if (key.toLowerCase().includes('patient') || key.toLowerCase().includes('name')) {
        groups['Patient Information'].push({ key, value });
      } else if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key.toLowerCase().includes('status')) {
        groups['Form Information'].push({ key, value });
      } else {
        groups['Other Information'].push({ key, value });
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach(groupName => {
      if (groups[groupName].length === 0) {
        delete groups[groupName];
      }
    });

    return groups;
  };

  const fieldGroups = groupFields(formData);

  return (
    <div className="space-y-6">
      {/* Form Description */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          This document contains the submitted information for the {formType.toLowerCase()}.
        </p>
      </div>

      {/* Render each group */}
      {Object.entries(fieldGroups).map(([groupName, fields]) => (
        <div key={groupName}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            {groupName}
          </h3>
          
          {groupName === 'Signatures' ? (
            // Special handling for signatures
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {fields.map(({ key, value }) => (
                <div key={key}>
                  <div className="text-sm font-medium mb-2">{formatFieldName(key)}:</div>
                  {value && (typeof value === 'string' && (value.startsWith('data:image/') || value.startsWith('http'))) ? (
                    <img src={value} alt={formatFieldName(key)} className="max-h-16 border border-gray-300" />
                  ) : (
                    <div className="h-16 border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
                      No signature provided
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Regular field display
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {fields.map(({ key, value }) => (
                <div key={key} className={value && String(value).length > 100 ? 'md:col-span-2' : ''}>
                  <span className="font-medium">{formatFieldName(key)}:</span>
                  <div className={`mt-1 ${String(value).length > 100 ? 'whitespace-pre-wrap' : ''}`}>
                    {formatFieldValue(value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Form Metadata */}
      <div className="mt-8 pt-4 border-t border-gray-300">
        <div className="text-xs text-gray-500 grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Form Type:</span> {formType}
          </div>
          <div>
            <span className="font-medium">Form Status:</span> {formData.form_status || 'Completed'}
          </div>
          {formData.created_at && (
            <div>
              <span className="font-medium">Created:</span> {new Date(formData.created_at).toLocaleString()}
            </div>
          )}
          {formData.updated_at && (
            <div>
              <span className="font-medium">Last Updated:</span> {new Date(formData.updated_at).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-gray-50 rounded border text-xs text-gray-600">
        <p className="font-medium mb-1">Important Notice:</p>
        <p>
          This document contains confidential patient information and should be handled in accordance with 
          HIPAA privacy regulations. Unauthorized disclosure of this information is prohibited.
        </p>
      </div>
    </div>
  );
};
