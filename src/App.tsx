import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { RealtimeNotificationsProvider } from "@/components/RealtimeNotificationsProvider";

// Pages
import AuthPage from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import ProspectingPage from "./pages/Prospecting";
import LeadsPage from "./pages/Leads";
import FunnelPage from "./pages/Funnel";
import ConversationsPage from "./pages/Conversations";
import MeetingsPage from "./pages/Meetings";
import AnalyticsPage from "./pages/Analytics";
import SettingsPage from "./pages/Settings";
import TutorialPage from "./pages/Tutorial";
import TestsPage from "./pages/Tests";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <RealtimeNotificationsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tutorial"
                element={
                  <ProtectedRoute>
                    <TutorialPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prospecting"
                element={
                  <ProtectedRoute>
                    <ProspectingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leads"
                element={
                  <ProtectedRoute>
                    <LeadsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/funnel"
                element={
                  <ProtectedRoute>
                    <FunnelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conversations"
                element={
                  <ProtectedRoute>
                    <ConversationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meetings"
                element={
                  <ProtectedRoute>
                    <MeetingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tests"
                element={
                  <ProtectedRoute>
                    <TestsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </RealtimeNotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
