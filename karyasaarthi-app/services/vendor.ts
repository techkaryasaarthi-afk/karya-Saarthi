/**
 * Vendor Application Service — API calls for the vendor hiring pipeline.
 * Handles multi-step application submission and status tracking.
 */

import api from './api';

// ── Types ────────────────────────────────────────────────────────────────────
export interface WorkSample {
  url: string;
  title: string;
  description?: string;
}

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
  work_samples: WorkSample[];
  q1_projects_experience: string | null;
  q2_pricing: string | null;
  q3_guidelines_corrections: string | null;
  q4_teaching_ability: string | null;
  q5_sample_sharing: string | null;
  interview_date: string | null;
  total_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface Step1Data {
  fullname: string;
  email: string;
  phone: string;
  education?: string;
  experience_years?: number;
  skills?: string[];
  previous_companies?: string;
  certifications?: string;
  resume_link?: string;
}

export interface Step2Data {
  work_samples: WorkSample[];
}

export interface Step3Data {
  q1_projects_experience: string;
  q2_pricing: string;
  q3_guidelines_corrections: string;
  q4_teaching_ability: string;
  q5_sample_sharing: string;
}

// ── API Functions ────────────────────────────────────────────────────────────

const ENDPOINT = '/api/vendor/apply';

/** Submit Step 1: Basic Info + Resume Link */
export async function submitStep1(data: Step1Data) {
  const { data: result } = await api.post(ENDPOINT, { step: 1, data });
  return result;
}

/** Submit Step 2: Work Sample Links */
export async function submitStep2(applicationId: number, data: Step2Data) {
  const { data: result } = await api.post(ENDPOINT, {
    step: 2,
    application_id: applicationId,
    data,
  });
  return result;
}

/** Submit Step 3: Written Questions */
export async function submitStep3(applicationId: number, data: Step3Data) {
  const { data: result } = await api.post(ENDPOINT, {
    step: 3,
    application_id: applicationId,
    data,
  });
  return result;
}

/** Get application status by email */
export async function getApplicationStatus(email: string) {
  const { data } = await api.get(`${ENDPOINT}?email=${encodeURIComponent(email)}`);
  return data;
}
