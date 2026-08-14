/**
 * Project Detail Screen — Full project info, status management, vendor assignment.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  TextInput, Modal, ActivityIndicator, FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Avatar from '@/components/ui/Avatar';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import Toast from 'react-native-toast-message';

const STATUS_FLOW = ['pending', 'assigned', 'in_progress', 'review', 'completed', 'delivered'];
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  assigned: { bg: '#E0E7FF', text: '#4F46E5' },
  in_progress: { bg: '#DBEAFE', text: '#2563EB' },
  review: { bg: '#FCE7F3', text: '#DB2777' },
  completed: { bg: '#D1FAE5', text: '#059669' },
  delivered: { bg: '#D1FAE5', text: '#047857' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [assignModal, setAssignModal] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'info'|'tasks'|'comm'|'checklist'|'billing'>('info');
  const [tasks, setTasks] = useState<any[]>([]);
  const [commLogs, setCommLogs] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [tabSaving, setTabSaving] = useState(false);

  const { data: project, refetch } = useQuery({
    queryKey: ['admin-project', id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`${ADMIN_ENDPOINTS.PROJECTS}/${id}`);
        return data?.project || data || null;
      } catch {
        // fallback: search in the projects list
        const { data } = await api.get(`${ADMIN_ENDPOINTS.PROJECTS}?limit=500`);
        const list = data?.projects || [];
        return list.find((p: any) => String(p.id) === String(id)) || null;
      }
    },
    enabled: !!id,
  });

  // Fetch vendors for assignment picker
  const { data: vendorsList = [] } = useQuery({
    queryKey: ['admin-vendors-list'],
    queryFn: async () => {
      const { data } = await api.get(`${ADMIN_ENDPOINTS.USERS}?role=vendor&limit=100`);
      return data?.users || [];
    },
    enabled: assignModal,
  });

  const filteredVendors = vendorsList.filter((v: any) =>
    (v.fullname || '').toLowerCase().includes(vendorSearch.toLowerCase()) ||
    (v.email || '').toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const updateMut = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      await api.patch(`${ADMIN_ENDPOINTS.PROJECTS}/${id}`, updates);
    },
    onSuccess: () => { refetch(); qc.invalidateQueries({ queryKey: ['admin-projects'] }); Toast.show({ type: 'success', text1: 'Updated' }); },
    onError: (e: any) => Toast.show({ type: 'error', text1: 'Update failed', text2: e?.response?.data?.error || e?.message || '' }),
  });

  const changeStatus = (status: string) => {
    Alert.alert('Change Status', `Set to "${status.replace(/_/g, ' ')}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateMut.mutate({ status }) },
    ]);
  };

  const loadTabData = useCallback(async () => {
    if (!id) return;
    try {
      const [tR, cR, chR] = await Promise.all([
        api.get(`${ADMIN_ENDPOINTS.PROJECT_TASKS}?project_id=${id}`).catch(() => ({ data: { tasks: [] } })),
        api.get(`${ADMIN_ENDPOINTS.PROJECT_COMM}?project_id=${id}`).catch(() => ({ data: { logs: [] } })),
        api.get(`${ADMIN_ENDPOINTS.PROJECT_CHECKLIST}?project_id=${id}`).catch(() => ({ data: { items: [] } })),
      ]);
      setTasks(tR.data?.tasks || []);
      setCommLogs(cR.data?.logs || []);
      setChecklist(chR.data?.items || []);
    } catch {}
  }, [id]);

  useEffect(() => { if (id) loadTabData(); }, [id, loadTabData]);

  const saveTask = async () => {
    if (!newTaskTitle.trim()) return;
    setTabSaving(true);
    try {
      await api.post(ADMIN_ENDPOINTS.PROJECT_TASKS, { project_id: id, title: newTaskTitle, status: 'todo', priority: 'medium' });
      setNewTaskTitle(''); loadTabData();
    } catch {} finally { setTabSaving(false); }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    await api.patch(ADMIN_ENDPOINTS.PROJECT_TASKS, { id: taskId, status }).catch(() => {});
  };

  const addCommNote = async () => {
    if (!newNote.trim()) return;
    setTabSaving(true);
    try {
      await api.post(ADMIN_ENDPOINTS.PROJECT_COMM, { project_id: id, note: newNote, author: 'Admin', type: 'note' });
      setNewNote(''); loadTabData();
    } catch {} finally { setTabSaving(false); }
  };

  const addChecklistItem = async () => {
    if (!newCheckItem.trim()) return;
    try {
      await api.post(ADMIN_ENDPOINTS.PROJECT_CHECKLIST, { project_id: id, item: newCheckItem });
      setNewCheckItem(''); loadTabData();
    } catch {}
  };

  const toggleCheck = async (itemId: number) => {
    const item = checklist.find((c: any) => c.id === itemId);
    if (!item) return;
    setChecklist(prev => prev.map((c: any) => c.id === itemId ? { ...c, checked: !c.checked } : c));
    await api.patch(ADMIN_ENDPOINTS.PROJECT_CHECKLIST, { id: itemId, checked: !item.checked }).catch(() => {});
  };

  const generateInvoice = async () => {
    if (!project?.budget || project.budget <= 0) { Alert.alert('Error', 'Set a budget first'); return; }
    setTabSaving(true);
    try {
      await api.post(`${ADMIN_ENDPOINTS.PROJECTS}/${id}/invoice`);
      updateMut.mutate({ invoice_status: 'sent' });
      Alert.alert('Success', 'Invoice generated!');
    } catch { Alert.alert('Error', 'Failed to generate invoice'); }
    finally { setTabSaving(false); }
  };

  if (!project) {
    return (
      <View style={[st.c, { paddingTop: insets.top }]}>
        <View style={st.hdr}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
          <Text style={st.hdrTitle}>Loading...</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
    );
  }

  const p = project;
  const sc = STATUS_COLORS[p.status] || STATUS_COLORS.pending;
  const currentIdx = STATUS_FLOW.indexOf(p.status);

  return (
    <View style={[st.c, { paddingTop: insets.top }]}>
      <View style={st.hdr}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
        <Text style={st.hdrTitle}>Project #{p.id}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Status + Title */}
        <View style={st.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={st.projTitle}>{p.service_type || p.name || 'Untitled'}</Text>
            <View style={[st.statusBadge, { backgroundColor: sc.bg }]}>
              <Text style={[st.statusText, { color: sc.text }]}>{(p.status || '').replace(/_/g, ' ').toUpperCase()}</Text>
            </View>
          </View>
          {!!p.description && <Text style={st.desc}>{p.description}</Text>}
        </View>

        {/* Progress */}
        <View style={st.section}>
          <Text style={st.secTitle}>📊 Progress</Text>
          <View style={st.progressBar}>
            <View style={[st.progressFill, { width: `${p.progress || 0}%` }]} />
          </View>
          <Text style={st.progressLabel}>{p.progress || 0}% complete</Text>

          {/* Step flow */}
          <View style={st.stepFlow}>
            {STATUS_FLOW.map((s, i) => {
              const done = i <= currentIdx;
              return (
                <View key={s} style={st.stepItem}>
                  <View style={[st.stepDot, done && st.stepDotDone]} />
                  <Text style={[st.stepLabel, done && st.stepLabelDone]}>{s.replace(/_/g, ' ')}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Client */}
        <View style={st.section}>
          <Text style={st.secTitle}>👤 Client</Text>
          {p.client ? (
            <View style={st.personRow}>
              <Avatar name={p.client.fullname} size={40} />
              <View>
                <Text style={st.personName}>{p.client.fullname}</Text>
                <Text style={st.personSub}>{p.client.email}</Text>
                {!!p.client.phone && <Text style={st.personSub}>{p.client.phone}</Text>}
              </View>
            </View>
          ) : (
            <Text style={st.na}>No client info</Text>
          )}
        </View>

        {/* Vendor */}
        <View style={st.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={st.secTitle}>🔧 Vendor</Text>
            <TouchableOpacity style={st.assignBtn} onPress={() => setAssignModal(true)}>
              <Ionicons name="person-add" size={14} color="#818CF8" />
              <Text style={st.assignBtnText}>{p.vendor ? 'Reassign' : 'Assign'}</Text>
            </TouchableOpacity>
          </View>
          {p.vendor ? (
            <View style={st.personRow}>
              <Avatar name={p.vendor.fullname} size={40} />
              <View>
                <Text style={st.personName}>{p.vendor.fullname}</Text>
                <Text style={st.personSub}>{p.vendor.email}</Text>
              </View>
            </View>
          ) : (
            <Text style={st.na}>No vendor assigned</Text>
          )}
        </View>

        {/* Financials */}
        <View style={st.section}>
          <Text style={st.secTitle}>💰 Financials</Text>
          <View style={st.finRow}>
            <View style={st.finItem}>
              <Text style={st.finLabel}>Client Budget</Text>
              <Text style={st.finVal}>{p.budget ? `₹${Number(p.budget).toLocaleString('en-IN')}` : 'TBD'}</Text>
            </View>
            <View style={st.finItem}>
              <Text style={st.finLabel}>Vendor Price</Text>
              <Text style={st.finVal}>{p.vendor_price ? `₹${Number(p.vendor_price).toLocaleString('en-IN')}` : 'TBD'}</Text>
            </View>
            <View style={st.finItem}>
              <Text style={st.finLabel}>Margin</Text>
              <Text style={[st.finVal, { color: '#10B981' }]}>
                {p.budget && p.vendor_price ? `₹${(Number(p.budget) - Number(p.vendor_price)).toLocaleString('en-IN')}` : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={st.section}>
          <Text style={st.secTitle}>📋 Details</Text>
          {[
            { l: 'Priority', v: p.priority, color: p.priority === 'urgent' ? '#DC2626' : p.priority === 'high' ? '#EF4444' : '#F59E0B' },
            { l: 'Deadline', v: p.deadline || 'Not set' },
            { l: 'Created', v: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
            { l: 'Updated', v: p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
          ].map((d, i) => (
            <View key={i} style={st.detailRow}>
              <Text style={st.detailLabel}>{d.l}</Text>
              <Text style={[st.detailVal, d.color ? { color: d.color } : {}]}>{d.v || '—'}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={st.section}>
          <Text style={st.secTitle}>⚡ Actions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {currentIdx < STATUS_FLOW.length - 1 && p.status !== 'cancelled' && (
              <TouchableOpacity
                style={[st.actBtn, { backgroundColor: 'rgba(245,158,11,0.15)' }]}
                onPress={() => changeStatus(STATUS_FLOW[currentIdx + 1])}
              >
                <Ionicons name="arrow-forward" size={16} color="#F59E0B" />
                <Text style={[st.actText, { color: '#F59E0B' }]}>Move to {STATUS_FLOW[currentIdx + 1].replace(/_/g, ' ')}</Text>
              </TouchableOpacity>
            )}
            {!['completed', 'delivered', 'cancelled'].includes(p.status) && (
              <TouchableOpacity style={[st.actBtn, { backgroundColor: 'rgba(220,38,38,0.12)' }]} onPress={() => changeStatus('cancelled')}>
                <Ionicons name="close-circle" size={16} color="#DC2626" />
                <Text style={[st.actText, { color: '#DC2626' }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tab Bar */}
        <View style={st.tabBar}>
          {(['info','tasks','comm','checklist','billing'] as const).map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[st.tabItem, activeTab === tab && st.tabActive]}>
              <Text style={[st.tabLabel, activeTab === tab && st.tabLabelActive]}>
                {tab === 'info' ? '📋 Info' : tab === 'tasks' ? '✅ Tasks' : tab === 'comm' ? '💬 Comm' : tab === 'checklist' ? '☑️ Check' : '💰 Billing'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <View style={st.section}>
            <Text style={st.secTitle}>✅ Project Tasks</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <TextInput style={[st.tabInput, { flex: 1 }]} placeholder="New task title..." placeholderTextColor="rgba(255,255,255,0.3)" value={newTaskTitle} onChangeText={setNewTaskTitle} />
              <TouchableOpacity style={st.tabAddBtn} onPress={saveTask}>
                <Ionicons name="add" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
            {['todo','in_progress','review','done'].map(col => {
              const colTasks = tasks.filter((t: any) => t.status === col);
              if (colTasks.length === 0 && col !== 'todo') return null;
              const colColors: any = { todo: '#F59E0B', in_progress: '#3B82F6', review: '#EC4899', done: '#10B981' };
              return (
                <View key={col} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colColors[col] || '#6B7280' }} />
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colColors[col], textTransform: 'capitalize' }}>{col.replace(/_/g, ' ')} ({colTasks.length})</Text>
                  </View>
                  {colTasks.map((t: any) => (
                    <View key={t.id} style={st.taskCard}>
                      <Text style={st.taskTitle}>{t.title}</Text>
                      <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                        {['todo','in_progress','review','done'].filter(s => s !== t.status).map(s => (
                          <TouchableOpacity key={s} style={[st.miniBtn, { backgroundColor: (colColors[s] || '#6B7280') + '25' }]} onPress={() => updateTaskStatus(t.id, s)}>
                            <Text style={{ fontSize: 9, color: colColors[s], fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' }}>{s.replace(/_/g,' ')}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
            {tasks.length === 0 && <Text style={st.na}>No tasks yet. Add one above.</Text>}
          </View>
        )}

        {/* Comm Log Tab */}
        {activeTab === 'comm' && (
          <View style={st.section}>
            <Text style={st.secTitle}>💬 Communication Log</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <TextInput style={[st.tabInput, { flex: 1 }]} placeholder="Add a note..." placeholderTextColor="rgba(255,255,255,0.3)" value={newNote} onChangeText={setNewNote} multiline />
              <TouchableOpacity style={st.tabAddBtn} onPress={addCommNote}>
                <Ionicons name="send" size={16} color="#0F172A" />
              </TouchableOpacity>
            </View>
            {commLogs.map((log: any) => (
              <View key={log.id} style={st.commCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={st.commAuthor}>{log.author || 'Admin'}</Text>
                  <Text style={st.commDate}>{log.created_at ? new Date(log.created_at).toLocaleDateString('en-IN') : ''}</Text>
                </View>
                <Text style={st.commNote}>{log.note}</Text>
              </View>
            ))}
            {commLogs.length === 0 && <Text style={st.na}>No communication logs yet.</Text>}
          </View>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <View style={st.section}>
            <Text style={st.secTitle}>☑️ Quality Checklist</Text>
            {checklist.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <View style={st.progressBar}><View style={[st.progressFill, { width: `${(checklist.filter((c: any) => c.checked).length / checklist.length * 100)}%`, backgroundColor: '#10B981' }]} /></View>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#10B981', marginTop: 4 }}>{checklist.filter((c: any) => c.checked).length}/{checklist.length} completed</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <TextInput style={[st.tabInput, { flex: 1 }]} placeholder="Add checklist item..." placeholderTextColor="rgba(255,255,255,0.3)" value={newCheckItem} onChangeText={setNewCheckItem} />
              <TouchableOpacity style={st.tabAddBtn} onPress={addChecklistItem}>
                <Ionicons name="add" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
            {checklist.map((item: any) => (
              <TouchableOpacity key={item.id} style={st.checkRow} onPress={() => toggleCheck(item.id)}>
                <Ionicons name={item.checked ? 'checkbox' : 'square-outline'} size={22} color={item.checked ? '#10B981' : 'rgba(255,255,255,0.2)'} />
                <Text style={[st.checkText, item.checked && st.checkTextDone]}>{item.item || item.title}</Text>
              </TouchableOpacity>
            ))}
            {checklist.length === 0 && <Text style={st.na}>No checklist items yet.</Text>}
          </View>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <View style={st.section}>
            <Text style={st.secTitle}>💰 Project Billing</Text>
            <View style={st.finRow}>
              <View style={st.finItem}><Text style={st.finLabel}>Client Budget</Text><Text style={st.finVal}>{p.budget ? `₹${Number(p.budget).toLocaleString('en-IN')}` : 'TBD'}</Text></View>
              <View style={st.finItem}><Text style={st.finLabel}>Vendor Price</Text><Text style={st.finVal}>{p.vendor_price ? `₹${Number(p.vendor_price).toLocaleString('en-IN')}` : 'TBD'}</Text></View>
            </View>
            <View style={[st.finRow, { marginTop: 10 }]}>
              <View style={st.finItem}><Text style={st.finLabel}>Margin</Text><Text style={[st.finVal, { color: '#10B981' }]}>{p.budget && p.vendor_price ? `₹${(Number(p.budget) - Number(p.vendor_price)).toLocaleString('en-IN')}` : '—'}</Text></View>
              <View style={st.finItem}><Text style={st.finLabel}>Invoice Status</Text><Text style={[st.finVal, { color: p.invoice_status === 'paid' ? '#10B981' : '#F59E0B' }]}>{(p.invoice_status || 'none').toUpperCase()}</Text></View>
            </View>
            <TouchableOpacity style={[st.actBtn, { backgroundColor: 'rgba(16,185,129,0.15)', marginTop: 16, alignSelf: 'stretch', justifyContent: 'center' }]} onPress={generateInvoice} disabled={tabSaving}>
              <Ionicons name="receipt" size={18} color="#10B981" />
              <Text style={[st.actText, { color: '#10B981' }]}>{tabSaving ? 'Generating...' : '🧾 Generate Invoice & Request Payment'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Assign Vendor Modal */}
      <Modal visible={assignModal} animationType="slide" transparent>
        <View style={st.mo}>
          <View style={[st.moSheet, { maxHeight: '80%' }]}>
            <View style={st.moHdr}>
              <Text style={st.moTitle}>Assign Vendor</Text>
              <TouchableOpacity onPress={() => { setAssignModal(false); setVendorSearch(''); setVendorId(''); }}>
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 }}>
              <Ionicons name="search" size={18} color="#94A3B8" />
              <TextInput
                style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 14, color: '#0F172A' }}
                placeholder="Search vendors by name or email..."
                placeholderTextColor="#94A3B8"
                value={vendorSearch}
                onChangeText={setVendorSearch}
              />
            </View>

            {/* Or enter ID manually */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <TextInput
                style={[st.moInput, { flex: 1 }]}
                value={vendorId}
                onChangeText={setVendorId}
                keyboardType="numeric"
                placeholder="Or enter vendor ID manually"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity
                style={[st.moBtn, { marginTop: 0, paddingVertical: 14, paddingHorizontal: 16 }]}
                onPress={() => {
                  if (!vendorId.trim()) return Alert.alert('Required', 'Select or enter vendor');
                  updateMut.mutate({ assigned_to: Number(vendorId) });
                  setAssignModal(false);
                  setVendorId('');
                  setVendorSearch('');
                }}
              >
                <Text style={st.moBtnText}>Assign</Text>
              </TouchableOpacity>
            </View>

            {/* Vendor list */}
            <FlatList
              data={filteredVendors}
              keyExtractor={(item: any) => String(item.id)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
                    paddingHorizontal: 12, borderRadius: 12, marginBottom: 4,
                    backgroundColor: String(vendorId) === String(item.id) ? '#FEF3C7' : '#F8FAFC',
                  }}
                  onPress={() => {
                    setVendorId(String(item.id));
                    updateMut.mutate({ assigned_to: item.id });
                    setAssignModal(false);
                    setVendorId('');
                    setVendorSearch('');
                  }}
                >
                  <Avatar name={item.fullname} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#0F172A' }}>{item.fullname || 'No name'}</Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#64748B' }}>{item.email} • ID: {item.id}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#94A3B8', paddingVertical: 20, fontFamily: 'Inter_400Regular' }}>
                  {vendorSearch ? 'No vendors match search' : 'No vendors found'}
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' },
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  hdrTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFF' },
  section: { marginHorizontal: 20, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  secTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  projTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFF', flex: 1, marginRight: 10 },
  desc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 10, lineHeight: 21 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.5 },

  // Progress
  progressBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#F59E0B' },
  progressLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#F59E0B', marginTop: 6 },
  stepFlow: { flexDirection: 'row', marginTop: 16, gap: 2 },
  stepItem: { flex: 1, alignItems: 'center', gap: 4 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)' },
  stepDotDone: { backgroundColor: '#F59E0B' },
  stepLabel: { fontFamily: 'Inter_400Regular', fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'capitalize', textAlign: 'center' },
  stepLabelDone: { color: '#F59E0B' },

  // Person
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  personName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  personSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
  na: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.25)' },
  assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(129,140,248,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  assignBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#818CF8' },

  // Financials
  finRow: { flexDirection: 'row', gap: 10 },
  finItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, alignItems: 'center' },
  finLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  finVal: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFF' },

  // Details
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  detailLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  detailVal: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' },

  // Actions
  actBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  actText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, textTransform: 'capitalize' },

  // Modal
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  moSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  moHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  moTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#0F172A' },
  moLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#475569', marginBottom: 8 },
  moInput: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A', borderWidth: 1.5, borderColor: '#E2E8F0' },
  moBtn: { backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  moBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#0F172A' },

  // Tabs
  tabBar: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 4, gap: 2 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)' },
  tabActive: { backgroundColor: 'rgba(245,158,11,0.15)' },
  tabLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: 'rgba(255,255,255,0.35)' },
  tabLabelActive: { color: '#F59E0B', fontFamily: 'Inter_700Bold' },
  tabInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#FFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  tabAddBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },
  taskCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  taskTitle: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  miniBtn: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  commCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, marginBottom: 8 },
  commAuthor: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#818CF8' },
  commDate: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.25)' },
  commNote: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6, lineHeight: 19 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  checkText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.7)', flex: 1 },
  checkTextDone: { textDecorationLine: 'line-through', color: 'rgba(255,255,255,0.3)' },
});
