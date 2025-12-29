import {
  Home,
  Stethoscope,
  MessageSquare,
  Camera,
  Calculator,
  TrendingUp,
  Wheat,
  Bug,
  BookOpen,
  AlertTriangle,
  Sprout,
  LogOut,
  User,
  CloudRain,
  Database,
  Store,
  Layers
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "My Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Weather",
    url: "/weather",
    icon: CloudRain,
  },
  {
    title: "Market Prices",
    url: "/market-prices",
    icon: Store,
  },
];

const healYourCropItems = [
  {
    title: "Plant Analysis Chat",
    url: "/heal-crop/chat",
    icon: MessageSquare,
  },
  {
    title: "Disease Detection",
    url: "/heal-crop/disease-detection",
    icon: Camera,
  }
];

const yourAnalysisItems = [
  {
    title: "Fertilizer Calculator",
    url: "/analysis/fertilizer-calculator",
    icon: Calculator,
  },
  {
    title: "Crop Yield Prediction",
    url: "/analysis/yield-prediction",
    icon: TrendingUp,
  },
  {
    title: "Crop Recommendation",
    url: "/analysis/crop-recommendation",
    icon: Wheat,
  },
  {
    title: "Soil Health",
    url: "/soil-health",
    icon: Layers,
  }
];

const agriMitraItems = [
  {
    title: "Cultivation Tips",
    url: "/agrimitra/cultivation-tips",
    icon: BookOpen,
  },
  {
    title: "Disease Alerts",
    url: "/agrimitra/disease-alerts",
    icon: Bug,
  },
  {
    title: "Disaster Prediction",
    url: "/agrimitra/disaster-prediction",
    icon: AlertTriangle,
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-[#e6f5e6] text-[#3E8E41] font-medium rounded-full" : "text-gray-700 hover:bg-gray-100 hover:text-[#3E8E41] rounded-full";

  return (
    <Sidebar className="border-r border-gray-200 bg-white shadow-md" collapsible="icon">
      <SidebarRail className="bg-white hover:bg-[#e6f5e6]" />
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#e6f5e6] rounded-full">
              <Sprout className="h-5 w-5 text-[#3E8E41]" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-[#3E8E41]">AgriGuru</h1>
                <p className="text-xs text-gray-600">AI Farm Assistant</p>
              </div>
            )}
          </div>
          {/* Add trigger button for mobile */}
          <div className="block md:hidden">
            <SidebarTrigger className="text-gray-600 hover:bg-[#e6f5e6] rounded-full" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end className={getNavClassName}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Heal Your Crop Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center text-gray-700 px-4 py-3 mt-4 font-bold text-base border-b border-gray-200">
            <Stethoscope className="h-5 w-5 mr-2 text-[#3E8E41]" />
            {!collapsed && "Heal Your Crop"}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {healYourCropItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Your Analysis Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center text-gray-700 px-4 py-3 mt-4 font-bold text-base border-b border-gray-200">
            <TrendingUp className="h-5 w-5 mr-2 text-[#3E8E41]" />
            {!collapsed && "Your Analysis"}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {yourAnalysisItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AgriMitra Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center text-gray-700 px-4 py-3 mt-4 font-bold text-base border-b border-gray-200">
            <BookOpen className="h-5 w-5 mr-2 text-[#F4D35E]" />
            {!collapsed && "AgriMitra"}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {agriMitraItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} className="text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-full">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-3">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
