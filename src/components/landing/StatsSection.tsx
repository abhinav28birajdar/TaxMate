"use client";

const stats = [
  { value: "10k+", label: "Chartered Accountants" },
  { value: "2M+", label: "Invoices Generated" },
  { value: "500k+", label: "Tax Returns Filed" },
  { value: "99.9%", label: "Platform Uptime" },
];

export function StatsSection() {
  return (
    <section className="py-20 bg-[#0A0A0A] border-y border-white/5 relative overflow-hidden text-white">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-36 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-2xl bg-[#111111]/70 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#141414] hover:-translate-y-1"
            >
              <h4 className="font-sans text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                <span className="bg-gradient-to-br from-white via-white to-emerald-400 bg-clip-text text-transparent">
                  {stat.value}
                </span>
              </h4>
              <p className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}