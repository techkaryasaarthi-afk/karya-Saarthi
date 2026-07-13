/**
 * Customer Chat Thread — Supports group, project, and DM chats.
 * Mintlify: Flat UI, hairline borders, ink text, brand green message bubbles.
 */
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getProjectMessagesApi, sendProjectMessageApi,
  getGroupMessagesApi, sendGroupMessageApi,
  getDirectMessagesApi, sendDirectMessageApi,
  type Message,
} from '@/services/chat';
import { pickDocument, uploadFile } from '@/services/upload';
import { useAuthStore } from '@/stores/authStore';
import Avatar from '@/components/ui/Avatar';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import Toast from 'react-native-toast-message';

export default function ChatConversation() {
  const router = useRouter();
  const { id, type, name: chatName } = useLocalSearchParams<{ id: string; type?: string; name?: string }>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const theme = useAppTheme();
  const s = useStyles(theme);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const chatType = type || 'project';
  const queryKey = [`chat-messages-${chatType}`, id];

  const { data: messagesData, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (chatType === 'group') {
        return getGroupMessagesApi(id as string);
      }
      if (chatType === 'dm') {
        return getDirectMessagesApi(id as string);
      }
      return getProjectMessagesApi(id as string);
    },
    enabled: !!id,
    refetchInterval: 3000, // Poll every 3s while chat is open
  });

  const messages = useMemo(() => messagesData?.messages || [], [messagesData]);

  const sendMutation = useMutation({
    mutationFn: ({ text, attachment_url, file_type }: { text: string; attachment_url?: string; file_type?: string }) => {
      if (chatType === 'group') {
        return sendGroupMessageApi(id as string, { text, attachment_url, file_type });
      }
      if (chatType === 'dm') {
        return sendDirectMessageApi(id as string, { text, attachment_url, file_type });
      }
      return sendProjectMessageApi(id as string, { text, attachment_url, file_type });
    },
    // Optimistic update
    onMutate: async ({ text, attachment_url }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}`,
        sender_id: user?.id,
        sender_name: user?.fullname || 'You',
        sender_role: user?.role,
        text,
        attachment_url,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        messages: [...(old?.messages || []), optimisticMessage],
      }));

      setMessage('');
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate({ text: trimmed });
  }, [message, sendMutation]);

  const handleAttachFile = async () => {
    const doc = await pickDocument();
    if (!doc) return;
    setUploading(true);
    try {
      const result = await uploadFile(doc.uri, doc.name, doc.mimeType || 'application/octet-stream');
      if (result?.url) {
        sendMutation.mutate({
          text: `📎 Attached: ${doc.name}`,
          attachment_url: result.url,
          file_type: doc.mimeType,
        });
      }
    } catch {
      Alert.alert('Upload Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const chatTitle = chatName
    || (chatType === 'group' ? 'Group Chat' : chatType === 'dm' ? 'Direct Message' : 'Project Support');

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <LinearGradient
        colors={[theme.heroDarkFrom, theme.heroDarkTo, '#1a4a3a']}
        style={s.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={'rgba(255,255,255,0.9)'} />
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={s.headerName} numberOfLines={1}>
            {chatTitle}
          </Text>
          <View style={s.headerStatusRow}>
            <View style={[s.statusDot, { backgroundColor: theme.brandGreen }]} />
            <Text style={s.headerStatus}>
              {messages.length} messages • {chatType === 'group' ? 'Group' : chatType === 'dm' ? 'Direct' : 'Project'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={s.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={'rgba(255,255,255,0.7)'} />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={[...messages].reverse()}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.messageList}
        showsVerticalScrollIndicator={false}
        inverted
        renderItem={({ item }) => {
          const isMine = item.sender_name === user?.fullname || item.sender_id === user?.id;
          const isOptimistic = String(item.id).startsWith('optimistic-');
          return (
            <View style={[s.msgRow, isMine && s.msgRowOwn]}>
              {!isMine && (
                <Avatar name={item.sender_name} size={28} />
              )}
              <View style={[s.bubble, isMine ? s.myBubble : s.otherBubble, isOptimistic && { opacity: 0.7 }]}>
                {!isMine && <Text style={s.senderName}>{item.sender_name}</Text>}
                <Text style={[s.bubbleText, isMine && s.myBubbleText]}>{item.text}</Text>
                {item.attachment_url && (
                  <TouchableOpacity
                    style={s.attachmentBox}
                    onPress={() => Linking.openURL(item.attachment_url!)}
                  >
                    <Ionicons name="document-attach" size={20} color={isMine ? theme.primary : theme.primary} />
                    <Text style={[s.attachmentText, isMine && s.myAttachmentText]} numberOfLines={1}>
                      View Attachment
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={s.bubbleFooter}>
                  <Text style={[s.bubbleTime, isMine && s.myBubbleTime]}>
                    {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                  {isMine && (
                    <Ionicons
                      name={isOptimistic ? 'time-outline' : 'checkmark-done'}
                      size={14}
                      color={isOptimistic ? 'rgba(10,10,10,0.5)' : theme.ink}
                    />
                  )}
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.emptyChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.stone} />
            <Text style={s.emptyChatText}>No messages yet</Text>
            <Text style={s.emptyChatSub}>Start the conversation!</Text>
          </View>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[s.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity style={s.attachBtn} onPress={handleAttachFile} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Ionicons name="add-circle" size={28} color={theme.stone} />
            )}
          </TouchableOpacity>
          <TextInput
            style={s.input}
            placeholder="Type a message..."
            placeholderTextColor={theme.stone}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={2000}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!message.trim() && !uploading) && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!message.trim() || sendMutation.isPending || uploading}
          >
            <Ionicons name="send" size={20} color={message.trim() ? theme.white : theme.stone} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.containerMargin, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  headerName: { ...typography.labelLg, color: '#ffffff' },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  headerStatus: { ...typography.labelMd, color: 'rgba(255,255,255,0.75)' },
  moreBtn: {},
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
