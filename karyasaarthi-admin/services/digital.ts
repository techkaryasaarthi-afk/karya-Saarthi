import api from './api';

export interface Creator {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  platforms: string[];
  categories: string[];
  status: string;
  rate_per_post: number;
  notes?: string;
}

export interface Submission {
  id: number;
  creator_id: number;
  title: string;
  platform: string;
  content_url?: string;
  content_type: string;
  status: string;
  reviewer_notes?: string;
  submitted_at: string;
}

export const digitalService = {
  getCreators: async () => {
    const res = await api.get('/api/admin/digital-creators?action=list');
    return res.data;
  },
  
  createCreator: async (data: Partial<Creator>) => {
    const res = await api.post('/api/admin/digital-creators', { action: 'create_creator', ...data });
    return res.data;
  },
  
  getSubmissions: async () => {
    const res = await api.get('/api/admin/digital-creators?action=submissions');
    return res.data;
  },
  
  submitContent: async (data: Partial<Submission>) => {
    const res = await api.post('/api/admin/digital-creators', { action: 'submit_content', ...data });
    return res.data;
  },
  
  reviewSubmission: async (id: number, status: string, notes: string = '') => {
    const res = await api.patch('/api/admin/digital-creators', { action: 'review_submission', id, status, reviewer_notes: notes });
    return res.data;
  },
  
  getKeywords: async () => {
    const res = await api.get('/api/admin/ops-digital?type=keywords');
    return res.data;
  },
  
  getAds: async () => {
    const res = await api.get('/api/admin/ops-digital?type=ads');
    return res.data;
  }
};
