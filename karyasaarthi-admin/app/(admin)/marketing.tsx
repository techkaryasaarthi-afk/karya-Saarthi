/**
 * Marketing Panel — Campaigns, events, outreach, referrals, newsletters.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { useAppTheme } from '@/utils/theme';

const TABS = ['calendar', 'events', 'competitor', 'referrals'] as const;
const CAMPAIGN_STATUSES: Record<string, string> = { active: '#10B981', draft: '#6B7280', completed: '#3B82F6', paused: '#F59E0B' };

export default function MarketingScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('calendar');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', budget: '', target_audience: '' });

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['marketing-data', activeTab],
    queryFn: async () => {
      try { const { data } = await api.get(`/api/admin/marketing/sub?type=${activeTab}`); return data || {}; }
      catch { return {}; }
    },
  });

  const createMut = useMutation({
    mutationFn: async () => { await api.post('/api/admin/marketing/sub', { type: activeTab, ...form, budget: form.budget ? Number(form.budget) : null }); },
    onSuccess: () => { refetch(); setShowAdd(false); setForm({ title: '', description: '', date: '', budget: '', target_audience: '' }); },
    onError: () => Alert.alert('Error', 'Failed to create'),
  });

  const calendar = data?.calendar || [];
  const events = data?.events || [];
  const competitor = data?.competitor || [];
  const referrals = data?.referrals || [];

  const items = activeTab === 'calendar' ? calendar : activeTab === 'events' ? events : activeTab === 'competitor' ? competitor : referrals;

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: T.surfaceContainer }]}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity>
        <Text style={[s.title, { color: T.ink }]}>Marketing</Text>
        <TouchableOpacity style={[s.addBtn, { backgroundColor: T.brandGreen }]} onPress={() => setShowAdd(true)}><Ionicons name="add" size={20} color={T.surface} /></TouchableOpacity>
      </View>

      {/* KPIs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginBottom: 12 }}>
        {[
          { icon: '📢', label: 'Calendar', v: calendar.length, color: '#3B82F6' },
          { icon: '🎉', label: 'Events', v: events.length, color: '#8B5CF6' },
          { icon: '🕵️', label: 'Competitors', v: competitor.length, color: '#EC4899' },
          { icon: '🤝', label: 'Referrals', v: referrals.length, color: '#10B981' },
        ].map(k => (
          <View key={k.label} style={[s.kpi, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <Text style={{ fontSize: 20 }}>{k.icon}</Text>
            <Text style={[s.kpiV, { color: k.color }]}>{k.v}</Text>
            <Text style={[s.kpiL, { color: T.muted }]}>{k.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6, marginBottom: 14 }}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[s.chip, { backgroundColor: activeTab === tab ? T.brandGreen + '20' : T.surfaceContainer, borderColor: activeTab === tab ? T.brandGreen : T.hairline }]}>
            <Text style={[s.chipText, { color: activeTab === tab ? T.brandGreen : T.steel }]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {items.length === 0 ? (
          <View style={s.empty}><Ionicons name="megaphone-outline" size={48} color={T.hairline} /><Text style={[s.et, { color: T.muted }]}>No {activeTab} yet</Text></View>
        ) : items.map((item: any) => {
          const statusColor = CAMPAIGN_STATUSES[item.status] || '#6B7280';
          return (
            <View key={item.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
              <View style={s.cardH}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardTitle, { color: T.ink }]}>{item.title || item.name}</Text>
                  {!!item.date && <Text style={[s.cardSub, { color: T.muted }]}>📅 {new Date(item.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</Text>}
                  {!!item.target_audience && <Text style={[s.cardSub, { color: T.muted }]}>🎯 {item.target_audience}</Text>}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {!!item.budget && <Text style={[s.budgetText, { color: T.ink }]}>₹{Number(item.budget).toLocaleString('en-IN')}</Text>}
                  {!!item.status && <View style={[s.badge, { backgroundColor: statusColor + '20' }]}><Text style={[s.badgeText, { color: statusColor }]}>{item.status}</Text></View>}
                </View>
              </View>
              {!!item.description && <Text style={[s.cardDesc, { color: T.steel }]} numberOfLines={2}>{item.description}</Text>}
              {!!item.metrics && (
                <View style={s.metricsRow}>
                  {Object.entries(item.metrics).map(([k, v]) => (
                    <View key={k} style={[s.metricItem, { backgroundColor: T.background }]}>
                      <Text style={[s.metricVal, { color: T.ink }]}>{String(v)}</Text>
                      <Text style={[s.metricLabel, { color: T.muted }]}>{k}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={s.mo}><View style={[s.mc, { backgroundColor: T.background }]}>
          <View style={s.mh}><Text style={[s.mt, { color: T.ink }]}>+ New {activeTab.slice(0, -1)}</Text><TouchableOpacity onPress={() => setShowAdd(false)}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity></View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[s.fl, { color: T.muted }]}>Title *</Text>
            <TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Title" placeholderTextColor={T.muted} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />
            <Text style={[s.fl, { color: T.muted }]}>Date</Text>
            <TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="YYYY-MM-DD" placeholderTextColor={T.muted} value={form.date} onChangeText={t => setForm(f => ({ ...f, date: t }))} />
            <Text style={[s.fl, { color: T.muted }]}>Budget (₹)</Text>
            <TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Amount" placeholderTextColor={T.muted} keyboardType="numeric" value={form.budget} onChangeText={t => setForm(f => ({ ...f, budget: t }))} />
            <Text style={[s.fl, { color: T.muted }]}>Target Audience</Text>
            <TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Who is this for?" placeholderTextColor={T.muted} value={form.target_audience} onChangeText={t => setForm(f => ({ ...f, target_audience: t }))} />
            <Text style={[s.fl, { color: T.muted }]}>Description</Text>
            <TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink, height: 70, textAlignVertical: 'top' }]} placeholder="Details..." placeholderTextColor={T.muted} multiline value={form.description} onChangeText={t => setForm(f => ({ ...f, description: t }))} />
            <TouchableOpacity style={[s.submitBtn, { backgroundColor: T.brandGreen }]} onPress={() => { if (!form.title.trim()) return; createMut.mutate(); }}>
              <Text style={[s.submitText, { color: T.surface }]}>{createMut.isPending ? 'Creating...' : 'Create'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  kpi: { width: 110, borderRadius: 14, padding: 12, borderWidth: 1 },
  kpiV: { fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 4 }, kpiL: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 }, et: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  card: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardH: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  cardSub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  cardDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 8, lineHeight: 17 },
  budgetText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, textTransform: 'capitalize' },
  metricsRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  metricItem: { borderRadius: 8, padding: 8, minWidth: 60, alignItems: 'center' },
  metricVal: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  metricLabel: { fontFamily: 'Inter_400Regular', fontSize: 9, marginTop: 2, textTransform: 'capitalize' },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  mc: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mt: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6, marginTop: 12 },
  inp: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 20 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});
