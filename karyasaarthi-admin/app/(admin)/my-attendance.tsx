/**
 * My Attendance — Employee clock in/out with live timer, GPS, pause/resume, work summary.
 * Uses career.karyasaarthi.com MySQL via the Next.js proxy.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clockService, type AttendanceSession } from '@/services/clockin';
import { useAppTheme } from '@/utils/theme';
import Toast from 'react-native-toast-message';

// expo-location is optional — degrades gracefully if not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Location: any = null;
try { Location = require('expo-location'); } catch (_) {}

async function getGPS(): Promise<{ lat: number; lng: number } | null> {
  if (!Location) return null;
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch { return null; }
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

export default function MyAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const qc = useQueryClient();

  const [clock, setClock] = useState('00:00:00');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breakTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [breakClock, setBreakClock] = useState('00:00:00');

  const { data, refetch, isLoading, isRefetching } = useQuery({
    queryKey: ['my-attendance-status'],
    queryFn: clockService.getStatus,
    refetchInterval: 30000,
  });

  const { data: histData, refetch: refetchHist } = useQuery({
    queryKey: ['my-attendance-history'],
    queryFn: clockService.getHistory,
  });

  const status = data?.status ?? 'not_started';
  const record = data?.record ?? null;

  // Live work timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (status === 'working' && record?.start_time) {
      const startMs = new Date(record.start_time + '+05:30').getTime();
      const pausedMs = (record.total_paused_minutes ?? 0) * 60000;
      timerRef.current = setInterval(() => {
        const diff = Math.max(0, Math.floor((Date.now() - startMs - pausedMs) / 1000));
        const h = String(Math.floor(diff / 3600)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const s = String(diff % 60).padStart(2, '0');
        setClock(`${h}:${m}:${s}`);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, record?.start_time, record?.total_paused_minutes]);

  // Break timer
  useEffect(() => {
    if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    if (status === 'paused' && record?.pause_time) {
      const pauseMs = new Date(record.pause_time + '+05:30').getTime();
      breakTimerRef.current = setInterval(() => {
        const diff = Math.max(0, Math.floor((Date.now() - pauseMs) / 1000));
        const h = String(Math.floor(diff / 3600)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const s = String(diff % 60).padStart(2, '0');
        setBreakClock(`${h}:${m}:${s}`);
      }, 1000);
    }
    return () => { if (breakTimerRef.current) clearInterval(breakTimerRef.current); };
  }, [status, record?.pause_time]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['my-attendance-status'] });
    qc.invalidateQueries({ queryKey: ['my-attendance-history'] });
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      const gps = await getGPS();
      const res = await clockService.clockIn(gps?.lat, gps?.lng);
      if (res.success) { Toast.show({ type: 'success', text1: 'Clocked In! ✅', text2: 'Have a productive day!' }); invalidate(); }
      else Alert.alert('Error', res.message);
    } catch { Alert.alert('Error', 'Clock in failed'); }
    setLoading(false);
  };

  const handlePause = async () => {
    setLoading(true);
    try {
      const res = await clockService.pause();
      if (res.success) { Toast.show({ type: 'success', text1: 'Session Paused ⏸', text2: 'Enjoy your break!' }); invalidate(); }
      else Alert.alert('Error', res.message);
    } catch { Alert.alert('Error', 'Pause failed'); }
    setLoading(false);
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      const res = await clockService.resume();
      if (res.success) { Toast.show({ type: 'success', text1: 'Resumed! ▶️', text2: res.message }); invalidate(); }
      else Alert.alert('Error', res.message);
    } catch { Alert.alert('Error', 'Resume failed'); }
    setLoading(false);
  };

  const handleClockOut = async () => {
    if (summary.trim().length < 20) {
      Alert.alert('Work Summary Required', 'Please write at least 20 characters describing your work today.');
      return;
    }
    setLoading(true);
    setShowSummaryModal(false);
    try {
      const gps = await getGPS();
      const res = await clockService.clockOut(summary, gps?.lat, gps?.lng);
      if (res.success) {
        Toast.show({ type: 'success', text1: 'Clocked Out! 🎉', text2: res.message });
        setSummary('');
        invalidate();
      } else Alert.alert('Error', res.message);
    } catch { Alert.alert('Error', 'Clock out failed'); }
    setLoading(false);
  };

  const quickTags = ['Client Delivery', 'Meeting', 'Content Writing', 'Design Work', 'Code/Dev', 'Data Entry', 'Marketing', 'Research', 'Calling', 'Social Media', 'Training', 'Admin Work'];

  const statusColor = status === 'working' ? '#10B981' : status === 'paused' ? '#F59E0B' : '#6B7280';
  const statusLabel = status === 'working' ? '● WORKING' : status === 'paused' ? '⏸ PAUSED — BREAK' : status === 'completed' ? '✓ DAY COMPLETE' : '';

  const histRecords: AttendanceSession[] = histData?.records ?? [];
  const month = data?.month;

  const s = StyleSheet.create({
    c: { flex: 1, backgroundColor: T.background },
    hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    back: { width: 36, height: 36, borderRadius: 10, backgroundColor: T.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700', color: T.ink, flex: 1 },
    card: { backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.hairline, margin: 16, padding: 20 },
    statusBadge: { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99, marginBottom: 16 },
    statusText: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
    timerTxt: { fontSize: 52, fontWeight: '900', fontVariant: ['tabular-nums'], textAlign: 'center', letterSpacing: 2, marginVertical: 12 },
    clockInBtn: { alignSelf: 'center', backgroundColor: '#10B981', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 4 },
    pauseBtn: { flex: 1, backgroundColor: '#F59E0B', paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    outBtn: { flex: 1, backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
    btnTxt: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 16 },
    statCard: { flex: 1, backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.hairline, padding: 12, alignItems: 'center' },
    statVal: { fontSize: 18, fontWeight: '800', color: T.ink, marginTop: 4 },
    statLbl: { fontSize: 10, color: T.muted, textAlign: 'center', marginTop: 2 },
    histCard: { backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.hairline, marginHorizontal: 16, marginBottom: 24, overflow: 'hidden' },
    histRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.hairline },
    histDate: { fontSize: 13, fontWeight: '600', color: T.ink },
    histSub: { fontSize: 11, color: T.muted, marginTop: 1 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, fontSize: 10, fontWeight: '700' },
    notRegistered: { margin: 24, backgroundColor: '#FEF3C7', borderRadius: 16, padding: 20, alignItems: 'center' },
  });

  if (isLoading) {
    return (
      <View style={[s.c, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={T.brandGreen} />
        <Text style={{ color: T.muted, marginTop: 12 }}>Loading attendance...</Text>
      </View>
    );
  }

  if (data?.not_registered) {
    return (
      <View style={[s.c, { paddingTop: insets.top }]}>
        <View style={s.hdr}>
          <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="arrow-back" size={20} color={T.ink} /></TouchableOpacity>
          <Text style={s.title}>My Attendance</Text>
        </View>
        <View style={s.notRegistered}>
          <Ionicons name="alert-circle" size={48} color="#D97706" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#92400E', marginTop: 12, textAlign: 'center' }}>Career Account Not Linked</Text>
          <Text style={{ fontSize: 13, color: '#92400E', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            Please register at{'\n'}career.karyasaarthi.com{'\n'}using the same email address.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="arrow-back" size={20} color={T.ink} /></TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>My Attendance</Text>
          <Text style={{ fontSize: 12, color: T.muted }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); refetchHist(); }} />} showsVerticalScrollIndicator={false}>

        {/* Clock Widget */}
        <View style={s.card}>
          {/* Status badge */}
          {statusLabel ? (
            <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
              <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          ) : null}

          {/* Timer or idle state */}
          {status === 'not_started' || status === 'completed' ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B98122', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="play-circle" size={44} color="#10B981" />
              </View>
              {status === 'completed' && data && data.today_total_minutes > 0 ? (
                <Text style={{ fontSize: 15, color: T.brandGreen, fontWeight: '700', marginBottom: 12 }}>
                  ✅ {formatDuration(data.today_total_minutes)} logged today
                </Text>
              ) : (
                <Text style={{ fontSize: 14, color: T.muted, marginBottom: 16 }}>Ready to start work?</Text>
              )}
              <TouchableOpacity style={s.clockInBtn} onPress={handleClockIn} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Ionicons name="play-circle" size={28} color="#FFF" />}
                <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900' }}>{status === 'completed' ? 'NEW SESSION' : 'CLOCK IN'}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {status === 'working' ? (
            <>
              {record?.start_time ? (
                <Text style={{ textAlign: 'center', fontSize: 12, color: T.muted, marginBottom: 4 }}>
                  Clocked in at {formatTime(record.start_time)}
                </Text>
              ) : null}
              <Text style={[s.timerTxt, { color: '#10B981' }]}>{clock}</Text>
              <Text style={{ textAlign: 'center', fontSize: 11, color: T.muted, marginBottom: 8 }}>
                Breaks deducted: {record?.total_paused_minutes ?? 0}m
              </Text>
              <View style={s.btnRow}>
                <TouchableOpacity style={s.pauseBtn} onPress={handlePause} disabled={loading}>
                  <Ionicons name="pause-circle" size={20} color="#FFF" />
                  <Text style={s.btnTxt}>PAUSE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.outBtn} onPress={() => setShowSummaryModal(true)} disabled={loading}>
                  <Ionicons name="stop-circle" size={20} color="#FFF" />
                  <Text style={s.btnTxt}>CLOCK OUT</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          {status === 'paused' ? (
            <>
              <Text style={{ textAlign: 'center', fontSize: 12, color: T.muted, marginBottom: 4 }}>Break started at {record?.pause_time ? formatTime(record.pause_time) : ''}</Text>
              <Text style={[s.timerTxt, { color: '#F59E0B' }]}>⏸ {breakClock}</Text>
              <View style={s.btnRow}>
                <TouchableOpacity style={[s.pauseBtn, { backgroundColor: '#10B981' }]} onPress={handleResume} disabled={loading}>
                  <Ionicons name="play-circle" size={20} color="#FFF" />
                  <Text style={s.btnTxt}>RESUME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.outBtn} onPress={() => setShowSummaryModal(true)} disabled={loading}>
                  <Ionicons name="stop-circle" size={20} color="#FFF" />
                  <Text style={s.btnTxt}>CLOCK OUT</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>

        {/* Stats Row */}
        {month ? (
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Ionicons name="calendar-outline" size={20} color="#10B981" />
              <Text style={[s.statVal, { color: '#10B981' }]}>{month.present_days}</Text>
              <Text style={s.statLbl}>Days{'\n'}This Month</Text>
            </View>
            <View style={s.statCard}>
              <Ionicons name="time-outline" size={20} color={T.brandGreen} />
              <Text style={[s.statVal, { color: T.brandGreen }]}>{Math.floor(month.total_minutes / 60)}h</Text>
              <Text style={s.statLbl}>Total{'\n'}Hours</Text>
            </View>
            <View style={s.statCard}>
              <Ionicons name="bar-chart-outline" size={20} color="#6366F1" />
              <Text style={[s.statVal, { color: '#6366F1' }]}>{month.avg_minutes > 0 ? (month.avg_minutes / 60).toFixed(1) : '0'}h</Text>
              <Text style={s.statLbl}>Avg{'\n'}Per Day</Text>
            </View>
            <View style={s.statCard}>
              <Ionicons name="flame-outline" size={20} color="#F59E0B" />
              <Text style={[s.statVal, { color: '#F59E0B' }]}>{Math.floor((data?.week_minutes ?? 0) / 60)}h</Text>
              <Text style={s.statLbl}>This{'\n'}Week</Text>
            </View>
          </View>
        ) : null}

        {/* History */}
        <View style={s.histCard}>
          <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: T.hairline, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: T.ink }}>📋 Attendance Log</Text>
            <Text style={{ fontSize: 11, color: T.muted }}>Last 30 days</Text>
          </View>
          {histRecords.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={40} color={T.muted} />
              <Text style={{ color: T.muted, marginTop: 8 }}>No records yet</Text>
            </View>
          ) : histRecords.map((rec, i) => {
            const stColors: Record<string, string> = { completed: '#10B981', working: '#3B82F6', paused: '#F59E0B', absent: '#EF4444' };
            const clr = stColors[rec.status] ?? '#6B7280';
            return (
              <View key={i} style={s.histRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.histDate}>{formatDate(rec.date)}</Text>
                  <Text style={s.histSub}>
                    {rec.start_time ? formatTime(rec.start_time) : '-'} → {rec.end_time ? formatTime(rec.end_time) : '-'}
                  </Text>
                  {rec.work_summary ? (
                    <Text style={{ fontSize: 10, color: '#6366F1', marginTop: 2 }} numberOfLines={1}>
                      📝 {rec.work_summary}
                    </Text>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={{ backgroundColor: clr + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                    <Text style={{ fontSize: 10, color: clr, fontWeight: '700' }}>{rec.status.toUpperCase()}</Text>
                  </View>
                  {rec.duration_minutes > 0 ? (
                    <Text style={{ fontSize: 12, fontWeight: '700', color: T.ink }}>{formatDuration(rec.duration_minutes)}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Work Summary Modal */}
      <Modal visible={showSummaryModal} transparent animationType="slide" onRequestClose={() => setShowSummaryModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' }}>
          <View style={{ backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: insets.bottom + 24 }}>
            <View style={{ width: 36, height: 4, backgroundColor: T.hairline, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
            <View style={{ backgroundColor: '#EF444422', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#EF4444' }}>📋 Work Summary — Required</Text>
              <Text style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>Describe what you worked on today (min. 20 chars)</Text>
            </View>
            <TextInput
              value={summary}
              onChangeText={setSummary}
              placeholder="e.g.&#10;- Completed 3 client deliverables&#10;- Attended team standup&#10;- Updated marketing dashboard"
              placeholderTextColor={T.muted}
              multiline
              numberOfLines={5}
              style={{ backgroundColor: T.surfaceContainer, borderRadius: 12, padding: 14, color: T.ink, fontSize: 13, height: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: summary.length >= 20 ? '#10B981' : T.hairline }}
            />
            <Text style={{ fontSize: 11, color: summary.length >= 20 ? '#10B981' : T.muted, textAlign: 'right', marginTop: 4 }}>{summary.length}/2000</Text>

            {/* Quick tags */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 }}>
              {quickTags.map(t => (
                <TouchableOpacity key={t} onPress={() => setSummary(p => (p.trim() ? p + '\n- ' : '- ') + t)}
                  style={{ backgroundColor: T.surfaceContainer, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, borderWidth: 1, borderColor: T.hairline }}>
                  <Text style={{ fontSize: 11, color: T.muted }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowSummaryModal(false)} style={{ flex: 1, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: T.hairline, alignItems: 'center' }}>
                <Text style={{ color: T.muted, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClockOut} disabled={summary.trim().length < 20 || loading}
                style={{ flex: 2, padding: 16, borderRadius: 14, backgroundColor: summary.trim().length >= 20 ? '#EF4444' : T.hairline, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Ionicons name="stop-circle" size={20} color="#FFF" />}
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Submit & Clock Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
