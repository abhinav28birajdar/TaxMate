import { Metadata } from "next";
import { 
  FileText, 
  Receipt,
  AlertCircle,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Client Portal - TaxMate",
  description: "Manage your tax filings, documents, and communicate with your CA.",
};

export default function ClientPortalPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Portal Home</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your tax status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button>Upload Document</Button>
          <Button variant="outline">Message CA</Button>
        </div>
      </div>

      {/* Action required */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 text-primary rounded-full">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Action Required: Sign ITR-V</h3>
            <p className="text-muted-foreground text-sm">Your CA has prepared your Income Tax Return. Please review and sign.</p>
          </div>
        </div>
        <Button size="lg" className="shrink-0 w-full sm:w-auto">Review & Sign</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Receipt className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹15,000</div>
            <p className="text-xs text-destructive">1 overdue invoice</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Documents Shared</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">3 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Next Meeting</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">24 Oct, 11:00 AM</div>
            <p className="text-xs text-muted-foreground">Tax Planning Session</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
