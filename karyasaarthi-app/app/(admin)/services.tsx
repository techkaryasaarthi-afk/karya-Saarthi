/**
 * Admin Services — List and manage services. Styled per DESIGN.md.
 */
import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getServicesApi } from '@/services/admin';
import { useAppTheme } from '@/utils/theme';

export default function AdminServicesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const { data: services = [], refetch, isRefetching } = useQuery({ queryKey: ['admin-services'], queryFn: getServicesApi });

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: T.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}><Text style={{ flex: 1, fontFamily: 'Inter_700Bold', fontSize: 24, color: T.ink }}>Services</Text><Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 13 }}>{services.length}</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {services.length === 0 ? (<View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}><Ionicons name="construct-outline" size={56} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>No services</Text></View>) : services.map((s: any) => (
          <View key={s.id} style={{ marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1, backgroundColor: T.surfaceContainer, borderColor: T.hairline, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: T.brandGreen + '12', alignItems: 'center', justifyContent: 'center' }}><Ionicons name={s.icon || 'star'} size={20} color={T.brandGreen} /></View>
            <View style={{ flex: 1 }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: T.ink }}>{s.title}</Text>{s.category && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: T.muted, marginTop: 2 }}>{s.category}</Text>}</View>
            <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: s.is_active ? T.success + '18' : T.hairline }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: s.is_active ? T.success : T.muted }}>{s.is_active ? 'Active' : 'Inactive'}</Text></View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
