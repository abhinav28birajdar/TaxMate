export const PERMISSIONS = {
    // Clients
    'clients.view': ['CA', 'STAFF'],
    'clients.create': ['CA'],
    'clients.edit': ['CA', 'STAFF'],
    'clients.delete': ['CA'],
    'clients.import': ['CA'],
    'clients.export': ['CA'],
    // Tasks
    'tasks.view': ['CA', 'CLIENT', 'STAFF'],
    'tasks.create': ['CA', 'STAFF'],
    'tasks.edit': ['CA', 'STAFF'],
    'tasks.delete': ['CA'],
    'tasks.assign': ['CA'],
    // Invoices
    'invoices.view': ['CA', 'CLIENT', 'STAFF'],
    'invoices.create': ['CA'],
    'invoices.edit': ['CA'],
    'invoices.delete': ['CA'],
    'invoices.download': ['CA', 'CLIENT'],
    'invoices.send': ['CA'],
    'invoices.markPaid': ['CA'],
    // Payments
    'payments.view': ['CA', 'CLIENT'],
    'payments.create': ['CLIENT'],
    'payments.refund': ['CA'],
    // Documents
    'documents.view': ['CA', 'CLIENT', 'STAFF'],
    'documents.upload': ['CA', 'CLIENT', 'STAFF'],
    'documents.delete': ['CA'],
    'documents.share': ['CA'],
    'documents.sign': ['CA', 'CLIENT'],
    // Tax Filings
    'filings.view': ['CA', 'CLIENT', 'STAFF'],
    'filings.create': ['CA'],
    'filings.edit': ['CA', 'STAFF'],
    'filings.delete': ['CA'],
    // Video Calls
    'video.create': ['CA'],
    'video.join': ['CA', 'CLIENT'],
    'video.record': ['CA'],
    'video.schedule': ['CA', 'CLIENT'],
    // Analytics
    'analytics.view': ['CA'],
    'analytics.export': ['CA'],
    // Team
    'team.view': ['CA'],
    'team.invite': ['CA'],
    'team.remove': ['CA'],
    // Admin
    'admin.users': ['SUPER_ADMIN'],
    'admin.cas': ['SUPER_ADMIN'],
    'admin.transactions': ['SUPER_ADMIN'],
    'admin.settings': ['SUPER_ADMIN'],
    'admin.audit': ['SUPER_ADMIN'],
} as const;

export function hasPermission(userRole: string, permission: keyof typeof PERMISSIONS): boolean {
    return (PERMISSIONS[permission] as readonly string[]).includes(userRole);
}

// React hook
import { useSession } from 'next-auth/react';
export function usePermission(permission: keyof typeof PERMISSIONS): boolean {
    const { data: session } = useSession();
    if (!session?.user?.role) return false;
    return hasPermission(session.user.role, permission);
}
