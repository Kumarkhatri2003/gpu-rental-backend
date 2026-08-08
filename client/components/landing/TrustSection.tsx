export function TrustSection() {
  const stats = [
    { value: "500+", label: "Available GPUs" },
    { value: "20+", label: "GPU Models" },
    { value: "100%", label: "Secure Compute" },
    { value: "24/7", label: "On-demand Access" },
  ];

  return (
    <section className="py-16 border-y border-white/5 bg-[#000000]">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-transparent md:divide-white/10">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <span className="text-[40px] font-bold tracking-tight text-white">
                {stat.value}
              </span>
              <span className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
