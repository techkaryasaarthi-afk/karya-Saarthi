/**
 * Admin Services Screen — Service catalog management.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Switch, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import Badge from '@/components/ui/Badge';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';
import { useRouter } from 'expo-router';

export default function AdminServicesScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const T = useAppTheme();
  const router = useRouter();
  
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', price_range: '' });
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => { const { data } = await api.get(ADMIN_ENDPOINTS.SERVICES); return data?.services || data || []; },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => { await api.put(`${ADMIN_ENDPOINTS.SERVICES}/${id}`, { is_active: !active }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); Toast.show({ type: 'success', text1: 'Service updated' }); },
  });

  const createMut = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(ADMIN_ENDPOINTS.SERVICES, data);
      return res.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); setShowApply(false); setForm({ title: '', category: '', price_range: '' }); Alert.alert('Success', 'Service created'); },
    onError: () => Alert.alert('Error', 'Failed to create service'),
  });

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: T.surfaceContainer }]}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity>
        <Text style={[s.title, { color: T.ink }]}>Services</Text>
        <TouchableOpacity style={[s.applyBtn, { backgroundColor: T.brandGreen }]} onPress={() => setShowApply(true)}><Ionicons name="add" size={20} color={T.surface} /></TouchableOpacity>
      </View>
      <FlatList
        data={data || []}
        keyExtractor={(i: any) => String(i.id)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}
        contentContainerStyle={s.list}
        renderItem={({ item }: { item: any }) => (
          <View style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.name, { color: T.ink }]}>{item.name || item.title}</Text>
              <Text style={[s.cat, { color: T.muted }]}>{item.category || 'General'}</Text>
              <Text style={[s.price, { color: T.brandGreen }]}>{item.price_range || '₹TBD'}</Text>
            </View>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Badge text={item.is_active ? 'Active' : 'Off'} variant={item.is_active ? 'success' : 'neutral'} size="sm" />
              <Switch
                value={!!item.is_active}
                onValueChange={() => toggle.mutate({ id: item.id, active: item.is_active })}
                trackColor={{ false: T.hairline, true: T.success + '80' }}
                thumbColor={item.is_active ? T.success : T.muted}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="construct-outline" size={48} color={T.hairline} /><Text style={[s.emptyT, { color: T.muted }]}>No services</Text></View>}
      />

      <Modal visible={showApply} animationType="slide" transparent>
        <View style={s.mo}><View style={[s.mc, { backgroundColor: T.background }]}>
          <View style={s.mh}><Text style={[s.mtt, { color: T.ink }]}>Add Service</Text><TouchableOpacity onPress={() => setShowApply(false)}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity></View>
          <Text style={[s.fl, { color: T.muted }]}>Service Title</Text><TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Website Development" placeholderTextColor={T.muted} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />
          <Text style={[s.fl, { color: T.muted }]}>Category</Text><TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Digital" placeholderTextColor={T.muted} value={form.category} onChangeText={t => setForm(f => ({ ...f, category: t }))} />
          <Text style={[s.fl, { color: T.muted }]}>Price Range</Text><TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="₹5000 - ₹10000" placeholderTextColor={T.muted} value={form.price_range} onChangeText={t => setForm(f => ({ ...f, price_range: t }))} />
          
          <TouchableOpacity style={[s.submitBtn, { backgroundColor: T.brandGreen }]} onPress={() => { if (!form.title) { Alert.alert('Required', 'Title is required'); return; } createMut.mutate(form); }}>
            <Text style={[s.submitText, { color: T.surface }]}>{createMut.isPending ? 'Creating...' : 'Create Service'}</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 },
  applyBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, borderWidth: 1 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  cat: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  price: { fontFamily: 'Inter_700Bold', fontSize: 14, marginTop: 6 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyT: { fontFamily: 'Inter_500Medium', fontSize: 15, marginTop: 12 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }, 
  mc: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, 
  mtt: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6, marginTop: 14 },
  inp: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});
