"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about the platform and how it works.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border bg-card px-6 rounded-lg data-[state=open]:shadow-md transition-all">
              <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
