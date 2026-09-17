"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, UserCheck, Target, Code2, BookOpen, 
  MessageSquare, Network, FileText, HeartHandshake, 
  LogOut, Sparkles, ChevronRight, TrendingUp, Brain, Clock, Bell, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { removeToken, fetchApi } from "@/lib";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState("student");
  const [userName, setUserName] = useState("Aarav Sharma");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [competency, setCompetency] = useState(84);
  const [level, setLevel] = useState("Level 4: Advanced Learner");

  useEffect(() => {
    function refreshUserData() {
      const savedRole = localStorage.getItem("user_role");
      if (savedRole) setUserRole(savedRole);

      const savedAvatar = localStorage.getItem("user_avatar");
      if (savedAvatar) setAvatarUrl(savedAvatar);
      const savedName = localStorage.getItem("user_name");
      if (savedName) setUserName(savedName);
      const savedDegree = localStorage.getItem("user_degree");
      if (savedDegree) setLevel(savedDegree);

      fetchApi<any>("/api/auth/me")
        .then((me) => {
          if (me?.role) {
            setUserRole(me.role);
            localStorage.setItem("user_role", me.role);
          }
        })
        .catch(() => {});

      fetchApi<any>("/api/profile")
        .then((data) => {
          if (data?.user?.name) {
            setUserName(data.user.name);
            localStorage.setItem("user_name", data.user.name);
          }
          if (data?.overall_mastery !== undefined) {
            setCompetency(Math.round(data.overall_mastery));
          }
          const av = data?.preferences?.avatar_url || localStorage.getItem("user_avatar");
          if (av) {
            setAvatarUrl(av);
            localStorage.setItem("user_avatar", av);
          }
          const sub = data?.preferences?.degree_standard || data?.preferences?.stream || data?.academic_level;
          if (sub) {
            setLevel(sub);
            localStorage.setItem("user_degree", sub);
          }
        })
        .catch(() => {});
    }

    refreshUserData();
    window.addEventListener("profile-updated", refreshUserData);
    return () => window.removeEventListener("profile-updated", refreshUserData);
  }, []);
  
  const studentNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Dynamic Learner Profile", href: "/profile", icon: UserCheck },
    { name: "Adaptive Practice", href: "/practice", icon: Target },
    { name: "Coding Challenges", href: "/challenges", icon: Code2 },
    { name: "Learning Path", href: "/path", icon: BookOpen },
    { name: "AI Chat Assistant", href: "/assistant", icon: MessageSquare },
    { name: "Diagram Studio", href: "/visualizer", icon: Network },
    { name: "Knowledge Base", href: "/materials", icon: FileText },
    { name: "Parent Portal", href: "/parent-dashboard", icon: HeartHandshake },
  ];

  const parentNavItems = [
    { name: "Overview & Progress", href: "/parent-dashboard#overview", icon: TrendingUp },
    { name: "Mastery & Diagnostics", href: "/parent-dashboard#mastery", icon: Target },
    { name: "Study Habits & Time", href: "/parent-dashboard#habits", icon: Clock },
    { name: "Tutor AI Insights", href: "/parent-dashboard#insights", icon: Brain },
    { name: "Settings & Alerts", href: "/parent-dashboard#settings", icon: Bell },
  ];

  const navItems = userRole === "parent" ? parentNavItems : studentNavItems;

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-50 flex flex-col justify-between shadow-xs transition-colors duration-200">
      
      {/* Top Brand & Nav */}
      <div className="flex flex-col p-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 px-2 py-3 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.2 7 9.5v-3.8a2 2 0 0 1 .6-1.4l1.4-1.3"></path>
              <path d="M12 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
              <circle cx="19" cy="19" r="3"></circle>
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight leading-none">AdaptEd AI</span>
              {userRole === "parent" ? (
                <span className="text-[9px] uppercase font-bold tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Parent
                </span>
              ) : (
                <span className="text-[9px] uppercase font-semibold tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
                  by SkillMatix
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 mt-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (userRole === "parent" && pathname === "/parent-dashboard" && item.href.startsWith("/parent-dashboard"));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400 dark:text-slate-500")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Card */}
      <div className="p-4 mt-auto">
        {userRole === "parent" ? (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {userName.startsWith("Parent") ? userName : `Parent Account`}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Parent Observer
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Family Telemetry</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Synced
              </span>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-xs font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-indigo-500/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {userName.charAt(0) || "A"}
                </div>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{userName}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{level}</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Competency</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{competency}%</span>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-xs font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}
