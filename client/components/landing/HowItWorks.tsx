import { Search, CreditCard, Terminal, Zap } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      id: "01",
      title: "Find your GPU",
      description: "Browse available GPUs and filter based on GPU model, VRAM, price, and location.",
      icon: <Search className="w-6 h-6 text-[#2B55E8]" />
    },
    {
      id: "02",
      title: "Rent",
      description: "Choose a GPU and start a rental session instantly.",
      icon: <CreditCard className="w-6 h-6 text-[#2B55E8]" />
    },
    {
      id: "03",
      title: "Connect",
      description: "Once the host provisions the environment, the platform provides secure SSH access.",
      icon: <Terminal className="w-6 h-6 text-[#2B55E8]" />
    },
    {
      id: "04",
      title: "Compute",
      description: "Use the rented GPU for AI/ML training, fine-tuning, development, or other workloads.",
      icon: <Zap className="w-6 h-6 text-[#2B55E8]" />
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-bold tracking-tight text-white mb-4">
            How It Works
          </h2>
          <p className="text-[16px] text-[#d4d4d4] max-w-2xl mx-auto">
            Get from zero to training your AI models in minutes. 
            Our streamlined process makes renting compute power simple.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2B55E8] to-[#a8bbff] rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
              <div className="relative flex flex-col p-8 bg-[#121212] border border-white/5 rounded-2xl h-full transition-colors group-hover:border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-[#2B55E8]/10 rounded-xl">
                    {step.icon}
                  </div>
                  <span className="text-[32px] font-extrabold text-white/5 font-mono">
                    {step.id}
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-white mb-3 tracking-tight">{step.title}</h3>
                <p className="text-[14px] text-[#d4d4d4] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
