'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const segments = pathname
      .split('/')
      .filter((s) => s && s !== 'dashboard' && s !== 'portal')
      .slice(0, 3);

    return segments.map((segment, i) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
      href: i < segments.length - 1 ? `/${segments.slice(0, i + 1).join('/')}` : undefined,
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className={cn('flex items-center gap-1 text-sm', className)}>
      {breadcrumbs.map((crumb, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
          {crumb.href ? (
            <Link href={crumb.href} className="text-slate-600 hover:text-lime-600 transition">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
