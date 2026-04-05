'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'taxmate-theme',
  attribute = 'data-theme',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  
  useEffect(() => {
    const root = window.document.documentElement;
    const initialColorValue = root.classList.contains('dark') ? 'dark' : 'light';
    
    // Load saved theme
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    
    // Apply saved theme or initialize with default
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (defaultTheme === 'system') {
      setTheme(
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      );
    }
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove any transition during theme change to avoid flashing
    if (disableTransitionOnChange) {
      root.classList.add('transition-none');
      
      // Re-enable transitions after change is complete
      window.setTimeout(() => {
        root.classList.remove('transition-none');
      }, 0);
    }

    if (theme === 'system' && enableSystem) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      root.setAttribute(attribute, theme);
    } else {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      root.setAttribute(attribute, theme);
    }

    // Save theme to localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, attribute, enableSystem, disableTransitionOnChange, storageKey]);

  // Set up system theme change listener
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        if (mediaQuery.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystem, theme]);

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
