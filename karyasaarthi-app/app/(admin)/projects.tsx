/**
 * Admin Projects — List and manage all projects. Styled per DESIGN.md.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getProjectsApi } from '@/services/admin';
import { useAppTheme } from '@/utils/theme';

const FILTERS = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

export default function AdminProjectsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const { data: projects = [], refetch, isRefetching } = useQuery({ queryKey: ['admin-projects', filter], queryFn: () => getProjectsApi(filter === 'All' ? undefined : filter.toLowerCase().replace(' ', '_')) });
  const filtered = projects.filter((p: any) => !search || p.title?.toLowerCase().includes(search.toLowerCase()));
  const stColor = (st: string) => st === 'completed' ? T.success : st === 'in_progress' ? T.info : st === 'cancelled' ? T.error : T.warning;

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: T.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 }}><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 24, color: T.ink, flex: 1 }}>Projects</Text><Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 13 }}>{filtered.length}</Text></View>
      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}><View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 9999, paddingHorizontal: 12, gap: 8, borderWidth: 1, backgroundColor: T.surfaceContainer, borderColor: T.hairline }}><Ionicons name="search" size={18} color={T.muted} /><TextInput style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, paddingVertical: 10, color: T.ink }} placeholder="Search projects..." placeholderTextColor={T.muted} value={search} onChangeText={setSearch} /></View></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 10 }}>{FILTERS.map(f => (<TouchableOpacity key={f} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 9999, borderWidth: 1, borderColor: filter === f ? T.brandGreen : T.hairline, backgroundColor: filter === f ? T.brandGreen : 'transparent' }} onPress={() => setFilter(f)}><Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: filter === f ? T.primary : T.steel }}>{f}</Text></TouchableOpacity>))}</ScrollView>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {filtered.length === 0 ? (<View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}><Ionicons name="briefcase-outline" size={56} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>No projects</Text></View>) : filtered.map((p: any) => (
          <TouchableOpacity key={p.id} style={{ marginHorizontal: 20, marginBottom: 10, borderRadius: 12, padding: 16, borderWidth: 1, backgroundColor: T.surfaceContainer, borderColor: T.hairline }} activeOpacity={0.8} onPress={() => router.push({ pathname: '/(admin)/project-detail', params: { id: p.id } } as any)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: T.ink, flex: 1, marginRight: 8 }} numberOfLines={1}>{p.title}</Text><View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: stColor(p.status) + '18' }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: stColor(p.status), textTransform: 'capitalize' }}>{p.status?.replace('_', ' ')}</Text></View></View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: T.muted, marginTop: 4 }}>{p.client_name || p.customer_name || '—'}</Text>
            {p.amount && <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: T.brandGreen, marginTop: 6 }}>₹{p.amount.toLocaleString()}</Text>}
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
