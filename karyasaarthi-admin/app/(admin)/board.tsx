/**
 * Board Panel — Executive dashboard with revenue, project KPIs, leads, risk alerts.
 * Matches the GET /api/admin/board response structure.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';

export default function BoardScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const router = useRouter();

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['board-dashboard'],
    queryFn: async () => {
      try { const { data } = await api.get(ADMIN_ENDPOINTS.BOARD); return data; }
      catch { return null; }
    },
  });

  const d = data || {};
  const rev = d.revenue || {};
  const proj = d.projects || {};
  const team = d.team || {};
  const leads = d.leads || {};
  const months = d.revenueByMonth || [];
  const topProjects = d.topProjects || [];
  const topClients = d.topClients || [];
  const riskAlerts = d.riskAlerts || [];
  const budget = d.budgetAllocation || [];
  const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: T.surfaceContainer }]}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity>
        <Text style={[s.title, { color: T.ink }]}>Board Dashboard</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Revenue KPIs */}
        <Text style={[s.sec, { color: T.ink }]}>💰 Revenue</Text>
        <View style={s.grid}>
          {[
            { icon: '💰', label: 'Total Revenue', v: fmt(rev.total), color: '#10B981' },
            { icon: '📅', label: 'This Month', v: fmt(rev.thisMonth), color: '#3B82F6' },
            { icon: '⏳', label: 'Pending', v: fmt(rev.pending), color: '#F59E0B' },
            { icon: '⚠️', label: 'Overdue Inv.', v: String(rev.overdueCount || 0), color: '#EF4444' },
          ].map(k => (
            <View key={k.label} style={[s.kpi, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
              <Text style={{ fontSize: 20 }}>{k.icon}</Text>
              <Text style={[s.kpiV, { color: k.color }]}>{k.v}</Text>
              <Text style={[s.kpiL, { color: T.muted }]}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Revenue Chart (simple bar) */}
        {months.length > 0 && (
          <View style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <Text style={[s.cardTitle, { color: T.ink }]}>📊 Revenue Trend (6 months)</Text>
            <View style={s.chartRow}>
              {months.map((m: any, i: number) => {
                const maxRev = Math.max(...months.map((x: any) => x.revenue || 0), 1);
                const h = Math.max(((m.revenue || 0) / maxRev) * 80, 4);
                return (
                  <View key={i} style={s.chartCol}>
                    <View style={[s.chartBar, { height: h, backgroundColor: '#10B981' }]} />
                    <Text style={[s.chartLabel, { color: T.muted }]}>{m.month}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Projects & Team */}
        <Text style={[s.sec, { color: T.ink }]}>📋 Projects & Team</Text>
        <View style={s.grid}>
          {[
            { label: 'Total Projects', v: proj.total, color: '#3B82F6' },
            { label: 'Active', v: proj.active, color: '#F59E0B' },
            { label: 'Completed', v: proj.completed, color: '#10B981' },
            { label: 'Team Size', v: team.internal, color: '#8B5CF6' },
            { label: 'Clients', v: team.clients, color: '#EC4899' },
            { label: 'Vendors', v: team.vendors, color: '#06B6D4' },
          ].map(k => (
            <View key={k.label} style={[s.kpiS, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
              <Text style={[s.kpiV2, { color: k.color }]}>{k.v || 0}</Text>
              <Text style={[s.kpiL2, { color: T.muted }]}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Leads */}
        <Text style={[s.sec, { color: T.ink }]}>📈 Leads</Text>
        <View style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
          <View style={s.leadRow}>
            <View style={s.leadItem}><Text style={[s.leadV, { color: T.ink }]}>{leads.total || 0}</Text><Text style={[s.leadL, { color: T.muted }]}>Total</Text></View>
            <View style={s.leadItem}><Text style={[s.leadV, { color: '#10B981' }]}>{leads.won || 0}</Text><Text style={[s.leadL, { color: T.muted }]}>Won</Text></View>
            <View style={s.leadItem}><Text style={[s.leadV, { color: '#3B82F6' }]}>{leads.conversionRate || 0}%</Text><Text style={[s.leadL, { color: T.muted }]}>Conversion</Text></View>
            <View style={s.leadItem}><Text style={[s.leadV, { color: '#F59E0B' }]}>{fmt(leads.pipelineValue)}</Text><Text style={[s.leadL, { color: T.muted }]}>Pipeline</Text></View>
          </View>
        </View>

        {/* Top Projects */}
        {topProjects.length > 0 && (
          <>
            <Text style={[s.sec, { color: T.ink }]}>🏆 Top Projects</Text>
            {topProjects.map((p: any, i: number) => (
              <TouchableOpacity key={p.id} style={[s.topRow, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}
                onPress={() => router.push({ pathname: '/(admin)/project-detail', params: { id: p.id } } as any)}>
                <Text style={[s.rank, { color: T.muted }]}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.topName, { color: T.ink }]}>{p.name}</Text>
                  <Text style={[s.topSub, { color: T.muted }]}>{p.status} • {p.priority}</Text>
                </View>
                <Text style={[s.topBudget, { color: '#10B981' }]}>{fmt(p.budget)}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Risk Alerts */}
        {riskAlerts.length > 0 && (
          <>
            <Text style={[s.sec, { color: T.ink }]}>⚠️ Risk Alerts</Text>
            {riskAlerts.map((a: any, i: number) => (
              <View key={i} style={[s.alertCard, { backgroundColor: a.severity === 'high' ? '#EF444415' : a.severity === 'medium' ? '#F59E0B15' : T.surfaceContainer, borderColor: a.severity === 'high' ? '#EF444440' : a.severity === 'medium' ? '#F59E0B40' : T.hairline }]}>
                <Ionicons name={a.severity === 'high' ? 'warning' : 'information-circle'} size={18} color={a.severity === 'high' ? '#EF4444' : '#F59E0B'} />
                <Text style={[s.alertText, { color: T.ink }]}>{a.message}</Text>
              </View>
            ))}
          </>
        )}

        {/* Top Clients */}
        {topClients.length > 0 && (
          <>
            <Text style={[s.sec, { color: T.ink }]}>👥 Top Clients</Text>
            {topClients.map((c: any, i: number) => (
              <View key={c.id} style={[s.topRow, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
                <Text style={[s.rank, { color: T.muted }]}>#{i + 1}</Text>
                <Text style={[s.topName, { color: T.ink, flex: 1 }]}>{c.name}</Text>
                <Text style={[s.topBudget, { color: '#10B981' }]}>{fmt(c.revenue)}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 },
  sec: { fontFamily: 'Inter_700Bold', fontSize: 16, marginTop: 20, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi: { width: '47%' as any, borderRadius: 14, padding: 14, borderWidth: 1 },
  kpiV: { fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 6 }, kpiL: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 2 },
  kpiS: { width: '30%' as any, borderRadius: 12, padding: 10, borderWidth: 1, alignItems: 'center' },
  kpiV2: { fontFamily: 'Inter_700Bold', fontSize: 20 }, kpiL2: { fontFamily: 'Inter_400Regular', fontSize: 9, marginTop: 2 },
  card: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 4 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 12 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartBar: { width: 20, borderRadius: 4, minHeight: 4 },
  chartLabel: { fontFamily: 'Inter_400Regular', fontSize: 8, marginTop: 4 },
  leadRow: { flexDirection: 'row', justifyContent: 'space-between' },
  leadItem: { alignItems: 'center' },
  leadV: { fontFamily: 'Inter_700Bold', fontSize: 18 }, leadL: { fontFamily: 'Inter_400Regular', fontSize: 9, marginTop: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 8, gap: 10 },
  rank: { fontFamily: 'Inter_700Bold', fontSize: 14, width: 28 },
  topName: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  topSub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  topBudget: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 8 },
  alertText: { fontFamily: 'Inter_500Medium', fontSize: 13, flex: 1 },
});
