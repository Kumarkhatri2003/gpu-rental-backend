import Link from "next/link";

import { Terminal } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#000000] pt-24 pb-32 md:pt-32 md:pb-40">
      {/* Background glow effects based on vast.ai */}
      <div className="absolute inset-0 bg-[url('https://vast.ai/star-bg.svg')] bg-cover bg-center opacity-30 pointer-events-none"></div>
      <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#2B55E8] opacity-[0.15] blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="container relative mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 text-left max-w-2xl">
          <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-[13px] font-medium text-white mb-8 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            Agent-Ready Infrastructure
          </div>
          
          <h1 className="text-[48px] md:text-[64px] lg:text-[72px] font-bold leading-[1.05] tracking-tight text-white mb-6">
            Rent GPU Power.<br />
            Run Anything.
          </h1>
          
          <p className="text-[18px] md:text-[20px] text-[#d4d4d4] mb-10 leading-relaxed font-normal max-w-xl">
            Labhya Compute lets developers, researchers and AI builders rent available GPUs on demand without purchasing expensive hardware.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/marketplace" 
              className="w-full sm:w-auto h-[52px] inline-flex items-center justify-center rounded-full bg-[#2B55E8] px-8 text-[16px] font-medium text-white transition-all duration-200 hover:bg-[#315FFF] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(43,85,232,0.24)]"
            >
              Browse GPUs
            </Link>
            <Link 
              href="#how-it-works" 
              className="w-full sm:w-auto h-[52px] inline-flex items-center justify-center rounded-full bg-transparent border border-white/20 px-8 text-[16px] font-medium text-white transition-all duration-200 hover:bg-white hover:text-[#0a0a0a]"
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Abstract GPU/Terminal visual */}
        <div className="flex-1 w-full max-w-lg lg:max-w-xl hidden md:block relative z-10">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#2B55E8]/20 to-[#a8bbff]/10 blur-2xl rounded-full opacity-50"></div>
          <div className="rounded-xl border border-white/10 bg-[#0d1117]/90 backdrop-blur-xl shadow-2xl overflow-hidden relative">
            <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/5">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="ml-4 text-[12px] text-white/40 font-mono">ssh renter@labhya</div>
            </div>
            <div className="p-6 font-mono text-[13px] text-[#d4d4d4] flex flex-col items-start min-h-[240px] leading-relaxed">
              <div className="flex items-center gap-2 mb-4 w-full">
                <Terminal className="w-4 h-4 text-[#2B55E8]" />
                <span className="text-[#a8bbff]">Establishing secure connection...</span>
              </div>
              <p className="text-white/80">Welcome to Ubuntu 22.04 LTS (GNU/Linux)</p>
              <div className="mt-4 space-y-1">
                <p className="text-white/60" suppressHydrationWarning>System information as of {new Date().toISOString().split('T')[0]}</p>
                <p className="text-white/90 font-semibold mt-2 text-[#a8bbff]">$ nvidia-smi</p>
                <div className="mt-2 p-3 bg-black/40 rounded border border-white/5 text-[12px] text-white/70">
                  <p>GPU 0: NVIDIA RTX 4090 (24GB)</p>
                  <p>Temp: 42C | Util: 0% | Power: 35W / 450W</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-green-400">renter@compute:~$</span>
                <span className="w-2 h-[15px] bg-white/80 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
