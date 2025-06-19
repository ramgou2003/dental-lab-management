import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

const Layout = () => {
  // Initialize sidebar state from localStorage or default to false (expanded)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error);
      return false;
    }
  });
  const location = useLocation();

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [sidebarCollapsed]);

  // Extract the current section from the pathname
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path === "/appointments") return "appointments";
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
    <div className="min-h-screen flex w-full bg-gray-50">
      <Sidebar 
        activeSection={getCurrentSection()} 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`flex-1 bg-white overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-52'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
