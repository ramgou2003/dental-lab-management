import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import OrientationGuard from "@/components/OrientationGuard";
import Layout from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientsPage } from "./pages/PatientsPage";
import { PatientProfilePage } from "./pages/PatientProfilePage";
import { LabPage } from "./pages/LabPage";
import { ReportCardsPage } from "./pages/ReportCardsPage";
import { ApplianceDeliveryPage } from "./pages/ApplianceDeliveryPage";
import { ManufacturingPage } from "./pages/ManufacturingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAInstallPrompt />
      <OrientationGuard>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="patients/:patientId" element={<PatientProfilePage />} />
              <Route path="lab" element={<LabPage />} />
              <Route path="report-cards" element={<ReportCardsPage />} />
              <Route path="appliance-delivery" element={<ApplianceDeliveryPage />} />
              <Route path="manufacturing" element={<ManufacturingPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OrientationGuard>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
