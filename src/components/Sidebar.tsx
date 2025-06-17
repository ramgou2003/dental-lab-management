import { House, Users, FlaskConical, FileText, Package, Factory, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeSection: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}
const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    section: "dashboard",
    icon: House
  }, {
    name: "Patients",
    href: "/patients",
    section: "patients",
    icon: Users
  }, {
    name: "Lab",
    href: "/lab",
    section: "lab",
    icon: FlaskConical
  }, {
    name: "Report Cards",
    href: "/report-cards",
    section: "report-cards",
    icon: FileText
  }, {
    name: "Manufacturing",
    href: "/manufacturing",
    section: "manufacturing",
    icon: Factory
  }, {
    name: "Appliance Delivery",
    href: "/appliance-delivery",
    section: "appliance-delivery",
    icon: Package
  }, {
    name: "Settings",
    href: "/settings",
    section: "settings",
    icon: Settings
  }
];
export function Sidebar({
  activeSection,
  collapsed,
  onToggleCollapse
}: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  return <div className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-10 shadow-sm ${collapsed ? 'w-16' : 'w-48'}`}>
      {/* Header - Clinic Logo */}
      <div className="border-b border-gray-200 py-1.5 px-[4px]">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-start w-full p-2 pl-3 h-14 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          title="Go to Dashboard"
        >
          <div className="relative flex items-center">
            {/* Wide logo for expanded state */}
            <img
              src="/logo-wide.png"
              alt="Clinic Logo"
              className={`h-14 max-w-[240px] object-contain object-left transition-all duration-300 ${
                collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}
              onError={(e) => {
                // Fallback to SVG if PNG doesn't exist
                e.currentTarget.src = "/logo-wide.svg";
                e.currentTarget.onerror = () => {
                  // Final fallback to placeholder
                  e.currentTarget.style.display = 'none';
                };
              }}
            />

            {/* Icon logo for collapsed state */}
            <img
              src="/logo-icon.png"
              alt="Clinic Logo"
              className={`h-24 w-24 object-contain transition-all duration-300 ${
                collapsed ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
              }`}
              onError={(e) => {
                // Fallback to SVG if PNG doesn't exist
                e.currentTarget.src = "/logo-icon.svg";
                e.currentTarget.onerror = () => {
                  // Final fallback to placeholder
                  e.currentTarget.style.display = 'none';
                };
              }}
            />
          </div>

          {/* Fallback placeholder when logo files don't exist */}
          <div className="hidden items-center justify-start h-10 w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white font-bold text-lg">
            {collapsed ? "C" : "CLINIC"}
          </div>
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 px-[9px] space-y-2">
        {navigation.map(item => {
        const isActive = activeSection === item.section;
        return <div key={item.section} className="relative">
            <button onClick={() => navigate(item.href)} className={cn("flex items-center justify-start w-full text-left px-3 py-4 rounded-lg transition-colors duration-200 relative h-14", isActive ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")} title={collapsed ? item.name : undefined}>
              {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />}
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className={`ml-3 font-medium text-sm transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                {item.name}
              </span>
            </button>
          </div>;
      })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-100 space-y-1 px-[11px]">
        <button onClick={onToggleCollapse} className="flex items-center w-full text-left px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200" title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? <ChevronRight className="h-5 w-5 flex-shrink-0" /> : <ChevronLeft className="h-5 w-5 flex-shrink-0" />}
          <span className={`ml-3 font-medium text-sm transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            {collapsed ? "Expand" : "Collapse"}
          </span>
        </button>

        <button onClick={handleLogout} className="flex items-center w-full text-left px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200" title={collapsed ? "Logout" : undefined}>
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className={`ml-3 font-medium text-sm transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            Logout
          </span>
        </button>

        {/* Profile Section - Moved from header */}
        <div className="border-t border-gray-100 pt-3 mt-3">
          <button onClick={() => navigate('/profile')} className="flex items-center justify-start w-full text-left hover:bg-gray-50 rounded-lg py-2 pl-0.5 pr-1 transition-colors duration-200">
            <div className="bg-blue-600 text-white rounded-full size-10 flex-shrink-0 flex items-center justify-center font-semibold text-sm">
              {getInitials("Amelia", "Stone")}
            </div>
            <div className={`transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none' : 'opacity-100 ml-3'}`}>
              <h1 className="text-gray-900 text-sm font-semibold whitespace-nowrap">Dr. Amelia Stone</h1>
              <p className="text-gray-500 text-xs whitespace-nowrap">General Dentistry</p>
            </div>
          </button>
        </div>
      </div>
    </div>;
}
