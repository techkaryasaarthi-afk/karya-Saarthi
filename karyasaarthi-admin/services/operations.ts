import api from './api';

export interface VendorWorkload {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  activeJobs: number;
}

export interface SOP {
  id: number;
  title: string;
  content: string | null;
  category: string;
  version: string;
  is_published: boolean;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  cost: number;
  renewal_date: string | null;
  status: string;
  vendor: string;
}

export interface SLAData {
  breached: number;
  atRisk: number;
  onTrack: number;
}

export const operationsService = {
  getDashboard: async () => {
    const res = await api.get('/api/admin/operations');
    return res.data;
  },
  
  getInventory: async () => {
    const res = await api.get('/api/admin/ops-digital?type=inventory');
    return res.data;
  },
  
  addInventoryItem: async (item: Partial<InventoryItem>) => {
    const res = await api.post('/api/admin/ops-digital', { routeType: 'inventory', ...item });
    return res.data;
  },
  
  removeInventoryItem: async (id: string) => {
    const res = await api.delete('/api/admin/ops-digital', { data: { type: 'inventory', id } });
    return res.data;
  },

  getSOPs: async () => {
    const res = await api.get('/api/admin/sop');
    return res.data;
  },

  createSOP: async (data: Partial<SOP>) => {
    const res = await api.post('/api/admin/sop', data);
    return res.data;
  },
  
  submitLegalDoc: async (data: any) => {
    const res = await api.post('/api/admin/board/legal', data);
    return res.data;
  }
};
