/**
 * Admin Chat Thread — Messages with delete, group info, member management.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Modal, ScrollView, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGroupMessagesApi, sendGroupMessageApi,
  getDirectMessagesApi, sendDirectMessageApi,
  getGroupChatsApi, deleteGroupApi, leaveGroupApi, deleteMessageApi,
  type ChatMessage,
} from '@/services/chat';
import { useAuthStore } from '@/stores/authStore';
import Avatar from '@/components/ui/Avatar';
import api from '@/services/api';
import Toast from 'react-native-toast-message';

export default function AdminChatThreadScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const isDM = type === 'dm';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [message, setMessage] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  // ── Get group info for title ──────────────────────────────
  const { data: groups = [] } = useQuery({
    queryKey: ['admin-chat-groups'],
    queryFn: getGroupChatsApi,
    enabled: !isDM,
  });
  const groupInfo = groups.find((g: any) => String(g.id) === String(id));
  const chatTitle = isDM ? 'Direct Message' : (groupInfo?.name || `Chat #${id}`);

  // ── Group members (only fetch when info panel open) ────────
  const { data: groupDetail } = useQuery({
    queryKey: ['admin-group-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/chat/groups/${id}`);
      return data;
    },
    enabled: showInfo && !isDM,
  });
  const members = groupDetail?.members || [];

  // ── Messages ───────────────────────────────────────────────
  const queryKey = isDM ? ['admin-dm-messages', id] : ['admin-chat-messages', id];
  const { data: messages = [] } = useQuery({
    queryKey,
    queryFn: () => isDM ? getDirectMessagesApi(id!) : getGroupMessagesApi(id!),
    enabled: !!id,
    refetchInterval: 3000,
  });

  // ── Send ───────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: (text: string) => isDM ? sendDirectMessageApi(id!, text) : sendGroupMessageApi(id!, text),
    onMutate: async (text: string) => {
      await qc.cancelQueries({ queryKey });
      const previousData = qc.getQueryData(queryKey);
      const optimisticMsg: ChatMessage = {
        id: `opt-${Date.now()}`,
        sender_id: user?.id || 0,
        sender_name: user?.fullname || 'You',
        sender_role: user?.role,
        content: text,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData(queryKey, (old: any) => [...(Array.isArray(old) ? old : []), optimisticMsg]);
      setMessage('');
      return { previousData };
    },
    onError: (_err, _text, ctx) => { if (ctx?.previousData) qc.setQueryData(queryKey, ctx.previousData); },
    onSettled: () => { qc.invalidateQueries({ queryKey }); qc.invalidateQueries({ queryKey: ['admin-chat-groups'] }); },
  });

  // ── Delete message ─────────────────────────────────────────
  const deleteMsgMut = useMutation({
    mutationFn: (messageId: number) => deleteMessageApi(id!, messageId),
    onSuccess: () => { qc.invalidateQueries({ queryKey }); Toast.show({ type: 'success', text1: 'Message deleted' }); },
    onError: (e: any) => Toast.show({ type: 'error', text1: e?.response?.data?.error || 'Delete failed' }),
  });

  // ── Delete group ───────────────────────────────────────────
  const deleteGroupMut = useMutation({
    mutationFn: () => deleteGroupApi(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-chat-groups'] });
      Toast.show({ type: 'success', text1: 'Group deleted' });
      router.back();
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: e?.response?.data?.error || 'Delete failed' }),
  });

  // ── Leave group ────────────────────────────────────────────
  const leaveGroupMut = useMutation({
    mutationFn: () => leaveGroupApi(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-chat-groups'] });
      Toast.show({ type: 'success', text1: 'Left group' });
      router.back();
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: e?.response?.data?.error || 'Failed' }),
  });

  // ── Remove member ──────────────────────────────────────────
  const removeMemberMut = useMutation({
    mutationFn: async (userId: number) => {
      // Direct Supabase delete via our API — we'll use the main group API with delete body
      await api.delete(`/api/chat/groups/${id}`, {
        data: { removeMember: true, user_id: userId },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-group-detail', id] });
      Toast.show({ type: 'success', text1: 'Member removed' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to remove member' }),
  });

  const handleSend = useCallback(() => {
    const text = message.trim();
    if (!text || sendMutation.isPending) return;
    sendMutation.mutate(text);
  }, [message, sendMutation]);

  const handleMessageLongPress = (msg: ChatMessage) => {
    const canDelete = msg.sender_id === user?.id || isAdmin;
    if (!canDelete || String(msg.id).startsWith('opt-')) return;

    Alert.alert('Message', msg.content.slice(0, 80), [
      { text: 'Copy', onPress: () => {} },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => Alert.alert('Delete Message', 'This message will be removed for everyone.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteMsgMut.mutate(Number(msg.id)) },
        ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleMorePress = () => {
    if (isDM) return;
    const options: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [
      { text: 'Group Info & Members', onPress: () => setShowInfo(true) },
      {
        text: 'Leave Group',
        onPress: () => Alert.alert('Leave', `Leave "${chatTitle}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => leaveGroupMut.mutate() },
        ]),
      },
    ];
    if (isAdmin) {
      options.push({
        text: 'Delete Group',
        style: 'destructive',
        onPress: () => Alert.alert('Delete Group', 'Permanently delete this group and all messages?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteGroupMut.mutate() },
        ]),
      });
    }
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(chatTitle, 'Group Options', options);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.sender_id === user?.id;
    const isOpt = String(item.id).startsWith('opt-');
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => handleMessageLongPress(item)}
        style={[st.msgRow, isOwn && st.msgRowOwn]}
      >
        {!isOwn && <View style={st.msgAvatarWrap}><Avatar name={item.sender_name} size={30} /></View>}
        <View style={[st.msgBubble, isOwn ? st.bubbleOwn : st.bubbleOther, isOpt && { opacity: 0.6 }]}>
          {!isOwn && <Text style={st.msgSender}>{item.sender_name}</Text>}
          <Text style={[st.msgText, isOwn && st.msgTextOwn]}>{item.content}</Text>
          <View style={st.msgFooter}>
            <Text style={[st.msgTime, isOwn && st.msgTimeOwn]}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isOwn && <Ionicons name={isOpt ? 'time-outline' : 'checkmark-done'} size={14} color={isOpt ? 'rgba(15,23,42,0.3)' : 'rgba(15,23,42,0.6)'} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView style={[st.c, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={st.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={st.hdrInfo} onPress={() => !isDM && setShowInfo(true)} activeOpacity={isDM ? 1 : 0.7}>
          <Text style={st.hdrTitle} numberOfLines={1}>{chatTitle}</Text>
          <View style={st.statusRow}>
            <View style={st.statusDot} />
            <Text style={st.hdrSub}>{messages.length} messages{!isDM && groupInfo ? ` • ${groupInfo.participant_count || 0} members` : ''}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={st.moreBtn} onPress={handleMorePress}>
          <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        renderItem={renderMessage}
        keyExtractor={(item) => String(item.id)}
        inverted
        contentContainerStyle={st.msgList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View style={[st.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput style={st.textInput} placeholder="Type a message..." placeholderTextColor="rgba(255,255,255,0.3)" value={message} onChangeText={setMessage} multiline maxLength={2000} onSubmitEditing={handleSend} />
        <TouchableOpacity style={[st.sendBtn, !message.trim() && st.sendBtnOff]} onPress={handleSend} disabled={!message.trim() || sendMutation.isPending}>
          <Ionicons name="send" size={20} color={message.trim() ? '#0F172A' : 'rgba(255,255,255,0.2)'} />
        </TouchableOpacity>
      </View>

      {/* ═══ Group Info Modal ═══ */}
      <Modal visible={showInfo} animationType="slide" transparent>
        <View style={st.infoOverlay}>
          <View style={st.infoSheet}>
            <View style={st.infoHdr}>
              <Text style={st.infoTitle}>Group Info</Text>
              <TouchableOpacity onPress={() => setShowInfo(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Group name */}
            <View style={st.infoCard}>
              <View style={st.infoIcon}><Ionicons name="people" size={24} color="#F59E0B" /></View>
              <View style={{ flex: 1 }}>
                <Text style={st.infoName}>{groupInfo?.name || 'Group'}</Text>
                <Text style={st.infoSub}>{groupInfo?.description || `Created ${groupInfo?.created_at ? new Date(groupInfo.created_at).toLocaleDateString() : 'recently'}`}</Text>
              </View>
            </View>

            {/* Members */}
            <Text style={st.membersTitle}>Members ({members.length})</Text>
            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              {members.map((m: any) => {
                const memberUser = m.user || {};
                const memberId = memberUser.id || m.user_id;
                const isSelf = memberId === user?.id;
                return (
                  <View key={memberId} style={st.memberRow}>
                    <Avatar name={memberUser.fullname} size={38} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={st.memberName}>{memberUser.fullname || `User #${memberId}`}</Text>
                        {m.role === 'admin' && (
                          <View style={st.adminBadge}><Text style={st.adminBadgeText}>Admin</Text></View>
                        )}
                        {isSelf && <Text style={st.youLabel}>(You)</Text>}
                      </View>
                      <Text style={st.memberSub}>{memberUser.role || ''} • Joined {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : ''}</Text>
                    </View>
                    {isAdmin && !isSelf && (
                      <TouchableOpacity
                        style={st.removeBtn}
                        onPress={() => Alert.alert('Remove Member', `Remove ${memberUser.fullname || 'this user'} from the group?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Remove', style: 'destructive', onPress: () => removeMemberMut.mutate(memberId) },
                        ])}
                      >
                        <Ionicons name="person-remove" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
              {members.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <ActivityIndicator color="#F59E0B" />
                  <Text style={{ color: '#94A3B8', marginTop: 8, fontFamily: 'Inter_400Regular' }}>Loading members...</Text>
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={{ marginTop: 16, gap: 8 }}>
              <TouchableOpacity style={st.leaveBtn} onPress={() => {
                setShowInfo(false);
                Alert.alert('Leave', `Leave "${chatTitle}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Leave', style: 'destructive', onPress: () => leaveGroupMut.mutate() },
                ]);
              }}>
                <Ionicons name="exit-outline" size={18} color="#EF4444" />
                <Text style={st.leaveBtnText}>Leave Group</Text>
              </TouchableOpacity>

              {isAdmin && (
                <TouchableOpacity style={[st.leaveBtn, { borderColor: '#EF4444', backgroundColor: '#FEE2E2' }]} onPress={() => {
                  setShowInfo(false);
                  Alert.alert('Delete Group', 'This will permanently delete the group and all messages.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteGroupMut.mutate() },
                  ]);
                }}>
                  <Ionicons name="trash" size={18} color="#DC2626" />
                  <Text style={[st.leaveBtnText, { color: '#DC2626' }]}>Delete Group</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' },
  hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  hdrInfo: { flex: 1 },
  hdrTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, color: '#FFF' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  hdrSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  moreBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // Messages
  msgList: { paddingHorizontal: 16, paddingVertical: 12 },
  msgRow: { flexDirection: 'row', marginBottom: 12, maxWidth: '80%' },
  msgRowOwn: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgAvatarWrap: { marginRight: 8, marginTop: 4 },
  msgBubble: { borderRadius: 16, padding: 12, maxWidth: '100%' },
  bubbleOwn: { backgroundColor: '#F59E0B', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 4 },
  msgSender: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#F59E0B', marginBottom: 4 },
  msgText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  msgTextOwn: { color: '#0F172A' },
  msgFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, alignSelf: 'flex-end' },
  msgTime: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.3)' },
  msgTimeOwn: { color: 'rgba(15,23,42,0.5)' },

  // Input
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', gap: 8 },
  textInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFF', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },
  sendBtnOff: { backgroundColor: 'rgba(255,255,255,0.08)' },

  // Group Info Modal
  infoOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  infoSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '85%' },
  infoHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  infoTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#0F172A' },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, marginBottom: 20 },
  infoIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(245,158,11,0.1)', alignItems: 'center', justifyContent: 'center' },
  infoName: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#0F172A' },
  infoSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#64748B', marginTop: 2 },

  membersTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#475569', marginBottom: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  memberName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#0F172A' },
  memberSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#94A3B8', marginTop: 1 },
  adminBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  adminBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#3B82F6' },
  youLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#94A3B8' },
  removeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },

  leaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  leaveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#EF4444' },
});
