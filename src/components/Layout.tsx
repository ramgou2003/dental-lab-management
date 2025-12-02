import { useState, useEffect, createContext, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

export type ViewMode = 'desktop' | 'tablet';

// Context to share view mode with child components
interface ViewModeContextType {
  viewMode: ViewMode;
  zoomLevel: number;
}

const ViewModeContext = createContext<ViewModeContextType>({ viewMode: 'desktop', zoomLevel: 1 });

export const useViewMode = () => useContext(ViewModeContext);

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

  // Initialize view mode from localStorage or default to 'desktop'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('view-mode');
      return (saved === 'tablet' ? 'tablet' : 'desktop') as ViewMode;
    } catch (error) {
      console.warn('Failed to load view mode from localStorage:', error);
      return 'desktop';
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

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('view-mode', viewMode);
    } catch (error) {
      console.warn('Failed to save view mode to localStorage:', error);
    }
  }, [viewMode]);

  // Extract the current section from the pathname
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path.startsWith("/lead-in")) return "lead-in";
    if (path === "/appointments") return "appointments";
    if (path.startsWith("/consultation")) return "consultation";
    if (path.startsWith("/patients")) return "patients";
    if (path.startsWith("/lab")) {
      // Check for submenu sections
      if (path === "/lab/lab-scripts") return "lab-scripts";
      if (path === "/lab/report-cards") return "report-cards";
      if (path === "/lab/manufacturing") return "manufacturing";
      if (path === "/lab/appliance-delivery") return "appliance-delivery";
      return "lab"; // Main lab page
    }
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

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'desktop' ? 'tablet' : 'desktop');
  };

  // Calculate zoom based on view mode
  const zoomLevel = viewMode === 'tablet' ? 0.8 : 1;

  return (
    <ViewModeContext.Provider value={{ viewMode, zoomLevel }}>
      <div
        className={`flex bg-gray-50 ${isResizing ? 'resize-active' : ''}`}
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
          width: `${100 / zoomLevel}vw`,
          height: `${100 / zoomLevel}vh`,
        }}
      >
        <Sidebar
          activeSection={getCurrentSection()}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          width={sidebarWidth}
          onWidthChange={handleWidthChange}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
          viewMode={viewMode}
          onToggleViewMode={toggleViewMode}
        />
        <main
          className="flex-1 bg-white overflow-hidden"
          style={{
            marginLeft: `${mainMarginLeft}px`,
            transition: 'none',
            height: '100%',
          }}
        >
          <Outlet />
        </main>
      </div>
    </ViewModeContext.Provider>
  );
};

export default Layout;
