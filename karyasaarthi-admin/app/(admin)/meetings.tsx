/**
 * Admin Meetings Screen — Schedule, view, and manage meetings.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { getMeetingsApi, createMeetingApi, type Meeting } from '@/services/meetings';
import { spacing } from '@/utils/theme';

export default function AdminMeetingsScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', meeting_link: '' });
  const { data: meetings = [], refetch, isRefetching } = useQuery({ queryKey: ['admin-meetings'], queryFn: getMeetingsApi });
  const createMut = useMutation({
    mutationFn: createMeetingApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-meetings'] }); setShowModal(false); setForm({ title: '', description: '', date: '', time: '', meeting_link: '' }); },
    onError: () => Alert.alert('Error', 'Failed to create meeting'),
  });
  const statusColor = (st: string) => st === 'scheduled' ? '#3B82F6' : st === 'completed' ? '#10B981' : st === 'cancelled' ? '#EF4444' : '#F59E0B';

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      <View style={s.hdr}><Text style={s.t}>Meetings</Text><TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}><Ionicons name="add" size={22} color="#0F172A" /></TouchableOpacity></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginBottom: 20 }}>
          {[{ l: 'Upcoming', v: meetings.filter((m: Meeting) => m.status === 'scheduled').length, g: ['#3B82F6', '#6366F1'] as [string, string] },
            { l: 'Today', v: meetings.filter((m: Meeting) => m.date === new Date().toISOString().split('T')[0]).length, g: ['#F59E0B', '#F97316'] as [string, string] },
            { l: 'Done', v: meetings.filter((m: Meeting) => m.status === 'completed').length, g: ['#10B981', '#34D399'] as [string, string] }
          ].map((st, i) => (
            <LinearGradient key={i} colors={st.g} style={s.sc} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}><Text style={s.sv}>{st.v}</Text><Text style={s.sl}>{st.l}</Text></LinearGradient>
          ))}
        </ScrollView>
        {meetings.length === 0 ? (
          <View style={s.empty}><Ionicons name="calendar-outline" size={56} color="rgba(255,255,255,0.15)" /><Text style={s.et}>No meetings yet</Text></View>
        ) : meetings.map((m: Meeting) => (
          <View key={m.id} style={s.card}>
            <View style={s.cardH}><View style={[s.dot, { backgroundColor: statusColor(m.status) }]} /><Text style={s.cn} numberOfLines={1}>{m.title}</Text><Text style={[s.cs, { color: statusColor(m.status) }]}>{m.status}</Text></View>
            {m.description && <Text style={s.cd} numberOfLines={2}>{m.description}</Text>}
            <View style={s.meta}>
              <View style={s.mi}><Ionicons name="calendar" size={14} color="rgba(255,255,255,0.4)" /><Text style={s.mt}>{m.date}</Text></View>
              <View style={s.mi}><Ionicons name="time" size={14} color="rgba(255,255,255,0.4)" /><Text style={s.mt}>{m.time}</Text></View>
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.mo}><View style={s.mc}>
          <View style={s.mh}><Text style={s.mtt}>Schedule Meeting</Text><TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" /></TouchableOpacity></View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.fl}>Title *</Text><TextInput style={s.inp} placeholder="Meeting title" placeholderTextColor="rgba(255,255,255,0.3)" value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />
            <Text style={s.fl}>Description</Text><TextInput style={[s.inp, { height: 80 }]} placeholder="Details" placeholderTextColor="rgba(255,255,255,0.3)" value={form.description} onChangeText={t => setForm(f => ({ ...f, description: t }))} multiline />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><Text style={s.fl}>Date *</Text><TextInput style={s.inp} placeholder="2026-05-25" placeholderTextColor="rgba(255,255,255,0.3)" value={form.date} onChangeText={t => setForm(f => ({ ...f, date: t }))} /></View>
              <View style={{ flex: 1 }}><Text style={s.fl}>Time *</Text><TextInput style={s.inp} placeholder="14:00" placeholderTextColor="rgba(255,255,255,0.3)" value={form.time} onChangeText={t => setForm(f => ({ ...f, time: t }))} /></View>
            </View>
            <Text style={s.fl}>Meeting Link</Text><TextInput style={s.inp} placeholder="Zoom/Meet link" placeholderTextColor="rgba(255,255,255,0.3)" value={form.meeting_link} onChangeText={t => setForm(f => ({ ...f, meeting_link: t }))} />
            <TouchableOpacity style={s.cBtn} onPress={() => { if (!form.title || !form.date || !form.time) { Alert.alert('Required', 'Fill title, date, time'); return; } createMut.mutate(form); }}>
              <Text style={s.cBt}>{createMut.isPending ? 'Creating...' : 'Schedule Meeting'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' }, hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  t: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFF' }, addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },
  sc: { width: 110, borderRadius: 14, padding: 16, alignItems: 'center' }, sv: { fontFamily: 'Inter_800ExtraBold', fontSize: 28, color: '#FFF' }, sl: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: { marginHorizontal: 20, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardH: { flexDirection: 'row', alignItems: 'center', gap: 10 }, dot: { width: 8, height: 8, borderRadius: 4 },
  cn: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.9)', flex: 1 }, cs: { fontFamily: 'Inter_500Medium', fontSize: 11, textTransform: 'capitalize' },
  cd: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 },
  meta: { flexDirection: 'row', gap: 16, marginTop: 12 }, mi: { flexDirection: 'row', alignItems: 'center', gap: 4 }, mt: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 }, et: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: 'rgba(255,255,255,0.5)' },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }, mc: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, mtt: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFF' },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6, marginTop: 14 },
  inp: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cBtn: { backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 }, cBt: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#0F172A' },
});
