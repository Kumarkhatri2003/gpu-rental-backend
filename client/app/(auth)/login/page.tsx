"use client";

import { Suspense } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const handleDevBypass = () => {
    // Set a user and token
    setAuth(
      {
        id: "dev-user-1",
        email: "dev@labhya.com",
        name: "Developer",
        role: "renter",
      },
      "fake-jwt-token-12345"
    );
    // Redirect to the intended destination (e.g. /marketplace/gpu/[id] or /dashboard)
    router.push(redirectUrl);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Login</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Sign in to your Labhya Compute account to manage or rent GPU resources.
      </p>

      {/* Developer Bypass Button */}
      <div className="mt-8 p-6 bg-[#121212] border border-dashed border-white/20 rounded-xl flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Debug Mode
        </div>
        <Button
          onClick={handleDevBypass}
          className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
        >
          Developer Login Bypass
        </Button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
