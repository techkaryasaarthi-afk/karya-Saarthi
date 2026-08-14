/**
 * Shared Workspace — Documents, SOPs, Wiki, Templates CRUD with pinning.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';

const DOC_TYPES = ['document', 'wiki', 'sop', 'template', 'resource', 'guide'];
const TYPE_ICONS: Record<string, string> = { document: '📄', wiki: '📖', sop: '📋', template: '🗒️', resource: '🔗', guide: '📚' };
const TYPE_COLORS: Record<string, string> = { document: '#3B82F6', wiki: '#8B5CF6', sop: '#FF6B35', template: '#F59E0B', resource: '#10B981', guide: '#06B6D4' };
const DEPARTMENTS = ['operations', 'marketing', 'digital', 'hr', 'finance', 'campus', 'calling', 'government', 'market'];

interface Doc {
  id: number; title: string; doc_type: string; content?: string; doc_url?: string;
  tags: string[]; department?: string; is_pinned: boolean; created_at: string;
  author?: { fullname: string };
}

export default function WorkspaceScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [form, setForm] = useState({ title: '', doc_type: 'document', content: '', doc_url: '', tags: '', department: '', is_pinned: false });

  const { data: docs = [], refetch, isRefetching } = useQuery({
    queryKey: ['workspace-docs'],
    queryFn: async () => {
      try { const { data } = await api.get(`${ADMIN_ENDPOINTS.WORKSPACE}?action=list`); return data?.documents || []; }
      catch { return []; }
    },
  });

  const saveMut = useMutation({
    mutationFn: async (payload: any) => {
      if (editing) {
        const { data } = await api.patch(ADMIN_ENDPOINTS.WORKSPACE, { id: editing.id, ...payload });
        return data;
      } else {
        const { data } = await api.post(ADMIN_ENDPOINTS.WORKSPACE, payload);
        return data;
      }
    },
    onSuccess: () => { refetch(); resetForm(); Alert.alert('Success', editing ? 'Document updated' : 'Document created'); },
    onError: () => Alert.alert('Error', 'Failed to save'),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => { await api.delete(ADMIN_ENDPOINTS.WORKSPACE, { data: { id } }); },
    onSuccess: () => refetch(),
  });

  const pinMut = useMutation({
    mutationFn: async ({ id, is_pinned }: { id: number; is_pinned: boolean }) => {
      await api.patch(ADMIN_ENDPOINTS.WORKSPACE, { id, is_pinned });
    },
    onSuccess: () => refetch(),
  });

  const resetForm = () => {
    setEditing(null); setShowForm(false);
    setForm({ title: '', doc_type: 'document', content: '', doc_url: '', tags: '', department: '', is_pinned: false });
  };

  const startEdit = (doc: Doc) => {
    setEditing(doc);
    setForm({ title: doc.title, doc_type: doc.doc_type, content: doc.content || '', doc_url: doc.doc_url || '', tags: doc.tags?.join(', ') || '', department: doc.department || '', is_pinned: doc.is_pinned });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { Alert.alert('Required', 'Title is required'); return; }
    saveMut.mutate({ ...form, tags: form.tags.split(',').map(s => s.trim()).filter(Boolean) });
  };

  const handleDelete = (doc: Doc) => {
    Alert.alert('Delete', `Delete "${doc.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMut.mutate(doc.id) },
    ]);
  };

  const filtered = docs.filter((d: Doc) => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
    const matchType = !filterType || d.doc_type === filterType;
    return matchSearch && matchType;
  });

  const pinned = filtered.filter((d: Doc) => d.is_pinned);
  const regular = filtered.filter((d: Doc) => !d.is_pinned);

  const renderDoc = (doc: Doc) => {
    const typeColor = TYPE_COLORS[doc.doc_type] || '#6B7280';
    return (
      <View key={doc.id} style={[st.docCard, { backgroundColor: T.surfaceContainer, borderColor: doc.is_pinned ? '#F59E0B30' : T.hairline }]}>
        <View style={st.docHeader}>
          <View style={[st.typeIcon, { backgroundColor: typeColor + '15' }]}>
            <Text style={{ fontSize: 18 }}>{TYPE_ICONS[doc.doc_type] || '📄'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[st.docTitle, { color: T.ink }]} numberOfLines={1}>{doc.title}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              <View style={[st.typeBadge, { backgroundColor: typeColor + '15' }]}>
                <Text style={[st.typeBadgeText, { color: typeColor }]}>{doc.doc_type}</Text>
              </View>
              {!!doc.department && (
                <View style={[st.typeBadge, { backgroundColor: T.hairline + '40' }]}>
                  <Text style={[st.typeBadgeText, { color: T.steel }]}>{doc.department}</Text>
                </View>
              )}
              {doc.is_pinned && <Text style={{ fontSize: 12 }}>📌</Text>}
            </View>
          </View>
        </View>

        {!!doc.content && <Text style={[st.docContent, { color: T.steel }]} numberOfLines={2}>{doc.content}</Text>}

        {(doc.tags || []).length > 0 && (
          <View style={st.tagRow}>
            {doc.tags.slice(0, 4).map((tag: string) => (
              <View key={tag} style={[st.tag, { backgroundColor: '#3B82F610' }]}>
                <Text style={[st.tagText, { color: '#3B82F6' }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={st.docMeta}>
          <Text style={[st.metaText, { color: T.muted }]}>By {doc.author?.fullname || 'Unknown'}</Text>
          <Text style={[st.metaText, { color: T.muted }]}>{new Date(doc.created_at).toLocaleDateString('en-IN')}</Text>
        </View>

        <View style={st.docActions}>
          {!!doc.doc_url && (
            <TouchableOpacity style={[st.docBtn, { backgroundColor: T.hairline + '30' }]} onPress={() => Linking.openURL(doc.doc_url!)}>
              <Text style={[st.docBtnText, { color: T.ink }]}>🔗 Open</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[st.docBtnSm, { backgroundColor: T.hairline + '20' }]} onPress={() => pinMut.mutate({ id: doc.id, is_pinned: !doc.is_pinned })}>
            <Text>{doc.is_pinned ? '📌' : '📎'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.docBtnSm, { backgroundColor: T.hairline + '20' }]} onPress={() => startEdit(doc)}>
            <Text>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.docBtnSm, { backgroundColor: '#EF444410' }]} onPress={() => handleDelete(doc)}>
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[st.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={st.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={[st.back, { backgroundColor: T.surfaceContainer }]}>
          <Ionicons name="arrow-back" size={22} color={T.ink} />
        </TouchableOpacity>
        <Text style={[st.title, { color: T.ink }]}>Workspace</Text>
        <TouchableOpacity style={[st.addBtn, { backgroundColor: T.brandGreen }]} onPress={() => { resetForm(); setShowForm(true); }}>
          <Ionicons name="add" size={20} color={T.surface} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[st.searchBar, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
        <Ionicons name="search" size={18} color={T.muted} />
        <TextInput style={[st.searchInput, { color: T.ink }]} placeholder="Search docs, tags..." placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />
      </View>

      {/* Type filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.filterRow} contentContainerStyle={{ paddingHorizontal: 20, gap: 6 }}>
        <TouchableOpacity style={[st.filterChip, { backgroundColor: !filterType ? T.brandGreen + '20' : T.surfaceContainer, borderColor: !filterType ? T.brandGreen : T.hairline }]} onPress={() => setFilterType('')}>
          <Text style={[st.filterText, { color: !filterType ? T.brandGreen : T.steel }]}>All</Text>
        </TouchableOpacity>
        {DOC_TYPES.map(t => (
          <TouchableOpacity key={t} style={[st.filterChip, { backgroundColor: filterType === t ? (TYPE_COLORS[t] + '20') : T.surfaceContainer, borderColor: filterType === t ? TYPE_COLORS[t] : T.hairline }]} onPress={() => setFilterType(filterType === t ? '' : t)}>
            <Text style={[st.filterText, { color: filterType === t ? TYPE_COLORS[t] : T.steel }]}>{TYPE_ICONS[t]} {t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {filtered.length === 0 ? (
          <View style={st.empty}>
            <Text style={{ fontSize: 48 }}>📁</Text>
            <Text style={[st.emptyText, { color: T.muted }]}>{search || filterType ? 'No matching documents' : 'No documents yet'}</Text>
          </View>
        ) : (
          <>
            {pinned.length > 0 && (
              <View style={st.group}>
                <Text style={[st.groupTitle, { color: T.warning }]}>📌 Pinned</Text>
                {pinned.map(renderDoc)}
              </View>
            )}
            <View style={st.group}>
              {pinned.length > 0 && <Text style={[st.groupTitle, { color: T.muted }]}>All Documents</Text>}
              {regular.map(renderDoc)}
            </View>
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={st.mo}><View style={[st.mc, { backgroundColor: T.background }]}>
          <View style={st.mh}>
            <Text style={[st.mt, { color: T.ink }]}>{editing ? '✏️ Edit Document' : '+ New Document'}</Text>
            <TouchableOpacity onPress={resetForm}><Ionicons name="close" size={24} color={T.muted} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[st.fl, { color: T.muted }]}>Title *</Text>
            <TextInput style={[st.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Document title" placeholderTextColor={T.muted} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />

            <Text style={[st.fl, { color: T.muted }]}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {DOC_TYPES.map(t => (
                <TouchableOpacity key={t} style={[st.typeChip, { borderColor: form.doc_type === t ? TYPE_COLORS[t] : T.hairline, backgroundColor: form.doc_type === t ? TYPE_COLORS[t] + '20' : 'transparent' }]} onPress={() => setForm(f => ({ ...f, doc_type: t }))}>
                  <Text style={[st.typeChipText, { color: form.doc_type === t ? TYPE_COLORS[t] : T.steel }]}>{TYPE_ICONS[t]} {t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[st.fl, { color: T.muted }]}>Link URL</Text>
            <TextInput style={[st.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="Google Doc, Drive, Notion..." placeholderTextColor={T.muted} value={form.doc_url} onChangeText={t => setForm(f => ({ ...f, doc_url: t }))} />

            <Text style={[st.fl, { color: T.muted }]}>Content / Description</Text>
            <TextInput style={[st.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink, height: 80, textAlignVertical: 'top' }]} placeholder="Content..." placeholderTextColor={T.muted} multiline value={form.content} onChangeText={t => setForm(f => ({ ...f, content: t }))} />

            <Text style={[st.fl, { color: T.muted }]}>Tags (comma-separated)</Text>
            <TextInput style={[st.inp, { backgroundColor: T.surfaceContainer, borderColor: T.hairline, color: T.ink }]} placeholder="onboarding, policy, hr" placeholderTextColor={T.muted} value={form.tags} onChangeText={t => setForm(f => ({ ...f, tags: t }))} />

            <Text style={[st.fl, { color: T.muted }]}>Department</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <TouchableOpacity style={[st.typeChip, { borderColor: !form.department ? T.brandGreen : T.hairline }]} onPress={() => setForm(f => ({ ...f, department: '' }))}>
                <Text style={[st.typeChipText, { color: !form.department ? T.brandGreen : T.steel }]}>All Depts</Text>
              </TouchableOpacity>
              {DEPARTMENTS.map(d => (
                <TouchableOpacity key={d} style={[st.typeChip, { borderColor: form.department === d ? T.brandGreen : T.hairline }]} onPress={() => setForm(f => ({ ...f, department: d }))}>
                  <Text style={[st.typeChipText, { color: form.department === d ? T.brandGreen : T.steel }]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={[st.submitBtn, { backgroundColor: T.brandGreen }]} onPress={handleSave}>
              <Text style={[st.submitText, { color: T.surface }]}>{saveMut.isPending ? 'Saving...' : editing ? 'Save Changes' : 'Create Document'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  c: { flex: 1 },
  hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  back: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, gap: 8, borderWidth: 1, marginBottom: 12 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, paddingVertical: 12 },
  filterRow: { marginBottom: 16, maxHeight: 36 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  filterText: { fontFamily: 'Inter_500Medium', fontSize: 11, textTransform: 'capitalize' },
  group: { paddingHorizontal: 20, marginBottom: 16 },
  groupTitle: { fontFamily: 'Inter_700Bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  docCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  docHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  typeIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, textTransform: 'capitalize' },
  docContent: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  docMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metaText: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  docActions: { flexDirection: 'row', gap: 6 },
  docBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  docBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  docBtnSm: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  mc: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mt: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 6, marginTop: 14 },
  inp: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginRight: 8 },
  typeChipText: { fontFamily: 'Inter_500Medium', fontSize: 11, textTransform: 'capitalize' },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});
