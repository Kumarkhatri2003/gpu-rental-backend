import Link from "next/link";

export function HostCTA() {
  return (
    <section className="py-24 bg-[#0a0a0a] border-y border-white/5 relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#2B55E8]/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="container relative mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-[32px] md:text-[40px] font-bold tracking-tight text-white">
            Have a GPU sitting idle?
          </h2>
          <p className="text-[18px] text-[#d4d4d4]">
            Turn unused GPU capacity into income by becoming a Labhya Compute host. Provide compute power to developers and researchers globally.
          </p>
          <div className="pt-4">
            <Link 
              href="/register/host" 
              className="inline-flex h-[52px] items-center justify-center rounded-md bg-[#2B55E8] px-8 text-[16px] font-medium text-white transition-all hover:bg-[#315FFF] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(43,85,232,0.24)]"
            >
              Become a Host
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
