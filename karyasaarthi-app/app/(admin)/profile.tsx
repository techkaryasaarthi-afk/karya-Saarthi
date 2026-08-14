/**
 * Admin Profile — Account details and logout. Styled per DESIGN.md.
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme } from '@/utils/theme';

export default function AdminProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login' as any); } },
    ]);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: T.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}><TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: T.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity><Text style={{ flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20, color: T.ink }}>Profile</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ alignItems: 'center', marginVertical: 24 }}><Avatar name={user?.fullname} size={80} /><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: T.ink, marginTop: 12 }}>{user?.fullname}</Text><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: T.muted, marginTop: 4 }}>{user?.email}</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, backgroundColor: T.brandGreen + '18' }}><Ionicons name="shield-checkmark" size={14} color={T.brandGreen} /><Text style={{ color: T.brandGreen, fontFamily: 'Inter_600SemiBold', fontSize: 12, textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</Text></View></View>
        <View style={{ marginHorizontal: 20, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: T.hairline, backgroundColor: T.surfaceContainer }}>
          {/* Menu items here if needed */}
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }} onPress={handleLogout}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.error + '15', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="log-out" size={18} color={T.error} /></View>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: T.error, flex: 1 }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
