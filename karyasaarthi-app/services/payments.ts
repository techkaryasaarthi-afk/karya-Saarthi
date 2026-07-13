/**
 * Payments API Service — Razorpay integration for mobile.
 */

import api from './api';
import { RAZORPAY_KEY } from '@/utils/constants';

export interface Invoice {
  id: number;
  project_id: number;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpay_order_id?: string;
  created_at: string;
  due_date?: string;
  description?: string;
}

/** Get user invoices */
export async function getInvoicesApi() {
  const { data } = await api.get('/api/invoices');
  return data;
}

/** Create a Razorpay order */
export async function createOrderApi(invoiceId: number) {
  const { data } = await api.post('/api/payments/create-order', { invoice_id: invoiceId });
  return data;
}

/** Verify payment after Razorpay callback */
export async function verifyPaymentApi(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  invoice_id: number;
}) {
  const { data } = await api.post('/api/payments/verify', payload);
  return data;
}

/** Get Razorpay checkout options for the native SDK */
export function getRazorpayOptions(order: {
  id: string;
  amount: number;
  currency: string;
  description: string;
  user: { name: string; email: string; phone?: string };
}) {
  return {
    key: RAZORPAY_KEY,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: 'Karya Saarthi',
    description: order.description,
    order_id: order.id,
    prefill: {
      name: order.user.name,
      email: order.user.email,
      contact: order.user.phone || '',
    },
    theme: { color: '#1B3A6B' },
  };
}
