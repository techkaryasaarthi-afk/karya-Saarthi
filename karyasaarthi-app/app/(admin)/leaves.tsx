/**
 * Admin Leave Management — View, approve/reject leave requests + apply. Styled per DESIGN.md.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeavesApi, updateLeaveStatusApi, applyLeaveApi, type LeaveRequest } from '@/services/hr';
import { useAppTheme } from '@/utils/theme';

export default function AdminLeavesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const T = useAppTheme();
  const [tab, setTab] = useState<'all' | 'pending'>('all');
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });

  const { data: leaves = [], refetch, isRefetching } = useQuery({ queryKey: ['admin-leaves', tab === 'pending' ? 'pending' : undefined], queryFn: () => getLeavesApi(tab === 'pending' ? 'pending' : undefined) });
  const updateMut = useMutation({ mutationFn: ({ id, status }: { id: number; status: 'approved' | 'rejected' }) => updateLeaveStatusApi(id, status), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-leaves'] }); Alert.alert('Success', 'Status updated'); } });
  const applyMut = useMutation({ mutationFn: applyLeaveApi, onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-leaves'] }); setShowApply(false); setForm({ leave_type: 'casual', start_date: '', end_date: '', reason: '' }); Alert.alert('Success', 'Leave applied'); } });
  const stColor = (st: string) => st === 'approved' ? T.success : st === 'rejected' ? T.error : T.warning;

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}><TouchableOpacity onPress={() => router.back()} style={[s.bk, { backgroundColor: T.surfaceContainer }]}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity><Text style={[s.tt, { color: T.ink }]}>Leave Management</Text><TouchableOpacity style={[s.ab, { backgroundColor: T.brandGreen }]} onPress={() => setShowApply(true)}><Ionicons name="add" size={20} color={T.primary} /></TouchableOpacity></View>
      <View style={[s.tabs, { backgroundColor: T.surfaceContainer }]}>{(['all', 'pending'] as const).map(t => (<TouchableOpacity key={t} style={[s.tab, tab === t && { backgroundColor: T.brandGreen }]} onPress={() => setTab(t)}><Text style={[s.tabT, { color: T.steel }, tab === t && { color: T.primary }]}>{t === 'all' ? 'All' : 'Pending'}</Text></TouchableOpacity>))}</View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {leaves.length === 0 ? (<View style={s.em}><Ionicons name="document-text-outline" size={56} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>No leave requests</Text></View>) : leaves.map((l: LeaveRequest) => (
          <View key={l.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: T.ink }}>{l.user_name}</Text><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: T.muted, marginTop: 2 }}>{l.user_role || 'Staff'}</Text></View><View style={[s.badge, { backgroundColor: stColor(l.status) + '20' }]}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: stColor(l.status), textTransform: 'capitalize' }}>{l.status}</Text></View></View>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: T.brandGreen, marginTop: 10, textTransform: 'capitalize' }}>{l.leave_type} leave</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: T.steel, marginTop: 6 }} numberOfLines={2}>{l.reason}</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: T.muted, marginTop: 8 }}>{l.start_date} → {l.end_date}</Text>
            {l.status === 'pending' && (<View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}><TouchableOpacity style={[s.actBtn, { backgroundColor: T.success + '15' }]} onPress={() => updateMut.mutate({ id: l.id, status: 'approved' })}><Ionicons name="checkmark" size={18} color={T.success} /><Text style={{ color: T.success, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Approve</Text></TouchableOpacity><TouchableOpacity style={[s.actBtn, { backgroundColor: T.error + '15' }]} onPress={() => updateMut.mutate({ id: l.id, status: 'rejected' })}><Ionicons name="close" size={18} color={T.error} /><Text style={{ color: T.error, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Reject</Text></TouchableOpacity></View>)}
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
      <Modal visible={showApply} animationType="slide" transparent><View style={s.mo}><View style={[s.mc, { backgroundColor: T.surfaceContainer }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: T.ink }}>Apply for Leave</Text><TouchableOpacity onPress={() => setShowApply(false)}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity></View>
        <Text style={[s.fl, { color: T.steel }]}>Leave Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{['casual','sick','earned','other'].map(t => (<TouchableOpacity key={t} style={[s.chip, { borderColor: T.hairline }, form.leave_type === t && { backgroundColor: T.brandGreen, borderColor: T.brandGreen }]} onPress={() => setForm(f => ({ ...f, leave_type: t }))}><Text style={[s.chipT, { color: T.steel }, form.leave_type === t && { color: T.primary }]}>{t}</Text></TouchableOpacity>))}</View>
        <Text style={[s.fl, { color: T.steel }]}>Start Date</Text><TextInput style={[s.inp, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline }]} placeholder="2026-05-25" placeholderTextColor={T.muted} value={form.start_date} onChangeText={t => setForm(f => ({ ...f, start_date: t }))} />
        <Text style={[s.fl, { color: T.steel }]}>End Date</Text><TextInput style={[s.inp, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline }]} placeholder="2026-05-27" placeholderTextColor={T.muted} value={form.end_date} onChangeText={t => setForm(f => ({ ...f, end_date: t }))} />
        <Text style={[s.fl, { color: T.steel }]}>Reason *</Text><TextInput style={[s.inp, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline, height: 80 }]} placeholder="Reason" placeholderTextColor={T.muted} value={form.reason} onChangeText={t => setForm(f => ({ ...f, reason: t }))} multiline />
        <TouchableOpacity style={[s.subBtn, { backgroundColor: T.brandGreen }]} onPress={() => { if (!form.start_date || !form.end_date || !form.reason) { Alert.alert('Required', 'Fill all fields'); return; } applyMut.mutate(form); }}><Text style={{ color: T.primary, fontFamily: 'Inter_700Bold', fontSize: 15 }}>{applyMut.isPending ? 'Applying...' : 'Apply Leave'}</Text></TouchableOpacity>
      </View></View></Modal>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  bk: { width: 36, height: 36, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  tt: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 }, ab: { width: 36, height: 36, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 }, tabT: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  em: { alignItems: 'center', paddingTop: 80, gap: 12 },
  card: { marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  actBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 9999 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }, mc: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6, marginTop: 14 },
  inp: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999, borderWidth: 1 }, chipT: { fontFamily: 'Inter_500Medium', fontSize: 12, textTransform: 'capitalize' },
  subBtn: { borderRadius: 9999, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
});
