'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ListSkeleton, DashboardSkeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/UnifiedAuthContext';

interface Invoice {
  id: string;
  clientId: string;
  caseId?: string;
  amount: number;
  description: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED';
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
  clientName?: string;
}

interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  paidThisMonth: number;
}

export default function PaymentsPage() {
  const { user, isLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    paidThisMonth: 0,
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setPageLoading(true);
      const response = await fetch('/api/payments?page=1&limit=100', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      const data = await response.json();
      setInvoices(data.data?.invoices || []);

      // Calculate stats
      const items = data.data?.invoices || [];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const calculatedStats = {
        totalRevenue: items
          .filter((inv: Invoice) => inv.status === 'PAID')
          .reduce((sum: number, inv: Invoice) => sum + inv.amount, 0),
        pendingAmount: items
          .filter((inv: Invoice) => inv.status === 'PENDING')
          .reduce((sum: number, inv: Invoice) => sum + inv.amount, 0),
        overdueAmount: items
          .filter((inv: Invoice) => {
            if (inv.status !== 'PENDING') return false;
            const dueDate = new Date(inv.dueDate);
            return dueDate < now;
          })
          .reduce((sum: number, inv: Invoice) => sum + inv.amount, 0),
        paidThisMonth: items
          .filter((inv: Invoice) => {
            if (inv.status !== 'PAID') return false;
            const createdDate = new Date(inv.createdAt);
            return (
              createdDate.getMonth() === currentMonth &&
              createdDate.getFullYear() === currentYear
            );
          })
          .reduce((sum: number, inv: Invoice) => sum + inv.amount, 0),
      };

      setStats(calculatedStats);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load invoices';
      toast.error(message);
      console.error('Error fetching invoices:', error);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user, fetchInvoices]);

  // Filter invoices
  useEffect(() => {
    let filtered = invoices.filter((invoice) => {
      const matchesSearch =
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, invoices]);

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
      case 'OVERDUE':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading || pageLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-primary" />
            Payments &amp; Invoicing
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage invoices and track payment status
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {[
          {
            title: 'Total Revenue',
            value: stats.totalRevenue,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
          },
          {
            title: 'Pending',
            value: stats.pendingAmount,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          },
          {
            title: 'Overdue',
            value: stats.overdueAmount,
            icon: AlertCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-100 dark:bg-red-900/20',
          },
          {
            title: 'This Month',
            value: stats.paidThisMonth,
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(stat.value)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PAID', 'PENDING', 'OVERDUE'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              <Filter className="w-3 h-3 mr-1" />
              {status}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Invoices Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Invoice ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                  {paginatedInvoices.length > 0 ? (
                    paginatedInvoices.map((invoice, index) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <code className="text-xs font-mono text-primary">
                            {invoice.id.slice(0, 12)}...
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm truncate">
                              {invoice.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info('Download PDF not yet implemented')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info('Edit not yet implemented')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => toast.info('Delete not yet implemented')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
                          <p className="text-muted-foreground">No invoices found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
