/**
 * Admin Blogs — List and manage blog posts. Styled per DESIGN.md.
 */
import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';

export default function AdminBlogsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const { data: blogs = [], refetch, isRefetching } = useQuery({ queryKey: ['admin-blogs'], queryFn: async () => { try { const { data } = await api.get(ADMIN_ENDPOINTS.BLOGS); return data?.blogs || data || []; } catch { return []; } } });

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: T.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}><TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: T.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity><Text style={{ flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20, color: T.ink }}>Blog Posts</Text><Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 13 }}>{blogs.length}</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {blogs.length === 0 ? (<View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}><Ionicons name="newspaper-outline" size={56} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>No blog posts</Text></View>) : blogs.map((b: any) => (
          <View key={b.id} style={{ marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1, backgroundColor: T.surfaceContainer, borderColor: T.hairline }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: T.ink }}>{b.title}</Text>
            {b.excerpt && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: T.steel, marginTop: 6, lineHeight: 20 }} numberOfLines={3}>{b.excerpt}</Text>}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: T.muted }}>{b.author || ''}</Text><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: T.muted }}>{b.created_at ? new Date(b.created_at).toLocaleDateString() : ''}</Text></View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
