/**
 * Admin Users Screen — User management with search, filters, role editing.
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
import { colors, spacing, typography, radius } from '@/utils/theme';

const ROLE_COLORS: Record<string, string> = {
  customer: 'info', vendor: 'secondary', admin: 'primary', super_admin: 'error',
  board_member: 'success', pillar_member: 'warning', pending_admin: 'outline',
};

const FILTER_TABS = ['All', 'Customer', 'Vendor', 'Admin', 'Staff'];

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['admin-users', activeFilter],
    queryFn: async () => {
      const params = activeFilter !== 'All' ? `?role=${activeFilter.toLowerCase()}` : '';
      const { data } = await api.get(`${ADMIN_ENDPOINTS.USERS}${params}`);
      return data?.users || data || [];
    },
  });

  const users = (data || []).filter((u: any) =>
    !search || u.fullname?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await api.put(`${ADMIN_ENDPOINTS.USERS}/${id}`, { is_active: !isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      Toast.show({ type: 'success', text1: 'User updated' });
    },
  });

  const handleUserAction = useCallback((user: any) => {
    Alert.alert(user.fullname, `Email: ${user.email}\nRole: ${user.role}`, [
      { text: user.is_active ? 'Deactivate' : 'Activate', style: user.is_active ? 'destructive' : 'default', onPress: () => toggleStatus.mutate({ id: user.id, isActive: user.is_active }) },
      { text: 'Close', style: 'cancel' },
    ]);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{users.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <FlatList
        data={FILTER_TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.filterChip, activeFilter === item && styles.filterActive]} onPress={() => setActiveFilter(item)}>
            <Text style={[styles.filterText, activeFilter === item && styles.filterActiveText]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* User List */}
      <FlatList
        data={users}
        keyExtractor={(item: any) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity style={styles.userCard} onPress={() => handleUserAction(item)} activeOpacity={0.7}>
            <Avatar name={item.fullname} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={styles.userName} numberOfLines={1}>{item.fullname || 'Unknown'}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
            </View>
            <Badge text={item.role?.replace('_', ' ') || 'user'} variant={ROLE_COLORS[item.role] as any || 'outline'} size="sm" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#FFFFFF' },
  countBadge: { backgroundColor: 'rgba(245,158,11,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  countText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#F59E0B' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.containerMargin, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 14, height: 44 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFFFFF' },
  filterRow: { paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  filterActive: { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: '#F59E0B' },
  filterText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  filterActiveText: { color: '#F59E0B' },
  listContent: { paddingHorizontal: spacing.containerMargin, paddingBottom: 100 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  userName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.9)' },
  userEmail: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontFamily: 'Inter_500Medium', fontSize: 15, color: 'rgba(255,255,255,0.3)', marginTop: 12 },
});
