/**
 * Invoices API Service — Fetch, filter, and pay invoices via Razorpay.
 *
 * Endpoints consumed (from the Next.js website):
 * - GET  /api/invoices/my      → List user's invoices
 * - POST /api/payments/create-order → Create a Razorpay order for an invoice
 * - POST /api/payments/verify   → Verify Razorpay payment signature
 */

import api from './api';

// ── Types ────────────────────────────────────────────────────────────────────

export interface Invoice {
  id: number;
  invoice_number: string;
  total: number;
  status: 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  project: { id: number; service_type: string } | null;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

// ── Status Configs ───────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  sent:      { label: 'Pending',   color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
  paid:      { label: 'Paid',      color: '#10B981', bg: '#D1FAE5', icon: '✅' },
  overdue:   { label: 'Overdue',   color: '#EF4444', bg: '#FEE2E2', icon: '⚠️' },
  cancelled: { label: 'Cancelled', color: '#6B7280', bg: '#F3F4F6', icon: '✕'  },
};

// ── API Functions ────────────────────────────────────────────────────────────

/** Get the current user's invoices */
export async function getMyInvoicesApi(): Promise<InvoiceListResponse> {
  const { data } = await api.get('/api/invoices/my');
  return { invoices: data?.invoices || [] };
}

/** Create a Razorpay order for a given invoice */
export async function createRazorpayOrderApi(invoiceId: number): Promise<RazorpayOrder> {
  const { data } = await api.post('/api/payments/create-order', { invoice_id: invoiceId });
  return data?.order || data;
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

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Compute summary KPIs from an invoice list */
export function computeInvoiceKPIs(invoices: Invoice[]) {
  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + i.total, 0);
  const totalPending = invoices
    .filter(i => i.status === 'sent')
    .reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices
    .filter(i => i.status === 'overdue')
    .reduce((s, i) => s + i.total, 0);
  return { totalPaid, totalPending, totalOverdue };
}
