"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, fetchApi, removeToken } from "@/lib";
import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Clock, Bell, Sun, Moon, ShieldCheck, LogOut } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [userRole, setUserRole] = useState("student");
  const [userName, setUserName] = useState("Aarav Sharma");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const role = localStorage.getItem("user_role") || "student";
    setUserRole(role);

    if (role === "parent" && pathname !== "/parent-dashboard") {
      router.replace("/parent-dashboard");
      return;
    }

    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && prefersDark);
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    function refreshProfile() {
      const av = localStorage.getItem("user_avatar");
      if (av) setAvatarUrl(av);
      const name = localStorage.getItem("user_name");
      if (name) setUserName(name);

      fetchApi<any>("/api/auth/me")
        .then((me) => {
          if (me?.role) {
            setUserRole(me.role);
            localStorage.setItem("user_role", me.role);
            if (me.role === "parent" && pathname !== "/parent-dashboard") {
              router.replace("/parent-dashboard");
            }
          }
        })
        .catch(() => {});

      fetchApi<any>("/api/profile")
        .then((data) => {
          if (data?.user?.name) {
            setUserName(data.user.name);
            localStorage.setItem("user_name", data.user.name);
          }
          const cloudAv = data?.preferences?.avatar_url || localStorage.getItem("user_avatar");
          if (cloudAv) {
            setAvatarUrl(cloudAv);
            localStorage.setItem("user_avatar", cloudAv);
          }
        })
        .catch(() => {});
    }

    refreshProfile();
    window.addEventListener("profile-updated", refreshProfile);
    return () => window.removeEventListener("profile-updated", refreshProfile);
  }, [router, pathname]);

  useEffect(() => {
    const role = localStorage.getItem("user_role") || userRole;
    if (role === "parent" && pathname !== "/parent-dashboard") {
      router.replace("/parent-dashboard");
    }
  }, [pathname, userRole, router]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area shifted right by sidebar width (w-72 = 288px) */}
      <div className="pl-72 flex flex-col min-h-screen">
        
        {/* Top Sticky Header */}
        <header className="fixed top-0 left-72 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 z-40 flex items-center justify-between px-6 lg:px-8 transition-colors duration-200">
          
          {userRole === "parent" ? (
            /* Parent Portal Header - No student search bar */
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Parent Observer Portal • Child Learning Telemetry</span>
              </div>
            </div>
          ) : (
            /* Student Search Bar */
            <div className="flex items-center gap-3 w-full max-w-md">
              <div className="relative w-full flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  className="w-full pl-9 pr-12 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  placeholder="Search concepts, notes, formulas..."
                  type="text"
                />
                <div className="absolute right-2.5 px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-700 rounded text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  ⌘K
                </div>
              </div>
            </div>
          )}

          {/* Right Status Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {userRole !== "parent" && (
              <>
                {/* Assessment Alarm Chip */}
                <div className="hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Next Assessment in 2 days</span>
                </div>

                {/* Live RAG Online Chip */}
                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 px-3 py-1.5 rounded-full text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Gemini RAG Online</span>
                </div>
              </>
            )}

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {userRole === "parent" ? (
              <button
                onClick={() => {
                  removeToken();
                  router.push("/login");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            ) : (
              <>
                {/* Notification Bell */}
                <div className="relative flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-500 dark:text-slate-400">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
                </div>

                {/* User Avatar Circle */}
                <Link
                  href="/profile"
                  className="relative group cursor-pointer focus:outline-none"
                  title="View & Edit Learner Profile"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-600 group-hover:scale-105 transition-all shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-all">
                      {userName.charAt(0) || "A"}
                    </div>
                  )}
                </Link>
              </>
            )}

          </div>

        </header>

        {/* Page Content with padding-top for fixed header */}
        <main className="flex-1 pt-16">
          <div className="p-6 lg:p-8 max-w-[1520px] mx-auto w-full">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
