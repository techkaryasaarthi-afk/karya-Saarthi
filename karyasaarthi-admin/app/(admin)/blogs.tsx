/**
 * Admin Blogs Screen — View-only blog management (no CRUD, just viewing).
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Linking, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';
import { useRouter } from 'expo-router';

export default function AdminBlogsScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const qc = useQueryClient();
  const router = useRouter();
  
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ title: '', excerpt: '', author: '' });
  const { data: blogs = [], refetch, isRefetching } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => { try { const { data } = await api.get(ADMIN_ENDPOINTS.BLOGS); return data?.blogs || data || []; } catch { return []; } },
  });

  const createMut = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(ADMIN_ENDPOINTS.BLOGS, data);
      return res.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blogs'] }); setShowApply(false); setForm({ title: '', excerpt: '', author: '' }); Alert.alert('Success', 'Blog post created'); },
    onError: () => Alert.alert('Error', 'Failed to create blog post'),
  });

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: T.surfaceContainer }]}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity>
        <Text style={[s.title, { color: T.ink }]}>Blogs</Text>
        <TouchableOpacity style={[s.applyBtn, { backgroundColor: T.brandGreen }]} onPress={() => setShowApply(true)}><Ionicons name="add" size={20} color={T.surface} /></TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {blogs.length === 0 ? (
          <View style={s.empty}><Ionicons name="newspaper-outline" size={56} color={T.hairline} /><Text style={[s.et, { color: T.muted }]}>No blog posts</Text></View>
        ) : blogs.map((b: any) => (
          <TouchableOpacity key={b.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]} activeOpacity={0.7} onPress={() => b.slug && Linking.openURL(`https://karyasaarthi.com/blogs/${b.slug}`)}>
            <View style={s.cardH}>
              <View style={[s.iconWrap, { backgroundColor: T.brandGreen + '15' }]}><Ionicons name="document-text" size={20} color={T.brandGreen} /></View>
              <View style={{ flex: 1 }}>
                <Text style={[s.cardTitle, { color: T.ink }]} numberOfLines={2}>{b.title}</Text>
                <Text style={[s.cardMeta, { color: T.muted }]}>{b.author || 'KaryaSaarthi'} • {b.created_at ? new Date(b.created_at).toLocaleDateString() : ''}</Text>
              </View>
            </View>
            {!!b.excerpt && <Text style={[s.excerpt, { color: T.steel }]} numberOfLines={2}>{b.excerpt}</Text>}
            <View style={s.tagRow}>{(b.tags || []).slice(0, 3).map((tag: string, i: number) => (
              <View key={i} style={[s.tag, { backgroundColor: T.brandGreen + '15' }]}><Text style={[s.tagText, { color: T.brandGreen }]}>{tag}</Text></View>
            ))}</View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showApply} animationType="slide" transparent>
        <View style={s.mo}><View style={[s.mc, { backgroundColor: T.background }]}>
          <View style={s.mh}><Text style={[s.mtt, { color: T.ink }]}>Create Blog Post</Text><TouchableOpacity onPress={() => setShowApply(false)}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity></View>
          <Text style={[s.fl, { color: T.muted }]}>Title</Text><TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="New Feature Update" placeholderTextColor={T.muted} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />
          <Text style={[s.fl, { color: T.muted }]}>Author</Text><TextInput style={[s.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Aman Mishra" placeholderTextColor={T.muted} value={form.author} onChangeText={t => setForm(f => ({ ...f, author: t }))} />
          <Text style={[s.fl, { color: T.muted }]}>Excerpt</Text><TextInput style={[s.inp, { height: 80, backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Brief summary of the blog post..." placeholderTextColor={T.muted} value={form.excerpt} onChangeText={t => setForm(f => ({ ...f, excerpt: t }))} multiline />
          
          <TouchableOpacity style={[s.submitBtn, { backgroundColor: T.brandGreen }]} onPress={() => { if (!form.title) { Alert.alert('Required', 'Title is required'); return; } createMut.mutate(form); }}>
            <Text style={[s.submitText, { color: T.surface }]}>{createMut.isPending ? 'Publishing...' : 'Publish Blog'}</Text>
          </TouchableOpacity>
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
  applyBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 }, et: { fontFamily: 'Inter_600SemiBold', fontSize: 18 },
  card: { marginHorizontal: 20, marginBottom: 12, borderRadius: 14, padding: 16, borderWidth: 1 },
  cardH: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, lineHeight: 22 },
  cardMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  excerpt: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 10, lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }, 
  mc: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, 
  mtt: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6, marginTop: 14 },
  inp: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});
