import React, { useState } from 'react';
import { Eye, EyeOff, Settings, RotateCcw, Save } from 'lucide-react';
import { 
  PAGE_VISIBILITY, 
  PAGE_VISIBILITY_PRESETS, 
  PageVisibilityConfig,
  isPageVisible,
  applyPreset 
} from '@/config/pageVisibility';

interface PageVisibilityManagerProps {
  onClose?: () => void;
}

export const PageVisibilityManager: React.FC<PageVisibilityManagerProps> = ({ onClose }) => {
  const [localConfig, setLocalConfig] = useState<PageVisibilityConfig>({ ...PAGE_VISIBILITY });
  const [hasChanges, setHasChanges] = useState(false);

  const pageDescriptions = {
    dashboard: 'Main overview and analytics page',
    leadIn: 'Lead management and patient intake system',
    appointments: 'Appointment scheduling and calendar',
    consultation: 'Patient consultation management',
    patients: 'Patient records and profile management',
    lab: 'Laboratory workflow and case management',
    reportCards: 'Clinical reports and documentation',
    manufacturing: 'Production tracking and manufacturing',
    applianceDelivery: 'Delivery tracking and logistics',
    userManagement: 'User accounts and permissions (Admin only)',
    settings: 'Application settings and configuration',
  };

  const handleTogglePage = (pageKey: keyof PageVisibilityConfig) => {
    const newConfig = {
      ...localConfig,
      [pageKey]: !localConfig[pageKey]
    };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleApplyPreset = (presetName: keyof typeof PAGE_VISIBILITY_PRESETS) => {
    const preset = PAGE_VISIBILITY_PRESETS[presetName];
    setLocalConfig({ ...preset });
    setHasChanges(true);
  };

  const handleSave = () => {
    // Update the actual configuration
    Object.assign(PAGE_VISIBILITY, localConfig);
    setHasChanges(false);
    
    // Show success message
    alert('Page visibility settings saved! Please refresh the page to see changes.');
    
    if (onClose) {
      onClose();
    }
  };

  const handleReset = () => {
    setLocalConfig({ ...PAGE_VISIBILITY });
    setHasChanges(false);
  };

  const visibleCount = Object.values(localConfig).filter(Boolean).length;
  const totalCount = Object.keys(localConfig).length;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Page Visibility Manager</h2>
            <p className="text-sm text-gray-600">
              Control which pages are visible in the sidebar navigation
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {visibleCount} of {totalCount} pages visible
        </div>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Presets</h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PAGE_VISIBILITY_PRESETS).map((presetName) => (
            <button
              key={presetName}
              onClick={() => handleApplyPreset(presetName as keyof typeof PAGE_VISIBILITY_PRESETS)}
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
            >
              {presetName.charAt(0).toUpperCase() + presetName.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Page List */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-medium text-gray-900">Individual Pages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(localConfig).map(([pageKey, isVisible]) => (
            <div
              key={pageKey}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                isVisible 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900 capitalize">
                    {pageKey.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {isVisible ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {pageDescriptions[pageKey as keyof typeof pageDescriptions]}
                </p>
              </div>
              <button
                onClick={() => handleTogglePage(pageKey as keyof PageVisibilityConfig)}
                className={`ml-3 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
                  isVisible
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                {isVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Changes will take effect after refreshing the page. 
          Hidden pages will still be accessible via direct URL if users know the route.
        </p>
      </div>
    </div>
  );
};
