import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/UnifiedAuthContext";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/theme/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaxMate - Professional Tax & Accounting Management Platform",
  description: "Connect with verified Chartered Accountants for professional financial services, tax planning, GST, and compliance solutions.",
  keywords: ["chartered accountant", "tax consultation", "GST filing", "ITR filing", "financial services", "CA marketplace"],
  authors: [{ name: "TaxMate" }],
  creator: "TaxMate",
  publisher: "TaxMate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                {children}
              </div>
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
