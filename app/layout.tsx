import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SupabaseAuthProvider } from "@/context/SupabaseAuthContext";
import { DevelopmentAuthProvider } from "@/context/DevelopmentAuthContext";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import AnalyticsWrapper from "@/components/analytics/AnalyticsWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaxMate - Enterprise-Grade Financial Services Marketplace",
  description: "Connect individuals and businesses with chartered accountants for professional financial services, tax planning, and compliance solutions.",
  keywords: ["tax consultation", "chartered accountants", "financial services", "tax planning", "business accounting", "enterprise finance"],
  authors: [{ name: "TaxMate Team" }],
  creator: "TaxMate",
  publisher: "TaxMate",
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL("https://taxmate.example.com"),
  openGraph: {
    title: "TaxMate - Enterprise-Grade Financial Services Marketplace",
    description: "Connect with verified Chartered Accountants for all your financial needs",
    url: "https://taxmate.example.com",
    siteName: "TaxMate",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaxMate - Enterprise-Grade Financial Services Marketplace",
    description: "Connect with verified Chartered Accountants for all your financial needs",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Use development auth provider for easier development experience */}
          {process.env.NODE_ENV === 'development' ? (
            <DevelopmentAuthProvider>
              <div className="flex flex-col min-h-screen">
                {children}
              </div>
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  className: "!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100",
                  style: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#FFFFFF',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#FFFFFF',
                    },
                  },
                }}
              />
              <AnalyticsWrapper />
            </DevelopmentAuthProvider>
          ) : (
            <SupabaseAuthProvider>
              <div className="flex flex-col min-h-screen">
                {children}
              </div>
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  className: "!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100",
                  style: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#FFFFFF',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#FFFFFF',
                    },
                  },
                }}
              />
              <AnalyticsWrapper />
            </SupabaseAuthProvider>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
