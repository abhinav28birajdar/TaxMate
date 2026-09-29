import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, ListChecks, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatTitle(path: string[]) {
  const value = path.filter(Boolean).join(" / ").replace(/[-_]/g, " ");
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Workspace";
}

export function ModulePage({
  portal,
  path,
}: {
  portal: "Customer" | "CA" | "Admin" | "Account";
  path: string[];
}) {
  const title = formatTitle(path);
  const basePath = portal === "Customer" ? "/client" : portal === "CA" ? "/ca" : portal === "Admin" ? "/admin" : "/";
  const isList = /dashboard|documents|tasks|clients|messages|notifications|reports|returns|payments|invoices|appointments|settings|support/i.test(title);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{portal} workspace</p>
          <h1 className="mt-1 text-3xl font-display font-bold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Manage this part of your TaxMate workspace with secure, firm-scoped records.
          </p>
        </div>
        {isList && <Button><Plus className="mr-2 h-4 w-4" />Create new</Button>}
      </div>

      <Card className="border-primary/20 bg-primary/[0.04]">
        <CardHeader>
          <CardTitle>{title} is ready for live data</CardTitle>
          <CardDescription>
            Connect records, permissions, and workflows here. Empty states are intentional until your account has data.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-lg border bg-background/70 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
            <div><p className="font-medium">Secure access</p><p className="text-sm text-muted-foreground">Protected by your workspace permissions.</p></div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border bg-background/70 p-4">
            <FileText className="mt-0.5 h-5 w-5 text-primary" />
            <div><p className="font-medium">Structured records</p><p className="text-sm text-muted-foreground">Use validated forms and auditable updates.</p></div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border bg-background/70 p-4">
            <ListChecks className="mt-0.5 h-5 w-5 text-primary" />
            <div><p className="font-medium">Clear next step</p><p className="text-sm text-muted-foreground">Start with setup, upload, or invite actions.</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href={`${basePath}/dashboard`}><Button variant="outline">Back to dashboard</Button></Link>
        <Link href={portal === "Customer" ? "/client/documents/upload" : portal === "CA" ? "/ca/clients/add" : "/contact"}>
          <Button>Open a primary workflow <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </div>
    </div>
  );
}
