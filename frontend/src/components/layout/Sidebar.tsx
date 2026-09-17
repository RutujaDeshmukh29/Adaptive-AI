"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, FileText, MessageSquare, Target, LayoutDashboard, LogOut, Settings, HeartHandshake, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { removeToken } from "@/lib";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Knowledge Base", href: "/materials", icon: FileText },
    { name: "AI Assistant", href: "/assistant", icon: MessageSquare },
    { name: "Adaptive Practice", href: "/practice", icon: Target },
    { name: "Learning Path", href: "/path", icon: BookOpen },
    { name: "Visualizer", href: "/visualizer", icon: Network },
    { name: "Parent Portal", href: "/parent-dashboard", icon: HeartHandshake },
    { name: "Profile", href: "/profile", icon: Settings },
  ];

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-slate-950 text-slate-50">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">AdaptEd AI</h2>
        <p className="text-sm text-slate-400 mt-1">Adaptive Learning Engine</p>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
