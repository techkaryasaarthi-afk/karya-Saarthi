/**
 * Admin Vendor Pipeline — Dashboard to manage vendor hiring process.
 * Styled per DESIGN.md: flat cards, brandGreen accent, pill filters.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Avatar from '@/components/ui/Avatar';
import { getVendorApplications } from '@/services/vendor-pipeline';
import { useAppTheme } from '@/utils/theme';

const STATUS_CFG: Record<string, { icon: string; color: string; label: string }> = {
  submitted: { icon: 'document-text', color: '#2563EB', label: 'Submitted' },
  under_review: { icon: 'eye', color: '#D97706', label: 'Under Review' },
  interview_scheduled: { icon: 'calendar', color: '#4F46E5', label: 'Interview' },
  interview_done: { icon: 'checkmark-circle', color: '#92400E', label: 'Interviewed' },
  selected: { icon: 'star', color: '#059669', label: 'Selected' },
  onboarding: { icon: 'rocket', color: '#0891B2', label: 'Onboarding' },
  active: { icon: 'shield-checkmark', color: '#059669', label: 'Active' },
  rejected: { icon: 'close-circle', color: '#DC2626', label: 'Rejected' },
};
const FILTERS = ['all','submitted','under_review','interview_scheduled','selected','onboarding','active','rejected'];

export default function VendorPipelineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['vendor-pipeline', filter, search],
    queryFn: () => getVendorApplications({ status: filter === 'all' ? undefined : filter, search: search || undefined }),
    staleTime: 120000,
  });
  const apps = data?.applications || [];
  const sc = data?.statusCounts || {} as any;
  const total = Object.values(sc).reduce((a: number, b: any) => a + b, 0);

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}><Text style={[s.title, { color: T.ink }]}>Vendor Pipeline</Text><Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 13 }}>{total} apps</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 10 }}>
        {[{ k:'total', l:'Total', c: total, cl: T.steel },{ k:'submitted', l:'New', c: sc.submitted||0, cl:'#2563EB' },{ k:'review', l:'Review', c:(sc.under_review||0)+(sc.interview_scheduled||0), cl:'#D97706' },{ k:'active', l:'Active', c: sc.active||0, cl: T.success },{ k:'rejected', l:'Rejected', c: sc.rejected||0, cl: T.error }].map(card => (
          <View key={card.k} style={[s.oc, { backgroundColor: card.cl + '12', borderColor: card.cl + '25' }]}><Text style={[s.ocn, { color: card.cl }]}>{card.c}</Text><Text style={[s.ocl, { color: T.steel }]}>{card.l}</Text></View>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}><View style={[s.sb, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}><Ionicons name="search" size={18} color={T.muted} /><TextInput style={[s.si, { color: T.ink }]} placeholder="Search..." placeholderTextColor={T.muted} value={search} onChangeText={setSearch} /></View></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 10 }}>
        {FILTERS.map(f => (<TouchableOpacity key={f} style={[s.fp, { borderColor: T.hairline }, filter===f && { backgroundColor: T.brandGreen, borderColor: T.brandGreen }]} onPress={() => setFilter(f)}><Text style={[s.ft, { color: T.steel }, filter===f && { color: T.primary }]}>{f==='all'?'All':STATUS_CFG[f]?.label||f}</Text></TouchableOpacity>))}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {apps.length === 0 ? (<View style={s.em}><Ionicons name="people-circle-outline" size={56} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>No applications</Text></View>) : apps.map((app: any) => {
          const cfg = STATUS_CFG[app.status] || STATUS_CFG.submitted;
          return (<TouchableOpacity key={app.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]} activeOpacity={0.8} onPress={() => router.push({ pathname: '/(admin)/vendor-application-detail', params: { id: app.id } } as any)}>
            <Avatar name={app.fullname} size={42} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={[s.nm, { color: T.ink }]} numberOfLines={1}>{app.fullname}</Text><View style={[s.badge, { backgroundColor: cfg.color + '18' }]}><Ionicons name={cfg.icon as any} size={12} color={cfg.color} /><Text style={{ color: cfg.color, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>{cfg.label}</Text></View></View>
              <Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 }}>{app.email}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}><Text style={{ color: T.brandTag, fontFamily: 'Inter_500Medium', fontSize: 11 }}>{app.vendor_id||'—'}</Text><Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 11 }}>{new Date(app.created_at).toLocaleDateString('en-IN',{ day:'numeric', month:'short' })}</Text></View>
              {app.total_score != null && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}><Ionicons name="star" size={12} color={T.brandGreen} /><Text style={{ color: T.brandGreen, fontFamily: 'Inter_500Medium', fontSize: 11 }}>Score: {app.total_score}/50</Text></View>}
            </View>
          </TouchableOpacity>);
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  oc: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, alignItems: 'center', minWidth: 70, borderWidth: 1 }, ocn: { fontFamily: 'Inter_700Bold', fontSize: 20 }, ocl: { fontFamily: 'Inter_500Medium', fontSize: 11, marginTop: 2 },
  sb: { flexDirection: 'row', alignItems: 'center', borderRadius: 9999, paddingHorizontal: 12, gap: 8, borderWidth: 1 }, si: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, paddingVertical: 10 },
  fp: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 }, ft: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  card: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 20, marginBottom: 10, borderRadius: 12, padding: 14, gap: 12, borderWidth: 1 },
  nm: { fontFamily: 'Inter_600SemiBold', fontSize: 15, flex: 1, marginRight: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999 },
  em: { alignItems: 'center', paddingTop: 80, gap: 12 },
});
