'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaymentButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  clientName: string;
  clientEmail: string;
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * PaymentButton - Razorpay Payment Integration
 * 
 * Handles online payments via Razorpay
 * Supports both success and error callbacks
 * 
 * Usage:
 * <PaymentButton
 *   invoiceId="inv-001"
 *   invoiceNumber="INV-202607-0001"
 *   amount={5000}
 *   clientName="ABC Corp"
 *   clientEmail="contact@abc.com"
 *   onPaymentSuccess={handleSuccess}
 * />
 */
export function PaymentButton({
  invoiceId,
  invoiceNumber,
  amount,
  clientName,
  clientEmail,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className,
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const loadRazorpaySdk = (): Promise<boolean> => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentClick = async () => {
    setIsProcessing(true);
    setPaymentStatus('idle');
    setErrorMessage('');

    try {
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
      if (!keyId || keyId.includes('placeholder')) {
        throw new Error('Payment gateway is not configured in this environment (NEXT_PUBLIC_RAZORPAY_KEY_ID missing).');
      }

      const loaded = await loadRazorpaySdk();
      if (!loaded) {
        throw new Error('Failed to load payment gateway');
      }

      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          invoiceNumber,
          amount: Math.round(amount * 100),
          clientName,
          clientEmail,
        }),
      });

      if (!orderResponse.ok) {
        const errData = await orderResponse.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create payment order');
      }

      const { orderId, amount: authoritativeAmount } = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: authoritativeAmount || Math.round(amount * 100),
        currency: 'INR',
        name: 'TaxMate',
        description: `Invoice ${invoiceNumber}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id || orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                invoiceId,
              }),
            });

            if (verifyResponse.ok) {
              setPaymentStatus('success');
              onPaymentSuccess?.(response.razorpay_payment_id);
            } else {
              const errData = await verifyResponse.json().catch(() => ({}));
              throw new Error(errData.error || 'Payment verification failed');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Verification failed';
            setPaymentStatus('error');
            setErrorMessage(message);
            onPaymentError?.(message);
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
        prefill: {
          name: clientName,
          email: clientEmail,
        },
        theme: {
          color: '#65a30d',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment error';
      setPaymentStatus('error');
      setErrorMessage(message);
      onPaymentError?.(message);
      setIsProcessing(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-lime-600 hover:bg-lime-700 text-white',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
    outline: 'border-2 border-lime-600 text-lime-600 hover:bg-lime-50',
  };

  // Status-based rendering
  if (paymentStatus === 'success') {
    return (
      <div className={cn('flex items-center gap-2 p-3 bg-lime-50 rounded border border-lime-300', className)}>
        <CheckCircle className="w-5 h-5 text-lime-600" />
        <div>
          <p className="font-semibold text-lime-900">Payment Successful!</p>
          <p className="text-sm text-lime-700">Transaction completed</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className={cn('flex items-center gap-2 p-3 bg-red-50 rounded border border-red-300', className)}>
        <AlertCircle className="w-5 h-5 text-red-600" />
        <div>
          <p className="font-semibold text-red-900">Payment Failed</p>
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handlePaymentClick}
      disabled={disabled || isProcessing}
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        'gap-2 font-semibold',
        className
      )}
    >
      <CreditCard className="w-4 h-4" />
      {isProcessing ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
    </Button>
  );
}

/**
 * @deprecated Use PaymentButton instead
 */
export function RazorpayPaymentButton(props: PaymentButtonProps) {
  return <PaymentButton {...props} />;
}

export default PaymentButton;

