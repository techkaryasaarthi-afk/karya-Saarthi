/**
 * Admin Attendance Screen — Track daily attendance. Styled per DESIGN.md.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAttendanceApi, type AttendanceRecord } from '@/services/hr';
import { useAppTheme } from '@/utils/theme';

export default function AdminAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const today = new Date().toISOString().split('T')[0];
  const { data: records = [], refetch, isRefetching } = useQuery({ queryKey: ['admin-attendance'], queryFn: () => getAttendanceApi(today) });
  const stColor = (st: string) => st === 'present' ? T.success : st === 'absent' ? T.error : st === 'late' ? T.warning : T.info;

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}><TouchableOpacity onPress={() => router.back()} style={[s.bk, { backgroundColor: T.surfaceContainer }]}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity><Text style={[s.tt, { color: T.ink }]}>Attendance</Text><Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 13 }}>{today}</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />}>
        {records.length === 0 ? (<View style={s.em}><Ionicons name="checkbox-outline" size={56} color={T.hairline} /><Text style={{ color: T.muted, fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>No records</Text></View>) : records.map((r: AttendanceRecord) => (
          <View key={r.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: T.ink }}>{r.user_name}</Text><View style={[s.badge, { backgroundColor: stColor(r.status) + '20' }]}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: stColor(r.status), textTransform: 'capitalize' }}>{r.status}</Text></View></View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>{r.check_in && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: T.muted }}>In: {r.check_in}</Text>}{r.check_out && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: T.muted }}>Out: {r.check_out}</Text>}{r.hours_worked != null && <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: T.brandGreen }}>{r.hours_worked}h</Text>}</View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  bk: { width: 36, height: 36, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  tt: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20 },
  em: { alignItems: 'center', paddingTop: 80, gap: 12 },
  card: { marginHorizontal: 20, marginBottom: 10, borderRadius: 12, padding: 16, borderWidth: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
});
