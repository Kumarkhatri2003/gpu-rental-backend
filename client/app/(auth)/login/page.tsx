"use client";

import React, { Suspense, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cpu } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(emailTrimmed)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      // Simulate auth request latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      const normalizedEmail = email.trim().toLowerCase();
      const username = normalizedEmail.split("@")[0] || "Renter";

      setAuth(
        {
          id: `user-${Date.now()}`,
          email: normalizedEmail,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          role: "renter",
        },
        `jwt-token-${Date.now()}`
      );

      toast.success("Signed in successfully.");
      router.push(redirectUrl);
    } catch {
      toast.error("Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevBypass = () => {
    setAuth(
      {
        id: "dev-user-1",
        email: "dev@labhya.com",
        name: "Developer",
        role: "renter",
      },
      "fake-jwt-token-12345"
    );
    toast.success("Developer bypass active.");
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-sm sm:w-96 flex flex-col gap-6">
        {/* Brand & Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-extrabold text-xl text-foreground tracking-tight mb-2"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <Cpu className="h-5 w-5" />
            </div>
            <span>Labhya Compute</span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sign in to Labhya Compute
          </p>
        </div>

        {/* HeroUI-Inspired Form */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              disabled={isLoading}
              aria-invalid={!!errors.email}
              autoComplete="email"
              autoFocus
            />
            {errors.email && (
              <span className="text-xs font-medium text-destructive mt-0.5 animate-in fade-in duration-150">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              disabled={isLoading}
              aria-invalid={!!errors.password}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="text-xs font-medium text-destructive mt-0.5 animate-in fade-in duration-150">
                {errors.password}
              </span>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isPending={isLoading}
              className="h-11 rounded-xl text-sm font-semibold shadow-sm"
            >
              <span>{isLoading ? "Signing in..." : "Login"}</span>
            </Button>

            {/* Quick Developer Bypass */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              fullWidth
              onPress={handleDevBypass}
              className="rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Quick Login as Developer
            </Button>
          </div>
        </form>

        {/* Footer Navigation */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Don&apos;t have an account?</p>
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline block"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm font-medium">Loading login...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
