import Link from "next/link";


export function FinalCTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#000000]">
      <div className="absolute inset-0 bg-[#2B55E8]/[0.02]"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2B55E8]/20 blur-[120px] rounded-[100%] pointer-events-none"></div>
      
      <div className="container relative mx-auto px-6 lg:px-10 text-center z-10">
        <h2 className="text-[40px] md:text-[56px] lg:text-[64px] font-bold tracking-tight mb-6 text-white leading-tight">
          Your next GPU is a <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#315FFF] to-[#a8bbff]">few clicks away.</span>
        </h2>
        
        <p className="text-[18px] text-[#d4d4d4] max-w-2xl mx-auto mb-10">
          Find the compute power you need and start building.
        </p>
        
        <Link 
          href="/marketplace" 
          className="inline-flex h-[56px] items-center justify-center rounded-full bg-[#2B55E8] px-10 text-[18px] font-medium text-white transition-all duration-200 hover:bg-[#315FFF] hover:-translate-y-0.5 shadow-[0_0_40px_rgba(43,85,232,0.3)] hover:shadow-[0_16px_40px_rgba(43,85,232,0.4)]"
        >
          Explore GPUs
        </Link>
      </div>
    </section>
  );
}
