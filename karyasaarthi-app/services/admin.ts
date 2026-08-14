/**
 * Admin API Service — Admin-specific API calls for dashboard, users, projects, etc.
 */
import api from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';

// ── Dashboard ────────────────────────────────────────────────
export async function getDashboardApi() {
  const { data } = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
  return data;
}

// ── Users ────────────────────────────────────────────────────
export async function getUsersApi(role?: string) {
  const p = role ? `?role=${role}` : '';
  const { data } = await api.get(`${ADMIN_ENDPOINTS.USERS}${p}`);
  return data?.users || data || [];
}

export async function updateUserApi(id: number, updates: Record<string, unknown>) {
  const { data } = await api.put(`${ADMIN_ENDPOINTS.USERS}/${id}`, updates);
  return data;
}

// ── Projects ─────────────────────────────────────────────────
export async function getProjectsApi(status?: string) {
  const p = status ? `?status=${status}` : '';
  const { data } = await api.get(`${ADMIN_ENDPOINTS.PROJECTS}${p}`);
  return data?.projects || data || [];
}

export async function updateProjectApi(id: number, updates: Record<string, unknown>) {
  const { data } = await api.put(`${ADMIN_ENDPOINTS.PROJECTS}/${id}`, updates);
  return data;
}

// ── Services ─────────────────────────────────────────────────
export async function getServicesApi() {
  const { data } = await api.get(ADMIN_ENDPOINTS.SERVICES);
  return data?.services || data || [];
}

export async function updateServiceApi(id: number, updates: Record<string, unknown>) {
  const { data } = await api.put(`${ADMIN_ENDPOINTS.SERVICES}/${id}`, updates);
  return data;
}

// ── Vendors ──────────────────────────────────────────────────
export async function getVendorsApi() {
  const { data } = await api.get(ADMIN_ENDPOINTS.VENDORS);
  return data?.vendors || data || [];
}

// ── Invoices ─────────────────────────────────────────────────
export async function getInvoicesApi() {
  const { data } = await api.get(ADMIN_ENDPOINTS.INVOICES);
  return data?.invoices || data || [];
}

// ── Staff ────────────────────────────────────────────────────
export async function getStaffApi() {
  const { data } = await api.get(ADMIN_ENDPOINTS.STAFF);
  return data?.staff || data || [];
}

// ── Analytics ────────────────────────────────────────────────
export async function getAnalyticsApi() {
  const { data } = await api.get(ADMIN_ENDPOINTS.ANALYTICS);
  return data;
}

// ── Announcements ────────────────────────────────────────────
export async function getAnnouncementsApi() {
  const { data } = await api.get(ADMIN_ENDPOINTS.ANNOUNCEMENTS);
  return data?.announcements || data || [];
}

export async function createAnnouncementApi(payload: { title: string; content: string; priority?: string }) {
  const { data } = await api.post(ADMIN_ENDPOINTS.ANNOUNCEMENTS, payload);
  return data;
}

// ── CRM ──────────────────────────────────────────────────────
export async function getCrmApi() {
  const { data } = await api.get(ADMIN_ENDPOINTS.CRM);
  return data;
}

// ── Meetings ─────────────────────────────────────────────────
export async function getMeetingsApi() {
  const { data } = await api.get(ADMIN_ENDPOINTS.MEETINGS);
  return data?.meetings || data || [];
}

// ── Ratings ──────────────────────────────────────────────────
export async function getRatingsApi() {
  const { data } = await api.get(ADMIN_ENDPOINTS.RATINGS);
  return data?.ratings || data || [];
}
