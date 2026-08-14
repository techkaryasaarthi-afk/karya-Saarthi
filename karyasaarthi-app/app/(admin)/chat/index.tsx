/**
 * Admin Chat Index — Inbox. Styled per DESIGN.md.
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import Avatar from '@/components/ui/Avatar';
import { useAppTheme } from '@/utils/theme';

export default function AdminChatIndex() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const { data: contacts = [], refetch, isRefetching } = useQuery({ queryKey: ['admin-chat-contacts'], queryFn: async () => { try { const { data } = await api.get('/api/direct-messages?contacts=1'); return data?.contacts || []; } catch { return []; } } });

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: T.background }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 24, color: T.ink }}>Messages</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {contacts.length === 0 ? (<View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}><Ionicons name="chatbubbles-outline" size={56} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>No messages yet</Text></View>) : contacts.map((c: any) => (
          <TouchableOpacity key={c.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.hairlineSoft }} onPress={() => router.push({ pathname: '/(admin)/chat/[id]', params: { id: c.id, name: c.fullname } } as any)}>
            <Avatar name={c.fullname} size={48} />
            <View style={{ flex: 1, marginLeft: 12 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: T.ink }}>{c.fullname}</Text></View><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: T.muted, marginTop: 4 }}>Tap to view conversation</Text></View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
