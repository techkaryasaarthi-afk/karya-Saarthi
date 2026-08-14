/**
 * Admin More Screen — Navigation hub with role-based menu visibility.
 * Finance/Earnings only visible to super_admin and board_member.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '@/components/ui/Avatar';
import { useAppTheme } from '@/utils/theme';
import { useAuthStore } from '@/stores/authStore';

export default function AdminMoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const T = useAppTheme();

  const role = user?.role?.toLowerCase() || '';
  const dept = user?.department?.toLowerCase() || '';
  const pillar = user?.pillar_role?.toLowerCase() || '';

  const isSuperAdmin = role === 'super_admin';
  const isBoard = role === 'board_member';
  const isPillar = role === 'pillar_member';
  const isProjectManager = dept === 'operations' && pillar === 'project_manager';

  const showFinance = isSuperAdmin || dept === 'finance';
  const showOperations = isSuperAdmin || (dept === 'operations' && !isProjectManager);
  const showDigital = isSuperAdmin || dept === 'digital' || (role === 'admin' && pillar === 'digital');
  const showCRM = isSuperAdmin || dept === 'operations' || dept === 'marketing';
  const showInvoices = isSuperAdmin || isProjectManager || dept === 'finance';
  const showStaff = isSuperAdmin || isBoard;

  const showMarketing = isSuperAdmin || dept === 'marketing';
  const showBoard = isSuperAdmin || isBoard;
  const showAdvanced = showOperations || showDigital || showMarketing;

   const MENU_SECTIONS = [
    ...(showAdvanced ? [{
      title: 'Advanced Panels',
      items: [
        ...(showOperations ? [{ icon: 'cog', label: 'Operations', route: '/(admin)/operations', color: T.info }] : []),
        ...(showDigital ? [{ icon: 'globe', label: 'Digital Saarthi', route: '/(admin)/digital', color: '#14B8A6' }] : []),
        ...(showMarketing ? [{ icon: 'megaphone', label: 'Marketing', route: '/(admin)/marketing', color: '#EC4899' }] : []),
      ],
    }] : []),
    {
      title: 'Management',
      items: [
        { icon: 'people', label: 'Users', route: '/(admin)/users', color: '#6366F1' },
        { icon: 'people-circle', label: 'Vendors', route: '/(admin)/vendors', color: '#8B5CF6' },
        { icon: 'git-merge', label: 'Vendor Pipeline', route: '/(admin)/vendor-pipeline', color: '#0891B2' },
        ...(showCRM ? [{ icon: 'briefcase', label: 'CRM', route: '/(admin)/crm', color: '#F59E0B' }] : []),
        ...(showInvoices ? [{ icon: 'receipt', label: 'Invoices', route: '/(admin)/invoices', color: T.success }] : []),
        { icon: 'bar-chart', label: 'Analytics', route: '/(admin)/analytics', color: T.info },
        ...(isSuperAdmin ? [{ icon: 'shield-checkmark', label: 'Staff Queue', route: '/(admin)/staff-requests', color: '#EF4444' }] : []),
      ],
    },
    ...(showFinance ? [{
      title: 'Finance & Earnings',
      items: [
        { icon: 'wallet', label: 'Revenue Dashboard', route: '/(admin)/finance', color: T.success },
        { icon: 'card', label: 'Invoices & Billing', route: '/(admin)/invoices', color: '#EC4899' },
      ],
    }] : []),
    {
      title: 'HR & Organization',
      items: [
        ...(isSuperAdmin || isBoard ? [{ icon: 'people', label: 'Staff Directory', route: '/(admin)/staff', color: '#6366F1' }] : []),
        { icon: 'calendar', label: 'Meetings', route: '/(admin)/meetings', color: T.warning },
        { icon: 'document-text', label: 'Leaves', route: '/(admin)/leaves', color: T.error },
        { icon: 'checkbox', label: 'Attendance', route: '/(admin)/attendance', color: '#14B8A6' },
        { icon: 'megaphone', label: 'Announcements', route: '/(admin)/announcements', color: '#F97316' },
        ...(isSuperAdmin || isBoard ? [{ icon: 'people-circle', label: 'Recruitment', route: '/(admin)/recruitment', color: '#8B5CF6' }] : []),
      ],
    },
    {
      title: 'My Work',
      items: [
        { icon: 'time', label: 'My Attendance', route: '/(admin)/my-attendance', color: '#10B981' },
        { icon: 'calendar-outline', label: 'My Leaves', route: '/(admin)/my-leaves', color: '#EF4444' },
        { icon: 'person', label: 'My Profile', route: '/(admin)/profile', color: '#6366F1' },
      ],
    },
    {
      title: 'Workspace & Content',
      items: [
        { icon: 'folder-open', label: 'Shared Workspace', route: '/(admin)/workspace', color: '#3B82F6' },
        { icon: 'newspaper', label: 'Blogs', route: '/(admin)/blogs', color: '#EC4899' },
        ...(isSuperAdmin || isBoard ? [{ icon: 'podium', label: 'Board', route: '/(admin)/board', color: '#8B5CF6' }] : []),
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Profile', route: '/(admin)/profile', color: T.steel },
      ],
    },
  ];

  const filteredMenu = MENU_SECTIONS.filter(s => s.items.length > 0);

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity style={[s.profileCard, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]} activeOpacity={0.7} onPress={() => router.push('/(admin)/profile' as any)}>
          <Avatar name={user?.fullname} size={50} />
          <View style={{ flex: 1 }}>
            <Text style={[s.name, { color: T.ink }]}>{typeof user?.fullname === 'object' ? (user.fullname as any).fullname : user?.fullname || 'Admin'}</Text>
            <Text style={[s.email, { color: T.muted }]}>{user?.email || ''}</Text>
            <View style={s.roleBadge}>
              <Ionicons name="shield-checkmark" size={10} color={T.brandGreen} />
              <Text style={[s.roleText, { color: T.brandGreen }]}>{user?.role || 'admin'}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={T.muted} />
        </TouchableOpacity>

        {/* Menu Sections */}
        {filteredMenu.map((section, si) => (
          <View key={si} style={s.section}>
            <Text style={[s.sectionTitle, { color: T.muted }]}>{section.title}</Text>
            <View style={s.grid}>
              {section.items.map((item, ii) => (
                <TouchableOpacity key={ii} style={[s.menuItem, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]} activeOpacity={0.7} onPress={() => router.push(item.route as any)}>
                  <View style={[s.iconWrap, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <Text style={[s.menuLabel, { color: T.ink }]}>{item.label}</Text>
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
  profileCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 20, marginBottom: 10, borderRadius: 16, padding: 16, gap: 14, borderWidth: 1 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
  email: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  roleText: { fontFamily: 'Inter_500Medium', fontSize: 11, textTransform: 'capitalize' },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  menuItem: { width: '47%', borderRadius: 14, padding: 16, gap: 10, borderWidth: 1 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
