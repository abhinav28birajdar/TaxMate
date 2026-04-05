'use client';

import React from 'react';
import { themeConfig, colors, shadows, borderRadius } from '@/src/theme/design-system';

// ============================================================================
// TAXMATE: Core UI Component Library
// This file contains reusable, high-quality components for the platform
// ============================================================================

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: `bg-primary text-white hover:bg-purple-700 transition-colors`,
      secondary: `bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors`,
      danger: `bg-red-600 text-white hover:bg-red-700 transition-colors`,
      outline: `border-2 border-primary text-primary hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors`,
      ghost: `text-primary hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors`,
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-${borderRadius.lg} transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${fullWidth ? 'w-full' : ''}
          ${variantStyles[variant]}
        `}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {icon && !isLoading && <span className="flex">{icon}</span>}
        {isLoading && <LoadingSpinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// CARD COMPONENT
// ============================================================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  elevated?: boolean;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ glass = false, elevated = false, interactive = false, children, ...props }, ref) => {
    const baseStyle = `
      rounded-${borderRadius['2xl']} p-6
      ${glass ? 'bg-white/70 backdrop-blur-lg border border-white/20' : 'bg-white'}
      ${elevated ? `shadow-lg` : `shadow-md`}
      ${interactive ? 'cursor-pointer hover:shadow-xl transition-shadow duration-200' : ''}
    `;

    return (
      <div ref={ref} className={baseStyle} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// INPUT COMPONENT
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2" style={{ color: colors.neutral[700] }}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2">{icon}</div>}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-lg border-2 transition-all
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${error ? `border-${colors.danger[500]}` : `border-${colors.neutral[200]}`}
              ${icon ? 'pl-10' : ''}
            `}
            style={{
              backgroundColor: colors.background.default,
              borderColor: error ? colors.danger[500] : colors.neutral[200],
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm font-medium" style={{ color: colors.danger[600] }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1 text-sm" style={{ color: colors.neutral[500] }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// BADGE COMPONENT
// ============================================================================

interface BadgeProps {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'primary', size = 'md', children }) => {
  const colorMap = {
    primary: { bg: '#e0f2fe', text: colors.primary[600] },
    success: { bg: '#dcfce7', text: colors.success[600] },
    danger: { bg: '#fee2e2', text: colors.danger[600] },
    warning: { bg: '#fef3c7', text: colors.warning[600] },
    info: { bg: '#e0f2fe', text: colors.info[600] },
    neutral: { bg: colors.neutral[100], text: colors.neutral[700] },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: colorMap[variant].bg,
        color: colorMap[variant].text,
      }}
    >
      {children}
    </span>
  );
};

// ============================================================================
// LOADING SPINNER
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeMap = { sm: 16, md: 24, lg: 32 };
  return (
    <div
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: `3px solid ${colors.neutral[200]}`,
        borderTop: `3px solid ${colors.primary[600]}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
};

// ============================================================================
// MODAL COMPONENT
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeMap = { sm: '400px', md: '500px', lg: '700px', xl: '900px' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <Card
        className="max-w-full"
        style={{ width: sizeMap[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <div className="mb-6">{children}</div>
        {actions && <div className="flex gap-3 justify-end">{actions}</div>}
      </Card>
    </div>
  );
};

// ============================================================================
// TOAST NOTIFICATION
// ============================================================================

interface ToastProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type = 'info', message, onClose }) => {
  const bgMap = {
    success: colors.success[50],
    error: colors.danger[50],
    info: colors.info[50],
    warning: colors.warning[50],
  };

  const borderMap = {
    success: colors.success[500],
    error: colors.danger[500],
    info: colors.info[500],
    warning: colors.warning[500],
  };

  return (
    <div
      className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border-l-4"
      style={{
        backgroundColor: bgMap[type],
        borderLeftColor: borderMap[type],
      }}
    >
      <p className="font-medium" style={{ color: borderMap[type] }}>
        {message}
      </p>
    </div>
  );
};

// ============================================================================
// STAT CARD
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
}) => {
  const trendColor =
    trend === 'up'
      ? colors.success[600]
      : trend === 'down'
        ? colors.danger[600]
        : colors.neutral[600];

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p style={{ color: colors.neutral[600] }} className="text-sm font-medium">
            {title}
          </p>
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      <div className="mb-2">
        <h3 className="text-3xl font-bold">{value}</h3>
        {subtitle && (
          <p style={{ color: colors.neutral[500] }} className="text-sm mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {trend && (
        <div className="text-sm font-medium" style={{ color: trendColor }}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// DATA TABLE
// ============================================================================

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: colors.neutral[500] }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b" style={{ borderColor: colors.neutral[200] }}>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3 text-left text-sm font-semibold"
                style={{ color: colors.neutral[700], width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className="border-b transition-colors hover:bg-neutral-50 cursor-pointer"
              style={{ borderColor: colors.neutral[100] }}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-6 py-4 text-sm"
                  style={{ color: colors.neutral[700] }}
                >
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// SIDEBAR NAVIGATION
// ============================================================================

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: number;
  submenu?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
  logo?: React.ReactNode;
  onNavigate?: (href: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, logo, onNavigate }) => {
  return (
    <aside
      className="w-64 h-screen flex flex-col border-r p-6"
      style={{ borderColor: colors.neutral[200], backgroundColor: colors.background.default }}
    >
      {logo && <div className="mb-8">{logo}</div>}
      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.(item.href);
            }}
            className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
              item.active ? 'bg-primary-100 text-primary-600' : 'hover:bg-neutral-100'
            }`}
            style={
              item.active
                ? {
                    backgroundColor: colors.primary[50],
                    color: colors.primary[600],
                  }
                : {}
            }
          >
            <div className="flex items-center gap-3">
              {item.icon && <span className="text-lg">{item.icon}</span>}
              <span className="font-medium">{item.label}</span>
            </div>
            {item.badge && (
              <Badge size="sm" variant="primary">
                {item.badge}
              </Badge>
            )}
          </a>
        ))}
      </nav>
    </aside>
  );
};

// ============================================================================
// TOP BAR / HEADER
// ============================================================================

interface TopBarProps {
  title?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
  notifications?: number;
  userMenu?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  searchPlaceholder = 'Search...',
  onSearch,
  actions,
  notifications,
  userMenu,
}) => {
  return (
    <header
      className="h-16 border-b px-6 flex items-center justify-between"
      style={{ borderColor: colors.neutral[200], backgroundColor: colors.background.default }}
    >
      {title && <h1 className="text-2xl font-bold">{title}</h1>}
      
      <div className="flex-1 mx-6 max-w-md">
        <Input
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          icon={<span>🔍</span>}
        />
      </div>

      <div className="flex items-center gap-4">
        {notifications !== undefined && (
          <div className="relative cursor-pointer">
            <span className="text-2xl">🔔</span>
            {notifications > 0 && (
              <Badge
                size="sm"
                variant="danger"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                }}
              >
                {notifications}
              </Badge>
            )}
          </div>
        )}
        {actions}
        {userMenu && <div className="ml-4">{userMenu}</div>}
      </div>
    </header>
  );
};

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'primary' | 'success' | 'danger' | 'warning';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  color = 'primary',
}) => {
  const percentage = (value / max) * 100;
  const colorMap = {
    primary: colors.primary[600],
    success: colors.success[600],
    danger: colors.danger[600],
    warning: colors.warning[600],
  };

  return (
    <div>
      {label && <p className="text-sm font-medium mb-2">{label}</p>}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: colors.neutral[200] }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: colorMap[color],
          }}
        />
      </div>
      <p className="text-xs mt-1" style={{ color: colors.neutral[500] }}>
        {value} / {max}
      </p>
    </div>
  );
};

export default {
  Button,
  Card,
  Input,
  Badge,
  LoadingSpinner,
  Modal,
  Toast,
  StatCard,
  DataTable,
  Sidebar,
  TopBar,
  ProgressBar,
};
