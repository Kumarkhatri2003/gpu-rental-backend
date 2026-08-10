"use client";

import { useAuthStore } from "@/stores/auth-store";

export function DashboardHeader() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "there";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mb-2">
      <h1 className="text-2xl font-semibold text-foreground">
        {getGreeting()}, {firstName}<span className="text-primary">.</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Here&apos;s your compute overview.
      </p>
    </div>
  );
}
