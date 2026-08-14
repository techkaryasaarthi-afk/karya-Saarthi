/**
 * Admin Meetings Screen — Schedule, view, manage meetings. Styled per DESIGN.md.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMeetingsServiceApi, createMeetingApi, type Meeting } from '@/services/meetings';
import { useAppTheme } from '@/utils/theme';

export default function AdminMeetingsScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', meeting_link: '' });
  const { data: meetings = [], refetch, isRefetching } = useQuery({ queryKey: ['admin-meetings'], queryFn: getMeetingsServiceApi });
  const createMut = useMutation({ mutationFn: createMeetingApi, onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-meetings'] }); setShowModal(false); setForm({ title: '', description: '', date: '', time: '', meeting_link: '' }); }, onError: () => Alert.alert('Error', 'Failed to create meeting') });
  const stColor = (st: string) => st === 'scheduled' ? T.info : st === 'completed' ? T.success : st === 'cancelled' ? T.error : T.warning;

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}><Text style={[s.tt, { color: T.ink }]}>Meetings</Text><TouchableOpacity style={[s.ab, { backgroundColor: T.brandGreen }]} onPress={() => setShowModal(true)}><Ionicons name="add" size={22} color={T.primary} /></TouchableOpacity></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginBottom: 20 }}>
          {[{ l: 'Upcoming', v: meetings.filter((m: Meeting) => m.status === 'scheduled').length, c: T.info },{ l: 'Today', v: meetings.filter((m: Meeting) => m.date === new Date().toISOString().split('T')[0]).length, c: T.warning },{ l: 'Done', v: meetings.filter((m: Meeting) => m.status === 'completed').length, c: T.success }].map((st, i) => (
            <View key={i} style={[s.sc, { backgroundColor: st.c + '12', borderColor: st.c + '25' }]}><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28, color: st.c }}>{st.v}</Text><Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: T.steel, marginTop: 4 }}>{st.l}</Text></View>
          ))}
        </ScrollView>
        {meetings.length === 0 ? (<View style={s.em}><Ionicons name="calendar-outline" size={56} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>No meetings yet</Text></View>) : meetings.map((m: Meeting) => (
          <View key={m.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stColor(m.status) }} /><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: T.ink, flex: 1 }} numberOfLines={1}>{m.title}</Text><Text style={{ color: stColor(m.status), fontFamily: 'Inter_500Medium', fontSize: 11, textTransform: 'capitalize' }}>{m.status}</Text></View>
            {m.description && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: T.muted, marginTop: 8 }} numberOfLines={2}>{m.description}</Text>}
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Ionicons name="calendar" size={14} color={T.muted} /><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: T.muted }}>{m.date}</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Ionicons name="time" size={14} color={T.muted} /><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: T.muted }}>{m.time}</Text></View></View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
      <Modal visible={showModal} animationType="slide" transparent><View style={s.mo}><View style={[s.mc, { backgroundColor: T.surfaceContainer }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: T.ink }}>Schedule Meeting</Text><TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity></View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[s.fl, { color: T.steel }]}>Title *</Text><TextInput style={[s.inp, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline }]} placeholder="Meeting title" placeholderTextColor={T.muted} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />
          <Text style={[s.fl, { color: T.steel }]}>Description</Text><TextInput style={[s.inp, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline, height: 80 }]} placeholder="Details" placeholderTextColor={T.muted} value={form.description} onChangeText={t => setForm(f => ({ ...f, description: t }))} multiline />
          <View style={{ flexDirection: 'row', gap: 12 }}><View style={{ flex: 1 }}><Text style={[s.fl, { color: T.steel }]}>Date *</Text><TextInput style={[s.inp, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline }]} placeholder="2026-05-25" placeholderTextColor={T.muted} value={form.date} onChangeText={t => setForm(f => ({ ...f, date: t }))} /></View><View style={{ flex: 1 }}><Text style={[s.fl, { color: T.steel }]}>Time *</Text><TextInput style={[s.inp, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline }]} placeholder="14:00" placeholderTextColor={T.muted} value={form.time} onChangeText={t => setForm(f => ({ ...f, time: t }))} /></View></View>
          <Text style={[s.fl, { color: T.steel }]}>Meeting Link</Text><TextInput style={[s.inp, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline }]} placeholder="Zoom/Meet link" placeholderTextColor={T.muted} value={form.meeting_link} onChangeText={t => setForm(f => ({ ...f, meeting_link: t }))} />
          <TouchableOpacity style={[s.sb, { backgroundColor: T.brandGreen }]} onPress={() => { if (!form.title || !form.date || !form.time) { Alert.alert('Required', 'Fill title, date, time'); return; } createMut.mutate(form); }}><Text style={{ color: T.primary, fontFamily: 'Inter_700Bold', fontSize: 15 }}>{createMut.isPending ? 'Creating...' : 'Schedule Meeting'}</Text></TouchableOpacity>
        </ScrollView>
      </View></View></Modal>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  tt: { fontFamily: 'Inter_700Bold', fontSize: 24 }, ab: { width: 40, height: 40, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  sc: { width: 110, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1 },
  card: { marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1 },
  em: { alignItems: 'center', paddingTop: 80, gap: 12 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }, mc: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6, marginTop: 14 },
  inp: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1 },
  sb: { borderRadius: 9999, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
});
