/**
 * Finance Panel — Revenue KPIs with real invoice data from API.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const router = useRouter();

  const { data, refetch, isRefetching, isLoading } = useQuery({
    queryKey: ['finance-dashboard'],
    queryFn: async () => {
      try {
        const [invRes, projRes] = await Promise.all([
          api.get(`${ADMIN_ENDPOINTS.INVOICES}?limit=100`).catch(() => ({ data: { invoices: [] } })),
          api.get(`${ADMIN_ENDPOINTS.PROJECTS}?limit=200`).catch(() => ({ data: { projects: [] } })),
        ]);
        const invoices = invRes.data?.invoices || invRes.data || [];
        const projects = projRes.data?.projects || [];

        const paid = invoices.filter((i: any) => i.status === 'paid');
        const pending = invoices.filter((i: any) => i.status === 'sent');
        const drafts = invoices.filter((i: any) => i.status === 'draft');
        const overdue = invoices.filter((i: any) => i.status !== 'paid' && i.due_date && new Date(i.due_date) < new Date());

        const sum = (arr: any[]) => arr.reduce((s, i) => s + (Number(i.total || i.amount || 0)), 0);
        const totalBudget = projects.reduce((s: number, p: any) => s + Number(p.budget || 0), 0);
        const totalVendor = projects.reduce((s: number, p: any) => s + Number(p.vendor_price || 0), 0);

        return {
          collected: sum(paid), pending: sum(pending), overdue: sum(overdue),
          draftCount: drafts.length, totalInvoices: invoices.length,
          totalBudget, totalVendor, margin: totalBudget - totalVendor,
          recentInvoices: invoices.slice(0, 5),
          activeProjects: projects.filter((p: any) => !['completed','delivered','cancelled'].includes(p.status)).length,
        };
      } catch { return { collected: 0, pending: 0, overdue: 0, draftCount: 0, totalInvoices: 0, totalBudget: 0, totalVendor: 0, margin: 0, recentInvoices: [], activeProjects: 0 }; }
    },
  });

  const d = data || { collected: 0, pending: 0, overdue: 0, draftCount: 0, totalInvoices: 0, totalBudget: 0, totalVendor: 0, margin: 0, recentInvoices: [], activeProjects: 0 };
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: T.surfaceContainer }]}>
          <Ionicons name="arrow-back" size={22} color={T.ink} />
        </TouchableOpacity>
        <Text style={[s.title, { color: T.ink }]}>Finance</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Revenue KPIs */}
        <View style={s.kpiGrid}>
          {[
            { icon: '✅', label: 'Collected', value: fmt(d.collected), color: '#10B981' },
            { icon: '⏳', label: 'Pending', value: fmt(d.pending), color: '#F59E0B' },
            { icon: '⚠️', label: 'Overdue', value: fmt(d.overdue), color: '#EF4444' },
            { icon: '📄', label: 'Drafts', value: String(d.draftCount), color: '#6B7280' },
          ].map(kpi => (
            <View key={kpi.label} style={[s.kpi, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
              <Text style={{ fontSize: 22 }}>{kpi.icon}</Text>
              <Text style={[s.kpiVal, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={[s.kpiLabel, { color: T.muted }]}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Project Economics */}
        <Text style={[s.secTitle, { color: T.ink }]}>📊 Project Economics</Text>
        <View style={[s.ecoCard, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
          <View style={s.ecoRow}><Text style={[s.ecoLabel, { color: T.muted }]}>Total Project Budgets</Text><Text style={[s.ecoVal, { color: T.ink }]}>{fmt(d.totalBudget)}</Text></View>
          <View style={s.ecoRow}><Text style={[s.ecoLabel, { color: T.muted }]}>Total Vendor Costs</Text><Text style={[s.ecoVal, { color: '#EF4444' }]}>{fmt(d.totalVendor)}</Text></View>
          <View style={[s.ecoRow, { borderTopWidth: 1, borderTopColor: T.hairline, paddingTop: 10, marginTop: 4 }]}>
            <Text style={[s.ecoLabel, { color: T.ink, fontFamily: 'Inter_700Bold' }]}>Net Margin</Text>
            <Text style={[s.ecoVal, { color: '#10B981', fontFamily: 'Inter_700Bold', fontSize: 18 }]}>{fmt(d.margin)}</Text>
          </View>
          <Text style={[s.ecoSub, { color: T.muted }]}>{d.activeProjects} active projects • {d.totalInvoices} total invoices</Text>
        </View>

        {/* Recent Invoices */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <Text style={[s.secTitle, { color: T.ink, marginBottom: 0 }]}>🧾 Recent Invoices</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/invoices')}><Text style={{ color: T.brandGreen, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>View All →</Text></TouchableOpacity>
        </View>
        {d.recentInvoices.length === 0 ? (
          <Text style={[s.empty, { color: T.muted }]}>No invoices yet</Text>
        ) : d.recentInvoices.map((inv: any) => (
          <View key={inv.id} style={[s.invCard, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.invNum, { color: T.ink }]}>{inv.invoice_number || `INV-${String(inv.id).padStart(4,'0')}`}</Text>
              <Text style={[s.invClient, { color: T.muted }]}>{typeof inv.client === 'object' ? inv.client?.fullname : inv.client_name || ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[s.invAmt, { color: T.ink }]}>{fmt(inv.total || inv.amount || 0)}</Text>
              <View style={[s.badge, { backgroundColor: (inv.status === 'paid' ? '#10B981' : inv.status === 'sent' ? '#3B82F6' : '#6B7280') + '20' }]}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: inv.status === 'paid' ? '#10B981' : inv.status === 'sent' ? '#3B82F6' : '#6B7280' }}>{(inv.status || 'draft').toUpperCase()}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1 },
  hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi: { width: '47%' as any, borderRadius: 14, padding: 16, borderWidth: 1 },
  kpiVal: { fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 6 },
  kpiLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  secTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, marginTop: 24, marginBottom: 12 },
  ecoCard: { borderRadius: 14, padding: 16, borderWidth: 1 },
  ecoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ecoLabel: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  ecoVal: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  ecoSub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 8 },
  invCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, borderWidth: 1, marginTop: 8 },
  invNum: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  invClient: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  invAmt: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 12 },
});
