import { House, Calendar, Users, FlaskConical, FileText, Package, Factory, Settings, LogOut, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

interface SidebarProps {
  activeSection: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  width: number;
  onWidthChange: (width: number) => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}
const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    section: "dashboard",
    icon: House
  }, {
    name: "Appointments",
    href: "/appointments",
    section: "appointments",
    icon: Calendar
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
  onToggleCollapse,
  width,
  onWidthChange,
  onResizeStart,
  onResizeEnd
}: SidebarProps) {
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format time for expanded mode (24-hour format HH:MM:SS with day)
  const formatTimeExpanded = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/New_York', // EST timezone
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // 24-hour format
    };
    const timeString = date.toLocaleTimeString('en-US', options);

    const dayOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'America/New_York',
      weekday: 'long'
    };
    const dayString = date.toLocaleDateString('en-US', dayOptions);

    return { time: timeString, day: dayString };
  };

  // Format time for collapsed mode (24-hour format HH:MM with abbreviated day)
  const formatTimeCollapsed = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/New_York', // EST timezone
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 24-hour format
    };
    const timeString = date.toLocaleTimeString('en-US', options);

    const dayOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'America/New_York',
      weekday: 'short'
    };
    const dayString = date.toLocaleDateString('en-US', dayOptions);

    return { time: timeString, day: dayString };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (collapsed) return;
    setIsResizing(true);
    onResizeStart();
    setStartX(e.clientX);
    setStartWidth(width);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    // Use requestAnimationFrame for smooth animation
    requestAnimationFrame(() => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(208, Math.min(400, startWidth + deltaX)); // Min 208px (w-52), Max 400px
      onWidthChange(newWidth);
    });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    onResizeEnd();
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, startX, startWidth, width]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sidebarWidth = collapsed ? 64 : width; // 64px = w-16

  return <div
    ref={sidebarRef}
    className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm"
    style={{
      width: `${sidebarWidth}px`,
      transition: isResizing ? 'none' : 'width 0.3s ease-in-out'
    }}
  >
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
      <nav className="flex-1 p-4 px-[9px] space-y-1">
        {navigation.map(item => {
        const isActive = activeSection === item.section;
        return <div key={item.section} className="relative">
            <button onClick={() => navigate(item.href)} className={cn("flex items-center justify-start w-full text-left px-3 py-3.5 rounded-lg transition-colors duration-200 relative h-12", isActive ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")} title={collapsed ? item.name : undefined}>
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
        {/* Time Display Container */}
        <div className="mb-2">
          {collapsed ? (
            // Collapsed mode: Clean elegant container with proper text visibility for narrow width
            <div className="bg-white border-2 border-blue-300 rounded-lg h-16 flex flex-col justify-center px-1 transition-all duration-300 ease-in-out hover:border-blue-400 hover:shadow-lg shadow-sm">
              <div className="text-blue-800 text-xs font-bold leading-tight text-center">
                {formatTimeCollapsed(currentTime).time}
              </div>
              <div className="text-blue-600 text-xs font-medium leading-tight mt-0.5 text-center">
                {formatTimeCollapsed(currentTime).day}
              </div>
            </div>
          ) : (
            // Expanded mode: Clean elegant container with enhanced spacing
            <div className="bg-white border-2 border-blue-300 rounded-lg h-16 flex flex-col justify-center px-3 transition-all duration-300 ease-in-out hover:border-blue-400 hover:shadow-lg shadow-sm">
              <div className="text-blue-800 text-base font-bold leading-tight">
                {formatTimeExpanded(currentTime).time}
              </div>
              <div className="text-blue-600 text-sm font-medium leading-tight mt-1">
                {formatTimeExpanded(currentTime).day}
              </div>
            </div>
          )}
        </div>

        <button onClick={onToggleCollapse} className="flex items-center w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200" title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? <ChevronRight className="h-5 w-5 flex-shrink-0" /> : <ChevronLeft className="h-5 w-5 flex-shrink-0" />}
          <span className={`ml-3 font-medium text-sm transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            {collapsed ? "Expand" : "Collapse"}
          </span>
        </button>

        <button onClick={handleLogout} className="flex items-center w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200" title={collapsed ? "Logout" : undefined}>
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className={`ml-3 font-medium text-sm transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            Logout
          </span>
        </button>

        {/* Profile Section - Moved from header */}
        <div className="border-t border-gray-100 pt-3 mt-3">
          <button onClick={() => navigate('/profile')} className="flex items-center justify-start w-full text-left hover:bg-gray-50 rounded-lg py-1.5 pl-0.5 pr-1 transition-colors duration-200">
            <div className="bg-blue-600 text-white rounded-full size-9 flex-shrink-0 flex items-center justify-center font-semibold text-sm">
              {getInitials("Amelia", "Stone")}
            </div>
            <div className={`transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none' : 'opacity-100 ml-3'}`}>
              <h1 className="text-gray-900 text-sm font-semibold whitespace-nowrap">Dr. Amelia Stone</h1>
              <p className="text-gray-500 text-xs whitespace-nowrap">General Dentistry</p>
            </div>
          </button>
        </div>
      </div>

      {/* Resize Handle - Only visible when expanded */}
      {!collapsed && (
        <div
          className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 cursor-col-resize bg-gray-100 hover:bg-gray-200 rounded-md px-1 py-3 transition-colors duration-200 shadow-sm border border-gray-300"
          onMouseDown={handleMouseDown}
          title="Drag to resize sidebar"
        >
          {/* Dots pattern for grip */}
          <div className="flex flex-col space-y-1">
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          </div>
        </div>
      )}
    </div>;
}
