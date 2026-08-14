/**
 * Admin Chat Service — Group chats, project chats, and direct messages.
 * Fixed: correct table names for Supabase subscriptions.
 */

import api from './api';

export interface ChatGroup {
  id: string;
  name: string;
  type: 'group' | 'project';
  description?: string;
  unread_count: number;
  participant_count: number;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string | number;
  sender_id: number;
  sender_name: string;
  sender_role?: string;
  sender_avatar?: string;
  content: string;
  attachment_url?: string | null;
  file_type?: string | null;
  created_at: string;
  is_own?: boolean;
}

// ── Group Chats ──────────────────────────────────────────────
export async function getGroupChatsApi(): Promise<ChatGroup[]> {
  try {
    const { data } = await api.get('/api/chat/groups');
    return (data?.groups || []).map((g: any) => ({
      id: String(g.id),
      name: g.name || 'Chat Group',
      type: 'group' as const,
      description: g.description,
      unread_count: 0,
      participant_count: Array.isArray(g.members) ? g.members.length : g.member_count || 0,
      last_message: g.last_message,
      last_message_at: g.last_message_at,
      created_at: g.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getGroupMessagesApi(groupId: string): Promise<ChatMessage[]> {
  try {
    const { data } = await api.get(`/api/chat/groups/${groupId}`);
    return (data?.messages || []).map((m: any) => ({
      id: m.id,
      sender_id: m.sender_id || m.sender?.id,
      sender_name: m.sender?.fullname || m.sender_name || 'Unknown',
      sender_role: m.sender?.role || m.sender_role,
      content: m.content || m.text || '',
      attachment_url: m.attachment_url,
      file_type: m.file_type,
      created_at: m.created_at,
    }));
  } catch {
    return [];
  }
}

export async function sendGroupMessageApi(groupId: string, content: string, attachment_url?: string, file_type?: string) {
  const { data } = await api.post(`/api/chat/groups/${groupId}`, {
    content,
    attachment_url,
    file_type,
  });
  return data;
}

// ── Direct Messages ──────────────────────────────────────────
export async function getDirectConversationsApi() {
  try {
    const { data } = await api.get('/api/direct-messages?contacts=1');
    return data?.contacts || [];
  } catch {
    return [];
  }
}

export async function getDirectMessagesApi(recipientId: number | string) {
  try {
    const { data } = await api.get(`/api/direct-messages?userId=${recipientId}`);
    return (data?.messages || []).map((m: any) => ({
      id: m.id,
      sender_id: m.sender_id || m.sender?.id,
      sender_name: m.sender?.fullname || 'Unknown',
      sender_role: m.sender?.role,
      content: m.content || '',
      created_at: m.created_at,
    }));
  } catch {
    return [];
  }
}

export async function sendDirectMessageApi(recipientId: number | string, content: string) {
  const { data } = await api.post('/api/direct-messages', {
    receiver_id: Number(recipientId),
    content,
  });
  return data;
}

// ── Project Chat ─────────────────────────────────────────────
export async function getProjectMessagesApi(projectId: string | number): Promise<ChatMessage[]> {
  try {
    const { data } = await api.get(`/api/projects/${projectId}/messages`);
    return (data?.messages || []).map((m: any) => ({
      id: m.id,
      sender_id: m.sender_id || m.sender?.id,
      sender_name: m.sender?.fullname || 'Unknown',
      sender_role: m.sender?.role,
      content: m.content || '',
      attachment_url: m.attachment_url,
      file_type: m.file_type,
      created_at: m.created_at,
    }));
  } catch {
    return [];
  }
}

export async function sendProjectMessageApi(projectId: string | number, content: string) {
  const { data } = await api.post(`/api/projects/${projectId}/messages`, { content });
  return data;
}

// ── Group Management ─────────────────────────────────────────

/** Delete a group chat entirely (admin only) */
export async function deleteGroupApi(groupId: string) {
  const { data } = await api.delete(`/api/chat/groups/${groupId}`, {
    data: { deleteGroup: true },
  });
  return data;
}

/** Leave a group chat (remove self) */
export async function leaveGroupApi(groupId: string) {
  const { data } = await api.delete(`/api/chat/groups/${groupId}`, {
    data: { leaveGroup: true },
  });
  return data;
}

/** Remove a member from a group (admin only) */
export async function removeMemberApi(groupId: string, userId: number) {
  // Uses a PATCH-style approach via POST with action
  const { data } = await api.post(`/api/chat/groups/${groupId}`, {
    action: 'remove_member',
    user_id: userId,
  });
  return data;
}

/** Add members to an existing group */
export async function addMembersApi(groupId: string, memberIds: number[]) {
  const { data } = await api.post(`/api/chat/groups/${groupId}`, {
    action: 'add_members',
    member_ids: memberIds,
  });
  return data;
}

/** Delete (soft-delete) a message */
export async function deleteMessageApi(groupId: string, messageId: number) {
  const { data } = await api.delete(`/api/chat/groups/${groupId}`, {
    data: { messageId },
  });
  return data;
}

