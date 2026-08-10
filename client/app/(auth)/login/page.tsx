"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleDevBypass = () => {
    // Set a fake user and token
    setAuth(
      {
        id: "dev-user-1",
        email: "dev@labhya.com",
        name: "Developer",
        role: "renter",
      },
      "fake-jwt-token-12345"
    );
    // Redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Login</h1>
      <p className="text-muted-foreground text-center max-w-md">
        This is a placeholder for the login page.
      </p>
      
      {/* Developer Bypass Button */}
      <div className="mt-8 p-6 bg-[#121212] border border-dashed border-white/20 rounded-xl flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Debug Mode</div>
        <Button 
          onClick={handleDevBypass}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Developer Login Bypass
        </Button>
      </div>
    </div>
  );
}

