"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Calendar,
  Wallet,
  Settings,
  User,
  PanelLeftClose,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Marketplace", href: "/marketplace", icon: Server },
  { name: "My GPUs", href: "/gpus", icon: Server },
  { name: "Sessions", href: "/sessions", icon: Calendar },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <>
      {/* Mobile Backdrop Overlay with smooth fade */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity duration-300 ease-in-out",
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar Aside Container with smooth width & transform transitions */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-background transition-all duration-300 ease-in-out md:relative flex flex-col shrink-0 border-r",
          isSidebarOpen
            ? "w-64 translate-x-0 opacity-100"
            : "w-64 -translate-x-full md:w-0 md:translate-x-0 md:opacity-0 md:border-r-0 md:overflow-hidden pointer-events-none"
        )}
      >
        <div className="w-64 flex flex-col h-full overflow-hidden shrink-0">
          {/* Header with Title and Close Button */}
          <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6 shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold text-lg text-primary"
            >
              <Server className="h-5 w-5 shrink-0" />
              <span className="truncate">Labhya Compute</span>
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              title="Close sidebar"
            >
              <PanelLeftClose className="hidden md:block h-4 w-4" />
              <X className="md:hidden h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>

          {/* Navigation items */}
          <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
