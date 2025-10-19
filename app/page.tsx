'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthHook";

export default function Home() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                TaxMate <span className="text-blue-600 dark:text-blue-400">Financial Services</span> Marketplace
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Connect with verified chartered accountants for all your financial and tax needs.
              </p>
              <div className="flex flex-wrap gap-4">
                {!user ? (
                  <>
                    <Link href="/login" className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                      Sign In
                    </Link>
                    <Link href="/register" className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      Register
                    </Link>
                  </>
                ) : (
                  <Link href={`/dashboard/${profile?.role || 'customer'}`} className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md h-80">
                <div className="absolute top-0 right-0 bg-blue-500 rounded-lg w-64 h-64 opacity-30 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 bg-purple-500 rounded-lg w-64 h-64 opacity-30 blur-2xl"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold">Tax Season 2024</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Connect with experts today!</p>
                      </div>
                    </div>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Get personalized tax advice</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>File returns with confidence</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Maximize your deductions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How TaxMate Works</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              We make it easy to find and connect with financial experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: "Find an Expert",
                description: "Browse profiles of verified chartered accountants with reviews and ratings."
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Schedule Consultation",
                description: "Book appointments at your convenience with our easy scheduling system."
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Get Expert Advice",
                description: "Receive professional guidance tailored to your specific financial situation."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join TaxMate today and connect with expert chartered accountants who can help you navigate the complex world of taxes and finance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
              Create Account
            </Link>
            <Link href="/about" className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">TaxMate</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connecting people with financial experts for better financial management.
              </p>
            </div>
            {[
              {
                title: "For Customers",
                links: [
                  { name: "Find an Expert", href: "/search" },
                  { name: "How it Works", href: "/how-it-works" },
                  { name: "Pricing", href: "/pricing" },
                  { name: "FAQ", href: "/faq" },
                ]
              },
              {
                title: "For CAs",
                links: [
                  { name: "Join as CA", href: "/register/ca" },
                  { name: "CA Resources", href: "/ca-resources" },
                  { name: "Success Stories", href: "/success-stories" },
                  { name: "CA FAQ", href: "/ca-faq" },
                ]
              },
              {
                title: "Company",
                links: [
                  { name: "About Us", href: "/about" },
                  { name: "Contact", href: "/contact" },
                  { name: "Careers", href: "/careers" },
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" },
                ]
              }
            ].map((category, index) => (
              <div key={index}>
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{category.title}</h3>
                <ul className="space-y-2">
                  {category.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href={link.href} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-300">
            <p>© {new Date().getFullYear()} TaxMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
