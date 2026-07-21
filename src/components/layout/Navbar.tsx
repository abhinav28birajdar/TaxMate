"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-xl tracking-tight">
          Tax<span className="text-primary">Mate</span>
        </Link>
        
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/about" className="text-sm font-medium hover:text-primary">About</Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary">Pricing</Link>
          <Link href="/faq" className="text-sm font-medium hover:text-primary">FAQ</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
