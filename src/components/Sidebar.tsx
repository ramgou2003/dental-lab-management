import { House, Calendar, Users, FlaskConical, FileText, Package, Factory, Settings, LogOut, ChevronLeft, ChevronRight, ChevronDown, GripVertical, Shield, UserPlus, Stethoscope, Microscope, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { isFeatureEnabled } from "@/config/featureFlags";
import { isPageVisible } from "@/config/pageVisibility";

interface SidebarProps {
  activeSection: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  width: number;
  onWidthChange: (width: number) => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  section: string;
  icon: any;
  featureFlag?: string;
  pageKey?: string;
  adminOnly?: boolean;
  permission?: string; // Permission required to view this menu item
  submenu?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    section: "dashboard",
    icon: House,
    featureFlag: "dashboard",
    pageKey: "dashboard"
  }, {
    name: "Lead-in",
    href: "/lead-in",
    section: "lead-in",
    icon: UserPlus,
    featureFlag: "leadIn",
    pageKey: "leadIn"
  }, {
    name: "Appointments",
    href: "/appointments",
    section: "appointments",
    icon: Calendar,
    featureFlag: "appointments",
    pageKey: "appointments",
    permission: "appointments.read"
  }, {
    name: "Consultation",
    href: "/consultation",
    section: "consultation",
    icon: Stethoscope,
    featureFlag: "consultation",
    pageKey: "consultation",
    permission: "consultation.read"
  }, {
    name: "Patients",
    href: "/patients",
    section: "patients",
    icon: Users,
    featureFlag: "patients",
    pageKey: "patients"
  }, {
    name: "Lab",
    href: "/lab",
    section: "lab",
    icon: Microscope,
    featureFlag: "lab",
    pageKey: "lab",
    submenu: [
      {
        name: "Lab Scripts",
        href: "/lab/lab-scripts",
        section: "lab-scripts",
        icon: FlaskConical,
        featureFlag: "lab",
        pageKey: "lab"
      },
      {
        name: "Manufacturing",
        href: "/lab/manufacturing",
        section: "manufacturing",
        icon: Factory,
        featureFlag: "manufacturing",
        pageKey: "manufacturing"
      },
      {
        name: "Appliance Delivery",
        href: "/lab/appliance-delivery",
        section: "appliance-delivery",
        icon: Package,
        featureFlag: "applianceDelivery",
        pageKey: "applianceDelivery"
      },
      {
        name: "Report Cards",
        href: "/lab/report-cards",
        section: "report-cards",
        icon: FileText,
        featureFlag: "reportCards",
        pageKey: "reportCards"
      }
    ]
  }, {
    name: "User Management",
    href: "/user-management",
    section: "user-management",
    icon: Shield,
    adminOnly: true,
    featureFlag: "userManagement",
    pageKey: "userManagement"
  }, {
    name: "Settings",
    href: "/settings",
    section: "settings",
    icon: Settings,
    featureFlag: "settings",
    pageKey: "settings"
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const { signOut, userProfile, loading, userRoles, hasPermission } = useAuth();
  const { canAccessUserManagement, isAdminUser } = usePermissions();

  const toggleSubmenu = (section: string) => {
    setExpandedMenus(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleMenuClick = (item: NavigationItem) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    if (hasSubmenu) {
      toggleSubmenu(item.section);
      // Also navigate to the parent route
      navigate(item.href);
    } else {
      navigate(item.href);
    }
  };

  // Check if user has doctor role
  const isDentist = userRoles.some(role => role.name === 'dentist');

  // Debug logging for user profile changes
  useEffect(() => {
    console.log('Sidebar: User profile changed:', {
      hasProfile: !!userProfile,
      fullName: userProfile?.full_name,
      email: userProfile?.email,
      loading
    });
  }, [userProfile, loading]);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return; // Prevent double clicks

    setLoggingOut(true);
    try {
      await signOut();

      // Force redirect using window.location to ensure complete page reload
      // This clears any in-memory state and React Query cache
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      setLoggingOut(false);
      // Even if signOut fails, try to redirect
      window.location.href = '/login';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (collapsed) return;
    e.preventDefault(); // Prevent scrolling
    setIsResizing(true);
    onResizeStart();
    setStartX(e.touches[0].clientX);
    setStartWidth(width);
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

  const handleTouchMove = (e: TouchEvent) => {
    if (!isResizing) return;
    e.preventDefault(); // Prevent scrolling

    // Use requestAnimationFrame for smooth animation
    requestAnimationFrame(() => {
      const deltaX = e.touches[0].clientX - startX;
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

  const handleTouchEnd = () => {
    setIsResizing(false);
    onResizeEnd();
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (isResizing) {
      // Mouse events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Touch events
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        // Remove mouse events
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // Remove touch events
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isResizing, startX, startWidth, width]);



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
            className={`h-14 max-w-[240px] object-contain object-left transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
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
            className={`h-24 w-24 object-contain transition-all duration-300 ${collapsed ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
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
    <nav className="flex-1 p-4 px-[9px] space-y-1 overflow-y-auto">
      {navigation.map(item => {
        // Hide admin-only items for non-admin users
        if (item.adminOnly && !isAdminUser()) {
          return null;
        }

        // Hide items based on permissions
        if (item.permission && !hasPermission(item.permission)) {
          return null;
        }

        // Hide items based on feature flags
        if (item.featureFlag && !isFeatureEnabled(item.featureFlag as any)) {
          return null;
        }

        // Hide items based on page visibility configuration
        if (item.pageKey && !isPageVisible(item.pageKey as any)) {
          return null;
        }

        const isActive = activeSection === item.section;
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isExpanded = expandedMenus.includes(item.section);
        const isSubmenuActive = item.submenu?.some(sub => activeSection === sub.section);

        // Filter visible submenu items
        const visibleSubmenuItems = hasSubmenu ? item.submenu!.filter(subItem => {
          if (subItem.permission && !hasPermission(subItem.permission)) {
            return false;
          }
          if (subItem.featureFlag && !isFeatureEnabled(subItem.featureFlag as any)) {
            return false;
          }
          if (subItem.pageKey && !isPageVisible(subItem.pageKey as any)) {
            return false;
          }
          return true;
        }) : [];

        return <div key={item.section} className="relative">
          <button
            onClick={() => handleMenuClick(item)}
            className={cn(
              "flex items-center justify-between w-full text-left px-3 py-3.5 rounded-lg transition-colors duration-200 relative h-12",
              isActive || isSubmenuActive
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            title={collapsed ? item.name : undefined}
          >
            <div className="flex items-center">
              {(isActive || isSubmenuActive) && <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />}
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className={`ml-3 font-medium text-sm transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                {item.name}
              </span>
            </div>
            {hasSubmenu && !collapsed && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded ? "rotate-180" : ""
                )}
              />
            )}
          </button>

          {/* Submenu - Show when expanded with smooth animation */}
          {hasSubmenu && (
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
              )}
            >
              <div className={cn(
                "space-y-1",
                collapsed ? "flex flex-col items-center" : ""
              )}>
                {visibleSubmenuItems.map(subItem => {
                  const isSubActive = activeSection === subItem.section;
                  return (
                    <button
                      key={subItem.section}
                      onClick={() => navigate(subItem.href)}
                      className={cn(
                        "flex items-center text-left rounded-lg transition-colors duration-200 border-2",
                        collapsed
                          ? "w-10 h-10 justify-center"
                          : "w-full px-3 py-2.5 text-sm",
                        isSubActive
                          ? "bg-indigo-50 text-indigo-700 border-indigo-500 font-medium"
                          : "text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-indigo-300"
                      )}
                      title={collapsed ? subItem.name : undefined}
                    >
                      <subItem.icon className={cn(
                        "flex-shrink-0",
                        collapsed ? "h-5 w-5" : "h-4 w-4"
                      )} />
                      {!collapsed && <span className="ml-2">{subItem.name}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>;
      })}
    </nav>

    {/* Footer */}
    <div className="p-4 border-t border-gray-100 space-y-1 px-[11px]">

      <button onClick={onToggleCollapse} className="flex items-center w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200" title={collapsed ? "Expand" : "Collapse"}>
        {collapsed ? <ChevronRight className="h-5 w-5 flex-shrink-0" /> : <ChevronLeft className="h-5 w-5 flex-shrink-0" />}
        <span className={`ml-3 font-medium text-sm transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
          {collapsed ? "Expand" : "Collapse"}
        </span>
      </button>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className={cn(
          "flex items-center w-full text-left px-3 py-2 rounded-lg transition-colors duration-200",
          loggingOut
            ? "text-gray-400 bg-gray-50 cursor-not-allowed"
            : "text-red-600 hover:bg-red-50"
        )}
        title={collapsed ? (loggingOut ? "Logging out..." : "Logout") : undefined}
      >
        {loggingOut ? (
          <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />
        ) : (
          <LogOut className="h-5 w-5 flex-shrink-0" />
        )}
        <span className={`ml-3 font-medium text-sm transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
          {loggingOut ? "Logging out..." : "Logout"}
        </span>
      </button>

      {/* Profile Section - Moved from header */}
      <div className="border-t border-gray-100 pt-3 mt-3">
        <button onClick={() => navigate('/profile')} className="flex items-center justify-start w-full text-left hover:bg-gray-50 rounded-lg py-1.5 pl-0.5 pr-1 transition-colors duration-200">
          <div className="bg-blue-600 text-white rounded-full size-9 flex-shrink-0 flex items-center justify-center font-semibold text-sm">
            {userProfile ? getInitials(userProfile.first_name, userProfile.last_name) : "U"}
          </div>
          <div className={`transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none' : 'opacity-100 ml-3'}`}>
            <h1 className="text-gray-900 text-sm font-semibold whitespace-nowrap">
              {userProfile ?
                `${isDentist ? 'Dr. ' : ''}${userProfile.first_name} ${userProfile.last_name}` :
                "User"
              }
            </h1>
            <p className="text-gray-500 text-xs whitespace-nowrap">
              {userProfile ? userProfile.email : ""}
            </p>
          </div>
        </button>
      </div>
    </div>

    {/* Resize Handle - Only visible when expanded */}
    {!collapsed && (
      <div
        className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 cursor-col-resize bg-gray-100 hover:bg-gray-200 rounded-md px-1 py-3 transition-colors duration-200 shadow-sm border border-gray-300 touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
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
