/**
 * App-wide constants — API URLs, storage keys, and config values.
 * All sensitive values come from environment variables.
 */

// ── API Configuration ─────────────────────────────────────────────────────────
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://karyasaarthi.com';

// ── Secure Storage Keys ───────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ks_access_token',
  REFRESH_TOKEN: 'ks_refresh_token',
  USER_DATA: 'ks_user_data',
  ONBOARDING_DONE: 'ks_onboarding_done',
  PUSH_TOKEN: 'ks_push_token',
  THEME_MODE: 'ks_theme_mode',
} as const;

// ── HTTP Headers ──────────────────────────────────────────────────────────────
export const PLATFORM_HEADER = { 'X-Platform': 'mobile' } as const;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  PROFILE: '/api/auth/profile',
  SEND_OTP: '/api/auth/send-signup-otp',
  VERIFY_OTP: '/api/auth/verify-otp',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  CHANGE_PASSWORD: '/api/auth/change-password',
  STAFF_REGISTER: '/api/auth/staff-register',
  VENDOR_APPLY: '/api/vendor/apply',
} as const;

// ── User Roles ────────────────────────────────────────────────────────────────
export const ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  BOARD_MEMBER: 'board_member',
  PILLAR_MEMBER: 'pillar_member',
  PENDING_ADMIN: 'pending_admin',
} as const;

// ── App Info ──────────────────────────────────────────────────────────────────
export const APP_INFO = {
  NAME: 'Karya Saarthi',
  TAGLINE: 'Hum Hai Aapke Saathi',
  VERSION: '1.0.0',
  SUPPORT_PHONE: '+91-8595025753',
  SUPPORT_EMAIL: 'founder@karyasaarthi.com',
  WEBSITE: 'https://karyasaarthi.com',
  HR_EMAIL: 'hr.karyasaarthi@gmail.com',
  HR_PHONE: '+91 9311025753',
  HR_WHATSAPP: '+91 9311025753',
  WHATSAPP_COMMUNITY_LINK: process.env.EXPO_PUBLIC_WHATSAPP_COMMUNITY_LINK || '',
  GOOGLE_FORM_LINK: process.env.EXPO_PUBLIC_GOOGLE_FORM_LINK || '',
} as const;

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGE_SIZE = 20;

// ── Razorpay ──────────────────────────────────────────────────────────────────
export const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY || '';
