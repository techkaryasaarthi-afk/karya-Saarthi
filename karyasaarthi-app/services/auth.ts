/**
 * Auth API service — handles all authentication-related API calls.
 * All endpoints mirror the website's /api/auth/* routes.
 */

import api from './api';
import { AUTH_ENDPOINTS } from '@/utils/constants';

// ── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  fullname: string;
  email: string;
  role: string;
  department: string | null;
  pillar_role: string | null;
  is_approved: boolean;
}

export interface LoginResponse {
  message: string;
  user: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  // Flat token fields (fallback shape)
  accessToken?: string;
  refreshToken?: string;
}

export interface SignupPayload {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
  user_type?: string;
  email_verified?: boolean;
}

// ── API Functions ────────────────────────────────────────────────────────────

/** Login with email and password */
export async function loginApi(email: string, password: string, remember = false) {
  const { data } = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, {
    email,
    password,
    remember,
  });
  return data;
}

/** Register a new customer or vendor account */
export async function signupApi(payload: SignupPayload) {
  const { data } = await api.post(AUTH_ENDPOINTS.SIGNUP, payload);
  return data;
}

/** Send OTP to email for signup verification */
export async function sendOtpApi(email: string, purpose = 'signup_verification') {
  const { data } = await api.post(AUTH_ENDPOINTS.SEND_OTP, { email, purpose });
  return data;
}

/** Verify OTP code */
export async function verifyOtpApi(email: string, otp: string, purpose = 'signup_verification') {
  const { data } = await api.post(AUTH_ENDPOINTS.VERIFY_OTP, { email, otp, purpose });
  return data;
}

/** Send password reset email */
export async function forgotPasswordApi(email: string) {
  const { data } = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
  return data;
}

/** Reset password with token from email */
export async function resetPasswordApi(token: string, password: string) {
  const { data } = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, { token, password });
  return data;
}

/** Change password (authenticated) */
export async function changePasswordApi(currentPassword: string, newPassword: string) {
  const { data } = await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
    currentPassword,
    newPassword,
  });
  return data;
}

/** Get current user profile */
export async function getMeApi() {
  const { data } = await api.get<User>(AUTH_ENDPOINTS.ME);
  return { user: data };
}

/** Update user profile */
export async function updateProfileApi(updates: Partial<User>) {
  const { data } = await api.patch(AUTH_ENDPOINTS.PROFILE, updates);
  return data?.profile || data;
}

/** Logout — revoke tokens */
export async function logoutApi() {
  try {
    await api.post(AUTH_ENDPOINTS.LOGOUT);
  } catch {
    // Even if server logout fails, we still clear local tokens
  }
}

/** Register as internal staff (admin approval required) */
export async function staffRegisterApi(payload: SignupPayload & { department?: string }) {
  const { data } = await api.post(AUTH_ENDPOINTS.STAFF_REGISTER, payload);
  return data;
}
