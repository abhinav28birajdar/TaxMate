"use client";

const stats = [
  { value: "10k+", label: "Chartered Accountants" },
  { value: "2M+", label: "Invoices Generated" },
  { value: "500k+", label: "Tax Returns Filed" },
  { value: "99.9%", label: "Platform Uptime" },
];

export function StatsSection() {
  return (
    <section className="py-20 bg-primary/5 border-y border-primary/10 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-2">
              <h4 className="font-display text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                {stat.value}
              </h4>
              <p className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
