/**
 * Admin Projects Screen — Redesigned with Kanban toggle, summary bar, create project modal.
 * References karyasaarthi-app projects design for card styling.
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
  ScrollView, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Badge from '@/components/ui/Badge';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import Toast from 'react-native-toast-message';

// ── Fixed Kanban columns ─────────────────────────────────────
const KANBAN_COLS = [
  { key: 'pending', label: 'Pending', color: '#F59E0B', icon: 'time' },
  { key: 'assigned', label: 'Assigned', color: '#8B5CF6', icon: 'person-add' },
  { key: 'in_progress', label: 'In Progress', color: '#3B82F6', icon: 'flash' },
  { key: 'review', label: 'Review', color: '#EC4899', icon: 'eye' },
  { key: 'completed', label: 'Completed', color: '#10B981', icon: 'checkmark-circle' },
  { key: 'delivered', label: 'Delivered', color: '#059669', icon: 'archive' },
];

const STATUS_VARIANT: Record<string, any> = {
  pending: 'warning', assigned: 'info', in_progress: 'info',
  review: 'warning', completed: 'success', delivered: 'success',
  cancelled: 'error',
};

const FILTER_TABS = ['All', 'Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

export default function AdminProjectsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'gantt'>('list');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ service_type: '', description: '', budget: '', user_id: '', assigned_to: '', deadline: '', priority: 'medium' });

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const { data } = await api.get(ADMIN_ENDPOINTS.PROJECTS);
      return data?.projects || [];
    },
  });

  const projects = data || [];

  // ── Filter ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (filter === 'All') return projects;
    const key = filter.toLowerCase().replace(' ', '_');
    return projects.filter((p: any) => p.status === key);
  }, [projects, filter]);

  // ── Summary counts ──────────────────────────────────────────
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: projects.length };
    projects.forEach((p: any) => { c[p.status] = (c[p.status] || 0) + 1; });
    return c;
  }, [projects]);

  // ── Kanban grouped data ─────────────────────────────────────
  const kanbanData = useMemo(() => {
    return KANBAN_COLS.map(col => ({
      ...col,
      items: projects.filter((p: any) => p.status === col.key),
    }));
  }, [projects]);

  // ── Create project ──────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: async () => {
      if (!form.service_type.trim()) throw new Error('Service type required');
      if (!form.user_id.trim()) throw new Error('Client ID required');
      const payload: any = {
        service_type: form.service_type.trim(),
        description: form.description.trim() || null,
        budget: form.budget ? Number(form.budget) : null,
        user_id: Number(form.user_id),
        deadline: form.deadline || null,
        priority: form.priority,
      };
      if (form.assigned_to.trim()) payload.assigned_to = Number(form.assigned_to);
      const { data } = await api.post(ADMIN_ENDPOINTS.PROJECTS, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      Toast.show({ type: 'success', text1: 'Project Created' });
      setShowCreate(false);
      setForm({ service_type: '', description: '', budget: '', user_id: '', assigned_to: '', deadline: '', priority: 'medium' });
    },
    onError: (e: any) => Alert.alert('Error', e.message || 'Failed to create'),
  });

  // ── Status update ───────────────────────────────────────────
  const updateMut = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.patch(`${ADMIN_ENDPOINTS.PROJECTS}/${id}`, { status });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-projects'] }); Toast.show({ type: 'success', text1: 'Updated' }); },
  });

  const renderCard = (item: any) => {
    const client = item.client;
    const vendor = item.vendor;
    return (
      <TouchableOpacity
        key={item.id}
        style={st.card}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/(admin)/project-detail', params: { id: item.id } } as any)}
      >
        {/* Header */}
        <View style={st.cardHdr}>
          <Text style={st.cardName} numberOfLines={1}>{item.service_type || item.name || 'Untitled'}</Text>
          <Badge text={item.status?.replace(/_/g, ' ') || 'pending'} variant={STATUS_VARIANT[item.status] || 'neutral'} size="sm" />
        </View>

        {/* Description */}
        {!!item.description && <Text style={st.cardDesc} numberOfLines={2}>{item.description}</Text>}

        {/* Progress bar */}
        {item.progress != null && item.progress > 0 && (
          <View style={st.progressWrap}>
            <View style={st.progressBg}>
              <View style={[st.progressFill, { width: `${Math.min(item.progress, 100)}%` }]} />
            </View>
            <Text style={st.progressText}>{item.progress}%</Text>
          </View>
        )}

        {/* Meta row */}
        <View style={st.cardMeta}>
          <View style={st.metaItem}>
            <Ionicons name="person" size={13} color="rgba(255,255,255,0.35)" />
            <Text style={st.metaText}>{typeof client?.fullname === 'object' ? client.fullname.fullname : client?.fullname || 'N/A'}</Text>
          </View>
          {!!vendor?.fullname && (
            <View style={st.metaItem}>
              <Ionicons name="construct" size={13} color="rgba(255,255,255,0.35)" />
              <Text style={st.metaText}>{typeof vendor.fullname === 'object' ? vendor.fullname.fullname : vendor.fullname}</Text>
            </View>
          )}
        </View>

        {/* Bottom row */}
        <View style={st.cardBottom}>
          {!!item.budget && (
            <View style={st.metaItem}>
              <Ionicons name="cash" size={13} color="#10B981" />
              <Text style={[st.metaText, { color: '#10B981' }]}>₹{Number(item.budget).toLocaleString('en-IN')}</Text>
            </View>
          )}
          {!!item.deadline && (
            <View style={st.metaItem}>
              <Ionicons name="calendar" size={13} color="#F59E0B" />
              <Text style={[st.metaText, { color: '#F59E0B' }]}>{item.deadline}</Text>
            </View>
          )}
          {!!item.priority && (
            <View style={[st.priorityBadge, { backgroundColor: item.priority === 'high' ? '#EF444420' : item.priority === 'urgent' ? '#DC262620' : '#F59E0B15' }]}>
              <Text style={[st.priorityText, { color: item.priority === 'high' ? '#EF4444' : item.priority === 'urgent' ? '#DC2626' : '#F59E0B' }]}>{item.priority}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[st.c, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={st.hdr}>
        <View>
          <Text style={st.title}>Projects</Text>
          <Text style={st.subtitle}>{projects.length} total</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={[st.modeBtn, viewMode === 'list' && st.modeBtnActive]} onPress={() => setViewMode('list')}>
            <Ionicons name="list" size={18} color={viewMode === 'list' ? '#0F172A' : 'rgba(255,255,255,0.4)'} />
          </TouchableOpacity>
          <TouchableOpacity style={[st.modeBtn, viewMode === 'kanban' && st.modeBtnActive]} onPress={() => setViewMode('kanban')}>
            <Ionicons name="grid" size={18} color={viewMode === 'kanban' ? '#0F172A' : 'rgba(255,255,255,0.4)'} />
          </TouchableOpacity>
          <TouchableOpacity style={[st.modeBtn, viewMode === 'gantt' && st.modeBtnActive]} onPress={() => setViewMode('gantt')}>
            <Ionicons name="bar-chart" size={18} color={viewMode === 'gantt' ? '#0F172A' : 'rgba(255,255,255,0.4)'} />
          </TouchableOpacity>
          <TouchableOpacity style={st.addBtn} onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary counts */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.summaryRow}>
        {FILTER_TABS.map(tab => {
          const key = tab === 'All' ? 'All' : tab.toLowerCase().replace(' ', '_');
          const count = key === 'All' ? counts.All || 0 : counts[key] || 0;
          const active = filter === tab;
          return (
            <TouchableOpacity key={tab} style={[st.filterPill, active && st.filterPillActive]} onPress={() => setFilter(tab)}>
              <Text style={[st.filterText, active && st.filterTextActive]}>{tab}</Text>
              {count > 0 && (
                <View style={[st.filterCount, active && st.filterCountActive]}>
                  <Text style={[st.filterCountText, active && st.filterCountTextActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      {viewMode === 'list' ? (
        <FlatList
          data={filtered}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }) => renderCard(item)}
          contentContainerStyle={st.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}
          ListEmptyComponent={
            <View style={st.empty}>
              <Ionicons name="briefcase-outline" size={56} color="rgba(255,255,255,0.15)" />
              <Text style={st.emptyText}>No projects found</Text>
            </View>
          }
        />
      ) : viewMode === 'kanban' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.kanbanRow}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}>
          {kanbanData.map(col => (
            <View key={col.key} style={st.kanbanCol}>
              <View style={st.kanbanHdr}>
                <View style={[st.kanbanDot, { backgroundColor: col.color }]} />
                <Text style={st.kanbanTitle}>{col.label}</Text>
                <View style={[st.kanbanBadge, { backgroundColor: col.color + '20' }]}>
                  <Text style={[st.kanbanBadgeText, { color: col.color }]}>{col.items.length}</Text>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                {col.items.map((item: any) => (
                  <TouchableOpacity key={item.id} style={st.kanbanCard} activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/(admin)/project-detail', params: { id: item.id } } as any)}>
                    <Text style={st.kanbanCardName} numberOfLines={2}>{item.service_type || 'Untitled'}</Text>
                    <View style={st.kanbanCardMeta}>
                      <Text style={st.kanbanCardClient}>{typeof item.client?.fullname === 'object' ? item.client.fullname.fullname : item.client?.fullname || 'N/A'}</Text>
                      {!!item.budget && <Text style={st.kanbanCardBudget}>₹{Number(item.budget).toLocaleString('en-IN')}</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
                {col.items.length === 0 && <Text style={st.kanbanEmpty}>No items</Text>}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      ) : (
        /* ── Gantt Chart View ─────────────────────────────────── */
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}>
          <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>📊 Timeline View ({filtered.length} projects)</Text>
            {(() => {
              const now = new Date();
              const timelineStart = new Date(now);
              timelineStart.setDate(timelineStart.getDate() - 30);
              const timelineEnd = new Date(now);
              timelineEnd.setDate(timelineEnd.getDate() + 90);
              const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
              const BAR_W = 600;

              return (
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View>
                    {/* Month headers */}
                    <View style={{ flexDirection: 'row', height: 28, marginLeft: 140 }}>
                      {Array.from({ length: 5 }).map((_, mi) => {
                        const m = new Date(timelineStart);
                        m.setMonth(m.getMonth() + mi);
                        return (
                          <View key={mi} style={{ width: BAR_W / 5, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.06)', paddingLeft: 6, justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                              {m.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    {/* Today marker line description */}
                    {filtered.map((p: any, idx: number) => {
                      const created = p.created_at ? new Date(p.created_at) : now;
                      const deadline = p.deadline ? new Date(p.deadline) : new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
                      const startOff = Math.max(0, (created.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
                      const duration = Math.max(7, (deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                      const left = (startOff / totalDays) * BAR_W;
                      const width = Math.min((duration / totalDays) * BAR_W, BAR_W - left);
                      const sc = { pending: '#F59E0B', assigned: '#8B5CF6', in_progress: '#3B82F6', review: '#EC4899', completed: '#10B981', delivered: '#059669' } as any;
                      const barColor = sc[p.status] || '#6B7280';
                      const progress = p.progress || 0;

                      return (
                        <TouchableOpacity key={p.id} style={{ flexDirection: 'row', alignItems: 'center', height: 40, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' }}
                          onPress={() => router.push({ pathname: '/(admin)/project-detail', params: { id: p.id } } as any)}>
                          <View style={{ width: 140, paddingRight: 8 }}>
                            <Text numberOfLines={1} style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{p.service_type || 'Untitled'}</Text>
                            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{typeof p.client?.fullname === 'object' ? '' : p.client?.fullname || ''}</Text>
                          </View>
                          <View style={{ width: BAR_W, height: 24, position: 'relative' }}>
                            {/* Background track */}
                            <View style={{ position: 'absolute', left, width: Math.max(width, 20), height: 20, top: 2, borderRadius: 4, backgroundColor: barColor + '20' }} />
                            {/* Progress fill */}
                            <View style={{ position: 'absolute', left, width: Math.max(width * (progress / 100), 4), height: 20, top: 2, borderRadius: 4, backgroundColor: barColor }} />
                            {/* Label */}
                            <View style={{ position: 'absolute', left: left + 4, top: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#FFF' }}>{progress}%</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                    {filtered.length === 0 && <Text style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 20, textAlign: 'center' }}>No projects to display</Text>}
                  </View>
                </ScrollView>
              );
            })()}
          </View>
        </ScrollView>
      )}

      {/* Create Project Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.mo}>
          <View style={st.mc}>
            <View style={st.mh}>
              <Text style={st.mTitle}>Create Project</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}><Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={st.fl}>Service Type *</Text>
              <TextInput style={st.inp} placeholder="e.g. Web Development" placeholderTextColor="rgba(255,255,255,0.2)" value={form.service_type} onChangeText={t => setForm(f => ({ ...f, service_type: t }))} />
              <Text style={st.fl}>Description</Text>
              <TextInput style={[st.inp, { height: 80 }]} placeholder="Project details" placeholderTextColor="rgba(255,255,255,0.2)" value={form.description} onChangeText={t => setForm(f => ({ ...f, description: t }))} multiline />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}><Text style={st.fl}>Client ID *</Text><TextInput style={st.inp} placeholder="User ID" placeholderTextColor="rgba(255,255,255,0.2)" value={form.user_id} onChangeText={t => setForm(f => ({ ...f, user_id: t }))} keyboardType="numeric" /></View>
                <View style={{ flex: 1 }}><Text style={st.fl}>Vendor ID</Text><TextInput style={st.inp} placeholder="Optional" placeholderTextColor="rgba(255,255,255,0.2)" value={form.assigned_to} onChangeText={t => setForm(f => ({ ...f, assigned_to: t }))} keyboardType="numeric" /></View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}><Text style={st.fl}>Budget (₹)</Text><TextInput style={st.inp} placeholder="Amount" placeholderTextColor="rgba(255,255,255,0.2)" value={form.budget} onChangeText={t => setForm(f => ({ ...f, budget: t }))} keyboardType="numeric" /></View>
                <View style={{ flex: 1 }}><Text style={st.fl}>Deadline</Text><TextInput style={st.inp} placeholder="YYYY-MM-DD" placeholderTextColor="rgba(255,255,255,0.2)" value={form.deadline} onChangeText={t => setForm(f => ({ ...f, deadline: t }))} /></View>
              </View>
              <Text style={st.fl}>Priority</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <TouchableOpacity key={p} style={[st.priChip, form.priority === p && st.priChipActive]} onPress={() => setForm(f => ({ ...f, priority: p }))}>
                    <Text style={[st.priText, form.priority === p && st.priTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[st.submitBtn, createMut.isPending && { opacity: 0.6 }]} onPress={() => createMut.mutate()} disabled={createMut.isPending}>
                {createMut.isPending ? <ActivityIndicator color="#0F172A" /> : <Text style={st.submitText}>Create Project</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' },
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFF' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  modeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  modeBtnActive: { backgroundColor: '#F59E0B' },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },

  // Summary/filter
  summaryRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 10 },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  filterPillActive: { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: '#F59E0B' },
  filterText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  filterTextActive: { color: '#F59E0B', fontWeight: '700' },
  filterCount: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  filterCountActive: { backgroundColor: '#F59E0B30' },
  filterCountText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  filterCountTextActive: { color: '#F59E0B' },

  // List
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  card: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardName: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: 'rgba(255,255,255,0.9)', flex: 1 },
  cardDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8, lineHeight: 19 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  progressBg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: '#F59E0B' },
  progressText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#F59E0B', width: 30, textAlign: 'right' },
  cardMeta: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, textTransform: 'capitalize' },

  // Kanban
  kanbanRow: { paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  kanbanCol: { width: 260, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 12, maxHeight: 600 },
  kanbanHdr: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  kanbanDot: { width: 8, height: 8, borderRadius: 4 },
  kanbanTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.7)', flex: 1 },
  kanbanBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  kanbanBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  kanbanCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  kanbanCardName: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  kanbanCardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  kanbanCardClient: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  kanbanCardBudget: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#10B981' },
  kanbanEmpty: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', paddingVertical: 20 },

  // Empty
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontFamily: 'Inter_500Medium', fontSize: 15, color: 'rgba(255,255,255,0.3)' },

  // Modal
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  mc: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFF' },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6, marginTop: 14 },
  inp: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  priChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  priChipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  priText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' },
  priTextActive: { color: '#0F172A' },
  submitBtn: { backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#0F172A' },
});
