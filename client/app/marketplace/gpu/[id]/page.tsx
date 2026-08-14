"use client";

import React, { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { getGpuById } from "@/services/api";
import { MarketplaceGPU } from "@/types/gpu";
import { useAuthStore } from "@/stores/auth-store";
import {
  Cpu,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function GpuDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { isAuthenticated } = useAuthStore();
  const isMounted = useIsMounted();

  const [gpu, setGpu] = useState<MarketplaceGPU | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRentModalOpen, setIsRentModalOpen] = useState<boolean>(false);

  const fetchDetails = useCallback(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    getGpuById(id)
      .then((data) => {
        if (!data) {
          setError("GPU instance not found on the network.");
        } else {
          setGpu(data);
        }
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Unable to retrieve GPU details.";
        setError(msg);
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let isMountedFlag = true;
    getGpuById(id)
      .then((data) => {
        if (isMountedFlag) {
          if (!data) {
            setError("GPU instance not found on the network.");
          } else {
            setGpu(data);
          }
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMountedFlag) {
          const msg =
            err instanceof Error ? err.message : "Unable to retrieve GPU details.";
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      isMountedFlag = false;
    };
  }, [id]);

  const handleRentClick = () => {
    if (!isAuthenticated) {
      // Redirect guest to login and remember intended destination
      router.push(`/login?redirect=${encodeURIComponent(`/marketplace/gpu/${id}`)}`);
      return;
    }

    // Authenticated user can proceed to rental confirmation
    setIsRentModalOpen(true);
  };

  const isAvailable = gpu?.availability === "available";

  const detailsBody = (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 w-full">
      {/* Back to Marketplace */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-xl border border-white/10 bg-[#121212] p-8 flex flex-col items-center justify-center min-h-[300px] gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#2B55E8] border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-400">Loading GPU instance details...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="rounded-xl border border-red-500/20 bg-[#121212] p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="p-3.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Instance Unavailable</h3>
          <p className="text-sm text-zinc-400 max-w-md mb-6">{error}</p>
          <button
            type="button"
            onClick={fetchDetails}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2B55E8] text-sm font-semibold text-white hover:bg-[#315FFF] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Details Card */}
      {!isLoading && !error && gpu && (
        <div className="flex flex-col gap-6">
          {/* Header & Main Info Card */}
          <div className="rounded-xl border border-white/10 bg-[#121212] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-[#2B55E8]/10 text-[#2B55E8] border border-[#2B55E8]/20 shrink-0">
                  <Cpu className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {gpu.name}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {gpu.location}
                    </span>
                    <span>•</span>
                    <span>Provider Online</span>
                  </div>
                </div>
              </div>

              <span
                className={`inline-flex items-center self-start sm:self-center text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  isAvailable
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isAvailable
                      ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      : "bg-amber-400"
                  }`}
                />
                {isAvailable ? "Available for Rental" : gpu.availability}
              </span>
            </div>

            {/* Grid of Verified Properties */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                <span className="text-xs text-zinc-400 font-medium block mb-1">
                  VRAM Capacity
                </span>
                <span className="text-lg font-bold text-white">
                  {gpu.vram} GB
                </span>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                <span className="text-xs text-zinc-400 font-medium block mb-1">
                  Compute Location
                </span>
                <span className="text-lg font-bold text-white">
                  {gpu.location}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                <span className="text-xs text-zinc-400 font-medium block mb-1">
                  Hourly Rate
                </span>
                <span className="text-lg font-bold text-white">
                  NPR {gpu.pricePerHour.toLocaleString()}
                  <span className="text-xs font-normal text-zinc-400 ml-1">/ hr</span>
                </span>
              </div>
            </div>

            {/* Security and Provisioning notes */}
            <div className="p-4 rounded-lg bg-[#2B55E8]/5 border border-[#2B55E8]/15 flex items-start gap-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-[#2B55E8] shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-300 leading-relaxed">
                <strong className="text-white">Direct SSH Provisioning:</strong> Session credentials and relay-port routing are allocated automatically upon rental confirmation. Wallet balance is deducted hourly based on active duration.
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  NPR {gpu.pricePerHour.toLocaleString()}
                </span>
                <span className="text-sm text-zinc-400">/ hour</span>
              </div>

              <button
                type="button"
                disabled={!isAvailable}
                onClick={handleRentClick}
                className={`w-full sm:w-auto px-8 h-12 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all ${
                  isAvailable
                    ? "bg-[#2B55E8] hover:bg-[#315FFF] text-white shadow-[0_8px_20px_rgba(43,85,232,0.3)] cursor-pointer"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                }`}
              >
                <Zap className="w-4 h-4" />
                {isAvailable ? "Rent GPU" : "Currently In Use"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rental Confirmation Modal for Authenticated Users */}
      {isRentModalOpen && gpu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#121212] p-6 shadow-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-2.5 rounded-lg bg-[#2B55E8]/10 text-[#2B55E8]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Confirm Rental Session</h3>
                <p className="text-xs text-zinc-400">Initiate instance provisioning</p>
              </div>
            </div>

            <div className="space-y-3 my-5 text-sm">
              <div className="flex justify-between text-zinc-300">
                <span>GPU Model:</span>
                <span className="font-semibold text-white">{gpu.name}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>VRAM:</span>
                <span className="font-semibold text-white">{gpu.vram} GB</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Location:</span>
                <span className="font-semibold text-white">{gpu.location}</span>
              </div>
              <div className="flex justify-between text-zinc-300 pt-2 border-t border-white/5">
                <span>Rental Rate:</span>
                <span className="font-bold text-white">NPR {gpu.pricePerHour} / hr</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRentModalOpen(false)}
                className="flex-1 h-10 rounded-lg border border-white/15 text-sm font-semibold text-zinc-300 hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRentModalOpen(false);
                  router.push("/dashboard");
                }}
                className="flex-1 h-10 rounded-lg bg-[#2B55E8] text-sm font-semibold text-white hover:bg-[#315FFF] transition-all shadow-[0_4px_16px_rgba(43,85,232,0.3)] cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Authenticated Mode: Render inside DashboardLayout with Sidebar & Header
  if (isMounted && isAuthenticated) {
    return <DashboardLayout>{detailsBody}</DashboardLayout>;
  }

  // Public / Guest Mode: Render with Website Navbar and Footer
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#000000] text-white selection:bg-[#2B55E8]/30">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {detailsBody}
      </main>
      <Footer />
    </div>
  );
}
