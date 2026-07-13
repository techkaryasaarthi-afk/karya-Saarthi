/**
 * Customer Invoices Screen — View, filter, and pay invoices via Razorpay.
 * Mirrors the website dashboard/invoices experience.
 * Mintlify: Flat UI, hairline borders, ink text, brand green accents.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Badge from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';
import {
  getMyInvoicesApi, createRazorpayOrderApi, verifyPaymentApi,
  computeInvoiceKPIs, STATUS_CONFIG,
  type Invoice,
} from '@/services/invoices';
import { RAZORPAY_KEY, APP_INFO } from '@/utils/constants';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import Toast from 'react-native-toast-message';

type FilterType = 'all' | 'sent' | 'paid' | 'overdue';

const FILTERS: { key: FilterType; icon: string }[] = [
  { key: 'all', icon: '📋' },
  { key: 'sent', icon: '⏳' },
  { key: 'paid', icon: '✅' },
  { key: 'overdue', icon: '⚠️' },
];

export default function InvoicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const theme = useAppTheme();
  const s = useStyles(theme);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('all');
  const [payingId, setPayingId] = useState<number | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: getMyInvoicesApi,
    enabled: !!user,
    refetchInterval: 30000,
  });

  const invoices = data?.invoices || [];
  const filtered = invoices.filter(inv => filter === 'all' || inv.status === filter);
  const kpis = computeInvoiceKPIs(invoices);

  const getCount = (f: FilterType) =>
    f === 'all' ? invoices.length : invoices.filter(i => i.status === f).length;

  const handlePay = useCallback(async (invoice: Invoice) => {
    try {
      setPayingId(invoice.id);

      // 1. Create Razorpay order on the backend
      const order = await createRazorpayOrderApi(invoice.id);

      if (!order?.id) {
        Alert.alert('Error', 'Could not create payment order. Please try again.');
        return;
      }

      // 2. For mobile (without Razorpay native SDK), open in WebView / browser
      // The website handles payment at /api/payments/create-order, but for mobile
      // we'll use Linking to the website's payment page as a Razorpay checkout fallback.
      const paymentUrl = `${APP_INFO.WEBSITE}/dashboard/invoices?pay=${invoice.id}&orderId=${order.id}`;
      
      const canOpen = await Linking.canOpenURL(paymentUrl);
      if (canOpen) {
        await Linking.openURL(paymentUrl);
        // After user returns, refresh invoices
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['my-invoices'] });
          refetch();
        }, 3000);
      } else {
        Alert.alert('Error', 'Cannot open payment page. Please use the website to pay.');
      }

      Toast.show({
        type: 'info',
        text1: 'Payment Initiated',
        text2: 'Complete payment in the browser, then return to the app.',
      });
    } catch (err: any) {
      Alert.alert('Payment Error', err.message || 'Failed to initiate payment');
    } finally {
      setPayingId(null);
    }
  }, [queryClient, refetch]);

  const statusVariant = (status: string) => {
    if (status === 'paid') return 'success' as const;
    if (status === 'overdue') return 'error' as const;
    if (status === 'cancelled') return 'secondary' as const;
    return 'warning' as const;
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.ink} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Invoices</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.brandGreen} />}
      >
        {/* ── KPI Cards ──────────────────────── */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.kpiRow}
        >
          {[
            { label: 'Total', value: invoices.length, icon: 'receipt-outline', color: '#3B82F6' },
            { label: 'Paid', value: `₹${kpis.totalPaid.toLocaleString('en-IN')}`, icon: 'checkmark-circle', color: '#10B981' },
            { label: 'Pending', value: `₹${kpis.totalPending.toLocaleString('en-IN')}`, icon: 'time', color: '#F59E0B' },
            { label: 'Overdue', value: `₹${kpis.totalOverdue.toLocaleString('en-IN')}`, icon: 'alert-circle', color: '#EF4444' },
          ].map((kpi, i) => (
            <Animated.View key={kpi.label} entering={FadeInDown.delay(i * 80).duration(400)} style={s.kpiCard}>
              <Ionicons name={kpi.icon as any} size={22} color={kpi.color} />
              <Text style={[s.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
            </Animated.View>
          ))}
        </ScrollView>

        {/* ── Filter Pills ───────────────────── */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            const count = getCount(f.key);
            return (
              <TouchableOpacity
                key={f.key}
                style={[s.pill, isActive && s.pillActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={s.pillIcon}>{f.icon}</Text>
                <Text style={[s.pillText, isActive && s.pillTextActive]}>
                  {f.key === 'all' ? 'All' : STATUS_CONFIG[f.key]?.label || f.key}
                </Text>
                {count > 0 && (
                  <View style={[s.pillCount, isActive && s.pillCountActive]}>
                    <Text style={[s.pillCountText, isActive && s.pillCountTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Invoice List ────────────────────── */}
        <View style={s.listContainer}>
          {isLoading ? (
            <View style={s.loadingWrap}>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={s.skeleton} />
              ))}
            </View>
          ) : filtered.length === 0 ? (
            <View style={s.emptyWrap}>
              <Ionicons name="receipt-outline" size={56} color={theme.stone} />
              <Text style={s.emptyTitle}>
                {filter === 'all' ? 'No Invoices Yet' : `No ${STATUS_CONFIG[filter]?.label || filter} Invoices`}
              </Text>
              <Text style={s.emptySub}>
                {filter === 'all'
                  ? 'Your invoices will appear here once a project is created.'
                  : `You have no ${filter} invoices at this time.`}
              </Text>
              {filter !== 'all' && (
                <TouchableOpacity onPress={() => setFilter('all')} style={s.viewAllBtn}>
                  <Text style={s.viewAllText}>View All Invoices</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filtered.map((inv, i) => {
              const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.sent;
              const isOverdue = inv.status === 'overdue';
              const isPending = inv.status === 'sent';
              const canPay = isPending || isOverdue;
              const isPaying = payingId === inv.id;

              return (
                <Animated.View key={inv.id} entering={FadeInDown.delay(i * 60).duration(400)}>
                  <View style={[s.invoiceCard, isOverdue && s.invoiceCardOverdue]}>
                    <View style={s.invoiceTop}>
                      <View style={{ flex: 1 }}>
                        <View style={s.invoiceHeaderRow}>
                          <Text style={s.invoiceNumber}>{inv.invoice_number}</Text>
                          <Badge
                            text={`${cfg.icon} ${cfg.label}`}
                            variant={statusVariant(inv.status)}
                            size="sm"
                          />
                        </View>
                        <Text style={s.invoiceService}>
                          {inv.project?.service_type || 'Service'}
                        </Text>
                        <View style={s.invoiceMeta}>
                          <Text style={s.metaText}>
                            🗓 {new Date(inv.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </Text>
                          {inv.due_date && inv.status !== 'paid' && (
                            <Text style={[s.metaText, isOverdue && { color: '#EF4444' }]}>
                              📅 Due {new Date(inv.due_date).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short',
                              })}
                            </Text>
                          )}
                          {inv.paid_at && (
                            <Text style={[s.metaText, { color: '#22c55e' }]}>
                              ✅ Paid {new Date(inv.paid_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={s.invoiceBottom}>
                      <Text style={s.invoiceAmount}>
                        ₹{inv.total.toLocaleString('en-IN')}
                      </Text>
                      {canPay && (
                        <TouchableOpacity
                          style={[s.payBtn, isPaying && { opacity: 0.6 }]}
                          onPress={() => handlePay(inv)}
                          disabled={isPaying}
                          activeOpacity={0.8}
                        >
                          {isPaying ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Ionicons name="card" size={16} color="#fff" />
                              <Text style={s.payBtnText}>
                                Pay ₹{inv.total.toLocaleString('en-IN')}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Animated.View>
              );
            })
          )}
        </View>

        {/* Footer note */}
        {!isLoading && invoices.length > 0 && (
          <Text style={s.footerNote}>
            🔒 All payments are secured by Razorpay. For disputes, contact{' '}
            <Text
              style={s.footerLink}
              onPress={() => Linking.openURL('mailto:support@karyasaarthi.com')}
            >
              support@karyasaarthi.com
            </Text>
          </Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const HP = spacing.containerMargin;
const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: HP, paddingVertical: spacing.md, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.headlineMd, color: theme.ink },

  // KPI
  kpiRow: { paddingHorizontal: HP, gap: 10, paddingVertical: spacing.md },
  kpiCard: { width: 120, backgroundColor: theme.white, borderRadius: radius.lg, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: theme.hairline },
  kpiValue: { ...typography.headlineSm, fontWeight: '700' },
  kpiLabel: { ...typography.labelSm, color: theme.stone },

  // Filters
  filterRow: { paddingHorizontal: HP, gap: 8, paddingBottom: spacing.md },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: theme.hairline, backgroundColor: theme.white },
  pillActive: { backgroundColor: 'rgba(0,212,164,0.1)', borderColor: theme.brandGreen },
  pillIcon: { fontSize: 14 },
  pillText: { ...typography.labelMd, color: theme.stone },
  pillTextActive: { color: theme.ink, fontWeight: '700' },
  pillCount: { backgroundColor: theme.surfaceContainer, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  pillCountActive: { backgroundColor: theme.brandGreen },
  pillCountText: { fontSize: 11, fontWeight: '700', color: theme.stone },
  pillCountTextActive: { color: theme.primary },

  // List
  listContainer: { paddingHorizontal: HP, gap: 12 },
  loadingWrap: { gap: 12 },
  skeleton: { height: 100, borderRadius: radius.lg, backgroundColor: theme.surfaceContainer },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { ...typography.headlineMd, color: theme.ink, marginTop: spacing.md },
  emptySub: { ...typography.bodySm, color: theme.stone, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
  viewAllBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.full, borderWidth: 1, borderColor: theme.hairline },
  viewAllText: { ...typography.labelMd, color: theme.ink },

  // Invoice Card
  invoiceCard: { backgroundColor: theme.white, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: theme.hairline },
  invoiceCardOverdue: { borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  invoiceTop: { flexDirection: 'row', gap: 12 },
  invoiceHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  invoiceNumber: { ...typography.labelLg, color: theme.ink, fontFamily: 'monospace', fontWeight: '700' },
  invoiceService: { ...typography.bodySm, color: theme.stone, marginBottom: 6 },
  invoiceMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaText: { ...typography.labelSm, color: theme.stone },

  invoiceBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.hairline },
  invoiceAmount: { ...typography.headlineMd, color: theme.ink },
  payBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF6B35', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.full },
  payBtnText: { ...typography.labelMd, color: '#fff', fontWeight: '700' },

  // Footer
  footerNote: { ...typography.bodySm, color: theme.stone, textAlign: 'center', marginTop: 20, paddingHorizontal: HP },
  footerLink: { color: '#3B82F6', fontWeight: '600' },
});
