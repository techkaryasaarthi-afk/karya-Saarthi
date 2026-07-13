/**
 * Customer Chat Screen — Two tabs: Support Chat + Project Chats.
 * 
 * Support tab: Direct chat with the admin/super_admin team (like website DirectChatPanel mode="user")
 * Projects tab: List of project group chats (like website's "Team Chat" per project)
 * 
 * Mintlify: Flat UI, hairline borders, ink text, brand green accents.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Linking, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getDirectMessagesApi, sendDirectMessageApi,
  getProjectMessagesApi, sendProjectMessageApi,
  getContactsApi,
  type Message,
} from '@/services/chat';
import { getProjectsApi } from '@/services/projects';
import { pickDocument, uploadFile } from '@/services/upload';
import { useAuthStore } from '@/stores/authStore';
import Avatar from '@/components/ui/Avatar';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import Toast from 'react-native-toast-message';

type ChatTab = 'support' | 'projects';

export default function CustomerChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const theme = useAppTheme();
  const s = useStyles(theme);
  const [activeTab, setActiveTab] = useState<ChatTab>('support');

  // ── Support Chat State ──
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [opsReceiverId, setOpsReceiverId] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // ── Project Chat State ──
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [projectMessage, setProjectMessage] = useState('');

  // Auto-find admin for support chat via API (bypasses RLS)
  useEffect(() => {
    (async () => {
      try {
        const contacts = await getContactsApi();
        // For customers, getContactsApi returns admin/super_admin users
        if (contacts && contacts.length > 0) {
          setOpsReceiverId(contacts[0].id);
        }
      } catch {}
      setInitialLoading(false);
    })();
  }, []);

  // ── Support Messages ──
  const supportQueryKey = ['support-chat-dm', opsReceiverId];
  const { data: supportData } = useQuery({
    queryKey: supportQueryKey,
    queryFn: () => opsReceiverId ? getDirectMessagesApi(opsReceiverId) : { messages: [] },
    enabled: !!opsReceiverId && activeTab === 'support',
    refetchInterval: 3000,
  });
  const supportMessages = useMemo(() => supportData?.messages || [], [supportData]);

  const supportSendMutation = useMutation({
    mutationFn: ({ text, attachment_url, file_type }: { text: string; attachment_url?: string; file_type?: string }) => {
      if (!opsReceiverId) throw new Error('No support contact');
      return sendDirectMessageApi(opsReceiverId, { text, attachment_url, file_type });
    },
    onMutate: async ({ text, attachment_url }) => {
      await queryClient.cancelQueries({ queryKey: supportQueryKey });
      const prev = queryClient.getQueryData(supportQueryKey);
      const optimistic: Message = { id: `opt-${Date.now()}`, sender_id: user?.id, sender_name: user?.fullname || 'You', sender_role: user?.role, text, attachment_url, created_at: new Date().toISOString() };
      queryClient.setQueryData(supportQueryKey, (old: any) => ({ ...old, messages: [...(old?.messages || []), optimistic] }));
      setMessage('');
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) queryClient.setQueryData(supportQueryKey, ctx.prev); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: supportQueryKey }),
  });

  // ── Projects List ──
  const { data: projectData, refetch: refetchProjects } = useQuery({
    queryKey: ['customer-chat-projects'],
    queryFn: getProjectsApi,
    enabled: activeTab === 'projects',
  });
  const projects = projectData?.projects || [];

  // ── Project Messages ──
  const projectQueryKey = ['project-chat-messages', selectedProjectId];
  const { data: projectMsgData } = useQuery({
    queryKey: projectQueryKey,
    queryFn: () => selectedProjectId ? getProjectMessagesApi(selectedProjectId) : { messages: [] },
    enabled: !!selectedProjectId && activeTab === 'projects',
    refetchInterval: 3000,
  });
  const projectMessages = useMemo(() => projectMsgData?.messages || [], [projectMsgData]);

  const projectSendMutation = useMutation({
    mutationFn: ({ text, attachment_url, file_type }: { text: string; attachment_url?: string; file_type?: string }) => {
      if (!selectedProjectId) throw new Error('No project selected');
      return sendProjectMessageApi(selectedProjectId, { text, attachment_url, file_type });
    },
    onMutate: async ({ text, attachment_url }) => {
      await queryClient.cancelQueries({ queryKey: projectQueryKey });
      const prev = queryClient.getQueryData(projectQueryKey);
      const optimistic: Message = { id: `opt-${Date.now()}`, sender_id: user?.id, sender_name: user?.fullname || 'You', sender_role: user?.role, text, attachment_url, created_at: new Date().toISOString() };
      queryClient.setQueryData(projectQueryKey, (old: any) => ({ ...old, messages: [...(old?.messages || []), optimistic] }));
      setProjectMessage('');
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) queryClient.setQueryData(projectQueryKey, ctx.prev); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: projectQueryKey }),
  });

  const handleSupportSend = useCallback(() => {
    const t = message.trim();
    if (!t || supportSendMutation.isPending || !opsReceiverId) return;
    supportSendMutation.mutate({ text: t });
  }, [message, supportSendMutation, opsReceiverId]);

  const handleProjectSend = useCallback(() => {
    const t = projectMessage.trim();
    if (!t || projectSendMutation.isPending || !selectedProjectId) return;
    projectSendMutation.mutate({ text: t });
  }, [projectMessage, projectSendMutation, selectedProjectId]);

  const handleAttachFile = async (isProject: boolean) => {
    const doc = await pickDocument();
    if (!doc) return;
    setUploading(true);
    try {
      const result = await uploadFile(doc.uri, doc.name, doc.mimeType || 'application/octet-stream');
      if (result?.url) {
        const payload = { text: `📎 ${doc.name}`, attachment_url: result.url, file_type: doc.mimeType };
        isProject ? projectSendMutation.mutate(payload) : supportSendMutation.mutate(payload);
      }
    } catch { Alert.alert('Upload Error', 'Failed to upload'); }
    setUploading(false);
  };

  // ── Render Message Bubble ──
  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender_name === user?.fullname || item.sender_id === user?.id;
    const isOpt = String(item.id).startsWith('opt-');
    return (
      <View style={[s.msgRow, isMine && s.msgRowOwn]}>
        {!isMine && <Avatar name={item.sender_name} size={28} />}
        <View style={[s.bubble, isMine ? s.myBubble : s.otherBubble, isOpt && { opacity: 0.7 }]}>
          {!isMine && <Text style={s.senderName}>{item.sender_name}</Text>}
          <Text style={[s.bubbleText, isMine && s.myBubbleText]}>{item.text}</Text>
          {item.attachment_url && (
            <TouchableOpacity style={s.attachmentBox} onPress={() => Linking.openURL(item.attachment_url!)}>
              <Ionicons name="document-attach" size={20} color={theme.primary} />
              <Text style={[s.attachmentText, isMine && s.myAttachmentText]} numberOfLines={1}>View Attachment</Text>
            </TouchableOpacity>
          )}
          <View style={s.bubbleFooter}>
            <Text style={[s.bubbleTime, isMine && s.myBubbleTime]}>{new Date(item.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</Text>
            {isMine && <Ionicons name={isOpt ? 'time-outline' : 'checkmark-done'} size={14} color={isOpt ? 'rgba(10,10,10,0.5)' : theme.ink} />}
          </View>
        </View>
      </View>
    );
  };

  // ── Tab Bar ──
  const tabs: { key: ChatTab; label: string; icon: string }[] = [
    { key: 'support', label: 'Support', icon: 'headset' },
    { key: 'projects', label: 'Projects', icon: 'briefcase' },
  ];

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Messages</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow} style={s.tabScroll}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.key} style={[s.tab, activeTab === tab.key && s.tabActive]} onPress={() => { setActiveTab(tab.key); setSelectedProjectId(null); }}>
            <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? theme.primary : theme.stone} />
            <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── SUPPORT TAB ── */}
      {activeTab === 'support' && (
        initialLoading ? (
          <View style={s.loadingContainer}><ActivityIndicator size="large" color={theme.brandGreen} /><Text style={s.loadingText}>Connecting to support...</Text></View>
        ) : !opsReceiverId ? (
          <View style={s.loadingContainer}><Ionicons name="chatbubble-ellipses-outline" size={56} color={theme.stone} /><Text style={s.emptyTitle}>Support Unavailable</Text><Text style={s.emptySubtitle}>Please try again later</Text></View>
        ) : (
          <>
            <FlatList data={[...supportMessages].reverse()} keyExtractor={(item) => String(item.id)} contentContainerStyle={s.messageList} showsVerticalScrollIndicator={false} inverted renderItem={renderMessage}
              ListEmptyComponent={<View style={s.emptyChat}><Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.stone} /><Text style={s.emptyChatText}>No messages yet</Text><Text style={s.emptyChatSub}>Chat with our support team!</Text></View>}
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={[s.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
                <TouchableOpacity style={s.attachBtn} onPress={() => handleAttachFile(false)} disabled={uploading}>
                  {uploading ? <ActivityIndicator size="small" color={theme.primary} /> : <Ionicons name="add-circle" size={28} color={theme.stone} />}
                </TouchableOpacity>
                <TextInput style={s.input} placeholder="Type your message..." placeholderTextColor={theme.stone} value={message} onChangeText={setMessage} multiline maxLength={2000} onSubmitEditing={handleSupportSend} />
                <TouchableOpacity style={[s.sendBtn, !message.trim() && s.sendBtnDisabled]} onPress={handleSupportSend} disabled={!message.trim() || supportSendMutation.isPending}>
                  <Ionicons name="send" size={20} color={message.trim() ? theme.white : theme.stone} />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </>
        )
      )}

      {/* ── PROJECTS TAB ── */}
      {activeTab === 'projects' && !selectedProjectId && (
        <FlatList
          data={projects}
          keyExtractor={(item: any) => String(item.id)}
          contentContainerStyle={s.listContent}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity style={s.chatItem} activeOpacity={0.7} onPress={() => { setSelectedProjectId(item.id); setSelectedProjectName(item.service_name || item.service_type || item.name || 'Project Chat'); }}>
              <View style={s.avatarWrap}>
                <Avatar name={item.service_name || item.service_type || item.name || 'P'} size={50} />
                <View style={[s.typeBadge, { backgroundColor: theme.stone }]}><Ionicons name="briefcase" size={10} color={theme.white} /></View>
              </View>
              <View style={s.chatContent}>
                <Text style={s.chatName} numberOfLines={1}>{item.service_name || item.service_type || item.name || 'Project'}</Text>
                <Text style={s.chatMsg} numberOfLines={1}>{item.description || 'Tap to open group chat'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.stone} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={s.emptyChat}><Ionicons name="folder-outline" size={48} color={theme.stone} /><Text style={s.emptyChatText}>No projects yet</Text><Text style={s.emptyChatSub}>Create a project to start chatting</Text></View>}
        />
      )}

      {/* ── PROJECT CHAT THREAD ── */}
      {activeTab === 'projects' && selectedProjectId && (
        <>
          <TouchableOpacity style={s.backBar} onPress={() => setSelectedProjectId(null)}>
            <Ionicons name="arrow-back" size={20} color={theme.ink} />
            <Text style={s.backBarText} numberOfLines={1}>{selectedProjectName}</Text>
          </TouchableOpacity>
          <FlatList data={[...projectMessages].reverse()} keyExtractor={(item) => String(item.id)} contentContainerStyle={s.messageList} showsVerticalScrollIndicator={false} inverted renderItem={renderMessage}
            ListEmptyComponent={<View style={s.emptyChat}><Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.stone} /><Text style={s.emptyChatText}>No messages yet</Text><Text style={s.emptyChatSub}>Start the conversation!</Text></View>}
          />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[s.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
              <TouchableOpacity style={s.attachBtn} onPress={() => handleAttachFile(true)} disabled={uploading}>
                {uploading ? <ActivityIndicator size="small" color={theme.primary} /> : <Ionicons name="add-circle" size={28} color={theme.stone} />}
              </TouchableOpacity>
              <TextInput style={s.input} placeholder="Type a message..." placeholderTextColor={theme.stone} value={projectMessage} onChangeText={setProjectMessage} multiline maxLength={2000} onSubmitEditing={handleProjectSend} />
              <TouchableOpacity style={[s.sendBtn, !projectMessage.trim() && s.sendBtnDisabled]} onPress={handleProjectSend} disabled={!projectMessage.trim() || projectSendMutation.isPending}>
                <Ionicons name="send" size={20} color={projectMessage.trim() ? theme.white : theme.stone} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      )}
    </View>
  );
}


const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  title: { ...typography.headlineMd, color: theme.ink },

  tabScroll: { flexGrow: 0, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  tabRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.full, borderWidth: 1, borderColor: theme.hairline, backgroundColor: theme.white },
  tabActive: { backgroundColor: 'rgba(0,212,164,0.1)', borderColor: theme.brandGreen },
  tabText: { ...typography.labelMd, color: theme.stone },
  tabTextActive: { color: theme.ink, fontWeight: '700' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { ...typography.bodyMd, color: theme.stone, marginTop: 8 },
  emptyTitle: { ...typography.headlineSm, color: theme.ink, marginTop: spacing.md },
  emptySubtitle: { ...typography.bodySm, color: theme.stone, textAlign: 'center', paddingHorizontal: 40 },

  listContent: { paddingBottom: 100 },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.containerMargin, paddingVertical: 14, gap: 12, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  avatarWrap: { position: 'relative' },
  typeBadge: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.white },
  chatContent: { flex: 1 },
  chatName: { ...typography.labelLg, color: theme.ink },
  chatMsg: { ...typography.bodyMd, color: theme.steel, marginTop: 2 },

  backBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.containerMargin, paddingVertical: 12, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  backBarText: { ...typography.labelLg, color: theme.ink, flex: 1 },

  messageList: { padding: spacing.containerMargin, gap: 4 },
  msgRow: { flexDirection: 'row', marginBottom: 8, maxWidth: '82%', gap: 8, alignItems: 'flex-end' },
  msgRowOwn: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubble: { maxWidth: '100%', padding: 12, borderRadius: radius.xl, marginBottom: 4, borderWidth: 1 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: theme.brandGreen, borderColor: theme.brandGreen, borderBottomRightRadius: 4 },
  otherBubble: { alignSelf: 'flex-start', backgroundColor: theme.white, borderColor: theme.hairline, borderBottomLeftRadius: 4 },
  senderName: { ...typography.labelSm, color: theme.stone, marginBottom: 4, fontWeight: '700' },
  bubbleText: { ...typography.bodyMd, color: theme.ink, lineHeight: 20 },
  myBubbleText: { color: theme.primary },
  attachmentBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: radius.md, marginTop: 8 },
  attachmentText: { ...typography.labelSm, color: theme.ink, flex: 1 },
  myAttachmentText: { color: theme.primary },
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, alignSelf: 'flex-end' },
  bubbleTime: { ...typography.labelSm, color: theme.stone },
  myBubbleTime: { color: theme.primary },
  emptyChat: { alignItems: 'center', paddingTop: 60, gap: 8, transform: [{ scaleY: -1 }] },
  emptyChatText: { ...typography.labelLg, color: theme.ink },
  emptyChatSub: { ...typography.bodySm, color: theme.stone },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 10, backgroundColor: theme.white, borderTopWidth: 1, borderTopColor: theme.hairline, gap: 8 },
  attachBtn: { paddingBottom: 6 },
  input: { flex: 1, backgroundColor: theme.surfaceContainerLow, borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: theme.ink, maxHeight: 100, fontFamily: 'Inter_400Regular', borderWidth: 1.5, borderColor: theme.hairline },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.brandGreen, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: theme.surfaceContainerLow },
});
