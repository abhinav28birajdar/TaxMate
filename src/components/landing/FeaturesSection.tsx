"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faShieldHalved, 
  faFileInvoice, 
  faFileInvoiceDollar, 
  faChartPie, 
  faUsers, 
  faCalendarDays 
} from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    title: "Client Document Vault",
    description: "Securely request, receive, and store documents from clients with bank-grade encryption and auto-organization.",
    icon: faShieldHalved,
  },
  {
    title: "Automated Tax Filing",
    description: "Direct integration for GST and ITR returns. Track filing status and deadlines across your entire client base.",
    icon: faFileInvoice,
  },
  {
    title: "Billing & Invoicing",
    description: "Generate professional invoices, send payment links, and track outstanding balances with automated reminders.",
    icon: faFileInvoiceDollar,
  },
  {
    title: "Practice Analytics",
    description: "Real-time insights into your firm's revenue, team productivity, and client compliance metrics.",
    icon: faChartPie,
  },
  {
    title: "Team Collaboration",
    description: "Assign tasks, manage staff permissions, and track internal workflow seamlessly.",
    icon: faUsers,
  },
  {
    title: "Meeting Scheduler",
    description: "Built-in calendar with video calling for remote client consultations without leaving the app.",
    icon: faCalendarDays,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none -z-10 translate-y-[-50%]" />
      
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Everything you need to <span className="text-emerald-500">scale</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed font-light">
            TaxMate replaces multiple disconnected tools with one cohesive, beautifully designed platform built specifically for Chartered Accountants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="group relative rounded-2xl bg-[#111111] border border-white/5 p-8 transition-all duration-300 hover:bg-[#151515] hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-[0_10px_40px_-15px_rgba(5,150,105,0.2)]"
            >
              <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <FontAwesomeIcon icon={feature.icon} className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-base text-gray-400 leading-relaxed font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}