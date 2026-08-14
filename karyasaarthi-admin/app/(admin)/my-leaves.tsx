/**
 * My Leaves — Employee self-service: view balances, apply, cancel, see history.
 * Uses career.karyasaarthi.com MySQL via the Next.js proxy.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppTheme } from '@/utils/theme';
import { CAREER_ENDPOINTS } from '@/utils/constants';
import api from '@/services/api';
import Toast from 'react-native-toast-message';

const leaveTypeColors: Record<string, { bar: string; bg: string }> = {
  casual: { bar: '#6366F1', bg: '#6366F122' },
  sick:   { bar: '#EF4444', bg: '#EF444422' },
  earned: { bar: '#F59E0B', bg: '#F59E0B22' },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending:   { bg: '#FEF3C7', text: '#D97706' },
  approved:  { bg: '#D1FAE5', text: '#059669' },
  rejected:  { bg: '#FEE2E2', text: '#DC2626' },
  cancelled: { bg: '#F3F4F6', text: '#6B7280' },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MyLeavesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const qc = useQueryClient();

  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const { data: statusData, refetch: refetchStatus, isRefetching: statusRefetch } = useQuery({
    queryKey: ['my-leave-status'],
    queryFn: () => api.get(CAREER_ENDPOINTS.LEAVE, { params: { action: 'status' } }).then(r => r.data),
  });

  const { data: histData, refetch: refetchHist, isRefetching: histRefetch } = useQuery({
    queryKey: ['my-leave-history'],
    queryFn: () => api.get(CAREER_ENDPOINTS.LEAVE, { params: { action: 'history' } }).then(r => r.data),
  });

  const cancelMut = useMutation({
    mutationFn: (leaveId: number) =>
      api.post(CAREER_ENDPOINTS.LEAVE, { action: 'cancel', leave_id: String(leaveId) }).then(r => r.data),
    onSuccess: (res: any) => {
      if (res.success) {
        Toast.show({ type: 'success', text1: 'Leave Cancelled' });
        qc.invalidateQueries({ queryKey: ['my-leave-status'] });
        qc.invalidateQueries({ queryKey: ['my-leave-history'] });
      } else Alert.alert('Error', res.message);
    },
  });

  const handleApply = async () => {
    if (!form.start_date || !form.end_date || !form.reason.trim()) {
      Alert.alert('Required', 'Please fill all fields'); return;
    }
    if (form.end_date < form.start_date) {
      Alert.alert('Error', 'End date cannot be before start date'); return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(CAREER_ENDPOINTS.LEAVE, { action: 'request', module: 'leave', ...form }).then(r => r.data);
      if (res.success) {
        Toast.show({ type: 'success', text1: '✅ Leave Applied!', text2: res.message });
        setShowApply(false);
        setForm({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
        qc.invalidateQueries({ queryKey: ['my-leave-status'] });
        qc.invalidateQueries({ queryKey: ['my-leave-history'] });
      } else Alert.alert('Error', res.message);
    } catch { Alert.alert('Error', 'Failed to submit leave request'); }
    setSubmitting(false);
  };

  const balances: any[] = statusData?.balances ?? [];
  const pending:  any[] = statusData?.pending ?? [];
  const history:  any[] = histData?.records ?? [];

  const defaultAllocations: Record<string, number> = { casual: 12, sick: 6, earned: 15 };

  const s = StyleSheet.create({
    c:      { flex: 1, backgroundColor: T.background },
    hdr:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    back:   { width: 36, height: 36, borderRadius: 10, backgroundColor: T.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
    title:  { fontSize: 20, fontWeight: '700', color: T.ink, flex: 1 },
    addBtn: { backgroundColor: T.brandGreen, width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    card:   { backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.hairline, margin: 16, padding: 16 },
    balRow: { marginBottom: 14 },
    balTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    balLbl: { fontSize: 13, fontWeight: '600', color: T.ink, textTransform: 'capitalize' },
    balVal: { fontSize: 13, fontWeight: '700' },
    bar:    { height: 8, borderRadius: 4, backgroundColor: T.hairline, overflow: 'hidden' },
    barFill:{ height: '100%', borderRadius: 4 },
    secHdr: { fontSize: 14, fontWeight: '700', color: T.ink, marginHorizontal: 16, marginBottom: 8, marginTop: 4 },
    reqCard:{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.hairline, marginHorizontal: 16, marginBottom: 10, padding: 14 },
    reqTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reqType:{ fontSize: 14, fontWeight: '700', color: T.ink, textTransform: 'capitalize' },
    reqDates:{ fontSize: 12, color: T.muted, marginTop: 4 },
    reqRemark:{ fontSize: 11, color: '#6366F1', marginTop: 4, fontStyle: 'italic' },
    badge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
    badgeTxt:{ fontSize: 11, fontWeight: '700' },
    cancelBtn:{ marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444' },
    inpLbl: { fontSize: 12, fontWeight: '600', color: T.muted, marginBottom: 4 },
    inp:    { backgroundColor: T.surfaceContainer, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: T.ink, fontSize: 13, borderWidth: 1, borderColor: T.hairline },
    submitBtn:{ backgroundColor: T.brandGreen, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  });

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="arrow-back" size={20} color={T.ink} /></TouchableOpacity>
        <Text style={s.title}>My Leaves</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowApply(true)}>
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={statusRefetch || histRefetch} onRefresh={() => { refetchStatus(); refetchHist(); }} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Leave Balances */}
        <View style={s.card}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: T.ink, marginBottom: 16 }}>🗓 Leave Balances ({new Date().getFullYear()})</Text>
          {(['casual', 'sick', 'earned'] as const).map(type => {
            const bal = balances.find((b: any) => b.leave_type === type);
            const total   = bal?.total_days   ?? defaultAllocations[type];
            const used    = bal?.used_days    ?? 0;
            const remaining = bal?.remaining ?? total;
            const pct     = total > 0 ? (used / total) * 100 : 0;
            const colors  = leaveTypeColors[type];
            return (
              <View key={type} style={s.balRow}>
                <View style={s.balTop}>
                  <Text style={s.balLbl}>{type} Leave</Text>
                  <Text style={[s.balVal, { color: colors.bar }]}>{remaining}/{total} days left</Text>
                </View>
                <View style={s.bar}>
                  <View style={[s.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: colors.bar }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Pending Requests */}
        {pending.length > 0 && (
          <>
            <Text style={s.secHdr}>⏳ Pending Requests</Text>
            {pending.map((req: any) => (
              <View key={req.leave_id} style={s.reqCard}>
                <View style={s.reqTop}>
                  <Text style={s.reqType}>{req.leave_type} Leave</Text>
                  <View style={[s.badge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[s.badgeTxt, { color: '#D97706' }]}>PENDING</Text>
                  </View>
                </View>
                <Text style={s.reqDates}>{fmtDate(req.start_date)} → {fmtDate(req.end_date)} · {req.total_days} day(s)</Text>
                <Text style={s.reqRemark}>"{req.reason}"</Text>
                <TouchableOpacity style={s.cancelBtn} onPress={() => Alert.alert('Cancel Leave', 'Cancel this request?', [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMut.mutate(req.leave_id) },
                ])}>
                  <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600' }}>Cancel Request</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* History */}
        <Text style={[s.secHdr, { marginTop: 8 }]}>📋 Leave History</Text>
        {history.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={40} color={T.muted} />
            <Text style={{ color: T.muted, marginTop: 8 }}>No leave records yet</Text>
          </View>
        ) : history.map((req: any) => {
          const sc = statusColors[req.status] ?? { bg: T.hairline, text: T.muted };
          return (
            <View key={req.leave_id} style={s.reqCard}>
              <View style={s.reqTop}>
                <Text style={s.reqType}>{req.leave_type} Leave</Text>
                <View style={[s.badge, { backgroundColor: sc.bg }]}>
                  <Text style={[s.badgeTxt, { color: sc.text }]}>{req.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={s.reqDates}>{fmtDate(req.start_date)} → {fmtDate(req.end_date)} · {req.total_days} day(s)</Text>
              {req.admin_remarks ? (
                <Text style={s.reqRemark}>💬 {req.admin_remarks}</Text>
              ) : null}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Apply Leave Modal */}
      <Modal visible={showApply} transparent animationType="slide" onRequestClose={() => setShowApply(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' }}>
          <View style={{ backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: insets.bottom + 24 }}>
            <View style={{ width: 36, height: 4, backgroundColor: T.hairline, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ fontSize: 18, fontWeight: '700', color: T.ink, marginBottom: 20 }}>Apply for Leave</Text>

            {/* Leave Type */}
            <Text style={s.inpLbl}>Leave Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {(['casual', 'sick', 'earned'] as const).map(t => (
                <TouchableOpacity key={t} onPress={() => setForm(p => ({ ...p, leave_type: t }))}
                  style={{ flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: form.leave_type === t ? T.brandGreen : T.hairline, backgroundColor: form.leave_type === t ? T.brandGreen + '22' : T.surfaceContainer }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: form.leave_type === t ? T.brandGreen : T.muted, textTransform: 'capitalize' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Dates */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.inpLbl}>Start Date</Text>
                <TextInput value={form.start_date} onChangeText={v => setForm(p => ({ ...p, start_date: v }))}
                  placeholder="YYYY-MM-DD" placeholderTextColor={T.muted} style={s.inp} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.inpLbl}>End Date</Text>
                <TextInput value={form.end_date} onChangeText={v => setForm(p => ({ ...p, end_date: v }))}
                  placeholder="YYYY-MM-DD" placeholderTextColor={T.muted} style={s.inp} />
              </View>
            </View>

            {/* Reason */}
            <Text style={s.inpLbl}>Reason *</Text>
            <TextInput value={form.reason} onChangeText={v => setForm(p => ({ ...p, reason: v }))}
              placeholder="Reason for leave..." placeholderTextColor={T.muted}
              multiline numberOfLines={3}
              style={[s.inp, { height: 80, textAlignVertical: 'top' }]} />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity onPress={() => setShowApply(false)} style={{ flex: 1, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: T.hairline, alignItems: 'center' }}>
                <Text style={{ color: T.muted, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleApply} disabled={submitting} style={[s.submitBtn, { flex: 2 }]}>
                {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Submit Request</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
