/**
 * Meetings Service — CRUD for admin meetings.
 * Uses website API for data operations.
 */

import api from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';

export interface Meeting {
  id: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration?: number;
  location?: string;
  type: 'virtual' | 'in-person' | 'hybrid';
  meeting_link?: string;
  organizer_id?: number;
  organizer_name?: string;
  attendees?: { id: number; name: string; role?: string }[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
}

export async function getMeetingsApi(): Promise<Meeting[]> {
  try {
    const { data } = await api.get(ADMIN_ENDPOINTS.MEETINGS);
    return data?.meetings || data || [];
  } catch {
    return [];
  }
}

export async function createMeetingApi(payload: {
  title: string;
  description?: string;
  date: string;
  time: string;
  duration?: number;
  location?: string;
  type?: string;
  meeting_link?: string;
  attendee_ids?: number[];
}) {
  const { data } = await api.post(ADMIN_ENDPOINTS.MEETINGS, payload);
  return data;
}

export async function updateMeetingApi(id: number, updates: Partial<Meeting>) {
  const { data } = await api.put(`${ADMIN_ENDPOINTS.MEETINGS}/${id}`, updates);
  return data;
}

export async function deleteMeetingApi(id: number) {
  const { data } = await api.delete(`${ADMIN_ENDPOINTS.MEETINGS}/${id}`);
  return data;
}
