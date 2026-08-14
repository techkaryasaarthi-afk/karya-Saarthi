/**
 * Admin Project Detail — View project info, assign vendor, update status. Styled per DESIGN.md.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { useAppTheme } from '@/utils/theme';

export default function AdminProjectDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const T = useAppTheme();
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  
  const { data: project, refetch, isRefetching, isLoading } = useQuery({ queryKey: ['admin-project', id], queryFn: async () => { const { data } = await api.get(`${ADMIN_ENDPOINTS.PROJECTS}/${id}`); if(data?.project && !status) setStatus(data.project.status); return data?.project; }, enabled: !!id });
  const updateMut = useMutation({ mutationFn: async (updates: any) => await api.put(`${ADMIN_ENDPOINTS.PROJECTS}/${id}`, updates), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-project', id] }); qc.invalidateQueries({ queryKey: ['admin-projects'] }); Alert.alert('Success', 'Project updated'); }, onError: () => Alert.alert('Error', 'Update failed') });
  
  if (isLoading) return <View style={{ flex: 1, backgroundColor: T.background, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={T.brandGreen} /></View>;
  if (!project) return <View style={{ flex: 1, backgroundColor: T.background, paddingTop: insets.top }}><Text style={{ color: T.ink, margin: 20 }}>Project not found</Text></View>;
  
  const stColor = (st: string) => st === 'completed' ? T.success : st === 'in_progress' ? T.info : st === 'cancelled' ? T.error : T.warning;

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: T.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}><TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: T.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={22} color={T.ink} /></TouchableOpacity><Text style={{ flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20, color: T.ink }}>Project Details</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={T.brandGreen} />} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1, backgroundColor: T.surfaceContainer, borderColor: T.hairline }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: T.ink, marginBottom: 12 }}>{project.title}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: T.steel, width: 80 }}>Client:</Text><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: T.ink, flex: 1 }}>{project.client_name || project.customer_name || '—'}</Text></View>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: T.steel, width: 80 }}>Amount:</Text><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: T.brandGreen, flex: 1 }}>₹{project.amount?.toLocaleString() || 0}</Text></View>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: T.steel, width: 80 }}>Status:</Text><View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, backgroundColor: stColor(project.status) + '18' }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: stColor(project.status), textTransform: 'capitalize' }}>{project.status?.replace('_', ' ')}</Text></View></View>
          {project.description && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: T.muted, lineHeight: 20, marginTop: 8 }}>{project.description}</Text>}
        </View>

        <View style={{ marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1, backgroundColor: T.surfaceContainer, borderColor: T.hairline }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: T.ink, marginBottom: 12 }}>Update Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {['pending', 'in_progress', 'completed', 'cancelled'].map(st => (
              <TouchableOpacity key={st} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999, borderWidth: 1, borderColor: status === st ? T.brandGreen : T.hairline, backgroundColor: status === st ? T.brandGreen : 'transparent' }} onPress={() => setStatus(st)}><Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: status === st ? T.primary : T.steel, textTransform: 'capitalize' }}>{st.replace('_', ' ')}</Text></TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={{ backgroundColor: T.brandGreen, borderRadius: 9999, paddingVertical: 12, alignItems: 'center' }} onPress={() => updateMut.mutate({ status })} disabled={updateMut.isPending || status === project.status}><Text style={{ color: T.primary, fontFamily: 'Inter_700Bold', fontSize: 14 }}>{updateMut.isPending ? 'Updating...' : 'Save Changes'}</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
