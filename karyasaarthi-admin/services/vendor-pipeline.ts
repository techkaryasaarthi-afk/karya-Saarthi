/**
 * Vendor Pipeline Service — Admin API calls for vendor hiring management.
 */

import api from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';

export interface VendorApplication {
  id: number;
  vendor_id: string;
  user_id: number | null;
  status: string;
  current_step: number;
  fullname: string;
  email: string;
  phone: string;
  education: string | null;
  experience_years: number;
  skills: string[];
  previous_companies: string | null;
  certifications: string | null;
  resume_link: string | null;
  work_samples: { url: string; title: string; description?: string }[];
  q1_projects_experience: string | null;
  q2_pricing: string | null;
  q3_guidelines_corrections: string | null;
  q4_teaching_ability: string | null;
  q5_sample_sharing: string | null;
  interview_date: string | null;
  interview_notes: string | null;
  score_communication: number | null;
  score_experience: number | null;
  score_quality: number | null;
  score_teaching: number | null;
  score_availability: number | null;
  total_score: number | null;
  selection_message_sent: boolean;
  whatsapp_joined: boolean;
  google_form_completed: boolean;
  website_registered: boolean;
  documents_uploaded: boolean;
  documents_verified: boolean;
  vendor_id_generated: boolean;
  orientation_completed: boolean;
  first_project_assigned: boolean;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ── List Applications ────────────────────────────────────────
export async function getVendorApplications(filters?: { status?: string; search?: string; page?: number }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.page) params.set('page', String(filters.page));
  const qs = params.toString();
  const { data } = await api.get(`${ADMIN_ENDPOINTS.VENDOR_PIPELINE}${qs ? `?${qs}` : ''}`);
  return data;
}

// ── Get Single Application ───────────────────────────────────
export async function getVendorApplicationDetail(id: number) {
  const { data } = await api.get(`${ADMIN_ENDPOINTS.VENDOR_PIPELINE}/${id}`);
  return data;
}

// ── Update Application ───────────────────────────────────────
export async function updateVendorApplication(id: number, updates: Record<string, unknown>) {
  const { data } = await api.put(`${ADMIN_ENDPOINTS.VENDOR_PIPELINE}/${id}`, updates);
  return data;
}
