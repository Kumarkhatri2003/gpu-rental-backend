"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Menu, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function Navbar() {
  const { isAuthenticated, user } = useAuthStore();
  const isMounted = useIsMounted();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="container mx-auto flex h-[72px] items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-[22px] tracking-tight text-white">
              Labhya Compute
            </span>
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link
              href="/marketplace"
              className="text-[15px] font-medium text-white/70 hover:text-white transition-colors duration-150"
            >
              Marketplace
            </Link>
            <Link
              href="/#how-it-works"
              className="text-[15px] font-medium text-white/70 hover:text-white transition-colors duration-150"
            >
              How It Works
            </Link>
            <Link
              href="/register/host"
              className="text-[15px] font-medium text-white/70 hover:text-[#a8bbff] transition-colors duration-150"
            >
              For Hosts
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-5">
          {isMounted && isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 h-9 rounded-md bg-[#2B55E8] px-4 text-[14px] font-medium text-white transition-all hover:bg-[#315FFF] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(43,85,232,0.24)]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard ({user?.name?.split(" ")[0] || "Account"})</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-flex items-center text-[15px] font-medium text-white/70 hover:text-white transition-colors duration-150"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-[#2B55E8] px-5 text-[14px] font-medium text-white transition-all hover:bg-[#315FFF] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(43,85,232,0.24)]"
              >
                Get Started
              </Link>
            </>
          )}
          <button className="md:hidden p-2 -mr-2 text-white/70 hover:text-white">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
