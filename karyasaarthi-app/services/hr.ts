/**
 * HR Service — Leave management, attendance tracking for admin app.
 */

import api from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';

export interface LeaveRequest {
  id: number;
  user_id: number;
  user_name: string;
  user_role?: string;
  leave_type: 'casual' | 'sick' | 'earned' | 'maternity' | 'paternity' | 'other';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: number;
  user_id: number;
  user_name: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  hours_worked?: number;
}

// ── Leave Management ─────────────────────────────────────────
export async function getLeavesApi(status?: string): Promise<LeaveRequest[]> {
  try {
    const params = status ? `?status=${status}` : '';
    const { data } = await api.get(`${ADMIN_ENDPOINTS.HR}/leaves${params}`);
    return data?.leaves || data || [];
  } catch {
    return [];
  }
}

export async function updateLeaveStatusApi(id: number, status: 'approved' | 'rejected', remarks?: string) {
  const { data } = await api.put(`${ADMIN_ENDPOINTS.HR}/leaves/${id}`, { status, remarks });
  return data;
}

export async function applyLeaveApi(payload: {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}) {
  const { data } = await api.post(`${ADMIN_ENDPOINTS.HR}/leaves`, payload);
  return data;
}

// ── Attendance ───────────────────────────────────────────────
export async function getAttendanceApi(date?: string): Promise<AttendanceRecord[]> {
  try {
    const params = date ? `?date=${date}` : '';
    const { data } = await api.get(`${ADMIN_ENDPOINTS.HR}/attendance${params}`);
    return data?.attendance || data || [];
  } catch {
    return [];
  }
}

export async function markAttendanceApi(payload: { status: string; notes?: string }) {
  const { data } = await api.post(`${ADMIN_ENDPOINTS.HR}/attendance`, payload);
  return data;
}
