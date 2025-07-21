import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import OrientationGuard from "@/components/OrientationGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard, PermissionGuard } from "@/components/auth/AuthGuard";
import { LoginForm } from "@/components/auth/LoginForm";
import Layout from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { PatientsPage } from "./pages/PatientsPage";
import { PatientProfilePage } from "./pages/PatientProfilePage";
import { LabPage } from "./pages/LabPage";
import { ReportCardsPage } from "./pages/ReportCardsPage";
import { ApplianceDeliveryPage } from "./pages/ApplianceDeliveryPage";
import { ManufacturingPage } from "./pages/ManufacturingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { ContactAdminPage } from "./pages/ContactAdminPage";
import { UserManagementAccessDenied } from "./components/ui/AccessDenied";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1, // Reduce retries for faster failure
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
    },
  },
});

const App = () => {
  // Force light mode by removing any dark class and clearing theme-related localStorage
  useEffect(() => {
    // Remove dark class from html and body elements
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');

    // Clear any theme-related localStorage items
    localStorage.removeItem('theme');
    localStorage.removeItem('vite-ui-theme');
    localStorage.removeItem('ui-theme');
    localStorage.removeItem('darkMode');
    localStorage.removeItem('color-theme');

    // Set light mode attributes
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.colorScheme = 'light';

    // Force light mode on all elements
    document.documentElement.classList.add('light');
    document.body.style.backgroundColor = 'white';
    document.body.style.color = '#0f172a';

    // Remove any dark mode classes that might be added dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as Element;
          if (target.classList.contains('dark')) {
            target.classList.remove('dark');
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Sonner />
          {/* <PWAInstallPrompt /> */}
          <OrientationGuard>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <AuthGuard requireAuth={false}>
                    <LoginForm />
                  </AuthGuard>
                }
              />
              <Route
                path="/contact-admin"
                element={
                  <AuthGuard requireAuth={false}>
                    <ContactAdminPage />
                  </AuthGuard>
                }
              />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <AuthGuard requireAuth={true}>
                    <Layout />
                  </AuthGuard>
                }
              >
                <Route
                  index
                  element={
                    <PermissionGuard permission="dashboard.access">
                      <DashboardPage />
                    </PermissionGuard>
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <PermissionGuard permission="dashboard.access">
                      <DashboardPage />
                    </PermissionGuard>
                  }
                />
                <Route
                  path="appointments"
                  element={
                    <PermissionGuard permission="appointments.read">
                      <AppointmentsPage />
                    </PermissionGuard>
                  }
                />
                <Route
                  path="patients"
                  element={
                    <PermissionGuard permission="patients.read">
                      <PatientsPage />
                    </PermissionGuard>
                  }
                />
                <Route
                  path="patients/:patientId"
                  element={
                    <PermissionGuard permission="patients.read">
                      <PatientProfilePage />
                    </PermissionGuard>
                  }
                />
                <Route
                  path="lab"
                  element={
                    <PermissionGuard permission="lab_scripts.read">
                      <LabPage />
                    </PermissionGuard>
                  }
                />
                <Route path="report-cards" element={<ReportCardsPage />} />
                <Route path="appliance-delivery" element={<ApplianceDeliveryPage />} />
                <Route path="manufacturing" element={<ManufacturingPage />} />
                <Route
                  path="user-management"
                  element={
                    <PermissionGuard
                      permission="users.read"
                      fallback={<UserManagementAccessDenied />}
                    >
                      <UserManagementPage />
                    </PermissionGuard>
                  }
                />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OrientationGuard>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
