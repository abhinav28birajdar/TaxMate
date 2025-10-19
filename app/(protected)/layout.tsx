import { ReactNode } from "react";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* This is a client component wrapper that would verify authentication */}
      {children}
    </div>
  );
}