/**
 * Staff Registration Queue — Approve/reject pending admin & pillar member registrations.
 * Super Admin only.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';
import { useAuthStore } from '@/stores/authStore';
import Avatar from '@/components/ui/Avatar';

const DEPT_COLORS: Record<string, string> = {
  hr: '#8B5CF6', finance: '#10B981', operations: '#3B82F6',
  marketing: '#F59E0B', digital: '#EC4899', campus: '#3B82F6',
};

const ROLE_OPTIONS = [
  { value: 'digital_marketing_head', label: '💻 Digital Marketing Head', dept: 'digital' },
  { value: 'marketing_head', label: '📢 Marketing Head', dept: 'marketing' },
  { value: 'operation_head', label: '⚙️ Operation Head', dept: 'operations' },
  { value: 'project_manager', label: '📋 Project Manager', dept: 'operations', pillar: 'project_manager' },
];

export default function StaffRequestsScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [roleOverrides, setRoleOverrides] = useState<Record<number, string>>({});

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['staff-requests'],
    queryFn: async () => {
      try {
        const { data } = await api.get(ADMIN_ENDPOINTS.STAFF_REQUESTS);
        return data || { pendingAdmins: [], pendingPillar: [] };
      } catch { return { pendingAdmins: [], pendingPillar: [] }; }
    },
  });

  const actionMut = useMutation({
    mutationFn: async ({ userId, action, department, role }: any) => {
      await api.patch(ADMIN_ENDPOINTS.STAFF_REQUESTS, { userId, action, department, role });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff-requests'] }); refetch(); },
    onError: () => Alert.alert('Error', 'Action failed'),
  });

  const handleApprove = (u: any) => {
    const selectedRole = roleOverrides[u.id] || '';
    const mapping = ROLE_OPTIONS.find(r => r.value === selectedRole);
    Alert.alert('Approve', `Approve ${u.fullname}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => actionMut.mutate({
        userId: u.id, action: 'approve',
        department: mapping?.dept || u.department,
        role: 'admin',
      })},
    ]);
  };

  const handleReject = (u: any) => {
    Alert.alert('Reject', `Reject ${u.fullname}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => actionMut.mutate({ userId: u.id, action: 'reject' }) },
    ]);
  };

  const pendingAdmins = data?.pendingAdmins || [];
  const pendingPillar = data?.pendingPillar || [];
  const total = pendingAdmins.length + pendingPillar.length;

  const renderUserCard = (u: any, type: 'admin' | 'pillar') => {
    const deptColor = DEPT_COLORS[u.department || ''] || '#6B7280';
    return (
      <View key={u.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
        <View style={s.cardRow}>
          <Avatar name={u.fullname} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={[s.userName, { color: T.ink }]}>{u.fullname}</Text>
            <Text style={[s.userEmail, { color: T.muted }]}>{u.email}</Text>
            {!!u.phone && <Text style={[s.userEmail, { color: T.muted }]}>📞 {u.phone}</Text>}
            <View style={[s.deptBadge, { backgroundColor: deptColor + '20' }]}>
              <Text style={[s.deptText, { color: deptColor }]}>
                {u.designation || u.department || u.pillar_role || 'Staff'}
              </Text>
            </View>
          </View>
        </View>

        {type === 'admin' && (
          <View style={s.roleSelector}>
            <Text style={[s.roleLabel, { color: T.muted }]}>Assign Role:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              {ROLE_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.value}
                  style={[s.roleChip, { borderColor: roleOverrides[u.id] === opt.value ? T.brandGreen : T.hairline, backgroundColor: roleOverrides[u.id] === opt.value ? T.brandGreen + '20' : 'transparent' }]}
                  onPress={() => setRoleOverrides(p => ({ ...p, [u.id]: opt.value }))}>
                  <Text style={[s.roleChipText, { color: roleOverrides[u.id] === opt.value ? T.brandGreen : T.steel }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={s.actionRow}>
          <TouchableOpacity style={[s.approveBtn, { backgroundColor: '#10B981' }]} onPress={() => handleApprove(u)}>
            <Ionicons name="checkmark" size={16} color="#FFF" />
            <Text style={s.btnLabel}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.rejectBtn, { backgroundColor: '#EF444420', borderColor: '#EF4444' }]} onPress={() => handleReject(u)}>
            <Ionicons name="close" size={16} color="#EF4444" />
            <Text style={[s.btnLabel, { color: '#EF4444' }]}>Reject</Text>
          </TouchableOpacity>
        </View>

        <Text style={[s.dateText, { color: T.muted }]}>
          Registered: {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: T.surfaceContainer }]}>
          <Ionicons name="arrow-back" size={22} color={T.ink} />
        </TouchableOpacity>
        <Text style={[s.title, { color: T.ink }]}>Staff Queue</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { icon: '⏳', label: 'Admins', v: pendingAdmins.length, color: '#F59E0B' },
          { icon: '🌟', label: 'Pillar', v: pendingPillar.length, color: '#8B5CF6' },
          { icon: '📋', label: 'Total', v: total, color: '#EF4444' },
        ].map(st => (
          <View key={st.label} style={[s.statCard, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <Text style={{ fontSize: 20 }}>{st.icon}</Text>
            <Text style={[s.statVal, { color: st.color }]}>{st.v}</Text>
            <Text style={[s.statLabel, { color: T.muted }]}>{st.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {total === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>🎉</Text>
            <Text style={[s.emptyTitle, { color: T.ink }]}>All Clear!</Text>
            <Text style={[s.emptyDesc, { color: T.muted }]}>No pending registrations</Text>
          </View>
        ) : (
          <>
            {pendingAdmins.length > 0 && (
              <View style={s.sectionGroup}>
                <Text style={[s.sectionHeader, { color: T.warning }]}>⏳ Pending Admins ({pendingAdmins.length})</Text>
                {pendingAdmins.map((u: any) => renderUserCard(u, 'admin'))}
              </View>
            )}
            {pendingPillar.length > 0 && (
              <View style={s.sectionGroup}>
                <Text style={[s.sectionHeader, { color: '#8B5CF6' }]}>🌟 Pending Pillar Members ({pendingPillar.length})</Text>
                {pendingPillar.map((u: any) => renderUserCard(u, 'pillar'))}
              </View>
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1 },
  hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  statVal: { fontFamily: 'Inter_700Bold', fontSize: 22, marginTop: 4 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  sectionGroup: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: { fontFamily: 'Inter_700Bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  userName: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  userEmail: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  deptBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6, alignSelf: 'flex-start' },
  deptText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, textTransform: 'capitalize' },
  roleSelector: { marginTop: 12 },
  roleLabel: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginRight: 8 },
  roleChipText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  btnLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFF' },
  dateText: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 10 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14 },
});
