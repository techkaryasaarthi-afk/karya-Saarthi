/**
 * Admin Users Screen — User management with search, filters, role editing.
 * Styled per DESIGN.md.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme, spacing } from '@/utils/theme';

const ROLE_COLORS: Record<string, string> = { customer: 'info', vendor: 'secondary', admin: 'primary', super_admin: 'error', board_member: 'success', pillar_member: 'warning', pending_admin: 'outline' };
const FILTER_TABS = ['All', 'Customer', 'Vendor', 'Admin', 'Staff'];

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const T = useAppTheme();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const { data, refetch, isRefetching } = useQuery({ queryKey: ['admin-users', activeFilter], queryFn: async () => { const p = activeFilter !== 'All' ? `?role=${activeFilter.toLowerCase()}` : ''; const { data } = await api.get(`${ADMIN_ENDPOINTS.USERS}${p}`); return data?.users || data || []; } });
  const users = (data || []).filter((u: any) => !search || u.fullname?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const toggleStatus = useMutation({ mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => { await api.put(`${ADMIN_ENDPOINTS.USERS}/${id}`, { is_active: !isActive }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); Toast.show({ type: 'success', text1: 'User updated' }); } });
  const handleAction = useCallback((user: any) => { Alert.alert(user.fullname, `Email: ${user.email}\nRole: ${user.role}`, [{ text: user.is_active ? 'Deactivate' : 'Activate', style: user.is_active ? 'destructive' : 'default', onPress: () => toggleStatus.mutate({ id: user.id, isActive: user.is_active }) }, { text: 'Close', style: 'cancel' }]); }, []);

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}><Text style={[s.tt, { color: T.ink }]}>Users</Text><View style={[s.cb, { backgroundColor: T.brandGreen + '20' }]}><Text style={{ color: T.brandGreen, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>{users.length}</Text></View></View>
      <View style={[s.sr, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}><Ionicons name="search" size={18} color={T.muted} /><TextInput style={[s.si, { color: T.ink }]} placeholder="Search users..." placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />{search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={T.muted} /></TouchableOpacity>}</View>
      <FlatList data={FILTER_TABS} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }} keyExtractor={i => i} renderItem={({ item }) => (<TouchableOpacity style={[s.fc, { borderColor: T.hairline }, activeFilter === item && { backgroundColor: T.brandGreen, borderColor: T.brandGreen }]} onPress={() => setActiveFilter(item)}><Text style={[s.ft, { color: T.steel }, activeFilter === item && { color: T.primary }]}>{item}</Text></TouchableOpacity>)} />
      <FlatList data={users} keyExtractor={(i: any) => String(i.id)} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} renderItem={({ item }: { item: any }) => (<TouchableOpacity style={[s.uc, { borderBottomColor: T.hairlineSoft }]} onPress={() => handleAction(item)} activeOpacity={0.7}><Avatar name={item.fullname} size={44} /><View style={{ flex: 1 }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: T.ink }} numberOfLines={1}>{item.fullname || 'Unknown'}</Text><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: T.muted, marginTop: 2 }} numberOfLines={1}>{item.email}</Text></View><Badge text={item.role?.replace('_', ' ') || 'user'} variant={ROLE_COLORS[item.role] as any || 'outline'} size="sm" /></TouchableOpacity>)} ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 80 }}><Ionicons name="people-outline" size={48} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_500Medium', fontSize: 15, marginTop: 12 }}>No users found</Text></View>} />
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
  tt: { fontFamily: 'Inter_700Bold', fontSize: 22 }, cb: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  sr: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, borderRadius: 9999, paddingHorizontal: 14, height: 44, borderWidth: 1 },
  si: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14 },
  fc: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, borderWidth: 1 }, ft: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  uc: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
});
