/**
 * Admin Vendors Screen — View and manage vendor profiles. Styled per DESIGN.md.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Avatar from '@/components/ui/Avatar';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';

export default function AdminVendorsScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const { data: vendors = [], refetch, isRefetching } = useQuery({ queryKey: ['admin-vendors'], queryFn: async () => { try { const { data } = await api.get(ADMIN_ENDPOINTS.VENDORS); return data?.vendors || data || []; } catch { return []; } } });

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}><Text style={[s.tt, { color: T.ink }]}>Vendors</Text><Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 13 }}>{vendors.length} total</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {vendors.length === 0 ? (<View style={s.em}><Ionicons name="people-circle-outline" size={56} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>No vendors</Text></View>) : vendors.map((v: any) => (
          <View key={v.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <Avatar name={v.fullname || v.name} size={44} />
            <View style={{ flex: 1 }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: T.ink }}>{v.fullname || v.name}</Text><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: T.muted, marginTop: 2 }}>{v.email}</Text>{v.skills && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: T.brandTag, marginTop: 4 }}>{Array.isArray(v.skills) ? v.skills.join(', ') : v.skills}</Text>}</View>
            <View style={[s.rb, { backgroundColor: T.brandGreen + '12' }]}><Ionicons name="star" size={14} color={T.brandGreen} /><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: T.brandGreen }}>{v.rating || '—'}</Text></View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  tt: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  em: { alignItems: 'center', paddingTop: 80, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, borderRadius: 12, padding: 16, gap: 14, borderWidth: 1 },
  rb: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
});
