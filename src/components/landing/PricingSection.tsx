"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
    <section className="py-24" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent <span className="text-primary">pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your firm's size. No hidden fees, ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <Card key={i} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold font-display">
                  {plan.price}
                  <span className="ml-1 text-xl font-medium text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
