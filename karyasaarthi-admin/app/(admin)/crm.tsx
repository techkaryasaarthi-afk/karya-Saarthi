/**
 * CRM Panel — Lead tracking, pipeline management, contact management.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';
import Avatar from '@/components/ui/Avatar';

const LEAD_STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const STAGE_COLORS: Record<string, string> = { new: '#6B7280', contacted: '#3B82F6', qualified: '#8B5CF6', proposal: '#F59E0B', negotiation: '#EC4899', won: '#10B981', lost: '#EF4444' };

export default function CRMScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const router = useRouter();
  const qc = useQueryClient();
  const [stageFilter, setStageFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', stage: 'new', value: '', notes: '' });

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['crm-leads'],
    queryFn: async () => {
      try { const { data } = await api.get(`${ADMIN_ENDPOINTS.CRM}`); return data?.leads || []; }
      catch { return []; }
    },
  });

  const leads = data || [];
  const filtered = leads.filter((l: any) => {
    const matchStage = stageFilter === 'all' || l.stage === stageFilter;
    const matchSearch = !search || (l.name || '').toLowerCase().includes(search.toLowerCase()) || (l.email || '').toLowerCase().includes(search.toLowerCase()) || (l.company || '').toLowerCase().includes(search.toLowerCase());
    return matchStage && matchSearch;
  });

  const createMut = useMutation({
    mutationFn: async () => { await api.post(ADMIN_ENDPOINTS.CRM, { name: form.name, email: form.email, phone: form.phone, source: 'admin', service_interest: form.company, budget: form.value ? Number(form.value) : null, stage: form.stage || 'new' }); },
    onSuccess: () => { refetch(); setShowAdd(false); setForm({ name: '', email: '', phone: '', company: '', stage: 'new', value: '', notes: '' }); },
    onError: () => Alert.alert('Error', 'Failed to create lead'),
  });

  const updateStageMut = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => { await api.patch(`${ADMIN_ENDPOINTS.CRM}/${id}`, { stage }); },
    onSuccess: () => refetch(),
  });

  const stageCounts: Record<string, number> = { all: leads.length };
  leads.forEach((l: any) => { stageCounts[l.stage] = (stageCounts[l.stage] || 0) + 1; });
  const totalValue = leads.reduce((s: number, l: any) => s + (Number(l.value) || 0), 0);
  const wonValue = leads.filter((l: any) => l.stage === 'won').reduce((s: number, l: any) => s + (Number(l.value) || 0), 0);

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: T.surfaceContainer }]}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity>
        <Text style={[s.title, { color: T.ink }]}>CRM</Text>
        <TouchableOpacity style={[s.addBtn, { backgroundColor: T.brandGreen }]} onPress={() => setShowAdd(true)}><Ionicons name="add" size={20} color={T.surface} /></TouchableOpacity>
      </View>

      {/* KPIs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginBottom: 12 }}>
        {[
          { icon: '📊', label: 'Total Leads', v: String(leads.length), color: T.ink },
          { icon: '💰', label: 'Pipeline Value', v: `₹${totalValue.toLocaleString('en-IN')}`, color: '#F59E0B' },
          { icon: '✅', label: 'Won Value', v: `₹${wonValue.toLocaleString('en-IN')}`, color: '#10B981' },
          { icon: '📈', label: 'Win Rate', v: leads.length ? `${Math.round((stageCounts.won || 0) / leads.length * 100)}%` : '0%', color: '#3B82F6' },
        ].map(kpi => (
          <View key={kpi.label} style={[s.kpi, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <Text style={{ fontSize: 18 }}>{kpi.icon}</Text>
            <Text style={[s.kpiV, { color: kpi.color }]}>{kpi.v}</Text>
            <Text style={[s.kpiL, { color: T.muted }]}>{kpi.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Search */}
      <View style={[s.searchBar, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
        <Ionicons name="search" size={16} color={T.muted} />
        <TextInput style={[s.searchInput, { color: T.ink }]} placeholder="Search leads..." placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />
      </View>

      {/* Stage filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6, marginBottom: 12 }}>
        {['all', ...LEAD_STAGES].map(st => (
          <TouchableOpacity key={st} onPress={() => setStageFilter(st)} style={[s.chip, { backgroundColor: stageFilter === st ? (STAGE_COLORS[st] || T.brandGreen) + '20' : T.surfaceContainer, borderColor: stageFilter === st ? (STAGE_COLORS[st] || T.brandGreen) : T.hairline }]}>
            <Text style={[s.chipText, { color: stageFilter === st ? (STAGE_COLORS[st] || T.brandGreen) : T.steel }]}>{st === 'all' ? `All (${leads.length})` : `${st} (${stageCounts[st] || 0})`}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {filtered.length === 0 ? (
          <View style={s.empty}><Ionicons name="people-outline" size={48} color={T.hairline} /><Text style={[s.et, { color: T.muted }]}>No leads found</Text></View>
        ) : filtered.map((lead: any) => {
          const stageColor = STAGE_COLORS[lead.stage] || '#6B7280';
          return (
            <View key={lead.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
              <View style={s.cardH}>
                <Avatar name={lead.name || '?'} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.leadName, { color: T.ink }]}>{lead.name}</Text>
                  {!!lead.company && <Text style={[s.leadSub, { color: T.muted }]}>{lead.company}</Text>}
                  <Text style={[s.leadSub, { color: T.muted }]}>{lead.email}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {!!lead.value && <Text style={[s.leadVal, { color: T.ink }]}>₹{Number(lead.value).toLocaleString('en-IN')}</Text>}
                  <View style={[s.stageBadge, { backgroundColor: stageColor + '20' }]}>
                    <Text style={[s.stageText, { color: stageColor }]}>{lead.stage}</Text>
                  </View>
                </View>
              </View>
              {!!lead.notes && <Text style={[s.leadNotes, { color: T.steel }]} numberOfLines={2}>{lead.notes}</Text>}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {LEAD_STAGES.filter(st => st !== lead.stage).map(st => (
                  <TouchableOpacity key={st} style={[s.moveBtn, { borderColor: STAGE_COLORS[st] + '40' }]} onPress={() => updateStageMut.mutate({ id: lead.id, stage: st })}>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 9, color: STAGE_COLORS[st], textTransform: 'capitalize' }}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Lead Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={s.mo}><View style={[s.mc, { backgroundColor: T.background }]}>
          <View style={s.mh}><Text style={[s.mt, { color: T.ink }]}>+ New Lead</Text><TouchableOpacity onPress={() => setShowAdd(false)}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity></View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {[
              { label: 'Name *', key: 'name', ph: 'Full name' },
              { label: 'Email', key: 'email', ph: 'email@company.com' },
              { label: 'Phone', key: 'phone', ph: '+91...' },
              { label: 'Company', key: 'company', ph: 'Company name' },
              { label: 'Deal Value (₹)', key: 'value', ph: 'Amount', kb: 'numeric' as const },
            ].map(f => (
              <View key={f.key}><Text style={[s.fl, { color: T.muted }]}>{f.label}</Text>
              <TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder={f.ph} placeholderTextColor={T.muted} value={(form as any)[f.key]} onChangeText={t => setForm(prev => ({ ...prev, [f.key]: t }))} keyboardType={f.kb || 'default'} /></View>
            ))}
            <Text style={[s.fl, { color: T.muted }]}>Notes</Text>
            <TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink, height: 60, textAlignVertical: 'top' }]} placeholder="Notes..." placeholderTextColor={T.muted} multiline value={form.notes} onChangeText={t => setForm(f => ({ ...f, notes: t }))} />
            <TouchableOpacity style={[s.submitBtn, { backgroundColor: T.brandGreen }]} onPress={() => { if (!form.name.trim()) { Alert.alert('Required', 'Name is required'); return; } createMut.mutate(); }}>
              <Text style={[s.submitText, { color: T.surface }]}>{createMut.isPending ? 'Creating...' : 'Create Lead'}</Text>
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
  kpi: { width: 120, borderRadius: 14, padding: 12, borderWidth: 1 },
  kpiV: { fontFamily: 'Inter_700Bold', fontSize: 15, marginTop: 4 }, kpiL: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, gap: 8, borderWidth: 1, marginBottom: 12 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, paddingVertical: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 }, et: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  card: { marginHorizontal: 20, marginBottom: 10, borderRadius: 14, padding: 14, borderWidth: 1 },
  cardH: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  leadName: { fontFamily: 'Inter_600SemiBold', fontSize: 14 }, leadSub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 1 },
  leadVal: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  stageBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  stageText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, textTransform: 'capitalize' },
  leadNotes: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 8, lineHeight: 17 },
  moveBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, marginRight: 6 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  mc: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mt: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6, marginTop: 12 },
  inp: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 20 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});
