/**
 * Admin Announcements Screen — View and create announcements.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';

export default function AdminAnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal' });

  const { data: announcements = [], refetch, isRefetching } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => { try { const { data } = await api.get(ADMIN_ENDPOINTS.ANNOUNCEMENTS); return data?.announcements || data || []; } catch { return []; } },
  });

  const createMut = useMutation({
    mutationFn: async (payload: any) => { const { data } = await api.post(ADMIN_ENDPOINTS.ANNOUNCEMENTS, payload); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-announcements'] }); setShowModal(false); setForm({ title: '', content: '', priority: 'normal' }); },
    onError: () => Alert.alert('Error', 'Failed to create'),
  });

  const priorityColor = (p: string) => p === 'urgent' ? '#EF4444' : p === 'high' ? '#F59E0B' : '#3B82F6';

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      <View style={s.hdr}><Text style={s.title}>Announcements</Text><TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}><Ionicons name="add" size={22} color="#0F172A" /></TouchableOpacity></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}>
        {announcements.length === 0 ? (
          <View style={s.empty}><Ionicons name="megaphone-outline" size={56} color="rgba(255,255,255,0.15)" /><Text style={s.et}>No announcements</Text></View>
        ) : announcements.map((a: any) => (
          <View key={a.id} style={s.card}>
            <View style={s.cardH}><View style={[s.priorityDot, { backgroundColor: priorityColor(a.priority || 'normal') }]} /><Text style={s.cardTitle} numberOfLines={1}>{a.title}</Text></View>
            <Text style={s.cardContent} numberOfLines={3}>{a.content}</Text>
            <Text style={s.cardDate}>{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</Text>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.mo}><View style={s.mc}>
          <View style={s.mh}><Text style={s.mtt}>New Announcement</Text><TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" /></TouchableOpacity></View>
          <Text style={s.fl}>Title *</Text><TextInput style={s.inp} placeholder="Title" placeholderTextColor="rgba(255,255,255,0.3)" value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />
          <Text style={s.fl}>Content *</Text><TextInput style={[s.inp, { height: 120, textAlignVertical: 'top' }]} placeholder="Announcement content" placeholderTextColor="rgba(255,255,255,0.3)" value={form.content} onChangeText={t => setForm(f => ({ ...f, content: t }))} multiline />
          <Text style={s.fl}>Priority</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>{['normal', 'high', 'urgent'].map(p => (
            <TouchableOpacity key={p} style={[s.chip, form.priority === p && { backgroundColor: priorityColor(p), borderColor: priorityColor(p) }]} onPress={() => setForm(f => ({ ...f, priority: p }))}>
              <Text style={[s.chipT, form.priority === p && { color: '#FFF' }]}>{p}</Text>
            </TouchableOpacity>
          ))}</View>
          <TouchableOpacity style={s.submitBtn} onPress={() => { if (!form.title || !form.content) return Alert.alert('Required', 'Fill title and content'); createMut.mutate(form); }}>
            <Text style={s.submitT}>{createMut.isPending ? 'Posting...' : 'Post Announcement'}</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' }, hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFF' }, addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 }, et: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: 'rgba(255,255,255,0.5)' },
  card: { marginHorizontal: 20, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardH: { flexDirection: 'row', alignItems: 'center', gap: 10 }, priorityDot: { width: 8, height: 8, borderRadius: 4 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.9)', flex: 1 },
  cardContent: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8, lineHeight: 20 },
  cardDate: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 8 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }, mc: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, mtt: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFF' },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6, marginTop: 14 },
  inp: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  chipT: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' },
  submitBtn: { backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  submitT: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#0F172A' },
});
