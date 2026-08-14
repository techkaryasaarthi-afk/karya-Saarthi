/**
 * Operations Panel — SLA tracking, Vendor workload, SOP library, Inventory.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { operationsService, SLAData, VendorWorkload, InventoryItem, SOP } from '@/services/operations';
import { useAppTheme } from '@/utils/theme';

export default function OperationsScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sop' | 'inventory'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [slaData, setSlaData] = useState<SLAData>({ breached: 0, atRisk: 0, onTrack: 0 });
  const [vendors, setVendors] = useState<VendorWorkload[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await operationsService.getDashboard();
        setSlaData(res.sla || { breached: 0, atRisk: 0, onTrack: 0 });
        setVendors(res.vendorWorkload || []);
      } else if (activeTab === 'sop') {
        const res = await operationsService.getSOPs();
        setSops(res.sops || []);
      } else if (activeTab === 'inventory') {
        const res = await operationsService.getInventory();
        setInventory(res.inventory || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) => (
    <View style={[s.metricCard, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <Text style={[s.metricValue, { color }]}>{value}</Text>
      <Text style={[s.metricLabel, { color: T.muted }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: T.background }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.title, { color: T.ink }]}>⚙️ Operations</Text>
      </View>

      {/* Tabs */}
      <View style={[s.tabs, { borderBottomColor: T.hairline }]}>
        {['dashboard', 'sop', 'inventory'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && { borderBottomColor: T.brandGreen, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[s.tabText, { color: activeTab === tab ? T.brandGreen : T.muted, textTransform: 'capitalize' }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={T.brandGreen} style={{ marginTop: 50 }} />
        ) : activeTab === 'dashboard' ? (
          <>
            <Text style={[s.sectionTitle, { color: T.ink }]}>SLA Performance</Text>
            <View style={s.metricGrid}>
              <MetricCard icon="🔴" label="Breached" value={slaData.breached} color={T.error} />
              <MetricCard icon="⚠️" label="At Risk" value={slaData.atRisk} color={T.warning} />
              <MetricCard icon="✅" label="On Track" value={slaData.onTrack} color={T.success} />
            </View>

            <Text style={[s.sectionTitle, { color: T.ink, marginTop: 24 }]}>Team Workload Heatmap</Text>
            {vendors.length === 0 ? (
              <Text style={{ color: T.muted }}>No team members found</Text>
            ) : (
              vendors.map(v => {
                const load = Math.min((v.activeJobs / 8) * 100, 100);
                const heatColor = load > 75 ? T.error : load > 50 ? T.warning : load > 25 ? T.info : T.success;
                return (
                  <View key={v.id} style={[s.vendorCard, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
                    <View style={s.vendorHeader}>
                      <View style={[s.avatar, { backgroundColor: heatColor }]}><Text style={s.avatarText}>{v.fullname[0]}</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.vendorName, { color: T.ink }]}>{v.fullname}</Text>
                        <Text style={[s.vendorSub, { color: T.muted }]}>{v.activeJobs} active jobs</Text>
                      </View>
                    </View>
                    <View style={[s.barBg, { backgroundColor: T.hairline }]}>
                      <View style={[s.barFill, { width: `${load}%`, backgroundColor: heatColor }]} />
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : activeTab === 'sop' ? (
          <>
            <Text style={[s.sectionTitle, { color: T.ink }]}>SOP Library ({sops.length})</Text>
            {sops.map(sop => (
              <View key={sop.id} style={[s.sopCard, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
                <View style={s.sopHeader}>
                  <Text style={[s.sopTitle, { color: T.ink }]}>📋 {sop.title}</Text>
                  <Text style={[s.sopTag, { backgroundColor: T.hairline, color: T.ink }]}>v{sop.version}</Text>
                </View>
                <Text style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>Category: {sop.category}</Text>
                {sop.content && (
                  <View style={[s.sopContentBg, { backgroundColor: T.background }]}>
                    <Text style={[s.sopContent, { color: T.steel }]}>{sop.content}</Text>
                  </View>
                )}
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={[s.sectionTitle, { color: T.ink }]}>Inventory & Tools</Text>
            {inventory.map(item => (
              <View key={item.id} style={[s.invCard, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
                <View style={s.invHeader}>
                  <Text style={[s.invTitle, { color: T.ink }]}>{item.name}</Text>
                  <Text style={[s.invTag, { backgroundColor: item.status === 'active' ? T.success + '20' : T.error + '20', color: item.status === 'active' ? T.success : T.error }]}>
                    {item.status}
                  </Text>
                </View>
                <Text style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>Type: {item.type} • Vendor: {item.vendor || '—'}</Text>
                <Text style={[s.invCost, { color: T.ink }]}>Cost: ₹{item.cost?.toLocaleString() || 0}</Text>
                {item.renewal_date && <Text style={{ color: T.warning, fontSize: 12, marginTop: 4 }}>Renewal: {new Date(item.renewal_date).toLocaleDateString()}</Text>}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, marginBottom: 16 },
  tab: { paddingVertical: 12, marginRight: 24 },
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { width: '31%', padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  metricValue: { fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 8 },
  metricLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 2 },
  vendorCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  vendorHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
  vendorName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  vendorSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  sopCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  sopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sopTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  sopTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  sopContentBg: { marginTop: 12, padding: 12, borderRadius: 8 },
  sopContent: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  invCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  invHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  invTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontFamily: 'Inter_700Bold', overflow: 'hidden' },
  invCost: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginTop: 8 },
});
