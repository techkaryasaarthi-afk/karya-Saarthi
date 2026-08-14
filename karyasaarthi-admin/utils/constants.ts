/**
 * Admin App Constants — API config, storage keys, admin-specific roles.
 */

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://karyasaarthi.com';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ksadmin_access_token',
  REFRESH_TOKEN: 'ksadmin_refresh_token',
  USER_DATA: 'ksadmin_user_data',
  THEME_MODE: 'ksadmin_theme_mode',
} as const;

export const PLATFORM_HEADER = { 'X-Platform': 'mobile' } as const;

export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  REFRESH: '/api/auth/refresh',
  CHANGE_PASSWORD: '/api/auth/change-password',
  PROFILE: '/api/auth/profile',
} as const;

export const ADMIN_ENDPOINTS = {
  DASHBOARD: '/api/admin/dashboard',
  USERS: '/api/admin/users',
  PROJECTS: '/api/admin/projects',
  PROJECT_TASKS: '/api/admin/projects/tasks',
  PROJECT_COMM: '/api/admin/projects/comm',
  PROJECT_CHECKLIST: '/api/admin/projects/checklist',
  REQUESTS: '/api/admin/requests',
  SERVICES: '/api/admin/services',
  VENDORS: '/api/admin/vendors',
  INVOICES: '/api/admin/invoices',
  STAFF: '/api/admin/staff',
  STAFF_REQUESTS: '/api/admin/staff-requests',
  HR: '/api/admin/hr',
  ANALYTICS: '/api/admin/analytics',
  ANNOUNCEMENTS: '/api/admin/announcements',
  BLOGS: '/api/admin/blogs',
  CRM: '/api/admin/crm',
  MEETINGS: '/api/admin/meetings',
  RATINGS: '/api/admin/ratings',
  FINANCE: '/api/admin/finance',
  WORKSPACE: '/api/admin/workspace',
  VENDOR_PIPELINE: '/api/admin/vendor-pipeline',
  VENDOR_APPLICATIONS: '/api/admin/vendor-applications',
  OPERATIONS: '/api/admin/operations',
  DIGITAL_SAARTHI: '/api/admin/digital-saarthi',
  BOARD: '/api/admin/board',
  MARKETING: '/api/admin/marketing',
  RECRUITMENT: '/api/admin/recruitment',
} as const;

export const CAREER_ENDPOINTS = {
  ATTENDANCE: '/api/career/attendance',
  LEAVE: '/api/career/leave',
  PROFILE: '/api/career/profile',
} as const;

export const ADMIN_ROLES = ['admin', 'super_admin', 'board_member', 'pillar_member'] as const;

export const APP_INFO = {
  NAME: 'Karyasaarthi Admin',
  VERSION: '1.0.0',
  TAGLINE: 'Hum Hai Aapke Saathi',
  SUPPORT_EMAIL: 'founder@karyasaarthi.com',
  SUPPORT_PHONE: '+91-8595025753',
  WEBSITE: 'https://karyasaarthi.com',
} as const;
