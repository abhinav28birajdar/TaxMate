'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// ============================================================================
// TAXMATE: Modern Design System & Theme
// ============================================================================

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary: Lime Accent (#65a30d)
  primary: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16',
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
  },

  // Success: Lime/Emerald
  success: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16',
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
  },

  // Tertiary: Red (Alerts/Danger)
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Warning: Amber Tint
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Info: Sky
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d66',
  },

  // Neutral: Slate-Based Grayscale
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    150: '#e2e8f0',
    200: '#cbd5e1',
    250: '#94a3b8', // slate-400
    300: '#64748b',
    400: '#475569',
    500: '#334155', // slate-700 for dark borders
    600: '#1e293b', // slate-800 for dark cards
    700: '#0f172a', // slate-900 for dark sidebars
    800: '#0f172a',
    900: '#020617', // slate-950 for dark page bg
    950: '#020617',
  },

  // Background Sets
  background: {
    default: '#020617',
    secondary: '#0f172a',
    dark: '#020617',
    darkSecondary: '#1e293b',
  },
};


// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fonts: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem',
};

// ============================================================================
// SHADOW SYSTEM (Soft & Elegant)
// ============================================================================

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glass: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
};

// ============================================================================
// BORDER RADIUS (Rounded Corners)
// ============================================================================

export const borderRadius = {
  none: '0px',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
};

// ============================================================================
// TRANSITIONS & ANIMATIONS
// ============================================================================

export const transitions = {
  fast: 'all 0.15s ease-in-out',
  base: 'all 0.3s ease-in-out',
  slow: 'all 0.5s ease-in-out',
};

// ============================================================================
// COMPONENT SIZES
// ============================================================================

export const componentSizes = {
  button: {
    xs: { padding: '0.375rem 0.75rem', fontSize: '0.75rem', height: '1.75rem' },
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem', height: '2rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem', height: '2.5rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem', height: '3rem' },
    xl: { padding: '1.25rem 2.5rem', fontSize: '1.25rem', height: '3.5rem' },
  },
  input: {
    sm: { padding: '0.5rem 0.75rem', height: '2rem' },
    md: { padding: '0.75rem 1rem', height: '2.5rem' },
    lg: { padding: '1rem 1.5rem', height: '3rem' },
  },
  card: {
    sm: { padding: '1rem' },
    md: { padding: '1.5rem' },
    lg: { padding: '2rem' },
  },
};

// ============================================================================
// GLASSMORPHISM EFFECT
// ============================================================================

export const glassmorphism = {
  base: `
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `,
  elevated: `
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  `,
  dark: `
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `,
};

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  notification: 700,
};

// ============================================================================
// BREAKPOINTS (Responsive Design)
// ============================================================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// THEME CONTEXT
// ============================================================================

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const saved = localStorage.getItem('theme-mode') as ThemeMode;
    setMode(saved || (prefersDark ? 'dark' : 'light'));
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// ============================================================================
// THEME CONFIG EXPORT
// ============================================================================

export const themeConfig = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  componentSizes,
  glassmorphism,
  zIndex,
  breakpoints,
};

export default themeConfig;
