import { CASidebar } from "@/components/layout/CASidebar";
import { TopBar } from "@/components/layout/topbar";

export default function CALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <CASidebar />
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <TopBar />
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
