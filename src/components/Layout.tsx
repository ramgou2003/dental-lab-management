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

  return (
    <div className={`min-h-screen flex w-full bg-gray-50 ${deviceType === 'tablet' ? 'tablet-container' : ''}`}>
      <Sidebar
        activeSection={getCurrentSection()}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`flex-1 bg-white overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-72'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
