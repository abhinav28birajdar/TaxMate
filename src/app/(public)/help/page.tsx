"use client";

import { UnifiedSupportSystem } from "@/components/support/UnifiedSupportSystem";

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="max-w-5xl mx-auto relative z-10">
        <UnifiedSupportSystem />
      </div>
    </div>
  );
}
