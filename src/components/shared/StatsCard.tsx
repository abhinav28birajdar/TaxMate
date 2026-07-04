import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
  onClick,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{value}</h3>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  trend === 'up' ? 'text-lime-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'
                )}
              >
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : trend === 'down' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : null}
                {trendValue}
              </div>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {icon && (
          <div className="ml-4 p-3 rounded-lg bg-lime-50 text-lime-600 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
