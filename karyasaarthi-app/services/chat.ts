/**
 * Chat API Service
 *
 * The backend exposes:
 * - Group chat: /api/chat/groups and /api/chat/groups/[id]
 * - Project chat: /api/projects/[id]/messages
 * - Direct messages: /api/direct-messages
 */

import api from './api';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface Conversation {
  id: string;
  name: string;
  type: 'group' | 'project' | 'dm';
  unread_count: number;
  participant_count?: number;
  created_at?: string;
}

export interface Message {
  id: string | number;
  sender_id?: number;
  sender_name: string;
  sender_role?: string;
  text: string;
  created_at: string;
  attachment_url?: string | null;
  file_type?: string | null;
}

export interface DMContact {
  id: number;
  fullname: string;
  email: string;
  phone?: string;
  role: string;
  lastMessage?: { content: string; created_at: string; sender_id: number } | null;
  unreadCount: number;
}

function normalizeGroupMessage(message: any): Message {
  return {
    id: message.id,
    sender_id: message.sender_id || message.sender?.id,
    sender_name: message.sender?.fullname || 'Unknown',
    sender_role: message.sender?.role,
    text: message.content || '',
    created_at: message.created_at,
    attachment_url: message.attachment_url,
    file_type: message.file_type,
  };
}

function normalizeProjectMessage(message: any): Message {
  return {
    id: message.id,
    sender_id: message.sender_id || message.sender?.id,
    sender_name: message.sender?.fullname || 'Unknown',
    sender_role: message.sender?.role,
    text: message.content || '',
    created_at: message.created_at,
    attachment_url: message.attachment_url,
    file_type: message.file_type,
  };
}

function normalizeDMMessage(message: any): Message {
  return {
    id: message.id,
    sender_id: message.sender_id || message.sender?.id,
    sender_name: message.sender?.fullname || 'Unknown',
    sender_role: message.sender?.role,
    text: message.content || '',
    created_at: message.created_at,
    attachment_url: message.attachment_url,
    file_type: message.file_type,
  };
}

// ── Group Chats ──────────────────────────────────────────────

export async function getGroupChatsApi() {
  const { data } = await api.get('/api/chat/groups');
  return {
    ...data,
    groups: (data?.groups || []).map((group: any) => ({
      id: String(group.id),
      name: group.name,
      type: 'group' as const,
      unread_count: 0,
      participant_count: Array.isArray(group.members) ? group.members.length : group.members?.[0]?.count || 0,
      created_at: group.created_at,
    })),
  };
}

export async function getGroupMessagesApi(groupId: string) {
  const { data } = await api.get(`/api/chat/groups/${groupId}`);
  return {
    ...data,
    messages: (data?.messages || []).map(normalizeGroupMessage),
  };
}

export async function sendGroupMessageApi(groupId: string, payload: {
  text: string;
  attachment_url?: string;
  file_type?: string;
}) {
  const { data } = await api.post(`/api/chat/groups/${groupId}`, {
    content: payload.text,
    attachment_url: payload.attachment_url,
    file_type: payload.file_type,
  });
  return {
    ...data,
    message: data?.message ? normalizeGroupMessage(data.message) : data?.message,
  };
}

// ── Project Chat ─────────────────────────────────────────────

export async function getProjectMessagesApi(projectId: string | number) {
  const { data } = await api.get(`/api/projects/${projectId}/messages`);
  return {
    ...data,
    messages: (data?.messages || []).map(normalizeProjectMessage),
  };
}

export async function sendProjectMessageApi(projectId: string | number, payload: {
  text: string;
  attachment_url?: string;
  file_type?: string;
}) {
  const { data } = await api.post(`/api/projects/${projectId}/messages`, {
    content: payload.text,
    attachment_url: payload.attachment_url,
    file_type: payload.file_type,
  });
  return {
    ...data,
    message: data?.message ? normalizeProjectMessage(data.message) : data?.message,
  };
}

// ── Direct Messages ──────────────────────────────────────────

export async function getContactsApi(): Promise<DMContact[]> {
  try {
    // Use the backend API which has server-side Supabase access (bypasses RLS)
    const { data } = await api.get('/api/direct-messages?contacts=1');
    return (data?.contacts || []).map((c: any) => ({
      id: c.id,
      fullname: c.fullname,
      email: c.email,
      phone: c.phone,
      role: c.role,
      lastMessage: c.lastMessage || null,
      unreadCount: c.unreadCount || 0,
    }));
  } catch {
    return [];
  }
}

/** Get DM thread with a specific user */
export async function getDirectMessagesApi(userId: number | string) {
  const { data } = await api.get(`/api/direct-messages?userId=${userId}`);
  return {
    ...data,
    messages: (data?.messages || []).map(normalizeDMMessage),
  };
}

/** Send a direct message */
export async function sendDirectMessageApi(receiverId: number | string, payload: {
  text: string;
  attachment_url?: string;
  file_type?: string;
}) {
  const { data } = await api.post('/api/direct-messages', {
    receiver_id: Number(receiverId),
    content: payload.text,
    attachment_url: payload.attachment_url,
    file_type: payload.file_type,
  });
  return {
    ...data,
    message: data?.message ? normalizeDMMessage(data.message) : data?.message,
  };
}
