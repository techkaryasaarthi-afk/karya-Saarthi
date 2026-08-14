/**
 * Admin Chat — Group chats, DMs, with full management (create, delete, swipe actions).
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  TextInput, Modal, Alert, ActivityIndicator, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGroupChatsApi, getDirectConversationsApi, deleteGroupApi, leaveGroupApi, type ChatGroup } from '@/services/chat';
import Avatar from '@/components/ui/Avatar';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAuthStore } from '@/stores/authStore';
import Toast from 'react-native-toast-message';

type Tab = 'groups' | 'direct';

export default function AdminChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>('groups');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // ── Group chats ────────────────────────────────────────────
  const { data: groups = [], refetch: refetchGroups, isRefetching: isGroupsRefetching } = useQuery({
    queryKey: ['admin-chat-groups'],
    queryFn: getGroupChatsApi,
    enabled: tab === 'groups',
  });

  // ── Direct messages — merge DM contacts + admin user list for full coverage ──
  const { data: contacts = [], refetch: refetchDM, isRefetching: isDMRefetching } = useQuery({
    queryKey: ['admin-dm-contacts'],
    queryFn: async () => {
      // Fetch both sources in parallel
      const [dmResult, usersResult] = await Promise.all([
        getDirectConversationsApi(),
        api.get(`${ADMIN_ENDPOINTS.USERS}?limit=300`).then(r => r.data?.users || []).catch(() => []),
      ]);

      // Build a map from DM contacts (has lastMessage, unreadCount)
      const contactMap = new Map<number, any>();
      (dmResult || []).forEach((c: any) => contactMap.set(c.id, c));

      // Merge admin users list — adds internal staff the DM API may not return
      (usersResult || []).forEach((u: any) => {
        if (u.id === user?.id) return; // skip self
        if (!contactMap.has(u.id)) {
          contactMap.set(u.id, {
            id: u.id,
            fullname: u.fullname,
            email: u.email,
            role: u.role,
            lastMessage: null,
            unreadCount: 0,
          });
        }
      });

      // Convert to array, sort: contacts with messages first, then alphabetically
      return Array.from(contactMap.values()).sort((a: any, b: any) => {
        if (a.lastMessage && !b.lastMessage) return -1;
        if (!a.lastMessage && b.lastMessage) return 1;
        if (a.lastMessage && b.lastMessage) {
          return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
        }
        return (a.fullname || '').localeCompare(b.fullname || '');
      });
    },
  });

  // ── All users (for member selection) ───────────────────────
  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-all-users-chat'],
    queryFn: async () => {
      const { data } = await api.get(`${ADMIN_ENDPOINTS.USERS}?limit=200`);
      return data?.users || [];
    },
    enabled: showCreate,
  });

  const filteredUsers = useMemo(() => {
    if (!memberSearch) return allUsers;
    const q = memberSearch.toLowerCase();
    return allUsers.filter((u: any) =>
      (u.fullname || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [allUsers, memberSearch]);

  const toggleMember = (userId: number) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // ── Create group ───────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: async () => {
      if (!groupForm.name.trim()) throw new Error('Group name required');
      const { data } = await api.post('/api/chat/groups', {
        name: groupForm.name.trim(),
        description: groupForm.description.trim() || undefined,
        member_ids: selectedMembers,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-chat-groups'] });
      Toast.show({ type: 'success', text1: 'Group Created' });
      resetCreateForm();
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.error || e?.message || 'Failed to create group';
      Alert.alert('Error', msg);
    },
  });

  // ── Delete group ───────────────────────────────────────────
  const deleteMut = useMutation({
    mutationFn: (groupId: string) => deleteGroupApi(groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-chat-groups'] });
      Toast.show({ type: 'success', text1: 'Group Deleted' });
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: e?.response?.data?.error || 'Delete failed' }),
  });

  // ── Leave group ────────────────────────────────────────────
  const leaveMut = useMutation({
    mutationFn: (groupId: string) => leaveGroupApi(groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-chat-groups'] });
      Toast.show({ type: 'success', text1: 'Left Group' });
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: e?.response?.data?.error || 'Failed' }),
  });

  const resetCreateForm = () => {
    setShowCreate(false);
    setGroupForm({ name: '', description: '' });
    setSelectedMembers([]);
    setMemberSearch('');
  };

  const isRefetching = tab === 'groups' ? isGroupsRefetching : isDMRefetching;
  const refetch = tab === 'groups' ? refetchGroups : refetchDM;

  const filteredGroups = groups.filter((g: ChatGroup) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredContacts = contacts.filter((c: any) => {
    const matchSearch = (c.fullname || c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (roleFilter === 'all') return true;
    if (roleFilter === 'internal') return ['super_admin', 'admin', 'board_member', 'pillar_member'].includes(c.role);
    return c.role === roleFilter;
  });

  const ROLE_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'internal', label: 'Internal Team' },
    { key: 'admin', label: 'Admin' },
    { key: 'board_member', label: 'Board' },
    { key: 'pillar_member', label: 'Pillar' },
    { key: 'vendor', label: 'Vendors' },
    { key: 'customer', label: 'Customers' },
  ];

  const getRoleBadge = (role: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      super_admin: { bg: '#FEF3C7', text: '#92400E', label: 'Super Admin' },
      admin: { bg: '#DBEAFE', text: '#1E40AF', label: 'Admin' },
      board_member: { bg: '#EDE9FE', text: '#5B21B6', label: 'Board' },
      pillar_member: { bg: '#FCE7F3', text: '#9D174D', label: 'Pillar' },
      vendor: { bg: '#D1FAE5', text: '#065F46', label: 'Vendor' },
      customer: { bg: '#F1F5F9', text: '#475569', label: 'Customer' },
    };
    return map[role] || { bg: '#F1F5F9', text: '#475569', label: role };
  };

  const handleGroupLongPress = (group: ChatGroup) => {
    const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
    const options: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [
      { text: 'Open Chat', onPress: () => router.push(`/(admin)/chat/${group.id}` as any) },
    ];
    options.push({
      text: 'Leave Group',
      onPress: () => Alert.alert('Leave Group', `Leave "${group.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => leaveMut.mutate(group.id) },
      ]),
    });
    if (isAdmin) {
      options.push({
        text: 'Delete Group',
        style: 'destructive',
        onPress: () => Alert.alert('Delete Group', `Permanently delete "${group.name}" and all messages?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteMut.mutate(group.id) },
        ]),
      });
    }
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(group.name, 'Choose an action', options);
  };

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.hdr}>
        <Text style={s.title}>Messages</Text>
        <TouchableOpacity style={s.createBtn} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(['groups', 'direct'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Ionicons name={t === 'groups' ? 'people' : 'person'} size={16} color={tab === t ? '#0F172A' : 'rgba(255,255,255,0.4)'} />
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t === 'groups' ? `Groups (${groups.length})` : `Direct (${contacts.length})`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={s.searchBox}>
        <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
        <TextInput style={s.searchInput} placeholder="Search conversations..." placeholderTextColor="rgba(255,255,255,0.3)" value={search} onChangeText={setSearch} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}>
        {tab === 'groups' ? (
          filteredGroups.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="chatbubbles-outline" size={56} color="rgba(255,255,255,0.15)" />
              <Text style={s.emptyTitle}>No group chats</Text>
              <Text style={s.emptySub}>Tap + to create a new group</Text>
            </View>
          ) : (
            filteredGroups.map((group: ChatGroup) => (
              <TouchableOpacity key={group.id} style={s.chatItem} activeOpacity={0.7}
                onPress={() => router.push(`/(admin)/chat/${group.id}` as any)}
                onLongPress={() => handleGroupLongPress(group)}
              >
                <View style={s.chatAvatar}>
                  <Ionicons name={group.type === 'project' ? 'briefcase' : 'people'} size={22} color="#F59E0B" />
                </View>
                <View style={s.chatInfo}>
                  <View style={s.chatRow}>
                    <Text style={s.chatName} numberOfLines={1}>{group.name}</Text>
                    {group.last_message_at && (
                      <Text style={s.chatTime}>{new Date(group.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    )}
                  </View>
                  <View style={s.chatRow}>
                    <Text style={s.chatPreview} numberOfLines={1}>{group.last_message || `${group.participant_count || 0} members`}</Text>
                    {group.unread_count > 0 && (
                      <View style={s.unreadBadge}><Text style={s.unreadText}>{group.unread_count}</Text></View>
                    )}
                  </View>
                </View>
                {/* Quick delete icon */}
                <TouchableOpacity
                  style={{ paddingLeft: 8 }}
                  onPress={() => handleGroupLongPress(group)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color="rgba(255,255,255,0.2)" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )
        ) : (
          <>
            {/* Role filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 42, marginBottom: 8, paddingHorizontal: 16 }} contentContainerStyle={{ gap: 6, alignItems: 'center' }}>
              {ROLE_FILTERS.map(rf => (
                <TouchableOpacity
                  key={rf.key}
                  style={[s.roleChip, roleFilter === rf.key && s.roleChipActive]}
                  onPress={() => setRoleFilter(rf.key)}
                >
                  <Text style={[s.roleChipText, roleFilter === rf.key && s.roleChipTextActive]}>{rf.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filteredContacts.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="person-outline" size={56} color="rgba(255,255,255,0.15)" />
                <Text style={s.emptyTitle}>No contacts found</Text>
                <Text style={s.emptySub}>{roleFilter !== 'all' ? 'Try a different filter' : 'Pull down to refresh'}</Text>
              </View>
            ) : (
              filteredContacts.map((contact: any) => {
                const badge = getRoleBadge(contact.role);
                const lastMsg = contact.lastMessage;
                return (
                  <TouchableOpacity key={contact.id} style={s.chatItem} activeOpacity={0.7}
                    onPress={() => router.push(`/(admin)/chat/${contact.id}?type=dm` as any)}>
                    <Avatar name={contact.fullname || contact.name} size={48} />
                    <View style={s.chatInfo}>
                      <View style={s.chatRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 }}>
                          <Text style={s.chatName} numberOfLines={1}>{contact.fullname || contact.name}</Text>
                          <View style={{ backgroundColor: badge.bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: badge.text }}>{badge.label}</Text>
                          </View>
                        </View>
                        {lastMsg?.created_at && (
                          <Text style={s.chatTime}>{new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        )}
                      </View>
                      <Text style={s.chatPreview} numberOfLines={1}>
                        {lastMsg?.content || 'Tap to start chatting'}
                      </Text>
                    </View>
                    {(contact.unreadCount || 0) > 0 && (
                      <View style={s.unreadBadge}><Text style={s.unreadText}>{contact.unreadCount}</Text></View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ═══ Create Group Modal ═══ */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={s.mo}>
          <View style={[s.mc, { maxHeight: '90%' }]}>
            <View style={s.mh}>
              <Text style={s.mTitle}>Create Group Chat</Text>
              <TouchableOpacity onPress={resetCreateForm}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>

            <Text style={s.fl}>Group Name *</Text>
            <TextInput style={s.inp} placeholder="e.g. Design Team" placeholderTextColor="rgba(255,255,255,0.2)" value={groupForm.name} onChangeText={t => setGroupForm(f => ({ ...f, name: t }))} />

            <Text style={s.fl}>Description</Text>
            <TextInput style={[s.inp, { height: 60 }]} placeholder="Optional description" placeholderTextColor="rgba(255,255,255,0.2)" value={groupForm.description} onChangeText={t => setGroupForm(f => ({ ...f, description: t }))} multiline />

            {/* Member selection */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <Text style={s.fl}>Add Members</Text>
              {selectedMembers.length > 0 && (
                <View style={{ backgroundColor: '#F59E0B', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: '#0F172A' }}>{selectedMembers.length} selected</Text>
                </View>
              )}
            </View>

            {/* Selected members chips */}
            {selectedMembers.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 36, marginBottom: 8 }} contentContainerStyle={{ gap: 6 }}>
                {selectedMembers.map(uid => {
                  const u = allUsers.find((x: any) => x.id === uid);
                  return (
                    <TouchableOpacity key={uid} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 }}
                      onPress={() => toggleMember(uid)}>
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#F59E0B' }}>{u?.fullname || `ID: ${uid}`}</Text>
                      <Ionicons name="close-circle" size={14} color="#F59E0B" />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Search users */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 10, marginBottom: 8 }}>
              <Ionicons name="search" size={16} color="rgba(255,255,255,0.3)" />
              <TextInput
                style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#FFF' }}
                placeholder="Search users..." placeholderTextColor="rgba(255,255,255,0.3)"
                value={memberSearch} onChangeText={setMemberSearch}
              />
            </View>

            {/* User list */}
            <FlatList
              data={filteredUsers}
              keyExtractor={(item: any) => String(item.id)}
              style={{ maxHeight: 220 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: { item: any }) => {
                const selected = selectedMembers.includes(item.id);
                return (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10, backgroundColor: selected ? 'rgba(245,158,11,0.1)' : 'transparent' }}
                    onPress={() => toggleMember(item.id)}
                  >
                    <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: selected ? '#F59E0B' : 'rgba(255,255,255,0.15)', backgroundColor: selected ? '#F59E0B' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                      {selected && <Ionicons name="checkmark" size={14} color="#0F172A" />}
                    </View>
                    <Avatar name={item.fullname} size={32} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{item.fullname || 'No name'}</Text>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{item.email} • {item.role}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', paddingVertical: 16, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
                  {memberSearch ? 'No users match' : 'Loading users...'}
                </Text>
              }
            />

            <TouchableOpacity
              style={[s.submitBtn, createMut.isPending && { opacity: 0.6 }]}
              onPress={() => createMut.mutate()}
              disabled={createMut.isPending}
            >
              {createMut.isPending ? <ActivityIndicator color="#0F172A" /> : (
                <Text style={s.submitText}>Create Group{selectedMembers.length > 0 ? ` (${selectedMembers.length} members)` : ''}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' },
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFF' },
  createBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },

  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: '#F59E0B' },
  tabText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  tabTextActive: { color: '#0F172A', fontWeight: '700' },

  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFF' },

  chatItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
  chatAvatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(245,158,11,0.12)', alignItems: 'center', justifyContent: 'center' },
  chatInfo: { flex: 1 },
  chatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.9)', flex: 1, marginRight: 8 },
  chatTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  chatPreview: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.4)', flex: 1, marginTop: 4 },
  unreadBadge: { backgroundColor: '#F59E0B', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#0F172A' },

  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: 'rgba(255,255,255,0.5)' },
  emptySub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.25)' },

  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  mc: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  mh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFF' },
  fl: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6, marginTop: 14 },
  inp: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  submitBtn: { backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 20 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#0F172A' },

  roleChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  roleChipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  roleChipText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  roleChipTextActive: { color: '#0F172A', fontWeight: '700' },
});
