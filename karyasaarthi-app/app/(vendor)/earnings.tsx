/**
 * Vendor Earnings — Live API-powered payment history and earnings stats.
 * Mirrors the website's vendor earnings tab with KPI cards, monthly chart, and payment history.
 * Mintlify: Flat UI, hairline borders, ink text, brand green accents.
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/ui/Card';
import api from '@/services/api';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';

const { width: SCREEN_W } = Dimensions.get('window');

interface EarningsData {
  totalEarned: number;
  totalPayments: number;
  pendingAmount: number;
  completedProjects: number;
}
interface MonthlyData { month: string; amount: number; count: number }
interface Payment { id: number; amount: number; status: string; created_at: string; razorpay_payment_id: string; description: string }

export default function VendorEarnings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useAppTheme();
  const s = useStyles(theme);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['vendor-earnings'],
    queryFn: async () => {
      const { data } = await api.get('/api/vendor/earnings');
      return {
        earnings: (data?.earnings || {}) as EarningsData,
        monthly: (data?.monthly || []) as MonthlyData[],
        payments: (data?.payments || []) as Payment[],
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const earnings = data?.earnings || { totalEarned: 0, totalPayments: 0, pendingAmount: 0, completedProjects: 0 };
  const monthly = data?.monthly || [];
  const payments = data?.payments || [];

  const KPI_CARDS = [
    { label: 'Total Earned', value: `₹${(earnings.totalEarned || 0).toLocaleString('en-IN')}`, icon: 'trending-up', color: '#10B981' },
    { label: 'Released', value: `₹${(earnings.totalPayments || 0).toLocaleString('en-IN')}`, icon: 'checkmark-circle', color: '#3B82F6' },
    { label: 'Pending', value: `₹${(earnings.pendingAmount || 0).toLocaleString('en-IN')}`, icon: 'time', color: '#F59E0B' },
    { label: 'Completed', value: String(earnings.completedProjects || 0), icon: 'briefcase', color: '#8B5CF6' },
  ];

  const maxMonthly = Math.max(...monthly.map(m => m.amount), 1);

  return (
    <View style={[s.container, { paddingTop: 0 }]}>
      <LinearGradient
        colors={[theme.heroDarkFrom, theme.heroDarkTo, '#1a4a3a']}
        style={[s.header, { paddingTop: insets.top + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={'rgba(255,255,255,0.9)'} />
        </TouchableOpacity>
        <Text style={s.title}>Earnings</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.brandGreen} />}
      >
        {isLoading ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator size="large" color={theme.brandGreen} />
            <Text style={[s.emptyText, { marginTop: 12 }]}>Loading earnings...</Text>
          </View>
        ) : (
          <>
            {/* ── KPI Cards ──────────────────────── */}
            <View style={s.kpiGrid}>
              {KPI_CARDS.map((kpi, i) => (
                <Animated.View key={kpi.label} entering={FadeInDown.delay(i * 80).duration(400)} style={s.kpiCard}>
                  <Ionicons name={kpi.icon as any} size={22} color={kpi.color} />
                  <Text style={[s.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                  <Text style={s.kpiLabel}>{kpi.label}</Text>
                </Animated.View>
              ))}
            </View>

            {/* ── Monthly Chart ──────────────────── */}
            {monthly.length > 0 && (
              <Card variant="flat" style={s.chartCard}>
                <Text style={s.sectionTitle}>Monthly Earnings</Text>
                <View style={s.chartWrap}>
                  {monthly.map((m, i) => (
                    <View key={m.month} style={s.barCol}>
                      <Text style={s.barLabel}>
                        {m.amount > 0 ? `₹${(m.amount / 1000).toFixed(0)}k` : ''}
                      </Text>
                      <View
                        style={[
                          s.bar,
                          {
                            height: Math.max((m.amount / maxMonthly) * 80, 4),
                            backgroundColor: i % 2 === 0 ? theme.brandGreen : theme.primary,
                          },
                        ]}
                      />
                      <Text style={s.barMonth}>{m.month}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* ── Payment History ────────────────── */}
            <Text style={s.sectionTitle}>Payment History</Text>
            <View style={s.listCard}>
              {payments.length === 0 ? (
                <View style={s.emptyWrap}>
                  <Ionicons name="wallet-outline" size={40} color={theme.stone} />
                  <Text style={s.emptyText}>No payments yet</Text>
                </View>
              ) : (
                payments.map((pay, i) => (
                  <Animated.View key={pay.id} entering={FadeInDown.delay(i * 60).duration(400)}>
                    <View style={[s.paymentItem, i === payments.length - 1 && { borderBottomWidth: 0 }]}>
                      <View style={s.payIcon}>
                        <Ionicons name="checkmark-circle" size={18} color={theme.brandGreen} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.payName}>{pay.description || 'Project Payment'}</Text>
                        <Text style={s.payDate}>
                          {new Date(pay.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                          {pay.razorpay_payment_id ? ` · ${pay.razorpay_payment_id}` : ''}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={s.payAmount}>₹{(pay.amount || 0).toLocaleString('en-IN')}</Text>
                        <Text style={s.payStatus}>received</Text>
                      </View>
                    </View>
                  </Animated.View>
                ))
              )}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const HP = spacing.containerMargin;
const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: HP, paddingBottom: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.headlineMd, color: '#ffffff' },
  content: { paddingHorizontal: HP, paddingTop: spacing.lg },

  // KPIs
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.lg },
  kpiCard: { width: (SCREEN_W - HP * 2 - 10) / 2, borderRadius: radius.xl, padding: 18, alignItems: 'flex-start', gap: 8, borderWidth: 1, borderColor: theme.hairline, backgroundColor: theme.white },
  kpiValue: { ...typography.headlineMd, fontWeight: '700' },
  kpiLabel: { ...typography.labelSm, color: theme.stone },

  // Chart
  chartCard: { padding: 18, backgroundColor: theme.white, borderWidth: 1, borderColor: theme.hairline, borderRadius: radius.lg, marginBottom: spacing.lg },
  chartWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 110, marginTop: spacing.md },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barLabel: { ...typography.labelSm, color: theme.stone, fontSize: 9, fontWeight: '700' },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barMonth: { ...typography.labelSm, color: theme.stone, fontSize: 9 },

  // Section
  sectionTitle: { ...typography.headlineMd, color: theme.ink, marginBottom: spacing.sm },

  // List
  listCard: { backgroundColor: theme.white, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.hairline, paddingHorizontal: HP },
  paymentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.hairline, gap: 12 },
  payIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: 'rgba(0,212,164,0.1)', alignItems: 'center', justifyContent: 'center' },
  payName: { ...typography.labelLg, color: theme.ink },
  payDate: { ...typography.bodySm, color: theme.stone, marginTop: 2 },
  payAmount: { ...typography.headlineSm, color: theme.brandGreen, fontWeight: '700' },
  payStatus: { ...typography.labelSm, color: theme.brandGreen, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { ...typography.bodySm, color: theme.stone, marginTop: 10 },
});
