/**
 * Admin Chat Thread — View messages. Styled per DESIGN.md.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme } from '@/utils/theme';

export default function AdminChatThread() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string, name: string }>();
  const T = useAppTheme();
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const [text, setText] = useState('');

  const { data: messages = [] } = useQuery({ queryKey: ['admin-chat', id], queryFn: async () => { try { const { data } = await api.get(`/api/direct-messages?userId=${id}`); return data?.messages || []; } catch { return []; } }, enabled: !!id, refetchInterval: 5000 });
  const sendMut = useMutation({ mutationFn: async () => { await api.post('/api/direct-messages', { receiver_id: Number(id), content: text }); }, onSuccess: () => { setText(''); qc.invalidateQueries({ queryKey: ['admin-chat', id] }); } });

  return (
    <View style={{ flex: 1, backgroundColor: T.background }}>
      <View style={{ paddingTop: insets.top, backgroundColor: T.surfaceContainer, borderBottomWidth: 1, borderBottomColor: T.hairline, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}><TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={T.ink} /></TouchableOpacity><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 17, color: T.ink, flex: 1 }}>{name || 'Chat'}</Text></View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {messages.map((m: any) => {
          const isOwn = m.sender_id === user?.id;
          return (
            <View key={m.id} style={{ alignSelf: isOwn ? 'flex-end' : 'flex-start', maxWidth: '80%', marginBottom: 12, padding: 12, borderRadius: 16, backgroundColor: isOwn ? T.brandGreen : T.surfaceContainer, borderBottomRightRadius: isOwn ? 4 : 16, borderBottomLeftRadius: isOwn ? 16 : 4 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: isOwn ? T.primary : T.ink, lineHeight: 20 }}>{m.content}</Text>
            </View>
          );
        })}
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: Math.max(insets.bottom, 12), borderTopWidth: 1, borderTopColor: T.hairline, backgroundColor: T.background, gap: 8 }}>
          <TextInput style={{ flex: 1, backgroundColor: T.inputBg, borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, maxHeight: 100, fontFamily: 'Inter_400Regular', fontSize: 14, color: T.ink, borderWidth: 1, borderColor: T.hairline }} placeholder="Type a message..." placeholderTextColor={T.muted} multiline value={text} onChangeText={setText} />
          <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: text.trim() ? T.brandGreen : T.surfaceDim, alignItems: 'center', justifyContent: 'center' }} onPress={() => text.trim() && sendMut.mutate()} disabled={!text.trim() || sendMut.isPending}><Ionicons name="send" size={18} color={text.trim() ? T.primary : T.muted} /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
