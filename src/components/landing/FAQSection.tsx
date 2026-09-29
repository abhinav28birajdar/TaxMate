"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How secure is my clients' data?",
    answer: "TaxMate uses bank-grade 256-bit AES encryption for all stored documents and data. We are ISO 27001 certified and strictly adhere to data privacy regulations. Your data is backed up daily and stored in secure AWS data centers.",
  },
  {
    question: "Can I migrate my existing clients to TaxMate?",
    answer: "Yes! We offer a dedicated onboarding team that will help you bulk-import your existing client data, documents, and historical filings using our CSV templates or direct API integrations.",
  },
  {
    question: "Do you support digital signatures (DSC)?",
    answer: "Absolutely. TaxMate natively supports digital signatures. You can plug in your DSC token and sign documents directly from the browser without needing third-party utilities.",
  },
  {
    question: "Can my staff have restricted access?",
    answer: "Yes, our robust Role-Based Access Control (RBAC) allows you to restrict staff access to specific clients, prevent them from downloading documents, and limit their ability to view financial data.",
  },
  {
    question: "Is there a white-label option for my firm?",
    answer: "Our Enterprise plan includes full white-labeling. Your clients will see your firm's logo, brand colors, and use a custom domain (e.g., portal.yourfirm.com) when they log in.",
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden text-white">
      {/* Background Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Frequently Asked <span className="text-emerald-500">Questions</span>
          </h2>
          <p className="text-lg text-gray-400 font-light leading-relaxed">
            Everything you need to know about the platform and how it works.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div 
                key={index} 
                className={`rounded-2xl bg-[#111111] border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-emerald-500/30 shadow-[0_4px_20px_-10px_rgba(5,150,105,0.2)]' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-6 flex items-center justify-between text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={`text-lg font-semibold tracking-tight transition-colors duration-300 ${isOpen ? 'text-emerald-500' : 'text-white'}`}>
                    {faq.question}
                  </span>
                  
                  {/* Chevron Icon */}
                  <div className={`ml-4 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#222222] text-gray-400'}`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </button>

                {/* Animated Dropdown Content */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-gray-400 font-light leading-relaxed text-base pt-2">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}