import { Banknote, Clock, Box, Lock } from "lucide-react";

export function WhyLabhya() {
  const features = [
    {
      title: "Affordable GPU Compute",
      description: "Access powerful GPUs without purchasing expensive hardware. Pay only for what you use.",
      icon: <Banknote className="w-6 h-6 text-[#2B55E8]" />
    },
    {
      title: "On-Demand Access",
      description: "Rent compute when you need it instead of maintaining dedicated infrastructure.",
      icon: <Clock className="w-6 h-6 text-[#2B55E8]" />
    },
    {
      title: "Isolated Environments",
      description: "Renter workloads run inside isolated Docker/Ubuntu environments for stability.",
      icon: <Box className="w-6 h-6 text-[#2B55E8]" />
    },
    {
      title: "Secure SSH Access",
      description: "The rental environment is exposed through the platform's secure SSH relay architecture.",
      icon: <Lock className="w-6 h-6 text-[#2B55E8]" />
    }
  ];

  return (
    <section className="py-24 bg-[#000000]">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-[32px] font-bold tracking-tight text-white mb-4">
              Why Labhya Compute
            </h2>
            <p className="text-[16px] text-[#d4d4d4]">
              Built for performance and reliability. Get enterprise-grade features at peer-to-peer pricing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex gap-6 p-6 md:p-8 rounded-2xl bg-[#121212] border border-white/5 hover:border-white/20 hover:bg-[#1a1a1a] transition-all">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#2B55E8]/10">
                  {feature.icon}
                </div>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-white mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-[14px] text-[#d4d4d4] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
