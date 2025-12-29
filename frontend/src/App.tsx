import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/features/LanguageSelector";
import { LocationProvider } from "@/contexts/LocationContext";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { Sprout } from "lucide-react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import PlantAnalysisChat from "./pages/heal-crop/PlantAnalysisChat";
import DiseaseDetection from "./pages/heal-crop/DiseaseDetection";
import FertilizerCalculator from "./pages/analysis/FertilizerCalculator";
import Profile from "./pages/Profile";
import WeatherPage from "./pages/WeatherPage";
import MarketPricesPage from "./pages/MarketPricesPage";
import NotFound from "./pages/NotFound";
import CropRecommendationPage from "./pages/CropRecommendationPage";
import YieldPredictionPage from "./pages/YieldPredictionPage";
import FertilizerCalculatorPage from "./pages/FertilizerCalculatorPage";
import DisasterPredictionPage from "./pages/DisasterPredictionPage";
import DiseaseDetectionPage from "./pages/DiseaseDetectionPage";
import PlantAnalysisChatPage from "./pages/PlantAnalysisChatPage";
import SoilHealthPage from "./pages/SoilHealthPage";
import DiseaseAlertsPage from "./pages/DiseaseAlertsPage";
import CultivationTipsPage from "./pages/CultivationTipsPage";
import FloatingCallbackButton from "./components/features/FloatingCallbackButton";

const queryClient = new QueryClient();

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
};

const DashboardLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      
      {/* Mobile header with sidebar trigger */}
      <div className="block md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Sprout className="h-5 w-5 text-green-600" />
            </div>
            <h1 className="text-lg font-bold text-primary">AgriGuru</h1>
          </div>
          <SidebarTrigger className="text-gray-600 hover:bg-gray-100 p-2 rounded-md" />
        </div>
      </div>
      
      {/* Desktop header with sidebar trigger */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm" style={{ left: collapsed ? '4rem' : '18rem' }}>
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-3">
            <SidebarTrigger className="text-gray-600 hover:bg-gray-100 p-2 rounded-md" />
            <h1 className="text-lg font-bold text-primary">AgriGuru</h1>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSelector />
          </div>
        </div>
      </div>
      
      <main className="flex-1 pt-16 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <FloatingCallbackButton />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                
                

                {/* Dashboard Routes with Sidebar */}
                <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
                <Route path="/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
                <Route path="/heal-crop/chat" element={<DashboardLayout><PlantAnalysisChatPage /></DashboardLayout>} />
                <Route path="/heal-crop/disease-detection" element={<DashboardLayout><DiseaseDetectionPage /></DashboardLayout>} />
                <Route path="/analysis/fertilizer-calculator" element={<DashboardLayout><FertilizerCalculatorPage /></DashboardLayout>} />
                <Route path="/analysis/yield-prediction" element={<DashboardLayout><YieldPredictionPage /></DashboardLayout>} />
                <Route path="/analysis/crop-recommendation" element={<DashboardLayout><CropRecommendationPage /></DashboardLayout>} />
                <Route path="/soil-health" element={<DashboardLayout><SoilHealthPage /></DashboardLayout>} />
                <Route path="/agrimitra/pest-notification" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
                <Route path="/agrimitra/cultivation-tips" element={<DashboardLayout><CultivationTipsPage /></DashboardLayout>} />
                <Route path="/agrimitra/disease-alerts" element={<DashboardLayout><DiseaseAlertsPage /></DashboardLayout>} />
                <Route path="/agrimitra/disaster-prediction" element={<DashboardLayout><DisasterPredictionPage /></DashboardLayout>} />
                <Route path="/weather" element={<DashboardLayout><WeatherPage /></DashboardLayout>} />
                <Route path="/market-prices" element={<DashboardLayout><MarketPricesPage /></DashboardLayout>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </LocationProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
