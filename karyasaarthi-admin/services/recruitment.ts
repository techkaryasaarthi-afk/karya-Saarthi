/**
 * Recruitment service — HR job postings, applications, interviews
 */
import api from './api'
import { ADMIN_ENDPOINTS } from '@/utils/constants'

const R = ADMIN_ENDPOINTS.RECRUITMENT

export interface JobPosting {
  job_id: number
  title: string
  category: string
  department: string
  pillar: string | null
  location: string
  work_type: string
  job_type: string
  description: string
  requirements: string
  skills: string
  salary_range: string
  positions: number
  status: 'active' | 'draft' | 'closed'
  deadline: string | null
  application_count: number
  created_at: string
}

export interface Application {
  application_id: number
  job_id: number
  job_title: string
  applicant_name: string
  email: string
  phone: string
  status: 'new' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'offer_sent' | 'joined' | 'rejected'
  applied_date: string
  score_comm: number
  score_exp: number
  score_quality: number
  score_teaching: number
  score_avail: number
  total_score: number
}

export interface Interview {
  interview_id: number
  application_id: number
  applicant_name: string
  job_title: string
  interview_type: string
  interview_date: string
  meeting_link: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
}

export const recruitmentService = {
  getJobs: () => api.get(R, { params: { action: 'jobs' } }).then(r => r.data),
  getApplications: (jobId?: number, status?: string) =>
    api.get(R, { params: { action: 'applications', ...(jobId ? { job_id: jobId } : {}), ...(status ? { status } : {}) } }).then(r => r.data),
  getInterviews: () => api.get(R, { params: { action: 'interviews' } }).then(r => r.data),

  createJob: (data: Record<string, string | number>) => api.post(R, { action: 'create_job', ...data }).then(r => r.data),
  updateJobStatus: (jobId: number, status: string) => api.post(R, { action: 'update_job_status', job_id: String(jobId), status }).then(r => r.data),
  deleteJob: (jobId: number) => api.post(R, { action: 'delete_job', job_id: String(jobId) }).then(r => r.data),

  updateApplicationStatus: (appId: number, status: string) =>
    api.post(R, { action: 'update_application_status', application_id: String(appId), status }).then(r => r.data),

  scheduleInterview: (data: Record<string, string>) =>
    api.post(R, { action: 'schedule_interview', ...data }).then(r => r.data),

  deleteInterview: (id: number) => api.post(R, { action: 'delete_interview', interview_id: String(id) }).then(r => r.data),
}
