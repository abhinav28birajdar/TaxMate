'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Building2, ChevronDown, Check, X } from 'lucide-react';
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
import { useAuth } from '@/hooks/UnifiedAuthContext';

interface ClientOption {
  id: string;
  name: string;
  type: string;
}

export function WorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role } = useAuth();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);

  useEffect(() => {
    if (!user || !pathname.startsWith('/ca') || role === 'CLIENT') return;
    let active = true;

    fetch('/api/clients?take=25')
      .then((res) => (res.ok ? res.json() : { clients: [] }))
      .then((json) => {
        if (!active) return;
        const rows = (json.clients || []).map((c: any) => ({
          id: c.id,
          name: c.display_name || c.full_name || c.email || 'Client',
          type: c.client_type ? String(c.client_type).toUpperCase() : 'Client',
        }));
        setClients(rows);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [user, role, pathname]);

  useEffect(() => {
    const clientId = pathname.match(/^\/ca\/clients\/([^/]+)/)?.[1];
    const match = clients.find((client) => client.id === clientId);
    const storedClientId = typeof window !== 'undefined' ? window.localStorage.getItem('taxmate:selected-client') : null;
    const storedClient = clients.find((client) => client.id === storedClientId);

    if (match) {
      setSelectedClient(match);
      window.localStorage.setItem('taxmate:selected-client', match.id);
    } else if (pathname.startsWith('/ca') && storedClient) {
      setSelectedClient(storedClient);
    } else if (!pathname.startsWith('/ca')) {
      setSelectedClient(null);
    }
  }, [pathname, clients]);

  const handleSelectClient = (client: ClientOption) => {
    setSelectedClient(client);
    window.localStorage.setItem('taxmate:selected-client', client.id);
    toast.success(`Switched to Client Workspace: ${client.name}`);
    router.push(`/ca/clients/${client.id}`);
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    window.localStorage.removeItem('taxmate:selected-client');
    toast.info('Switched back to CA Firm Master Dashboard');
    router.push('/ca/dashboard');
  };

  return (
    <div className="flex items-center gap-3">
      {selectedClient && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-lime-600/20 text-lime-600 dark:text-lime-400 border border-lime-500/30 rounded-xl text-xs font-semibold animate-fade-in">
          <span>
            Viewing Client Workspace: <strong>{selectedClient.name}</strong>
          </span>
          <button
            onClick={handleClearClient}
            title="Exit Client Workspace"
            className="p-0.5 hover:bg-lime-600/30 rounded-full text-lime-600 dark:text-lime-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-lime-600 dark:text-lime-400" />
            {selectedClient ? selectedClient.name : 'Switch Client Workspace'}
            <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2 shadow-xl"
        >
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
            Active Client Workspaces ({clients.length})
          </DropdownMenuLabel>
          {clients.length === 0 ? (
            <div className="px-2 py-3 text-[11px] text-slate-400">
              No clients added yet.
            </div>
          ) : (
            clients.map((cli) => (
              <DropdownMenuItem
                key={cli.id}
                onClick={() => handleSelectClient(cli)}
                className="text-xs flex items-center justify-between cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 py-2 rounded-lg"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{cli.name}</div>
                  <div className="text-[10px] text-slate-400">{cli.type} Account</div>
                </div>
                {selectedClient?.id === cli.id && (
                  <Check className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
