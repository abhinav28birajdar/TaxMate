import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const RoleSelector = ({ onSelect }: { onSelect: (role: string) => void }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => onSelect('ca')}>
        <span className="font-bold text-lg">Chartered Accountant</span>
        <span className="text-xs text-slate-500">I want to provide services</span>
      </Button>
      <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => onSelect('client_business')}>
        <span className="font-bold text-lg">Business Client</span>
        <span className="text-xs text-slate-500">I need tax & accounting services</span>
      </Button>
    </div>
  );
};
