import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { RealtimeNotificationsProvider } from "@/components/RealtimeNotificationsProvider";
import { PageLoadingFallback } from "@/components/ui/page-loading";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load pages
const AuthPage = lazy(() => import("./pages/Auth"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const ProspectingPage = lazy(() => import("./pages/Prospecting"));
const CampaignsPage = lazy(() => import("./pages/Campaigns"));
const GoogleMapsPage = lazy(() => import("./pages/GoogleMaps"));
const WebSearchPage = lazy(() => import("./pages/WebSearch"));
const WhatsAppGroupsPage = lazy(() => import("./pages/WhatsAppGroups"));
const ImportLeadsPage = lazy(() => import("./pages/ImportLeads"));
const MassSendPage = lazy(() => import("./pages/MassSend"));
const ScheduledProspectingPage = lazy(() => import("./pages/ScheduledProspecting"));
const EmailFinderPage = lazy(() => import("./pages/EmailFinder"));
const ProspectingHistoryPage = lazy(() => import("./pages/ProspectingHistory"));
const LeadsPage = lazy(() => import("./pages/Leads"));
const FunnelPage = lazy(() => import("./pages/Funnel"));
const ConversationsPage = lazy(() => import("./pages/Conversations"));
const MeetingsPage = lazy(() => import("./pages/Meetings"));
const FollowUpPage = lazy(() => import("./pages/FollowUp"));
const TemplatesPage = lazy(() => import("./pages/Templates"));
const AnalyticsPage = lazy(() => import("./pages/Analytics"));
const AntiBanPage = lazy(() => import("./pages/AntiBan"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const TutorialPage = lazy(() => import("./pages/Tutorial"));
const TestsPage = lazy(() => import("./pages/Tests"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <RealtimeNotificationsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/auth" element={<AuthPage />} />

                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/tutorial" element={<ProtectedRoute><TutorialPage /></ProtectedRoute>} />
                  
                  {/* Prospecção */}
                  <Route path="/prospecting" element={<ProtectedRoute><ProspectingPage /></ProtectedRoute>} />
                  <Route path="/google-maps" element={<ProtectedRoute><GoogleMapsPage /></ProtectedRoute>} />
                  <Route path="/web-search" element={<ProtectedRoute><WebSearchPage /></ProtectedRoute>} />
                  <Route path="/whatsapp-groups" element={<ProtectedRoute><WhatsAppGroupsPage /></ProtectedRoute>} />
                  <Route path="/import-leads" element={<ProtectedRoute><ImportLeadsPage /></ProtectedRoute>} />
                  <Route path="/mass-send" element={<ProtectedRoute><MassSendPage /></ProtectedRoute>} />
                  <Route path="/scheduled-prospecting" element={<ProtectedRoute><ScheduledProspectingPage /></ProtectedRoute>} />
                  <Route path="/email-finder" element={<ProtectedRoute><EmailFinderPage /></ProtectedRoute>} />
                  <Route path="/prospecting-history" element={<ProtectedRoute><ProspectingHistoryPage /></ProtectedRoute>} />
                  <Route path="/campaigns" element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>} />

                  {/* CRM */}
                  <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
                  <Route path="/funnel" element={<ProtectedRoute><FunnelPage /></ProtectedRoute>} />
                  <Route path="/conversations" element={<ProtectedRoute><ConversationsPage /></ProtectedRoute>} />
                  <Route path="/meetings" element={<ProtectedRoute><MeetingsPage /></ProtectedRoute>} />

                  {/* Automação */}
                  <Route path="/follow-up" element={<ProtectedRoute><FollowUpPage /></ProtectedRoute>} />
                  <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />

                  {/* Ferramentas */}
                  <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                  <Route path="/antiban" element={<ProtectedRoute><AntiBanPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/tests" element={<ProtectedRoute><TestsPage /></ProtectedRoute>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </RealtimeNotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
