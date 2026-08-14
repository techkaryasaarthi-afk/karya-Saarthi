/**
 * Admin More Screen — Navigation hub with role-based menu visibility.
 * Styled per DESIGN.md.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme } from '@/utils/theme';

const CAN_SEE_FINANCE = ['super_admin', 'board_member'];

export default function AdminMoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const role = user?.role?.toLowerCase() || '';
  const isSuperAdmin = role === 'super_admin' || role === 'board_member';
  const showFinance = isSuperAdmin;
  const showOps = isSuperAdmin || user?.department === 'operations';
  const showDigital = isSuperAdmin || user?.department === 'digital';
  
  const T = useAppTheme();

  const MENU = [
    { title: 'Management', items: [
      { icon: 'people', label: 'Users', route: '/(admin)/users', color: '#6366F1' },
      { icon: 'people-circle', label: 'Vendors', route: '/(admin)/vendors', color: '#8B5CF6' },
      { icon: 'git-merge', label: 'Vendor Pipeline', route: '/(admin)/vendor-pipeline', color: '#0891B2' },
    ]},
    ...(showFinance ? [{ title: 'Finance', items: [
      { icon: 'wallet', label: 'Revenue', route: '/(admin)/finance', color: T.success },
      { icon: 'receipt', label: 'Invoices', route: '/(admin)/invoices', color: '#EC4899' },
    ]}] : []),
    { title: 'Advanced Panels', items: [
      ...(showOps ? [{ icon: 'cog', label: 'Operations', route: '/(admin)/operations', color: T.info }] : []),
      ...(showDigital ? [{ icon: 'globe', label: 'Digital Marketing', route: '/(admin)/digital', color: '#14B8A6' }] : []),
      { icon: 'bar-chart', label: 'Analytics', route: '/(admin)/analytics', color: '#F59E0B' },
    ]},
    { title: 'HR & Organization', items: [
      { icon: 'calendar', label: 'Meetings', route: '/(admin)/meetings', color: T.warning },
      { icon: 'document-text', label: 'Leaves', route: '/(admin)/leaves', color: T.error },
      { icon: 'checkbox', label: 'Attendance', route: '/(admin)/attendance', color: '#14B8A6' },
      { icon: 'megaphone', label: 'Announcements', route: '/(admin)/announcements', color: '#F97316' },
    ]},
    { title: 'Content', items: [{ icon: 'newspaper', label: 'Blogs', route: '/(admin)/blogs', color: '#EC4899' }] },
    { title: 'Account', items: [{ icon: 'person', label: 'Profile', route: '/(admin)/profile', color: T.steel }] },
  ];

  // Filter out empty sections
  const filteredMenu = MENU.filter(section => section.items.length > 0);

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={[s.pc, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]} activeOpacity={0.7} onPress={() => router.push('/(admin)/profile' as any)}>
          <Avatar name={user?.fullname} size={50} />
          <View style={{ flex: 1 }}><Text style={[s.nm, { color: T.ink }]}>{user?.fullname || 'Admin'}</Text><Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 }}>{user?.email}</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}><Ionicons name="shield-checkmark" size={10} color={T.brandGreen} /><Text style={{ color: T.brandGreen, fontFamily: 'Inter_500Medium', fontSize: 11, textTransform: 'capitalize' }}>{user?.role}</Text></View></View>
          <Ionicons name="chevron-forward" size={20} color={T.muted} />
        </TouchableOpacity>
        {filteredMenu.map((section, si) => (
          <View key={si} style={{ marginTop: 20, paddingHorizontal: 20 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>{section.title}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {section.items.map((item, ii) => (
                <TouchableOpacity key={ii} style={[s.mi, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]} activeOpacity={0.7} onPress={() => router.push(item.route as any)}>
                  <View style={[s.iw, { backgroundColor: item.color + '15' }]}><Ionicons name={item.icon as any} size={22} color={item.color} /></View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: T.ink }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1 },
  pc: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 20, marginBottom: 10, borderRadius: 12, padding: 16, gap: 14, borderWidth: 1 },
  nm: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
  mi: { width: '47%', borderRadius: 12, padding: 16, gap: 10, borderWidth: 1 },
  iw: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
