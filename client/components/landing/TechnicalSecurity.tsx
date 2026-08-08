import { ShieldCheck, Server, ArrowRight } from "lucide-react";

export function TechnicalSecurity() {
  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#2B55E8]/10 blur-[120px]"></div>
      
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#2B55E8]/30 bg-[#2B55E8]/10 px-3 py-1.5 text-[13px] font-medium text-[#a8bbff] mb-6">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Enterprise-grade Isolation
            </div>
            
            <h2 className="text-[32px] md:text-[40px] font-bold tracking-tight text-white mb-6">
              Your compute environment stays isolated.
            </h2>
            
            <p className="text-[16px] text-[#d4d4d4] mb-8 leading-relaxed">
              We&apos;ve built Labhya Compute with security from the ground up. You receive a fully isolated Ubuntu environment, ensuring both your code and the host&apos;s system remain secure and separate.
            </p>
            
            <ul className="space-y-4">
              {[
                "Host filesystems are completely inaccessible to renters",
                "Workloads are containerized using Docker",
                "Direct hardware passthrough for maximum GPU performance",
                "Encrypted reverse SSH tunneling"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  </div>
                  <span className="text-[#d4d4d4] text-[15px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#2B55E8]/20 to-transparent opacity-50 blur-xl"></div>
            <div className="relative rounded-2xl border border-white/10 bg-[#0d1117] p-8 shadow-2xl">
              <div className="flex flex-col space-y-2 font-mono text-[13px]">
                
                <div className="flex items-center justify-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <span className="font-semibold text-white">Your Browser</span>
                </div>
                
                <div className="flex justify-center py-1 text-white/30">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
                
                <div className="flex items-center justify-center p-4 bg-[#2B55E8]/20 text-[#a8bbff] rounded-lg border border-[#2B55E8]/30">
                  <span className="font-semibold">Labhya Compute</span>
                </div>
                
                <div className="flex justify-center py-1 text-white/30">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
                
                <div className="flex items-center justify-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <LockIcon />
                  <span className="font-semibold text-white ml-2">Secure SSH Relay</span>
                </div>
                
                <div className="flex justify-center py-1 text-white/30">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
                
                <div className="p-1 rounded-lg border-2 border-dashed border-[#2B55E8]/40 bg-[#121212]">
                  <div className="flex flex-col space-y-2 p-3">
                    <div className="text-[11px] text-center text-[#a8bbff] mb-1 uppercase tracking-wider font-semibold">Isolation Boundary</div>
                    
                    <div className="flex items-center justify-center p-3 bg-white/5 rounded-md border border-white/10">
                      <span className="font-semibold text-white">Ubuntu Container</span>
                    </div>
                    
                    <div className="flex items-center justify-center p-3 bg-white/5 rounded-md border border-white/10">
                      <span className="font-semibold text-white">Docker Isolation</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center py-1 text-white/30">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>

                <div className="flex items-center justify-center p-4 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">
                  <Server className="w-4 h-4 mr-2" />
                  <span className="font-semibold">NVIDIA GPU</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
