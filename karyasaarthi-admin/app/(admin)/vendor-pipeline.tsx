/**
 * Admin Vendor Pipeline — Dashboard to manage vendor hiring process.
 * Shows pipeline overview cards, filterable application list.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Avatar from '@/components/ui/Avatar';
import { getVendorApplications } from '@/services/vendor-pipeline';

const STATUS_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  submitted: { icon: 'document-text', color: '#2563EB', bg: '#DBEAFE', label: 'Submitted' },
  under_review: { icon: 'eye', color: '#D97706', bg: '#FEF3C7', label: 'Under Review' },
  interview_scheduled: { icon: 'calendar', color: '#4F46E5', bg: '#E0E7FF', label: 'Interview' },
  interview_done: { icon: 'checkmark-circle', color: '#92400E', bg: '#FDE68A', label: 'Interviewed' },
  selected: { icon: 'star', color: '#059669', bg: '#D1FAE5', label: 'Selected' },
  onboarding: { icon: 'rocket', color: '#0891B2', bg: '#CFFAFE', label: 'Onboarding' },
  active: { icon: 'shield-checkmark', color: '#059669', bg: '#D1FAE5', label: 'Active' },
  rejected: { icon: 'close-circle', color: '#DC2626', bg: '#FEE2E2', label: 'Rejected' },
};

const FILTERS = ['all', 'submitted', 'under_review', 'interview_scheduled', 'selected', 'onboarding', 'active', 'rejected'];

export default function VendorPipelineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['vendor-pipeline', filter, search],
    queryFn: () => getVendorApplications({ status: filter === 'all' ? undefined : filter, search: search || undefined }),
    staleTime: 1000 * 60 * 2,
  });

  const applications = data?.applications || [];
  const statusCounts = data?.statusCounts || {};
  const totalApps = Object.values(statusCounts).reduce((a: number, b: any) => a + b, 0);

  const overviewCards = [
    { key: 'total', label: 'Total', count: totalApps, color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
    { key: 'submitted', label: 'New', count: statusCounts.submitted || 0, color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
    { key: 'under_review', label: 'Review', count: (statusCounts.under_review || 0) + (statusCounts.interview_scheduled || 0), color: '#D97706', bg: 'rgba(217,119,6,0.12)' },
    { key: 'active', label: 'Active', count: statusCounts.active || 0, color: '#059669', bg: 'rgba(5,150,105,0.12)' },
    { key: 'rejected', label: 'Rejected', count: statusCounts.rejected || 0, color: '#DC2626', bg: 'rgba(220,38,38,0.12)' },
  ];

  return (
    <View style={[st.c, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={st.hdr}>
        <Text style={st.title}>Vendor Pipeline</Text>
        <Text style={st.count}>{totalApps} applications</Text>
      </View>

      {/* Overview cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.overviewRow}>
        {overviewCards.map((card) => (
          <View key={card.key} style={[st.overviewCard, { backgroundColor: card.bg }]}>
            <Text style={[st.overviewCount, { color: card.color }]}>{card.count}</Text>
            <Text style={st.overviewLabel}>{card.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Search */}
      <View style={st.searchRow}>
        <View style={st.searchBox}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
          <TextInput
            style={st.searchInput}
            placeholder="Search by name, email, ID..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[st.filterPill, filter === f && st.filterPillActive]} onPress={() => setFilter(f)}>
            <Text style={[st.filterText, filter === f && st.filterTextActive]}>
              {f === 'all' ? 'All' : (STATUS_CONFIG[f]?.label || f)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Application list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}
      >
        {applications.length === 0 ? (
          <View style={st.empty}>
            <Ionicons name="people-circle-outline" size={56} color="rgba(255,255,255,0.15)" />
            <Text style={st.emptyText}>No applications found</Text>
          </View>
        ) : (
          applications.map((app: any) => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted;
            return (
              <TouchableOpacity
                key={app.id}
                style={st.card}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/(admin)/vendor-application-detail', params: { id: app.id } } as any)}
              >
                <Avatar name={app.fullname} size={42} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={st.name} numberOfLines={1}>{app.fullname}</Text>
                    <View style={[st.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
                      <Text style={[st.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  <Text style={st.email}>{app.email}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={st.vendorIdText}>{app.vendor_id || '—'}</Text>
                    <Text style={st.dateText}>{new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                  </View>
                  {app.total_score != null && (
                    <View style={st.scoreRow}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={st.scoreText}>Score: {app.total_score}/50</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' },
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFF' },
  count: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.4)' },

  // Overview
  overviewRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 10 },
  overviewCard: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, alignItems: 'center', minWidth: 70 },
  overviewCount: { fontFamily: 'Inter_800ExtraBold', fontSize: 20 },
  overviewLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  // Search
  searchRow: { paddingHorizontal: 20, marginBottom: 8 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 12, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFF', paddingVertical: 10 },

  // Filters
  filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 10 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  filterPillActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  filterText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  filterTextActive: { color: '#0F172A', fontWeight: '700' },

  // Cards
  card: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 20, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.9)', flex: 1, marginRight: 8 },
  email: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  vendorIdText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#818CF8' },
  dateText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  scoreText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#F59E0B' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: 'rgba(255,255,255,0.5)' },
});
