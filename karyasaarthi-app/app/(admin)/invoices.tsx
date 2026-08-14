/**
 * Admin Invoices — List and manage invoices. Styled per DESIGN.md.
 */
import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getInvoicesApi } from '@/services/admin';
import { useAppTheme } from '@/utils/theme';

export default function AdminInvoicesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const { data: invoices = [], refetch, isRefetching } = useQuery({ queryKey: ['admin-invoices'], queryFn: getInvoicesApi });
  const stColor = (st: string) => st === 'paid' ? T.success : st === 'overdue' ? T.error : T.warning;

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: T.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}><TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: T.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity><Text style={{ flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20, color: T.ink }}>Invoices</Text><Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 13 }}>{invoices.length}</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {invoices.length === 0 ? (<View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}><Ionicons name="receipt-outline" size={56} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>No invoices</Text></View>) : invoices.map((inv: any) => (
          <View key={inv.id} style={{ marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1, backgroundColor: T.surfaceContainer, borderColor: T.hairline }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: T.ink }}>#{inv.invoice_number || inv.id}</Text><View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, backgroundColor: stColor(inv.status) + '20' }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: stColor(inv.status), textTransform: 'capitalize' }}>{inv.status}</Text></View></View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: T.steel, marginTop: 6 }}>{inv.client_name || inv.customer_name || '—'}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: T.brandGreen }}>₹{inv.amount?.toLocaleString() || 0}</Text><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: T.muted }}>{inv.due_date || inv.created_at ? new Date(inv.due_date || inv.created_at).toLocaleDateString() : ''}</Text></View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
