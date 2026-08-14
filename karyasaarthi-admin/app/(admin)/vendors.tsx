/**
 * Admin Vendors Screen — View and manage vendor profiles.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Avatar from '@/components/ui/Avatar';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';

export default function AdminVendorsScreen() {
  const insets = useSafeAreaInsets();
  const { data: vendors = [], refetch, isRefetching } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: async () => { try { const { data } = await api.get(ADMIN_ENDPOINTS.VENDORS); return data?.vendors || data || []; } catch { return []; } },
  });

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      <View style={s.hdr}><Text style={s.title}>Vendors</Text><Text style={s.count}>{vendors.length} total</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}>
        {vendors.length === 0 ? (
          <View style={s.empty}><Ionicons name="people-circle-outline" size={56} color="rgba(255,255,255,0.15)" /><Text style={s.et}>No vendors</Text></View>
        ) : vendors.map((v: any) => (
          <View key={v.id} style={s.card}>
            <Avatar name={v.fullname || v.name} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{v.fullname || v.name}</Text>
              <Text style={s.email}>{v.email}</Text>
              {v.skills && <Text style={s.skills}>{Array.isArray(v.skills) ? v.skills.join(', ') : v.skills}</Text>}
            </View>
            <View style={s.ratingBox}><Ionicons name="star" size={14} color="#F59E0B" /><Text style={s.rating}>{v.rating || '—'}</Text></View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' }, hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFF' }, count: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 }, et: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: 'rgba(255,255,255,0.5)' },
  card: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.9)' },
  email: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  skills: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#818CF8', marginTop: 4 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,158,11,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  rating: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#F59E0B' },
});
