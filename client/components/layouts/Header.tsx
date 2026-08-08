"use client";

import { Menu, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/stores/app-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

export function Header() {
  const { toggleSidebar } = useAppStore();
  const { logout, user } = useAuthStore();
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <div className="hidden md:flex items-center text-sm font-medium">
          Welcome, {user?.name || "User"}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-5 w-5 text-destructive" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
}
