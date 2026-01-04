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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { isFeatureEnabled } from "@/config/featureFlags";
import Layout from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import LeadInPage from "./pages/LeadInPage";
import LeadDetailsPage from "./pages/LeadDetailsPage";
import NewPatientLeadPage from "./pages/NewPatientLeadPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { NextAppointmentsPage } from "./pages/NextAppointmentsPage";
import ConsultationPage from "./pages/ConsultationPage";
import ConsultationSessionPage from "./pages/ConsultationSessionPage";
import { PatientsPage } from "./pages/PatientsPage";
import { PatientProfilePage } from "./pages/PatientProfilePage";
import { LabMainPage } from "./pages/LabMainPage";
import { LabPage } from "./pages/LabPage";
import { ReportCardsPage } from "./pages/ReportCardsPage";
import { ApplianceDeliveryPage } from "./pages/ApplianceDeliveryPage";
import { ManufacturingPage } from "./pages/ManufacturingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { ContactAdminPage } from "./pages/ContactAdminPage";
import PublicPatientPacketPage from "./pages/PublicPatientPacketPage";
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
  // Handle chunk loading errors
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      if (event.message?.includes('Loading chunk') || event.message?.includes('ChunkLoadError')) {
        console.warn('Chunk loading error detected, reloading page...');
        window.location.reload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Loading chunk') ||
        event.reason?.message?.includes('ChunkLoadError')) {
        console.warn('Chunk loading promise rejection detected, reloading page...');
        event.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

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
              <ErrorBoundary>
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
                  {isFeatureEnabled('publicPatientForm') && (
                    <Route
                      path="/new-patient"
                      element={
                        <AuthGuard requireAuth={false}>
                          <NewPatientLeadPage />
                        </AuthGuard>
                      }
                    />
                  )}
                  {isFeatureEnabled('publicPatientPacket') && (
                    <Route
                      path="/patient-packet/:token"
                      element={
                        <AuthGuard requireAuth={false}>
                          <PublicPatientPacketPage />
                        </AuthGuard>
                      }
                    />
                  )}

                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <AuthGuard requireAuth={true}>
                        <Layout />
                      </AuthGuard>
                    }
                  >
                    {isFeatureEnabled('dashboard') && (
                      <Route
                        index
                        element={
                          <PermissionGuard permission="dashboard.access">
                            <DashboardPage />
                          </PermissionGuard>
                        }
                      />
                    )}
                    {isFeatureEnabled('dashboard') && (
                      <Route
                        path="dashboard"
                        element={
                          <PermissionGuard permission="dashboard.access">
                            <DashboardPage />
                          </PermissionGuard>
                        }
                      />
                    )}
                    {isFeatureEnabled('leadIn') && (
                      <>
                        <Route path="lead-in" element={<LeadInPage />} />
                        <Route path="lead-in/:leadId" element={<LeadDetailsPage />} />
                      </>
                    )}
                    {isFeatureEnabled('appointments') && (
                      <>
                        <Route
                          path="appointments"
                          element={
                            <PermissionGuard permission="appointments.read">
                              <AppointmentsPage />
                            </PermissionGuard>
                          }
                        />
                        <Route
                          path="appointments/unscheduled"
                          element={
                            <PermissionGuard permission="appointments.read">
                              <NextAppointmentsPage />
                            </PermissionGuard>
                          }
                        />
                      </>
                    )}
                    {isFeatureEnabled('consultation') && (
                      <>
                        <Route
                          path="consultation"
                          element={
                            <PermissionGuard permission="consultation.read">
                              <ConsultationPage />
                            </PermissionGuard>
                          }
                        />
                        <Route
                          path="consultation/:appointmentId"
                          element={
                            <PermissionGuard permission="consultation.read">
                              <ConsultationSessionPage />
                            </PermissionGuard>
                          }
                        />
                      </>
                    )}
                    {isFeatureEnabled('patients') && (
                      <>
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
                      </>
                    )}
                    {isFeatureEnabled('lab') && (
                      <>
                        <Route path="lab" element={<LabMainPage />} />
                        <Route
                          path="lab/lab-scripts"
                          element={
                            <PermissionGuard permission="lab_scripts.read">
                              <LabPage />
                            </PermissionGuard>
                          }
                        />
                        {isFeatureEnabled('reportCards') && (
                          <Route path="lab/report-cards" element={<ReportCardsPage />} />
                        )}
                        {isFeatureEnabled('manufacturing') && (
                          <Route path="lab/manufacturing" element={<ManufacturingPage />} />
                        )}
                        {isFeatureEnabled('applianceDelivery') && (
                          <Route path="lab/appliance-delivery" element={<ApplianceDeliveryPage />} />
                        )}
                      </>
                    )}
                    {isFeatureEnabled('userManagement') && (
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
                    )}
                    {isFeatureEnabled('settings') && (
                      <Route path="settings" element={<SettingsPage />} />
                    )}
                    {isFeatureEnabled('profile') && (
                      <Route path="profile" element={<ProfilePage />} />
                    )}
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </OrientationGuard>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
