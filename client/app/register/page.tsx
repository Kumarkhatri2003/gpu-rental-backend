"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Check, ArrowRight, ArrowLeft, Cpu } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock API submission
const mockRegisterUser = async (): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1200);
  });
};

export default function RegisterPage() {
  const router = useRouter();

  // Step State (1-5, where 5 is success)
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  // Error State for current step
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Focus management
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, termsAccepted: checked }));
    if (errors.termsAccepted) {
      setErrors((prev) => ({ ...prev, termsAccepted: "" }));
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      const fName = formData.firstName.trim();
      const lName = formData.lastName.trim();

      if (!fName) {
        newErrors.firstName = "First name is required";
        isValid = false;
      } else if (fName.length < 2) {
        newErrors.firstName = "First name must be at least 2 characters";
        isValid = false;
      }

      if (!lName) {
        newErrors.lastName = "Last name is required";
        isValid = false;
      } else if (lName.length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters";
        isValid = false;
      }

      if (isValid) {
        setFormData((prev) => ({ ...prev, firstName: fName, lastName: lName }));
      }
    } else if (currentStep === 2) {
      const email = formData.email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) {
        newErrors.email = "Email is required";
        isValid = false;
      } else if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }

      if (isValid) {
        setFormData((prev) => ({ ...prev, email: email.toLowerCase() }));
      }
    } else if (currentStep === 3) {
      if (!formData.password) {
        newErrors.password = "Password is required";
        isValid = false;
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
        isValid = false;
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    } else if (currentStep === 4) {
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = "You must accept the Terms of Service to continue";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    setErrors({});
  };

  const handleKeyDown = (e: React.KeyboardEvent, isFinalStep = false) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isFinalStep) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);
    try {
      const res = await mockRegisterUser();

      if (res.success) {
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        setStep(5);
      }
    } catch {
      toast.error("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "About You" },
    { num: 2, label: "Email" },
    { num: 3, label: "Password" },
    { num: 4, label: "Review" },
  ];

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
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sign up for Labhya Compute
          </p>
        </div>

        {/* Progress Step Dots */}
        {step < 5 && (
          <div className="flex items-center justify-between relative px-1 py-1">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-[2px] bg-border -z-10" />

            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs",
                    step === s.num
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-105"
                      : step > s.num
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground border border-border"
                  )}
                >
                  {step > s.num ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                </div>
                <span
                  className={cn(
                    "text-[10px] mt-1.5 font-semibold",
                    step >= s.num ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* HeroUI-Inspired Multi-Step Form */}
        <div className="flex w-full flex-col gap-4">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  ref={firstInputRef}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <span className="text-xs font-medium text-destructive mt-0.5 animate-in fade-in duration-150">
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <span className="text-xs font-medium text-destructive mt-0.5 animate-in fade-in duration-150">
                    {errors.lastName}
                  </span>
                )}
              </div>

              <Button
                variant="primary"
                size="md"
                fullWidth
                onPress={handleNext}
                className="h-11 rounded-xl font-semibold shadow-sm mt-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Email */}
          {step === 2 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  ref={firstInputRef}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <span className="text-xs font-medium text-destructive mt-0.5 animate-in fade-in duration-150">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="tertiary"
                  size="md"
                  isIconOnly
                  onPress={handleBack}
                  aria-label="Previous step"
                  className="h-11 px-4 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onPress={handleNext}
                  className="flex-1 h-11 rounded-xl font-semibold shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    ref={firstInputRef}
                    aria-invalid={!!errors.password}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  Must be at least 8 characters with 1 uppercase and 1 number
                </p>
                {errors.password && (
                  <span className="text-xs font-medium text-destructive mt-0.5 animate-in fade-in duration-150">
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <span className="text-xs font-medium text-destructive mt-0.5 animate-in fade-in duration-150">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="tertiary"
                  size="md"
                  isIconOnly
                  onPress={handleBack}
                  aria-label="Previous step"
                  className="h-11 px-4 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onPress={handleNext}
                  className="flex-1 h-11 rounded-xl font-semibold shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Terms */}
          {step === 4 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="bg-secondary/40 p-4 rounded-xl space-y-2.5 border border-border/60">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Name
                  </div>
                  <div className="font-bold text-sm text-foreground">
                    {formData.firstName} {formData.lastName}
                  </div>
                </div>
                <div className="h-px bg-border/40" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Email
                  </div>
                  <div className="font-bold text-sm text-foreground font-mono">
                    {formData.email}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 pt-1">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={handleCheckboxChange}
                  className="mt-0.5"
                />
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-xs font-normal cursor-pointer leading-relaxed text-muted-foreground"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline font-semibold">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline font-semibold">
                      Privacy Policy
                    </Link>
                  </Label>
                  {errors.termsAccepted && (
                    <p className="text-xs text-destructive font-semibold mt-1">
                      {errors.termsAccepted}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="tertiary"
                  size="md"
                  isIconOnly
                  onPress={handleBack}
                  isDisabled={isLoading}
                  aria-label="Previous step"
                  className="h-11 px-4 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  isPending={isLoading}
                  onPress={handleSubmit}
                  className="flex-1 h-11 rounded-xl font-semibold shadow-sm"
                >
                  <span>{isLoading ? "Creating account..." : "Create Account"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="flex flex-col items-center text-center gap-4 py-4 animate-in zoom-in-95 duration-300">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center shadow-xs">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                  Account Created
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                  Welcome to Labhya Compute, {formData.firstName}. Your account has been set up successfully.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                fullWidth
                onPress={() => router.push("/dashboard")}
                className="h-11 rounded-xl font-semibold shadow-sm mt-2"
              >
                Continue to Dashboard
              </Button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 5 && (
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Already have an account?</p>
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline block"
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
