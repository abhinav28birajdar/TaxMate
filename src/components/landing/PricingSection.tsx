"use client";

import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "₹1,999",
    period: "/month",
    description: "Perfect for solo practitioners and independent CAs.",
    features: [
      "Up to 100 Clients",
      "Unlimited Document Storage",
      "Basic Task Management",
      "GST & ITR Reminders",
      "Email Support",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
  {
    name: "Professional",
    price: "₹4,999",
    period: "/month",
    description: "Ideal for growing firms with multiple staff members.",
    features: [
      "Up to 500 Clients",
      "5 Staff Accounts",
      "Advanced Practice Analytics",
      "Automated Invoicing & Payments",
      "Video Consultations",
      "Priority Support",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large firms requiring custom workflows and scale.",
    features: [
      "Unlimited Clients",
      "Unlimited Staff Accounts",
      "White-label Client Portal",
      "Custom API Integrations",
      "Dedicated Account Manager",
      "On-premise deployment option",
    ],
    popular: false,
    cta: "Contact Sales",
  }
];

export function PricingSection() {
  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden text-white" id="pricing">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none -z-10 translate-y-[-50%]" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Simple, transparent <span className="text-emerald-500">pricing</span>
          </h2>
          <p className="text-lg text-gray-400 font-light leading-relaxed">
            Choose the plan that fits your firm's size. No hidden fees, ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 bg-[#111111] ${
                plan.popular 
                  ? 'border-2 border-emerald-500 shadow-[0_10px_40px_-15px_rgba(5,150,105,0.3)] md:-translate-y-2' 
                  : 'border border-white/5 hover:border-emerald-500/30 hover:bg-[#151515]'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 font-light min-h-[40px]">{plan.description}</p>
                <div className="mt-6 flex items-baseline text-4xl font-extrabold text-white">
                  {plan.price}
                  <span className="ml-1 text-base font-normal text-gray-400">{plan.period}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="flex-1 mb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0 mr-3 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-gray-300 text-sm font-light">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer / CTA Button */}
              <div>
                <Link href={plan.name === "Enterprise" ? "/contact" : "/register"} className="block w-full">
                  <button className={`w-full h-12 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center ${
                    plan.popular
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(5,150,105,0.3)] hover:shadow-[0_0_30px_rgba(5,150,105,0.5)]'
                      : 'bg-[#222222] hover:bg-[#333333] text-white border border-white/5'
                  }`}>
                    {plan.cta}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}