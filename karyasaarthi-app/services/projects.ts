/**
 * Projects API Service — CRUD operations for customer/vendor projects.
 */

import api from './api';

export interface Project {
  id: number;
  name: string;
  title?: string;
  description: string;
  status: string;
  service_name?: string;
  service_type?: string;
  vendor_name?: string;
  customer_name?: string;
  amount?: number;
  deadline?: string;
  progress?: number;
  created_at: string;
  updated_at: string;
}

function normalizeProject(project: any): Project {
  return {
    ...project,
    name: project.name || project.title || project.service_type || 'Project',
    title: project.title || project.service_type || project.name,
    service_name: project.service_name || project.service_type,
    vendor_name: project.vendor_name || project.vendor?.fullname,
    customer_name: project.customer_name || project.client?.fullname,
    amount: project.amount ?? project.budget,
    deadline: project.deadline ?? project.completed_at,
  };
}

/** Get all projects for the current user */
export async function getProjectsApi(params?: { status?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  const { data } = await api.get(`/api/projects?${query.toString()}`);
  return {
    ...data,
    projects: (data?.projects || []).map(normalizeProject),
  };
}

/** Get a single project by ID */
export async function getProjectApi(id: number | string) {
  const { data } = await api.get(`/api/projects/${id}`);
  return normalizeProject(data?.project || data);
}

/** Create a new service request / project */
export async function createProjectApi(payload: {
  service_id?: number;
  name: string;
  description: string;
  budget?: number;
  deadline?: string;
  attachments?: string[];
}) {
  const { data } = await api.post('/api/projects', {
    service_type: payload.name,
    description: payload.description,
    budget: payload.budget,
  });
  return data;
}

/** Update project status or details */
export async function updateProjectApi(id: number | string, updates: Partial<Project>) {
  const { data } = await api.patch(`/api/projects/${id}`, updates);
  return data?.project ? normalizeProject(data.project) : data;
}

/** Submit project deliverable (vendor) */
export async function submitDeliverableApi(id: number | string, payload: {
  notes: string;
  files: string[];
}) {
  const { data } = await api.patch(`/api/projects/${id}`, {
    status: 'delivered',
    progress: 100,
    notes: payload.notes,
    files: payload.files,
  });
  return data?.project ? normalizeProject(data.project) : data;
}

/** Submit Vendor Rating */
export async function submitRatingApi(payload: { project_id: number; rating: number; review?: string }) {
  const { data } = await api.post('/api/ratings', payload);
  return data;
}

/** Get Project Tasks */
export async function getProjectTasksApi(projectId: number | string) {
  const { data } = await api.get(`/api/admin/projects/tasks?project_id=${projectId}`);
  return data;
}

/** Update Project Task Status */
export async function updateProjectTaskApi(id: number | string, status: string) {
  const { data } = await api.patch('/api/admin/projects/tasks', { id, status });
  return data;
}
