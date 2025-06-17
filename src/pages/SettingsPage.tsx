
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Settings, User, Bell, Shield, Database, Palette, Clock, Monitor, ZoomIn, ZoomOut } from "lucide-react";
import { useDeviceType, useZoomLevel } from "@/hooks/use-mobile";

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("display");
  const deviceType = useDeviceType();
  const { zoomLevel, updateZoomLevel } = useZoomLevel();

  const settingSections = [
    { id: "display", label: "Display & Zoom", icon: Monitor },
    { id: "clinic", label: "Clinic Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data & Backup", icon: Database },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "scheduling", label: "Scheduling", icon: Clock },
  ];

  const renderSettingContent = () => {
    switch (activeSection) {
      case "display":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Display & Zoom Settings</h3>

              {/* Current Device Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">Device: {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}</h4>
                    <p className="text-sm text-blue-700">Current view: {zoomLevel === 100 ? 'Desktop View' : 'Tablet View'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">View Mode</label>
                  <p className="text-sm text-slate-600 mb-6">
                    Choose between desktop and tablet view modes. Tablet mode makes UI elements smaller to fit more content on your screen.
                  </p>

                  {/* View Mode Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => updateZoomLevel(100)}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        zoomLevel === 100
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Monitor className="h-6 w-6 text-slate-600" />
                        <h4 className="font-semibold text-slate-900">Desktop View</h4>
                      </div>
                      <p className="text-sm text-slate-600">
                        Standard size elements, recommended for desktop computers and large screens.
                      </p>
                      <div className="mt-2 text-xs text-slate-500">100% Scale</div>
                    </button>

                    <button
                      onClick={() => updateZoomLevel(90)}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        zoomLevel === 90
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 w-6 bg-slate-600 rounded flex items-center justify-center">
                          <div className="h-4 w-3 bg-white rounded-sm"></div>
                        </div>
                        <h4 className="font-semibold text-slate-900">Tablet View</h4>
                      </div>
                      <p className="text-sm text-slate-600">
                        Compact elements perfect for tablets. Shows more content while keeping everything readable.
                      </p>
                      <div className="mt-2 text-xs text-slate-500">90% Scale</div>
                    </button>
                  </div>

                  {/* Current Selection Info */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h4 className="font-medium text-emerald-900 mb-2">
                      ✓ Current Mode: {zoomLevel === 100 ? 'Desktop View' : 'Tablet View'}
                    </h4>
                    <p className="text-sm text-emerald-800">
                      {zoomLevel === 100
                        ? 'Using standard desktop sizing for optimal desktop experience.'
                        : 'Using compact tablet sizing to show more content on your screen.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "clinic":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Clinic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Clinic Name</label>
                  <input type="text" defaultValue="Dental Clinic" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Doctor Name</label>
                  <input type="text" defaultValue="Dr. Amelia Stone" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Specialty</label>
                  <input type="text" defaultValue="General Dentistry" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input type="tel" defaultValue="(555) 123-4567" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <textarea rows={3} defaultValue="123 Main Street, City, State 12345" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">Appointment Reminders</h4>
                    <p className="text-sm text-slate-600">Send reminders to patients before appointments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">Email Notifications</h4>
                    <p className="text-sm text-slate-600">Receive email updates for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">SMS Notifications</h4>
                    <p className="text-sm text-slate-600">Send SMS reminders and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Change Password</h4>
                  <div className="space-y-3">
                    <input type="password" placeholder="Current password" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <input type="password" placeholder="New password" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <input type="password" placeholder="Confirm new password" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "scheduling":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Scheduling Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Default Appointment Duration</label>
                    <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>30 minutes</option>
                      <option>45 minutes</option>
                      <option>60 minutes</option>
                      <option>90 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Working Hours</label>
                    <div className="flex space-x-2">
                      <input type="time" defaultValue="09:00" className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      <span className="self-center">to</span>
                      <input type="time" defaultValue="17:00" className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <p className="text-slate-600">Settings for {activeSection} coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col max-w-full flex-1">
      <PageHeader 
        title="Settings" 
        description="Configure your clinic and application preferences" 
      />

      <div className="px-4 py-3 pb-1.5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ height: 'calc(100vh - 250px)' }}>
          {/* Settings Navigation */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-slate-900 text-lg font-semibold mb-4">Settings</h3>
              <nav className="space-y-2">
                {settingSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <section.icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content - Extended to viewport height */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="p-6 flex-1 overflow-y-auto">
                {renderSettingContent()}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex justify-end space-x-3">
                    <button className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
