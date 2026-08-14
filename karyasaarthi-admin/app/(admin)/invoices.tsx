/**
 * Admin Invoices Screen — Full invoice management with line items, GST, status flow.
 * Matches web admin finance/invoices panel.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';
import { useRouter } from 'expo-router';

interface LineItem { description: string; quantity: number; unit_price: number; }

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: '#6B7280' },
  sent: { label: 'Sent', color: '#3B82F6' },
  paid: { label: 'Paid', color: '#10B981' },
  overdue: { label: 'Overdue', color: '#EF4444' },
  cancelled: { label: 'Cancelled', color: '#9CA3AF' },
};

export default function AdminInvoicesScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const qc = useQueryClient();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: 1, unit_price: 0 }]);

  const { data: invoiceData, refetch, isRefetching } = useQuery({
    queryKey: ['admin-invoices', statusFilter],
    queryFn: async () => {
      try {
        const params = statusFilter !== 'all' ? `?status=${statusFilter}&limit=50` : '?limit=50';
        const { data } = await api.get(`${ADMIN_ENDPOINTS.INVOICES}${params}`);
        return { invoices: data?.invoices || data || [], summary: data?.summary || null };
      } catch { return { invoices: [], summary: null }; }
    },
  });

  const invoices = invoiceData?.invoices || [];
  const summary = invoiceData?.summary || { total: 0, pending: 0, overdue: 0, draft: 0 };

  const createMut = useMutation({
    mutationFn: async () => {
      const payload = { client_id: clientId, items, due_date: dueDate || null, notes };
      await api.post(ADMIN_ENDPOINTS.INVOICES, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      setShowCreate(false);
      resetForm();
      Alert.alert('Success', 'Invoice created as draft');
    },
    onError: () => Alert.alert('Error', 'Failed to create invoice'),
  });

  const updateStatusMut = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.patch(`${ADMIN_ENDPOINTS.INVOICES}/${id}`, { status });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-invoices'] }); refetch(); },
    onError: () => Alert.alert('Error', 'Failed to update status'),
  });

  const resetForm = () => {
    setClientId(''); setDueDate(''); setNotes('');
    setItems([{ description: '', quantity: 1, unit_price: 0 }]);
  };

  const addItem = () => setItems(p => [...p, { description: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, val: string | number) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const subtotal = items.reduce((a, i) => a + (i.quantity * i.unit_price), 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const statusClr = (st: string) => STATUS_CFG[st]?.color || '#6B7280';

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: T.surfaceContainer }]}>
          <Ionicons name="arrow-back" size={22} color={T.ink} />
        </TouchableOpacity>
        <Text style={[s.title, { color: T.ink }]}>Invoices</Text>
        <TouchableOpacity style={[s.addBtn, { backgroundColor: T.brandGreen }]} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={20} color={T.surface} />
        </TouchableOpacity>
      </View>

      {/* Summary KPIs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Collected', value: `₹${(summary.total || 0).toLocaleString('en-IN')}`, icon: '✅', color: '#10B981' },
          { label: 'Pending', value: `₹${(summary.pending || 0).toLocaleString('en-IN')}`, icon: '⏳', color: '#F59E0B' },
          { label: 'Overdue', value: `₹${(summary.overdue || 0).toLocaleString('en-IN')}`, icon: '⚠️', color: '#EF4444' },
          { label: 'Drafts', value: String(summary.draft || 0), icon: '📄', color: '#6B7280' },
        ].map(kpi => (
          <View key={kpi.label} style={[s.kpiCard, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <Text style={{ fontSize: 18 }}>{kpi.icon}</Text>
            <Text style={[s.kpiVal, { color: kpi.color }]}>{kpi.value}</Text>
            <Text style={[s.kpiLabel, { color: T.muted }]}>{kpi.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Status filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6, marginBottom: 12 }}>
        {['all', 'draft', 'sent', 'paid', 'overdue'].map(st => (
          <TouchableOpacity key={st} style={[s.filterChip, { backgroundColor: statusFilter === st ? T.brandGreen + '20' : T.surfaceContainer, borderColor: statusFilter === st ? T.brandGreen : T.hairline }]} onPress={() => setStatusFilter(st)}>
            <Text style={[s.filterText, { color: statusFilter === st ? T.brandGreen : T.steel }]}>{st === 'all' ? 'All' : STATUS_CFG[st]?.label || st}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {invoices.length === 0 ? (
          <View style={s.empty}><Ionicons name="receipt-outline" size={56} color={T.hairline} /><Text style={[s.et, { color: T.muted }]}>No invoices</Text></View>
        ) : invoices.map((inv: any) => {
          const cfg = STATUS_CFG[inv.status] || STATUS_CFG.draft;
          const isOverdue = inv.status !== 'paid' && inv.due_date && new Date(inv.due_date) < new Date();
          const displayStatus = isOverdue ? 'overdue' : inv.status;
          const displayColor = isOverdue ? '#EF4444' : cfg.color;
          return (
            <View key={inv.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
              <View style={s.cardH}>
                <View style={[s.invIcon, { backgroundColor: T.brandGreen + '15' }]}><Ionicons name="receipt" size={20} color={T.brandGreen} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.invId, { color: T.ink }]}>{inv.invoice_number || `INV-${String(inv.id).padStart(4, '0')}`}</Text>
                  <Text style={[s.invClient, { color: T.muted }]}>
                    {typeof inv.client === 'object' ? inv.client?.fullname : inv.client_name || 'Customer'}
                  </Text>
                  {!!inv.project && <Text style={[s.invProject, { color: T.steel }]}>{typeof inv.project === 'object' ? inv.project?.service_type : inv.project_name || ''}</Text>}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.invAmount, { color: T.ink }]}>₹{(inv.total || inv.amount || 0).toLocaleString('en-IN')}</Text>
                  <View style={[s.statusBadge, { backgroundColor: displayColor + '20' }]}>
                    <Text style={[s.statusText, { color: displayColor }]}>{isOverdue ? '⚠️ Overdue' : cfg.label}</Text>
                  </View>
                </View>
              </View>
              <View style={s.cardMeta}>
                <Text style={[s.invDate, { color: T.muted }]}>{inv.due_date ? `Due: ${new Date(inv.due_date).toLocaleDateString('en-IN')}` : ''}</Text>
                <View style={s.cardActions}>
                  {inv.status === 'draft' && (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#3B82F620' }]} onPress={() => updateStatusMut.mutate({ id: inv.id, status: 'sent' })}>
                      <Text style={[s.actionText, { color: '#3B82F6' }]}>Send</Text>
                    </TouchableOpacity>
                  )}
                  {inv.status === 'sent' && (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#10B98120' }]} onPress={() => updateStatusMut.mutate({ id: inv.id, status: 'paid' })}>
                      <Text style={[s.actionText, { color: '#10B981' }]}>Mark Paid</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Invoice Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={s.mo}><View style={[s.mc, { backgroundColor: T.background }]}>
          <View style={s.mh}>
            <Text style={[s.mtt, { color: T.ink }]}>🧾 Create Invoice</Text>
            <TouchableOpacity onPress={() => { setShowCreate(false); resetForm(); }}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[s.fl, { color: T.muted }]}>Client User ID *</Text>
            <TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Client user ID" placeholderTextColor={T.muted} keyboardType="numeric" value={clientId} onChangeText={setClientId} />

            <Text style={[s.fl, { color: T.muted }]}>Due Date</Text>
            <TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="YYYY-MM-DD" placeholderTextColor={T.muted} value={dueDate} onChangeText={setDueDate} />

            <Text style={[s.fl, { color: T.muted }]}>Line Items</Text>
            {items.map((item, i) => (
              <View key={i} style={[s.lineItemRow, { borderColor: T.hairline }]}>
                <TextInput style={[s.lineInput, { flex: 3, backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Description" placeholderTextColor={T.muted} value={item.description} onChangeText={v => updateItem(i, 'description', v)} />
                <TextInput style={[s.lineInput, { flex: 1, backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Qty" placeholderTextColor={T.muted} keyboardType="numeric" value={String(item.quantity)} onChangeText={v => updateItem(i, 'quantity', parseInt(v) || 0)} />
                <TextInput style={[s.lineInput, { flex: 1.5, backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Rate ₹" placeholderTextColor={T.muted} keyboardType="numeric" value={String(item.unit_price)} onChangeText={v => updateItem(i, 'unit_price', parseFloat(v) || 0)} />
                <TouchableOpacity onPress={() => removeItem(i)} style={s.removeBtn}>
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addItem} style={{ marginTop: 8 }}>
              <Text style={[s.addItemText, { color: T.brandGreen }]}>+ Add item</Text>
            </TouchableOpacity>

            {/* Totals */}
            <View style={[s.totalsBox, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
              <View style={s.totalRow}><Text style={[s.totalLabel, { color: T.muted }]}>Subtotal</Text><Text style={[s.totalVal, { color: T.ink }]}>₹{subtotal.toLocaleString('en-IN')}</Text></View>
              <View style={s.totalRow}><Text style={[s.totalLabel, { color: T.muted }]}>GST (18%)</Text><Text style={[s.totalVal, { color: T.ink }]}>₹{gst.toFixed(2)}</Text></View>
              <View style={[s.totalRow, { borderTopWidth: 1, borderTopColor: T.hairline, paddingTop: 8, marginTop: 4 }]}>
                <Text style={[s.totalLabel, { color: T.ink, fontFamily: 'Inter_700Bold' }]}>Total</Text>
                <Text style={[s.totalVal, { color: T.brandGreen, fontFamily: 'Inter_700Bold', fontSize: 16 }]}>₹{total.toFixed(2)}</Text>
              </View>
            </View>

            <Text style={[s.fl, { color: T.muted }]}>Notes</Text>
            <TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink, height: 60, textAlignVertical: 'top' }]} placeholder="Payment terms, notes..." placeholderTextColor={T.muted} multiline value={notes} onChangeText={setNotes} />

            <TouchableOpacity style={[s.submitBtn, { backgroundColor: T.brandGreen }]} onPress={() => {
              if (!clientId) { Alert.alert('Required', 'Client ID is required'); return; }
              createMut.mutate();
            }}>
              <Text style={[s.submitText, { color: T.surface }]}>{createMut.isPending ? 'Creating...' : '🧾 Create Invoice (Draft)'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1 },
  hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  kpiCard: { width: 130, borderRadius: 14, padding: 14, borderWidth: 1 },
  kpiVal: { fontFamily: 'Inter_700Bold', fontSize: 16, marginTop: 4 },
  kpiLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  filterText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  et: { fontFamily: 'Inter_600SemiBold', fontSize: 18 },
  card: { marginHorizontal: 20, marginBottom: 12, borderRadius: 14, padding: 16, borderWidth: 1 },
  cardH: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  invIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  invId: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  invClient: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  invProject: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 1 },
  invAmount: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, textTransform: 'capitalize' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  invDate: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  cardActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  mc: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mtt: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6, marginTop: 14 },
  inp: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1 },
  lineItemRow: { flexDirection: 'row', gap: 6, marginBottom: 8, alignItems: 'center' },
  lineInput: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, fontFamily: 'Inter_400Regular', fontSize: 12, borderWidth: 1 },
  removeBtn: { padding: 4 },
  addItemText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  totalsBox: { borderRadius: 12, padding: 14, marginTop: 14, borderWidth: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalLabel: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  totalVal: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});
