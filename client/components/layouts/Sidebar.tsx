"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Server, Calendar, Wallet, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

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
  const { isSidebarOpen } = useAppStore();

  if (!isSidebarOpen) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform duration-300 md:relative md:translate-x-0">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Server className="h-6 w-6" />
          <span>GPU Renting</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
