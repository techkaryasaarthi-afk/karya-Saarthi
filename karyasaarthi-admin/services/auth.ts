/**
 * Admin Auth Service — Login, logout, session, profile updates for admin users.
 */
import api from './api';
import { AUTH_ENDPOINTS } from '@/utils/constants';

export interface User {
  id: number;
  email: string;
  fullname?: string;
  role?: string;
  phone?: string;
  avatar?: string;
  department?: string;
  pillar_role?: string;
  designation?: string;
  is_active?: boolean;
  employee_id?: string;
  joining_date?: string;
  status?: string;
}

interface LoginResponse {
  user: User;
  tokens?: { accessToken: string; refreshToken: string };
}

export async function loginApi(email: string, password: string, remember = false): Promise<LoginResponse> {
  const { data } = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password, remember });
  return data;
}

export async function logoutApi(): Promise<void> {
  await api.post(AUTH_ENDPOINTS.LOGOUT);
}

export async function getMeApi(): Promise<{ user: User }> {
  const { data } = await api.get(AUTH_ENDPOINTS.ME);
  // API returns user object directly — wrap it for consistency
  if (data && data.id) return { user: data };
  return data;
}

export async function refreshTokenApi(refreshToken: string) {
  const { data } = await api.post(AUTH_ENDPOINTS.REFRESH, { refreshToken });
  return data;
}

/** Update admin profile */
export async function updateProfileApi(updates: Partial<User>) {
  const { data } = await api.patch(AUTH_ENDPOINTS.PROFILE, updates);
  return data?.profile || data;
}

/** Change password (authenticated) */
export async function changePasswordApi(currentPassword: string, newPassword: string) {
  const { data } = await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, { currentPassword, newPassword });
  return data;
}
