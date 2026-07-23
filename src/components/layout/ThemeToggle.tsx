'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleSetTheme = (mode: string) => {
    setTheme(mode);
    toast.success(`Theme switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-lime-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DropdownMenuItem onClick={() => handleSetTheme('light')} className="cursor-pointer text-xs">
          <Sun className="w-3.5 h-3.5 mr-2 text-amber-500" /> Light Mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme('dark')} className="cursor-pointer text-xs">
          <Moon className="w-3.5 h-3.5 mr-2 text-lime-400" /> Dark Mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme('system')} className="cursor-pointer text-xs">
          System Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
