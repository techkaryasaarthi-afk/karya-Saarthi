/**
 * Admin Leave Management — View, approve/reject leave requests + apply for leave.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeavesApi, updateLeaveStatusApi, applyLeaveApi, type LeaveRequest } from '@/services/hr';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme } from '@/utils/theme';

export default function AdminLeavesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const T = useAppTheme();
  const [tab, setTab] = useState<'all' | 'pending' | 'apply'>('all');
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });

  const isSuperAdmin = user?.role === 'super_admin';

  const { data: leaves = [], refetch, isRefetching } = useQuery({
    queryKey: ['admin-leaves', tab === 'pending' ? 'pending' : undefined],
    queryFn: () => getLeavesApi(tab === 'pending' ? 'pending' : undefined),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'approved' | 'rejected' }) => updateLeaveStatusApi(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-leaves'] }); Alert.alert('Success', 'Leave status updated'); },
  });

  const applyMut = useMutation({
    mutationFn: applyLeaveApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-leaves'] }); setShowApply(false); setForm({ leave_type: 'casual', start_date: '', end_date: '', reason: '' }); Alert.alert('Success', 'Leave applied'); },
    onError: () => Alert.alert('Error', 'Failed to apply'),
  });

  const statusColor = (st: string) => st === 'approved' ? T.success : st === 'rejected' ? T.error : T.warning;
  const leaveTypes = ['casual', 'sick', 'earned', 'other'];

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: T.surfaceContainer }]}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity>
        <Text style={[s.title, { color: T.ink }]}>Leave Management</Text>
        <TouchableOpacity style={[s.applyBtn, { backgroundColor: T.brandGreen }]} onPress={() => setShowApply(true)}><Ionicons name="add" size={20} color={T.surface} /></TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[s.tabs, { backgroundColor: T.surfaceContainer }]}>
        {(['all', 'pending'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && { backgroundColor: T.brandGreen }]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, { color: tab === t ? T.surface : T.muted }]}>{t === 'all' ? 'All' : 'Pending'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {leaves.length === 0 ? (
          <View style={s.empty}><Ionicons name="document-text-outline" size={56} color={T.hairline} /><Text style={[s.et, { color: T.muted }]}>No leave requests</Text></View>
        ) : leaves.map((l: LeaveRequest) => (
          <View key={l.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <View style={s.cardTop}>
              <View><Text style={[s.name, { color: T.ink }]}>{typeof l.user_name === 'object' ? (l.user_name as any).fullname || (l.user_name as any).name : l.user_name}</Text><Text style={[s.role, { color: T.muted }]}>{l.user_role || 'Staff'}</Text></View>
              <View style={[s.badge, { backgroundColor: statusColor(l.status) + '20' }]}><Text style={[s.badgeText, { color: statusColor(l.status) }]}>{l.status}</Text></View>
            </View>
            <View style={s.typeRow}><Text style={[s.typeLabel, { color: T.warning }]}>{l.leave_type} leave</Text></View>
            <Text style={[s.reason, { color: T.steel }]} numberOfLines={2}>{l.reason}</Text>
            <View style={s.dateRow}>
              <Text style={[s.date, { color: T.muted }]}>{l.start_date} → {l.end_date}</Text>
            </View>
            {l.status === 'pending' && isSuperAdmin && (
              <View style={s.actions}>
                <TouchableOpacity style={[s.actBtn, { backgroundColor: T.success + '20' }]} onPress={() => updateMut.mutate({ id: l.id, status: 'approved' })}>
                  <Ionicons name="checkmark" size={18} color={T.success} /><Text style={[s.actText, { color: T.success }]}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actBtn, { backgroundColor: T.error + '20' }]} onPress={() => updateMut.mutate({ id: l.id, status: 'rejected' })}>
                  <Ionicons name="close" size={18} color={T.error} /><Text style={[s.actText, { color: T.error }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Modal */}
      <Modal visible={showApply} animationType="slide" transparent>
        <View style={s.mo}><View style={[s.mc, { backgroundColor: T.background }]}>
          <View style={s.mh}><Text style={[s.mtt, { color: T.ink }]}>Apply for Leave</Text><TouchableOpacity onPress={() => setShowApply(false)}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity></View>
          <Text style={[s.fl, { color: T.muted }]}>Leave Type</Text>
          <View style={s.typeChips}>{leaveTypes.map(t => (
            <TouchableOpacity key={t} style={[s.chip, { borderColor: T.hairline }, form.leave_type === t && { backgroundColor: T.brandGreen, borderColor: T.brandGreen }]} onPress={() => setForm(f => ({ ...f, leave_type: t }))}>
              <Text style={[s.chipText, { color: form.leave_type === t ? T.surface : T.muted }]}>{t}</Text>
            </TouchableOpacity>
          ))}</View>
          <Text style={[s.fl, { color: T.muted }]}>Start Date (YYYY-MM-DD)</Text><TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="2026-05-25" placeholderTextColor={T.muted} value={form.start_date} onChangeText={t => setForm(f => ({ ...f, start_date: t }))} />
          <Text style={[s.fl, { color: T.muted }]}>End Date (YYYY-MM-DD)</Text><TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="2026-05-27" placeholderTextColor={T.muted} value={form.end_date} onChangeText={t => setForm(f => ({ ...f, end_date: t }))} />
          <Text style={[s.fl, { color: T.muted }]}>Reason *</Text><TextInput style={[s.inp, { height: 80, backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Reason for leave" placeholderTextColor={T.muted} value={form.reason} onChangeText={t => setForm(f => ({ ...f, reason: t }))} multiline />
          <TouchableOpacity style={[s.submitBtn, { backgroundColor: T.brandGreen }]} onPress={() => { if (!form.start_date || !form.end_date || !form.reason) { Alert.alert('Required', 'Fill all fields'); return; } applyMut.mutate(form); }}>
            <Text style={[s.submitText, { color: T.surface }]}>{applyMut.isPending ? 'Applying...' : 'Apply Leave'}</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 }, applyBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 }, et: { fontFamily: 'Inter_600SemiBold', fontSize: 18 },
  card: { marginHorizontal: 20, marginBottom: 12, borderRadius: 14, padding: 16, borderWidth: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 15 }, role: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }, badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, textTransform: 'capitalize' },
  typeRow: { marginTop: 10 }, typeLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, textTransform: 'capitalize' },
  reason: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 6 },
  dateRow: { marginTop: 8 }, date: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  actText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }, mc: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, mtt: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6, marginTop: 14 },
  inp: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1 },
  typeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});
