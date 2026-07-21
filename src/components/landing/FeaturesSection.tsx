"use client";

import { FileText, Calculator, ShieldCheck, PieChart, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Client Document Vault",
    description: "Securely request, receive, and store documents from clients with bank-grade encryption and auto-organization.",
    icon: ShieldCheck,
  },
  {
    title: "Automated Tax Filing",
    description: "Direct integration for GST and ITR returns. Track filing status and deadlines across your entire client base.",
    icon: FileText,
  },
  {
    title: "Billing & Invoicing",
    description: "Generate professional invoices, send payment links, and track outstanding balances with automated reminders.",
    icon: Calculator,
  },
  {
    title: "Practice Analytics",
    description: "Real-time insights into your firm's revenue, team productivity, and client compliance metrics.",
    icon: PieChart,
  },
  {
    title: "Team Collaboration",
    description: "Assign tasks, manage staff permissions, and track internal workflow seamlessly.",
    icon: Users,
  },
  {
    title: "Meeting Scheduler",
    description: "Built-in calendar with video calling for remote client consultations without leaving the app.",
    icon: Calendar,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to <span className="text-primary">scale</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            TaxMate replaces multiple disconnected tools with one cohesive, beautifully designed platform built specifically for Chartered Accountants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="border-border bg-card/50 backdrop-blur hover:bg-card/80 transition-colors shadow-sm hover:shadow-primary/5 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
