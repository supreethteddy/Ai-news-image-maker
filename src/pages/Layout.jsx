

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext.jsx";
import AuthModal from "@/components/AuthModal.jsx";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import CreditBalance from "@/components/ui/CreditBalance";
import apiClient from "@/api/client";
// Removed: Sparkles, LayoutDashboard, Palette from 'lucide-react' as they are replaced by custom images.
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger } from
"@/components/ui/sidebar";

const navigationItems = [
{
  title: "Create Storyboard",
  url: createPageUrl("CreateStoryboard"),
  icon: () => <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/fbbdafa46_1.png" alt="Create" className="w-5 h-5" />
},
{
  title: "My Storyboards",
  url: createPageUrl("MyStoryboards"),
  icon: () => <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/8111d62e6_2.png" alt="My Storyboards" className="w-5 h-5" />
},
{
  title: "Characters",
  url: createPageUrl("CharacterManagement"),
  icon: () => <User className="w-5 h-5" />
}];


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [branding, setBranding] = useState(null);
  const { user, isAuthenticated, logout, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch branding data
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getPublicBranding();
        if (res?.success) setBranding(res.data);
      } catch (e) {
        console.error('Failed to fetch branding:', e);
      }
    })();
  }, []);

  // Auto-redirect admin users to admin dashboard
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin' && !location.pathname.startsWith('/admin')) {
      console.log('🔄 Admin user detected, redirecting to admin dashboard...');
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  if (showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center px-4">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.brandName || "NewsPlay by StaiblTech"}
              className="w-48 md:w-64 h-auto mx-auto animate-pulse" />
          ) : (
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/30f8cfabb_POWEREDBYSTAIBLTECH.png"
              alt="NewsPlay by StaiblTech"
              className="w-48 md:w-64 h-auto mx-auto animate-pulse" />
          )}
        </div>
      </div>);

  }

  return (
    <SidebarProvider>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          
          :root {
            --primary: 220 38% 50%;
            --primary-foreground: 210 40% 98%;
            --secondary: 220 14.3% 95.9%;
            --secondary-foreground: 220.9 39.3% 11%;
            --accent: 220 14.3% 95.9%;
            --accent-foreground: 220.9 39.3% 11%;
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --border: 214.3 31.8% 91.4%;
            --input: 214.3 31.8% 91.4%;
            --ring: 222.2 84% 4.9%;
            --radius: 0.75rem;
          }
          
          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.4;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.4;
            letter-spacing: -0.01em;
          }
          
          .gradient-bg {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          }
          
          .card-gradient {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          }
          
          .storyboard-gradient {
            background: linear-gradient(145deg, #667eea 0%, #764ba2 100%);
          }

          /* Mobile optimizations */
          @media (max-width: 768px) {
            .gradient-bg {
              min-height: 100vh;
            }
            
            /* Improve touch targets */
            button, a {
              min-height: 44px;
              touch-action: manipulation;
            }
            
            /* Better scrolling on mobile */
            * {
              -webkit-overflow-scrolling: touch;
            }
          }
        `}
      </style>
      <div className="min-h-screen flex w-full gradient-bg">
        <Sidebar className="border-r border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/60 p-4 md:p-6">
            <div className="flex items-center justify-center w-full">
              {branding?.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.brandName || "NewsPlay by StaiblTech"}
                  className="w-32 md:w-40 h-auto" 
                  onError={(e) => {
                    // Fallback if branding logo fails to load
                    e.target.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/30f8cfabb_POWEREDBYSTAIBLTECH.png";
                  }}
                />
              ) : (
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/30f8cfabb_POWEREDBYSTAIBLTECH.png"
                  alt="NewsPlay by StaiblTech" 
                  className="w-32 md:w-40 h-auto" />
              )}
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2 md:p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) =>
                  <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                      asChild
                      className={`hover:bg-purple-50 hover:text-purple-700 transition-all duration-300 rounded-xl mb-1 min-h-[44px] ${
                      location.pathname === item.url ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-slate-600'}`
                      }>

                        <Link to={item.url} className="flex items-center gap-3 px-3 md:px-4 py-3">
                          <item.icon />
                          <span className="font-medium text-sm md:text-base">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Credit Balance Section */}
            {isAuthenticated && (
              <SidebarGroup className="mt-4">
                <SidebarGroupContent>
                  <div className="px-3 md:px-4 py-3">
                    <CreditBalance showLabel={true} variant="sidebar" />
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup className="mt-6 md:mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Features
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 md:px-4 py-3 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f145ce9d6_3.png" alt="AI-Powered" className="w-4 h-4" />
                    <span className="text-slate-600 font-medium">AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/85bd47c69_4.png" alt="Visual Stories" className="w-4 h-4" />
                    <span className="text-slate-600 font-medium">Visual Stories</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4 md:p-6">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 md:w-10 h-8 md:h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-xs md:text-sm truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="w-full text-xs"
                >
                  <LogOut className="w-3 h-3 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 md:w-10 h-8 md:h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/010e7ad72_5.png" alt="NP" className="w-5 md:w-6 h-5 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-xs md:text-sm truncate">NewsPlay</p>
                    <p className="text-xs text-slate-500 truncate">Transform stories</p>
                  </div>
                </div>
                <AuthModal>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full text-xs bg-purple-600 hover:bg-purple-700"
                  >
                    <User className="w-3 h-3 mr-2" />
                    Login / Register
                  </Button>
                </AuthModal>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-4 md:px-6 py-3 md:py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 p-2 rounded-xl min-h-[44px] min-w-[44px]" />
              <h1 className="text-lg md:text-xl font-bold text-slate-900">NewsPlay</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
      
    </SidebarProvider>);

}
