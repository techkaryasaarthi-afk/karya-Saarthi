import api from './api';

export interface RevenueRecord {
  id: number;
  campaign_name: string;
  channel?: string;
  revenue_amount: number;
  leads_generated: number;
  conversions: number;
  period_start?: string;
  period_end?: string;
  creator?: { name: string };
}

export const financeService = {
  getRevenue: async () => {
    const res = await api.get('/api/admin/digital-creators?action=revenue');
    return res.data;
  },
  
  logRevenue: async (data: Partial<RevenueRecord>) => {
    const res = await api.post('/api/admin/digital-creators', { action: 'log_revenue', ...data });
    return res.data;
  },
};
