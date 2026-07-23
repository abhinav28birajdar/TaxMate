'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Building2, Users, ChevronDown, Check, ArrowRight, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function WorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);

  const clients = [
    { id: 'cli_1', name: 'TechNova Solutions Pvt Ltd', type: 'Business' },
    { id: 'cli_2', name: 'Ananya Deshmukh', type: 'Individual' },
    { id: 'cli_3', name: 'Apex Logistics India', type: 'Business' },
    { id: 'cli_4', name: 'Dr. Vikramaditya Rao', type: 'Individual' },
  ];

  // Auto-detect active client from URL path
  useEffect(() => {
    if (pathname.includes('/ca/clients/')) {
      const parts = pathname.split('/ca/clients/');
      const clientId = parts[1];
      const match = clients.find((c) => c.id === clientId);
      if (match) {
        setSelectedClient(match);
      }
    }
  }, [pathname]);

  const handleSelectClient = (client: { id: string; name: string }) => {
    setSelectedClient(client);
    toast.success(`Switched to Client Workspace: ${client.name}`);
    router.push(`/ca/clients/${client.id}`);
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    toast.info('Switched back to CA Firm Master Dashboard');
    router.push('/ca/dashboard');
  };

  return (
    <div className="flex items-center gap-3">
      {/* Banner if client is active */}
      {selectedClient && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-lime-600/20 text-lime-600 dark:text-lime-400 border border-lime-500/30 rounded-xl text-xs font-semibold animate-fade-in">
          <span>Viewing Client Workspace: <strong>{selectedClient.name}</strong></span>
          <button onClick={handleClearClient} title="Exit Client Workspace" className="p-0.5 hover:bg-lime-600/30 rounded-full text-lime-600 dark:text-lime-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Switcher Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm">
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-lime-600 dark:text-lime-400" />
            {selectedClient ? selectedClient.name : 'Switch Client Workspace'}
            <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2 shadow-xl">
          <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            CA Firm Master Workspace
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={handleClearClient}
            className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 py-2 rounded-lg"
          >
            <span>My CA Firm Dashboard</span>
            {!selectedClient && <Check className="w-4 h-4 text-lime-600 dark:text-lime-400" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1.5" />

          <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Active Client Workspaces
          </DropdownMenuLabel>
          {clients.map((cli) => (
            <DropdownMenuItem
              key={cli.id}
              onClick={() => handleSelectClient(cli)}
              className="text-xs flex items-center justify-between cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 py-2 rounded-lg"
            >
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{cli.name}</div>
                <div className="text-[10px] text-slate-400">{cli.type} Account</div>
              </div>
              {selectedClient?.id === cli.id && <Check className="w-4 h-4 text-lime-600 dark:text-lime-400" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
