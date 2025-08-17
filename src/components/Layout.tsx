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

  // Initialize sidebar width from localStorage or default to 208px (w-52)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar-width');
      return saved ? parseInt(saved, 10) : 208;
    } catch (error) {
      console.warn('Failed to load sidebar width from localStorage:', error);
      return 208;
    }
  });

  // Track if sidebar is being resized to disable transitions
  const [isResizing, setIsResizing] = useState(false);

  const location = useLocation();

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [sidebarCollapsed]);

  // Save sidebar width to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-width', sidebarWidth.toString());
    } catch (error) {
      console.warn('Failed to save sidebar width to localStorage:', error);
    }
  }, [sidebarWidth]);

  // Extract the current section from the pathname
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path.startsWith("/lead-in")) return "lead-in";
    if (path === "/appointments") return "appointments";
    if (path.startsWith("/consultation")) return "consultation";
    if (path.startsWith("/patients")) return "patients";
    if (path === "/lab") return "lab";
    if (path === "/report-cards") return "report-cards";
    if (path === "/appliance-delivery") return "appliance-delivery";
    if (path === "/manufacturing") return "manufacturing";
    if (path === "/user-management") return "user-management";
    if (path === "/settings") return "settings";
    if (path === "/profile") return "profile";
    return "dashboard";
  };

  const mainMarginLeft = sidebarCollapsed ? 64 : sidebarWidth; // 64px = w-16

  const handleWidthChange = (newWidth: number) => {
    if (!isResizing) {
      setIsResizing(true);
    }
    setSidebarWidth(newWidth);
  };

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResizeEnd = () => {
    // Reset resizing state after a short delay
    setTimeout(() => setIsResizing(false), 100);
  };

  return (
    <div className={`min-h-screen flex w-full bg-gray-50 ${isResizing ? 'resize-active' : ''}`}>
      <Sidebar
        activeSection={getCurrentSection()}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        width={sidebarWidth}
        onWidthChange={handleWidthChange}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
      />
      <main
        className="flex-1 bg-white overflow-auto"
        style={{
          marginLeft: `${mainMarginLeft}px`,
          transition: 'none' // Remove all transitions for smooth real-time resizing
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
