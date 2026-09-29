import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, ListPlus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard - TaxMate CA",
  description: "Overview of your CA practice, clients, and compliance tasks.",
};

const setupSteps = [
  { title: "Add your first client", description: "Create a firm-scoped client record before tracking tax work.", href: "/clients/new", icon: UserPlus },
  { title: "Create a task template", description: "Turn recurring filing work into an assignable checklist.", href: "/tasks/new", icon: ListPlus },
  { title: "Upload a document", description: "Start the secure document pipeline for a connected client.", href: "/documents", icon: FileText },
];

export default function CADashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Firm workspace</p>
        <h1 className="mt-1 text-3xl font-display font-bold tracking-tight">Set up your practice</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Your dashboard will show live client, task, document, revenue, and compliance data once the workspace is connected.</p>
      </div>

      <Card className="border-primary/20 bg-primary/[0.04]">
        <CardHeader>
          <CardTitle>Connect your firm data</CardTitle>
          <CardDescription>TaxMate keeps financial and compliance metrics empty until they come from your firm-scoped records.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/firm/setup"><Button>Finish firm setup <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          <Link href="/firm/team/invite"><Button variant="outline">Invite your team</Button></Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {setupSteps.map(({ title, description, href, icon: Icon }) => (
          <Card key={title} className="group transition-colors hover:border-primary/40">
            <CardHeader>
              <Icon className="mb-2 h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent><Link href={href} className="inline-flex items-center text-sm font-medium text-primary hover:underline">Open workflow <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
