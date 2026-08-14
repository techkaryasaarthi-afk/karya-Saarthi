/**
 * Staff Management — Full staff directory with dept assignment, role changes, search.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';
import Avatar from '@/components/ui/Avatar';

const DEPT_COLORS: Record<string, string> = {
  operations: '#3B82F6', marketing: '#F59E0B', digital: '#EC4899', hr: '#8B5CF6',
  finance: '#10B981', campus: '#06B6D4', calling: '#FF6B35', government: '#10B981', market: '#F59E0B',
};
const ROLES = ['admin', 'super_admin', 'board_member', 'pillar_member'];
const DEPARTMENTS = ['operations', 'marketing', 'digital', 'hr', 'finance', 'campus', 'calling', 'government', 'market'];

export default function StaffScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ department: '', role: '', designation: '' });

  const { data: staff = [], refetch, isRefetching } = useQuery({
    queryKey: ['staff-list'],
    queryFn: async () => {
      try { const { data } = await api.get(`${ADMIN_ENDPOINTS.STAFF}?type=directory`); return data?.staff || []; }
      catch { return []; }
    },
  });

  const updateMut = useMutation({
    mutationFn: async () => { await api.patch(`${ADMIN_ENDPOINTS.USERS}/${editingUser.id}`, editForm); },
    onSuccess: () => { refetch(); setEditingUser(null); Alert.alert('Success', 'Staff member updated'); },
    onError: () => Alert.alert('Error', 'Update failed'),
  });

  const filtered = staff.filter((m: any) => {
    const matchSearch = !search || (m.fullname || '').toLowerCase().includes(search.toLowerCase()) || (m.email || '').toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || m.department === deptFilter;
    return matchSearch && matchDept;
  });

  const deptCounts: Record<string, number> = { all: staff.length };
  staff.forEach((m: any) => { const d = m.department || 'other'; deptCounts[d] = (deptCounts[d] || 0) + 1; });

  const startEdit = (user: any) => {
    setEditingUser(user);
    setEditForm({ department: user.department || '', role: user.role || '', designation: user.designation || '' });
  };

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: T.surfaceContainer }]}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity>
        <Text style={[s.title, { color: T.ink }]}>Staff ({staff.length})</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={[s.searchBar, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
        <Ionicons name="search" size={16} color={T.muted} />
        <TextInput style={[s.searchInput, { color: T.ink }]} placeholder="Search staff..." placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />
      </View>

      {/* Dept filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6, marginBottom: 12 }}>
        <TouchableOpacity style={[s.chip, { backgroundColor: deptFilter === 'all' ? T.brandGreen + '20' : T.surfaceContainer, borderColor: deptFilter === 'all' ? T.brandGreen : T.hairline }]} onPress={() => setDeptFilter('all')}>
          <Text style={[s.chipText, { color: deptFilter === 'all' ? T.brandGreen : T.steel }]}>All ({staff.length})</Text>
        </TouchableOpacity>
        {DEPARTMENTS.map(d => (
          <TouchableOpacity key={d} style={[s.chip, { backgroundColor: deptFilter === d ? (DEPT_COLORS[d] || '#6B7280') + '20' : T.surfaceContainer, borderColor: deptFilter === d ? (DEPT_COLORS[d] || '#6B7280') : T.hairline }]} onPress={() => setDeptFilter(deptFilter === d ? 'all' : d)}>
            <Text style={[s.chipText, { color: deptFilter === d ? (DEPT_COLORS[d] || '#6B7280') : T.steel }]}>{d} ({deptCounts[d] || 0})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {filtered.length === 0 ? (
          <View style={s.empty}><Ionicons name="people-outline" size={48} color={T.hairline} /><Text style={[s.et, { color: T.muted }]}>{search ? 'No matches' : 'No staff found'}</Text></View>
        ) : filtered.map((m: any) => {
          const deptColor = DEPT_COLORS[m.department] || '#6B7280';
          return (
            <TouchableOpacity key={m.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]} onPress={() => startEdit(m)}>
              <View style={s.cardH}>
                <Avatar name={m.fullname || '?'} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.name, { color: T.ink }]}>{m.fullname}</Text>
                  <Text style={[s.email, { color: T.muted }]}>{m.email}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {!!m.department && <View style={[s.badge, { backgroundColor: deptColor + '20' }]}><Text style={[s.badgeText, { color: deptColor }]}>{m.department}</Text></View>}
                    <View style={[s.badge, { backgroundColor: T.hairline + '40' }]}><Text style={[s.badgeText, { color: T.steel }]}>{m.role}</Text></View>
                    {!!m.designation && <View style={[s.badge, { backgroundColor: '#8B5CF620' }]}><Text style={[s.badgeText, { color: '#8B5CF6' }]}>{m.designation}</Text></View>}
                  </View>
                </View>
                <View style={[s.statusDot, { backgroundColor: m.status === 'active' ? '#10B981' : '#EF4444' }]} />
              </View>
              <View style={s.metaRow}>
                {!!m.phone && <Text style={[s.metaText, { color: T.muted }]}>📞 {m.phone}</Text>}
                {!!m.employee_id && <Text style={[s.metaText, { color: T.muted }]}>🆔 {m.employee_id}</Text>}
                {!!m.joining_date && <Text style={[s.metaText, { color: T.muted }]}>📅 {new Date(m.joining_date).toLocaleDateString('en-IN')}</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={!!editingUser} animationType="slide" transparent>
        <View style={s.mo}><View style={[s.mc, { backgroundColor: T.background }]}>
          <View style={s.mh}><Text style={[s.mt, { color: T.ink }]}>✏️ Edit {editingUser?.fullname}</Text><TouchableOpacity onPress={() => setEditingUser(null)}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity></View>
          <Text style={[s.fl, { color: T.muted }]}>Department</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {DEPARTMENTS.map(d => (
              <TouchableOpacity key={d} style={[s.chip, { marginRight: 6, borderColor: editForm.department === d ? T.brandGreen : T.hairline, backgroundColor: editForm.department === d ? T.brandGreen + '20' : 'transparent' }]} onPress={() => setEditForm(f => ({ ...f, department: d }))}>
                <Text style={[s.chipText, { color: editForm.department === d ? T.brandGreen : T.steel }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[s.fl, { color: T.muted }]}>Role</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {ROLES.map(r => (
              <TouchableOpacity key={r} style={[s.chip, { marginRight: 6, borderColor: editForm.role === r ? T.brandGreen : T.hairline, backgroundColor: editForm.role === r ? T.brandGreen + '20' : 'transparent' }]} onPress={() => setEditForm(f => ({ ...f, role: r }))}>
                <Text style={[s.chipText, { color: editForm.role === r ? T.brandGreen : T.steel }]}>{r.replace(/_/g, ' ')}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[s.fl, { color: T.muted }]}>Designation</Text>
          <TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Designation" placeholderTextColor={T.muted} value={editForm.designation} onChangeText={t => setEditForm(f => ({ ...f, designation: t }))} />
          <TouchableOpacity style={[s.submitBtn, { backgroundColor: T.brandGreen }]} onPress={() => updateMut.mutate()}>
            <Text style={[s.submitText, { color: T.surface }]}>{updateMut.isPending ? 'Saving...' : 'Update Staff'}</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, gap: 8, borderWidth: 1, marginBottom: 12 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, paddingVertical: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 }, et: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  card: { marginHorizontal: 20, marginBottom: 10, borderRadius: 14, padding: 14, borderWidth: 1 },
  cardH: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 15 }, email: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, textTransform: 'capitalize' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  metaText: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  mc: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mt: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6, marginTop: 14 },
  inp: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});
