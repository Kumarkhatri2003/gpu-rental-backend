"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Mock API submission
const mockRegisterUser = async (): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1500);
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
    // Clear error for field when typing
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
        // Normalize
        setFormData(prev => ({ ...prev, firstName: fName, lastName: lName }));
      }
    } 
    else if (currentStep === 2) {
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
        setFormData(prev => ({ ...prev, email: email.toLowerCase() }));
      }
    }
    else if (currentStep === 3) {
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
    }
    else if (currentStep === 4) {
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
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      };
      
      console.log("Submitting registration:", payload);
      const res = await mockRegisterUser();
      
      if (res.success) {
        // Clear sensitive data
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        setStep(5); // Success step
      }
    } catch {
      toast.error("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Progress steps
  const steps = [
    { num: 1, label: "About You" },
    { num: 2, label: "Email" },
    { num: 3, label: "Password" },
    { num: 4, label: "Review" },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <div className="w-full max-w-md mx-auto">
        
        {/* Progress Indicator */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-[2px] bg-muted/50 -z-10" />
              
              {steps.map((s) => (
                <div key={s.num} className="flex flex-col items-center">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      step === s.num 
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                        : step > s.num 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground border-2 border-background"
                    }`}
                  >
                    {step > s.num ? <Check className="w-3 h-3" /> : s.num}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-2 font-medium ${
                    step >= s.num ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Area */}
        <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-sm border border-border/50 backdrop-blur-sm">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Let&apos;s get started</h1>
                <p className="text-sm text-muted-foreground mt-1">What should we call you?</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    placeholder="Jane" 
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    ref={firstInputRef}
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    placeholder="Doe" 
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                </div>
              </div>

              <Button onClick={handleNext} className="w-full h-11 text-base font-medium">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Your email</h1>
                <p className="text-sm text-muted-foreground mt-1">We&apos;ll use this for your account</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    placeholder="jane@example.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    ref={firstInputRef}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="px-3">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button onClick={handleNext} className="flex-1 h-11 text-base font-medium">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Secure your account</h1>
                <p className="text-sm text-muted-foreground mt-1">Create a strong password</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password" 
                      type={showPassword ? "text" : "password"}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="px-3">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button onClick={handleNext} className="flex-1 h-11 text-base font-medium">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Review & Create</h1>
                <p className="text-sm text-muted-foreground mt-1">Please confirm your details</p>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Name</div>
                  <div className="font-medium text-base">{formData.firstName} {formData.lastName}</div>
                </div>
                <div className="h-px bg-border/50" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Email</div>
                  <div className="font-medium text-base">{formData.email}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 mt-4">
                  <Checkbox 
                    id="terms" 
                    checked={formData.termsAccepted}
                    onCheckedChange={handleCheckboxChange}
                    className="mt-1"
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                      I agree to the <Link href="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                    </Label>
                    {errors.termsAccepted && <p className="text-sm text-destructive mt-1">{errors.termsAccepted}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} disabled={isLoading} className="px-3">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading} 
                  className="flex-1 h-11 text-base font-medium"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center py-6 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight mb-2">Account Created</h1>
                <p className="text-muted-foreground">
                  Welcome to Labhya Compute, {formData.firstName}. Your account has been successfully set up.
                </p>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => router.push("/dashboard")} className="w-full h-11 text-base font-medium">
                  Continue to Dashboard
                </Button>
              </div>
            </div>
          )}

        </div>

        {step < 5 && (
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
