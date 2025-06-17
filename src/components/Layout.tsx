import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useDeviceType } from "@/hooks/use-mobile";

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const deviceType = useDeviceType();

  // Extract the current section from the pathname
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path.startsWith("/patients")) return "patients";
    if (path === "/lab") return "lab";
    if (path === "/report-cards") return "report-cards";
    if (path === "/appliance-delivery") return "appliance-delivery";
    if (path === "/manufacturing") return "manufacturing";
    if (path === "/settings") return "settings";
    if (path === "/profile") return "profile";
    return "dashboard";
  };

  // Get responsive margin based on device type and sidebar state
  const getMainMargin = () => {
    if (deviceType === 'tablet') {
      return sidebarCollapsed ? 'ml-14' : 'ml-64';
    }
    return sidebarCollapsed ? 'ml-16' : 'ml-72';
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <Sidebar
        activeSection={getCurrentSection()}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`flex-1 bg-white overflow-auto transition-all duration-300 ${getMainMargin()}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
