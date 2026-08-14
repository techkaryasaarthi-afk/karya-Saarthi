/**
 * Clock In/Out service — proxies through Next.js to career.karyasaarthi.com MySQL
 */
import api from './api'
import { CAREER_ENDPOINTS } from '@/utils/constants'

export interface AttendanceSession {
  attendance_id: number
  user_id: string
  date: string
  start_time: string
  end_time: string | null
  duration_minutes: number
  status: 'working' | 'paused' | 'completed' | 'absent' | 'half_day' | 'late'
  pause_time: string | null
  total_paused_minutes: number
  clock_in_lat: number | null
  clock_in_lng: number | null
  clock_out_lat: number | null
  clock_out_lng: number | null
  work_summary: string | null
}

export interface ClockStatus {
  success: boolean
  status: 'not_started' | 'working' | 'paused' | 'completed'
  record: AttendanceSession | null
  today_total_minutes: number
  today_sessions: number
  month: { present_days: number; total_minutes: number; avg_minutes: number }
  week_minutes: number
  not_registered?: boolean
  message?: string
}

export const clockService = {
  /** Get today's clock status + month/week stats */
  getStatus: async (): Promise<ClockStatus> => {
    const { data } = await api.get(CAREER_ENDPOINTS.ATTENDANCE, { params: { action: 'status' } })
    return data
  },

  /** Clock in with optional GPS */
  clockIn: async (lat?: number, lng?: number): Promise<{ success: boolean; message: string; start_time?: string }> => {
    const { data } = await api.post(CAREER_ENDPOINTS.ATTENDANCE, {
      action: 'start',
      module: 'attendance',
      latitude: lat ?? '',
      longitude: lng ?? '',
      device_time: new Date().toISOString(),
    })
    return data
  },

  /** Clock out with mandatory work summary */
  clockOut: async (summary: string, lat?: number, lng?: number): Promise<{ success: boolean; message: string; duration_minutes?: number; require_summary?: boolean }> => {
    const { data } = await api.post(CAREER_ENDPOINTS.ATTENDANCE, {
      action: 'stop',
      module: 'attendance',
      work_summary: summary,
      latitude: lat ?? '',
      longitude: lng ?? '',
      device_time: new Date().toISOString(),
    })
    return data
  },

  /** Pause current session (break) */
  pause: async (): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post(CAREER_ENDPOINTS.ATTENDANCE, { action: 'pause', module: 'attendance' })
    return data
  },

  /** Resume paused session */
  resume: async (): Promise<{ success: boolean; message: string; break_minutes?: number }> => {
    const { data } = await api.post(CAREER_ENDPOINTS.ATTENDANCE, { action: 'resume', module: 'attendance' })
    return data
  },

  /** Get last 30 days attendance history */
  getHistory: async (): Promise<{ success: boolean; records: AttendanceSession[] }> => {
    const { data } = await api.get(CAREER_ENDPOINTS.ATTENDANCE, { params: { action: 'history' } })
    return data
  },

  /** Admin: get all users attendance for a date */
  getAllUsers: async (date?: string): Promise<{ success: boolean; records: (AttendanceSession & { name: string; user_type: string })[] }> => {
    const { data } = await api.get(CAREER_ENDPOINTS.ATTENDANCE, { params: { action: 'all_users', date: date ?? '' } })
    return data
  },
}
