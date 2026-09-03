export function TrustSection() {
  const stats = [
    { value: "500+", label: "Available GPUs" },
    { value: "20+", label: "GPU Models" },
    { value: "100%", label: "Encrypted SSH" },
    { value: "24/7", label: "On-demand Access" },
  ];

  return (
    <section className="py-14 border-b border-border/60 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x-0 md:divide-x divide-border/60">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col space-y-1.5 px-4">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                {stat.value}
              </span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
