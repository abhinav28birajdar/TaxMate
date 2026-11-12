'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CASupportTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = params?.id || '';
  const router = useRouter();

  const [ticket, setTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTicket = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/support-tickets', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.error || 'Failed to load tickets');
      }
      const list: any[] = json.data?.tickets || json.tickets || [];
      const found = list.find((t) => t.id === ticketId || t.ticket_number === ticketId);
      if (!found) {
        throw new Error('Support ticket not found');
      }
      setTicket(found);
    } catch (err: any) {
      setError(err.message || 'Unable to load support ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-lime-500" /> Loading ticket details...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button
          variant="outline"
          size="icon"
          className="border-slate-800 bg-slate-900 text-slate-300"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Card className="bg-slate-900 border-rose-500/30 p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-white font-semibold">{error || 'Support ticket not found'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="border-slate-800 bg-slate-900 text-slate-300"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{ticket.subject}</h1>
            <p className="text-sm text-slate-400">
              Ticket: {ticket.ticket_number || ticket.id} | Category: {ticket.category || 'general'}
            </p>
          </div>
        </div>
        <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 uppercase px-3 py-1">
          {String(ticket.status || 'open').replace(/_/g, ' ')}
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-lime-400">Your Ticket Description</span>
              <span className="text-slate-500">
                {new Date(ticket.created_at).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-sm text-slate-200 whitespace-pre-line">{ticket.description}</p>
          </div>

          {ticket.admin_response && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400">TaxMate Support Response</span>
                <span className="text-slate-500">
                  {ticket.responded_at ? new Date(ticket.responded_at).toLocaleString('en-IN') : ''}
                </span>
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-line">{ticket.admin_response}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={() => router.push('/ca/support')}
            className="border-slate-700 text-slate-300 text-xs"
          >
            Back to Support Center
          </Button>
        </div>
      </Card>
    </div>
  );
}
