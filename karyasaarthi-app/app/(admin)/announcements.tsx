/**
 * Admin Announcements — Create and list announcements. Styled per DESIGN.md.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnnouncementsApi, createAnnouncementApi } from '@/services/admin';
import { useAppTheme } from '@/utils/theme';

export default function AdminAnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal' });
  const { data: items = [], refetch, isRefetching } = useQuery({ queryKey: ['admin-announcements'], queryFn: getAnnouncementsApi });
  const createMut = useMutation({ mutationFn: createAnnouncementApi, onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-announcements'] }); setShow(false); setForm({ title: '', content: '', priority: 'normal' }); } });

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}><TouchableOpacity onPress={() => router.back()} style={[s.bk, { backgroundColor: T.surfaceContainer }]}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity><Text style={[s.tt, { color: T.ink }]}>Announcements</Text><TouchableOpacity style={[s.ab, { backgroundColor: T.brandGreen }]} onPress={() => setShow(true)}><Ionicons name="add" size={20} color={T.primary} /></TouchableOpacity></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {items.length === 0 ? (<View style={s.em}><Ionicons name="megaphone-outline" size={56} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>No announcements</Text></View>) : items.map((a: any) => (
          <View key={a.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: T.ink }}>{a.title}</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: T.steel, marginTop: 6, lineHeight: 20 }}>{a.content}</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: T.muted, marginTop: 8 }}>{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</Text>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
      <Modal visible={show} animationType="slide" transparent><View style={s.mo}><View style={[s.mc, { backgroundColor: T.surfaceContainer }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: T.ink }}>New Announcement</Text><TouchableOpacity onPress={() => setShow(false)}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity></View>
        <Text style={[s.fl, { color: T.steel }]}>Title *</Text><TextInput style={[s.inp, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline }]} placeholder="Title" placeholderTextColor={T.muted} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />
        <Text style={[s.fl, { color: T.steel }]}>Content *</Text><TextInput style={[s.inp, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline, height: 120 }]} placeholder="Content" placeholderTextColor={T.muted} value={form.content} onChangeText={t => setForm(f => ({ ...f, content: t }))} multiline />
        <TouchableOpacity style={[s.subBtn, { backgroundColor: T.brandGreen }]} onPress={() => { if (!form.title || !form.content) { Alert.alert('Required', 'Fill title and content'); return; } createMut.mutate(form); }}><Text style={{ color: T.primary, fontFamily: 'Inter_700Bold', fontSize: 15 }}>{createMut.isPending ? 'Posting...' : 'Post Announcement'}</Text></TouchableOpacity>
      </View></View></Modal>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  bk: { width: 36, height: 36, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  tt: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 }, ab: { width: 36, height: 36, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  em: { alignItems: 'center', paddingTop: 80, gap: 12 },
  card: { marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }, mc: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6, marginTop: 14 },
  inp: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1 },
  subBtn: { borderRadius: 9999, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
});
