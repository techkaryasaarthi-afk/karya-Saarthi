/**
 * Admin Attendance Screen — View staff attendance + mark self attendance.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendanceApi, markAttendanceApi, type AttendanceRecord } from '@/services/hr';
import Toast from 'react-native-toast-message';

export default function AdminAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: records = [], refetch, isRefetching } = useQuery({
    queryKey: ['admin-attendance'],
    queryFn: () => getAttendanceApi(),
  });

  const markMut = useMutation({
    mutationFn: (status: string) => markAttendanceApi({ status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-attendance'] }); Toast.show({ type: 'success', text1: 'Attendance Marked' }); },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to mark attendance' }),
  });

  const handleMark = () => {
    Alert.alert('Mark Attendance', 'Record your attendance for today', [
      { text: 'Present', onPress: () => markMut.mutate('present') },
      { text: 'Late', onPress: () => markMut.mutate('late') },
      { text: 'Half Day', onPress: () => markMut.mutate('half_day') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const statusIcon = (st: string) => st === 'present' ? 'checkmark-circle' : st === 'absent' ? 'close-circle' : st === 'late' ? 'time' : st === 'on_leave' ? 'airplane' : 'remove-circle';
  const statusClr = (st: string) => st === 'present' ? '#10B981' : st === 'absent' ? '#EF4444' : st === 'late' ? '#F59E0B' : st === 'on_leave' ? '#6366F1' : '#8B5CF6';

  // Summary
  const summary = { present: 0, absent: 0, late: 0, on_leave: 0 };
  records.forEach((r: AttendanceRecord) => {
    if (r.status in summary) summary[r.status as keyof typeof summary]++;
  });

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Attendance</Text>
          <Text style={s.sub}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <TouchableOpacity style={s.markBtn} onPress={handleMark}>
          <Ionicons name="checkmark-done" size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={s.summaryRow}>
        {[
          { label: 'Present', count: summary.present, color: '#10B981' },
          { label: 'Absent', count: summary.absent, color: '#EF4444' },
          { label: 'Late', count: summary.late, color: '#F59E0B' },
          { label: 'Leave', count: summary.on_leave, color: '#6366F1' },
        ].map((item, i) => (
          <View key={i} style={[s.summaryCard, { borderColor: item.color + '30' }]}>
            <Text style={[s.summaryCount, { color: item.color }]}>{item.count}</Text>
            <Text style={s.summaryLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F59E0B" />}>
        {records.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="people-outline" size={56} color="rgba(255,255,255,0.15)" />
            <Text style={s.et}>No attendance records</Text>
          </View>
        ) : records.map((r: AttendanceRecord) => (
          <View key={r.id} style={s.card}>
            <View style={[s.iconWrap, { backgroundColor: statusClr(r.status) + '15' }]}>
              <Ionicons name={statusIcon(r.status) as any} size={22} color={statusClr(r.status)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{r.user_name}</Text>
              <Text style={s.date}>{r.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[s.status, { color: statusClr(r.status) }]}>{r.status?.replace(/_/g, ' ')}</Text>
              {r.check_in && <Text style={s.time}>In: {r.check_in}</Text>}
              {r.hours_worked != null && <Text style={s.hours}>{r.hours_worked}h</Text>}
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' },
  hdr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  back: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFF' },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  markBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },

  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1 },
  summaryCount: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  summaryLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  et: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: 'rgba(255,255,255,0.5)' },
  card: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.9)' },
  date: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  status: { fontFamily: 'Inter_600SemiBold', fontSize: 12, textTransform: 'capitalize' },
  time: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  hours: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
});
