/**
 * Vendor Application Detail — 5-step review: Resume, Work Samples, Written Answers, Interview Scoring, Onboarding Checklist.
 * Styled per DESIGN.md.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Avatar from '@/components/ui/Avatar';
import { getVendorApplicationDetail, updateVendorApplication } from '@/services/vendor-pipeline';
import { useAppTheme } from '@/utils/theme';

const SCORE_FIELDS = [
  { key: 'score_communication', label: 'Communication' },
  { key: 'score_experience', label: 'Experience' },
  { key: 'score_quality', label: 'Quality Consciousness' },
  { key: 'score_teaching', label: 'Teaching Ability' },
  { key: 'score_availability', label: 'Availability' },
] as const;

const CHECKLIST = [
  { key: 'selection_message_sent', label: 'Selection email/message sent' },
  { key: 'whatsapp_joined', label: 'WhatsApp community joined' },
  { key: 'google_form_completed', label: 'Google Form completed' },
  { key: 'website_registered', label: 'Website/App registration done' },
  { key: 'documents_uploaded', label: 'Documents uploaded to Drive' },
  { key: 'documents_verified', label: 'Documents verified by HR' },
  { key: 'vendor_id_generated', label: 'Vendor ID generated' },
  { key: 'orientation_completed', label: 'Orientation call completed' },
  { key: 'first_project_assigned', label: 'First project assigned' },
] as const;

const ST_COLORS: Record<string, { bg: string; text: string }> = {
  submitted: { bg: '#DBEAFE', text: '#2563EB' }, under_review: { bg: '#FEF3C7', text: '#D97706' },
  interview_scheduled: { bg: '#E0E7FF', text: '#4F46E5' }, interview_done: { bg: '#FDE68A', text: '#92400E' },
  selected: { bg: '#D1FAE5', text: '#059669' }, onboarding: { bg: '#CFFAFE', text: '#0891B2' },
  active: { bg: '#D1FAE5', text: '#059669' }, rejected: { bg: '#FEE2E2', text: '#DC2626' },
};

export default function VendorApplicationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const T = useAppTheme();

  const { data, refetch } = useQuery({ queryKey: ['vendor-app-detail', id], queryFn: () => getVendorApplicationDetail(Number(id)), enabled: !!id });
  const app = data?.application;
  const mutation = useMutation({ mutationFn: (u: Record<string, unknown>) => updateVendorApplication(Number(id), u), onSuccess: () => { refetch(); qc.invalidateQueries({ queryKey: ['vendor-pipeline'] }); } });

  const [notes, setNotes] = useState('');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState('');

  const saveScores = () => {
    const parsed: Record<string, number> = {};
    for (const f of SCORE_FIELDS) { const v = parseInt(scores[f.key] || String(app?.[f.key] || 0)); if (isNaN(v) || v < 0 || v > 10) return Alert.alert('Invalid', `${f.label} must be 0-10`); parsed[f.key] = v; }
    mutation.mutate({ ...parsed, interview_notes: notes || app?.interview_notes || '', status: 'interview_done', current_step: 5 });
    Alert.alert('Saved', 'Interview scores saved');
  };
  const changeStatus = (status: string) => { if (status === 'rejected') { if (!rejectReason.trim()) return Alert.alert('Required', 'Provide rejection reason'); mutation.mutate({ status, rejection_reason: rejectReason.trim() }); } else mutation.mutate({ status }); };

  if (!app) return (<View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}><View style={s.hdr}><TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={T.ink} /></TouchableOpacity><Text style={[s.ht, { color: T.ink }]}>Loading...</Text><View style={{ width: 24 }} /></View></View>);

  const stc = ST_COLORS[app.status] || ST_COLORS.submitted;
  const totalScore = SCORE_FIELDS.reduce((sum, f) => sum + (parseInt(scores[f.key] || String(app[f.key] || 0)) || 0), 0);

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.hdr}><TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={T.ink} /></TouchableOpacity><Text style={[s.ht, { color: T.ink }]}>Application Detail</Text><View style={{ width: 24 }} /></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile */}
        <View style={[s.sec, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><Avatar name={app.fullname} size={50} /><View style={{ flex: 1 }}><Text style={[s.nm, { color: T.ink }]}>{app.fullname}</Text><Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 }}>{app.email}</Text><Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 12 }}>{app.phone}</Text></View></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.hairlineSoft }}><Text style={{ color: T.brandTag, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>{app.vendor_id}</Text><View style={[s.badge, { backgroundColor: stc.bg }]}><Text style={{ color: stc.text, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.5 }}>{app.status.replace(/_/g, ' ').toUpperCase()}</Text></View></View>
        </View>
        {/* Step 1: Resume */}
        <View style={[s.sec, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
          <Text style={[s.st, { color: T.ink }]}>📄 Step 1: Resume/Basic Info</Text>
          {[{ l: 'Education', v: app.education },{ l: 'Experience', v: `${app.experience_years} years` },{ l: 'Skills', v: app.skills?.join(', ') },{ l: 'Companies', v: app.previous_companies },{ l: 'Certifications', v: app.certifications }].map((it, i) => it.v ? <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}><Text style={{ color: T.steel, fontFamily: 'Inter_600SemiBold', fontSize: 12, width: 90 }}>{it.l}:</Text><Text style={{ color: T.charcoal, fontFamily: 'Inter_400Regular', fontSize: 12, flex: 1 }}>{it.v}</Text></View> : null)}
          {app.resume_link && <TouchableOpacity style={[s.lnk, { backgroundColor: T.brandTag + '12' }]} onPress={() => Linking.openURL(app.resume_link!)}><Ionicons name="document-attach" size={16} color={T.brandTag} /><Text style={{ color: T.brandTag, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>View Resume</Text></TouchableOpacity>}
        </View>
        {/* Step 2: Work Samples */}
        {app.work_samples?.length > 0 && <View style={[s.sec, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}><Text style={[s.st, { color: T.ink }]}>🖼️ Step 2: Work Samples ({app.work_samples.length})</Text>{app.work_samples.map((sm: any, i: number) => (<TouchableOpacity key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.hairlineSoft }} onPress={() => Linking.openURL(sm.url)}><Ionicons name="link" size={16} color={T.brandTag} /><View style={{ flex: 1 }}><Text style={{ color: T.ink, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>{sm.title || `Sample ${i+1}`}</Text>{sm.description && <Text style={{ color: T.muted, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 }}>{sm.description}</Text>}</View><Ionicons name="open-outline" size={16} color={T.muted} /></TouchableOpacity>))}</View>}
        {/* Step 3: Written Answers */}
        {app.q1_projects_experience && <View style={[s.sec, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}><Text style={[s.st, { color: T.ink }]}>✍️ Step 3: Written Answers</Text>{[{ q: 'Q1: Projects & Experience', a: app.q1_projects_experience },{ q: 'Q2: Pricing', a: app.q2_pricing },{ q: 'Q3: Guidelines & Corrections', a: app.q3_guidelines_corrections },{ q: 'Q4: Teaching Ability', a: app.q4_teaching_ability },{ q: 'Q5: Sample Sharing', a: app.q5_sample_sharing }].map((it, i) => <View key={i} style={{ marginBottom: 14 }}><Text style={{ color: T.brandGreen, fontFamily: 'Inter_600SemiBold', fontSize: 12, marginBottom: 4 }}>{it.q}</Text><Text style={{ color: T.charcoal, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 }}>{it.a}</Text></View>)}</View>}
        {/* Step 4: Interview Scoring */}
        <View style={[s.sec, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
          <Text style={[s.st, { color: T.ink }]}>🎤 Step 4: Interview Scoring</Text>
          {SCORE_FIELDS.map(f => (<View key={f.key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><Text style={{ color: T.charcoal, fontFamily: 'Inter_500Medium', fontSize: 13 }}>{f.label}</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.inputBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: T.hairline }}><TextInput style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: T.ink, width: 30, textAlign: 'center' }} value={scores[f.key] ?? String(app[f.key] ?? '')} onChangeText={v => setScores(p => ({ ...p, [f.key]: v }))} keyboardType="numeric" maxLength={2} placeholder="0" placeholderTextColor={T.muted} /><Text style={{ color: T.muted, fontFamily: 'Inter_500Medium', fontSize: 13 }}>/10</Text></View></View>))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: T.hairline, paddingTop: 10, marginTop: 4 }}><Text style={{ color: T.brandGreen, fontFamily: 'Inter_700Bold', fontSize: 14 }}>Total</Text><Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: totalScore >= 35 ? T.success : totalScore >= 25 ? T.warning : T.error }}>{totalScore}/50 {totalScore >= 35 ? '✅ Select' : totalScore >= 25 ? '🔶 Maybe' : '❌ Reject'}</Text></View>
          <TextInput style={[s.ni, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline }]} placeholder="Interview notes..." placeholderTextColor={T.muted} value={notes || app.interview_notes || ''} onChangeText={setNotes} multiline />
          <TouchableOpacity style={[s.btn, { backgroundColor: T.brandGreen }]} onPress={saveScores}><Text style={{ color: T.primary, fontFamily: 'Inter_700Bold', fontSize: 14 }}>Save Interview Scores</Text></TouchableOpacity>
        </View>
        {/* Step 5: Onboarding Checklist */}
        <View style={[s.sec, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
          <Text style={[s.st, { color: T.ink }]}>✅ Step 5: Onboarding Checklist</Text>
          {CHECKLIST.map(f => (<TouchableOpacity key={f.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.hairlineSoft }} onPress={() => mutation.mutate({ [f.key]: !app[f.key] })}><Ionicons name={app[f.key] ? 'checkbox' : 'square-outline'} size={22} color={app[f.key] ? T.success : T.muted} /><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: app[f.key] ? T.success : T.steel, flex: 1, textDecorationLine: app[f.key] ? 'line-through' : 'none' }}>{f.label}</Text></TouchableOpacity>))}
        </View>
        {/* Actions */}
        <View style={[s.sec, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
          <Text style={[s.st, { color: T.ink }]}>⚡ Actions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {app.status === 'submitted' && <TouchableOpacity style={[s.ab, { backgroundColor: '#D9770615' }]} onPress={() => changeStatus('under_review')}><Ionicons name="eye" size={16} color="#D97706" /><Text style={{ color: '#D97706', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Start Review</Text></TouchableOpacity>}
            {['under_review','interview_done'].includes(app.status) && <TouchableOpacity style={[s.ab, { backgroundColor: '#4F46E515' }]} onPress={() => changeStatus('interview_scheduled')}><Ionicons name="calendar" size={16} color="#4F46E5" /><Text style={{ color: '#4F46E5', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Schedule Interview</Text></TouchableOpacity>}
            {['interview_done','interview_scheduled'].includes(app.status) && <TouchableOpacity style={[s.ab, { backgroundColor: '#05966915' }]} onPress={() => changeStatus('selected')}><Ionicons name="checkmark-done" size={16} color="#059669" /><Text style={{ color: '#059669', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Select Vendor</Text></TouchableOpacity>}
            {app.status === 'selected' && <TouchableOpacity style={[s.ab, { backgroundColor: '#0891B215' }]} onPress={() => changeStatus('onboarding')}><Ionicons name="rocket" size={16} color="#0891B2" /><Text style={{ color: '#0891B2', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Start Onboarding</Text></TouchableOpacity>}
            {app.status === 'onboarding' && <TouchableOpacity style={[s.ab, { backgroundColor: '#05966915' }]} onPress={() => changeStatus('active')}><Ionicons name="shield-checkmark" size={16} color="#059669" /><Text style={{ color: '#059669', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Activate ✅</Text></TouchableOpacity>}
          </View>
          {!['active','rejected'].includes(app.status) && <View style={{ marginTop: 16 }}><TextInput style={[s.ni, { backgroundColor: T.inputBg, color: T.ink, borderColor: T.hairline }]} placeholder="Rejection reason..." placeholderTextColor={T.muted} value={rejectReason} onChangeText={setRejectReason} /><TouchableOpacity style={[s.ab, { backgroundColor: '#DC262615', alignSelf: 'flex-start' }]} onPress={() => changeStatus('rejected')}><Ionicons name="close-circle" size={16} color="#DC2626" /><Text style={{ color: '#DC2626', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Reject</Text></TouchableOpacity></View>}
        </View>
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1 }, hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  ht: { fontFamily: 'Inter_700Bold', fontSize: 18 }, nm: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  sec: { marginHorizontal: 20, borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 10 },
  st: { fontFamily: 'Inter_700Bold', fontSize: 15, marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  lnk: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999, alignSelf: 'flex-start' },
  ni: { borderRadius: 10, padding: 12, fontFamily: 'Inter_400Regular', fontSize: 13, minHeight: 60, textAlignVertical: 'top', marginTop: 8, borderWidth: 1 },
  btn: { borderRadius: 9999, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  ab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9999 },
});
