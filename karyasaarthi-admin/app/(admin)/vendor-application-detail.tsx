/**
 * Vendor Application Detail — Admin reviews, scores interviews, manages onboarding checklist.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Avatar from '@/components/ui/Avatar';
import { getVendorApplicationDetail, updateVendorApplication } from '@/services/vendor-pipeline';

const SCORE_FIELDS = [
  { key: 'score_communication', label: 'Communication' },
  { key: 'score_experience', label: 'Experience' },
  { key: 'score_quality', label: 'Quality Consciousness' },
  { key: 'score_teaching', label: 'Teaching Ability' },
  { key: 'score_availability', label: 'Availability' },
] as const;

const CHECKLIST_FIELDS = [
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

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#E2E8F0', text: '#475569' },
  submitted: { bg: '#DBEAFE', text: '#2563EB' },
  under_review: { bg: '#FEF3C7', text: '#D97706' },
  interview_scheduled: { bg: '#E0E7FF', text: '#4F46E5' },
  interview_done: { bg: '#FDE68A', text: '#92400E' },
  selected: { bg: '#D1FAE5', text: '#059669' },
  onboarding: { bg: '#CFFAFE', text: '#0891B2' },
  active: { bg: '#D1FAE5', text: '#059669' },
  rejected: { bg: '#FEE2E2', text: '#DC2626' },
};

export default function VendorApplicationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ['vendor-app-detail', id],
    queryFn: () => getVendorApplicationDetail(Number(id)),
    enabled: !!id,
  });

  const app = data?.application;

  const mutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) => updateVendorApplication(Number(id), updates),
    onSuccess: () => {
      refetch();
      qc.invalidateQueries({ queryKey: ['vendor-pipeline'] });
    },
  });

  const [interviewNotes, setInterviewNotes] = useState('');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState('');

  const updateScore = (key: string, val: string) => setScores((p) => ({ ...p, [key]: val }));

  const saveScores = () => {
    const parsed: Record<string, number> = {};
    for (const f of SCORE_FIELDS) {
      const v = parseInt(scores[f.key] || String(app?.[f.key] || 0));
      if (isNaN(v) || v < 0 || v > 10) return Alert.alert('Invalid Score', `${f.label} must be 0-10`);
      parsed[f.key] = v;
    }
    mutation.mutate({ ...parsed, interview_notes: interviewNotes || app?.interview_notes || '', status: 'interview_done', current_step: 5 });
    Alert.alert('Saved', 'Interview scores saved successfully');
  };

  const changeStatus = (status: string) => {
    if (status === 'rejected') {
      if (!rejectReason.trim()) return Alert.alert('Reason Required', 'Please provide a rejection reason');
      mutation.mutate({ status, rejection_reason: rejectReason.trim() });
    } else {
      mutation.mutate({ status });
    }
  };

  const toggleChecklist = (key: string, current: boolean) => {
    mutation.mutate({ [key]: !current });
  };

  if (!app) {
    return (
      <View style={[st.c, { paddingTop: insets.top }]}>
        <View style={st.hdr}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
          <Text style={st.hdrTitle}>Loading...</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
    );
  }

  const stColor = STATUS_COLORS[app.status] || STATUS_COLORS.draft;
  const totalScore = SCORE_FIELDS.reduce((sum, f) => sum + (parseInt(scores[f.key] || String(app[f.key] || 0)) || 0), 0);

  return (
    <View style={[st.c, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={st.hdr}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
        <Text style={st.hdrTitle}>Application Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Card */}
        <View style={st.profileCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name={app.fullname} size={50} />
            <View style={{ flex: 1 }}>
              <Text style={st.name}>{app.fullname}</Text>
              <Text style={st.email}>{app.email}</Text>
              <Text style={st.phone}>{app.phone}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
            <Text style={st.vid}>{app.vendor_id}</Text>
            <View style={[st.statusBadge, { backgroundColor: stColor.bg }]}>
              <Text style={[st.statusText, { color: stColor.text }]}>{app.status.replace(/_/g, ' ').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Step 1: Resume Info */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>📄 Step 1: Resume/Basic Info</Text>
          <View style={st.infoGrid}>
            {[
              { l: 'Education', v: app.education },
              { l: 'Experience', v: `${app.experience_years} years` },
              { l: 'Skills', v: app.skills?.join(', ') },
              { l: 'Companies', v: app.previous_companies },
              { l: 'Certifications', v: app.certifications },
            ].map((item, i) => item.v ? (
              <View key={i} style={st.infoRow}>
                <Text style={st.infoLabel}>{item.l}:</Text>
                <Text style={st.infoValue}>{item.v}</Text>
              </View>
            ) : null)}
          </View>
          {app.resume_link && (
            <TouchableOpacity style={st.linkBtn} onPress={() => Linking.openURL(app.resume_link!)}>
              <Ionicons name="document-attach" size={16} color="#818CF8" />
              <Text style={st.linkBtnText}>View Resume</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Step 2: Work Samples */}
        {app.work_samples?.length > 0 && (
          <View style={st.section}>
            <Text style={st.sectionTitle}>🖼️ Step 2: Work Samples ({app.work_samples.length})</Text>
            {app.work_samples.map((sample: any, i: number) => (
              <TouchableOpacity key={i} style={st.sampleItem} onPress={() => Linking.openURL(sample.url)}>
                <Ionicons name="link" size={16} color="#818CF8" />
                <View style={{ flex: 1 }}>
                  <Text style={st.sampleTitle}>{sample.title || `Sample ${i + 1}`}</Text>
                  {sample.description && <Text style={st.sampleDesc}>{sample.description}</Text>}
                </View>
                <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 3: Written Answers */}
        {app.q1_projects_experience && (
          <View style={st.section}>
            <Text style={st.sectionTitle}>✍️ Step 3: Written Answers</Text>
            {[
              { q: 'Q1: Projects & Experience', a: app.q1_projects_experience },
              { q: 'Q2: Pricing', a: app.q2_pricing },
              { q: 'Q3: Guidelines & Corrections', a: app.q3_guidelines_corrections },
              { q: 'Q4: Teaching Ability', a: app.q4_teaching_ability },
              { q: 'Q5: Sample Sharing', a: app.q5_sample_sharing },
            ].map((item, i) => (
              <View key={i} style={st.qaItem}>
                <Text style={st.qaQ}>{item.q}</Text>
                <Text style={st.qaA}>{item.a}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Step 4: Interview Scoring */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>🎤 Step 4: Interview Scoring</Text>
          {SCORE_FIELDS.map((f) => (
            <View key={f.key} style={st.scoreRow}>
              <Text style={st.scoreLabel}>{f.label}</Text>
              <View style={st.scoreInput}>
                <TextInput
                  style={st.scoreInputText}
                  value={scores[f.key] ?? String(app[f.key] ?? '')}
                  onChangeText={(v) => updateScore(f.key, v)}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
                <Text style={st.scoreMax}>/10</Text>
              </View>
            </View>
          ))}
          <View style={[st.scoreRow, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 4 }]}>
            <Text style={[st.scoreLabel, { fontWeight: '800', color: '#F59E0B' }]}>Total</Text>
            <Text style={[st.scoreMax, { fontSize: 18, color: totalScore >= 35 ? '#059669' : totalScore >= 25 ? '#D97706' : '#DC2626' }]}>
              {totalScore}/50 {totalScore >= 35 ? '✅ Select' : totalScore >= 25 ? '🔶 Maybe' : '❌ Reject'}
            </Text>
          </View>
          <TextInput
            style={st.notesInput}
            placeholder="Interview notes..."
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={interviewNotes || app.interview_notes || ''}
            onChangeText={setInterviewNotes}
            multiline
          />
          <TouchableOpacity style={st.saveBtn} onPress={saveScores}>
            <Text style={st.saveBtnText}>Save Interview Scores</Text>
          </TouchableOpacity>
        </View>

        {/* Step 5: Onboarding Checklist */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>✅ Step 5: Onboarding Checklist</Text>
          {CHECKLIST_FIELDS.map((f) => (
            <TouchableOpacity key={f.key} style={st.checkRow} onPress={() => toggleChecklist(f.key, !!app[f.key])}>
              <Ionicons name={app[f.key] ? 'checkbox' : 'square-outline'} size={22} color={app[f.key] ? '#059669' : 'rgba(255,255,255,0.3)'} />
              <Text style={[st.checkLabel, app[f.key] && st.checkLabelDone]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>⚡ Actions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {app.status === 'submitted' && (
              <TouchableOpacity style={[st.actionBtn, { backgroundColor: 'rgba(245,158,11,0.15)' }]} onPress={() => changeStatus('under_review')}>
                <Ionicons name="eye" size={16} color="#F59E0B" /><Text style={[st.actionText, { color: '#F59E0B' }]}>Start Review</Text>
              </TouchableOpacity>
            )}
            {['under_review', 'interview_done'].includes(app.status) && (
              <TouchableOpacity style={[st.actionBtn, { backgroundColor: 'rgba(79,70,229,0.15)' }]} onPress={() => changeStatus('interview_scheduled')}>
                <Ionicons name="calendar" size={16} color="#818CF8" /><Text style={[st.actionText, { color: '#818CF8' }]}>Schedule Interview</Text>
              </TouchableOpacity>
            )}
            {['interview_done', 'interview_scheduled'].includes(app.status) && (
              <TouchableOpacity style={[st.actionBtn, { backgroundColor: 'rgba(5,150,105,0.15)' }]} onPress={() => changeStatus('selected')}>
                <Ionicons name="checkmark-done" size={16} color="#059669" /><Text style={[st.actionText, { color: '#059669' }]}>Select Vendor</Text>
              </TouchableOpacity>
            )}
            {app.status === 'selected' && (
              <TouchableOpacity style={[st.actionBtn, { backgroundColor: 'rgba(8,145,178,0.15)' }]} onPress={() => changeStatus('onboarding')}>
                <Ionicons name="rocket" size={16} color="#0891B2" /><Text style={[st.actionText, { color: '#0891B2' }]}>Start Onboarding</Text>
              </TouchableOpacity>
            )}
            {app.status === 'onboarding' && (
              <TouchableOpacity style={[st.actionBtn, { backgroundColor: 'rgba(5,150,105,0.15)' }]} onPress={() => changeStatus('active')}>
                <Ionicons name="shield-checkmark" size={16} color="#059669" /><Text style={[st.actionText, { color: '#059669' }]}>Activate Vendor ✅</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Reject section */}
          {!['active', 'rejected'].includes(app.status) && (
            <View style={{ marginTop: 16 }}>
              <TextInput
                style={st.notesInput}
                placeholder="Rejection reason..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={rejectReason}
                onChangeText={setRejectReason}
              />
              <TouchableOpacity style={[st.actionBtn, { backgroundColor: 'rgba(220,38,38,0.15)', alignSelf: 'flex-start' }]} onPress={() => changeStatus('rejected')}>
                <Ionicons name="close-circle" size={16} color="#DC2626" /><Text style={[st.actionText, { color: '#DC2626' }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' },
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  hdrTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFF' },

  // Profile
  profileCard: { marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 10 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 17, color: 'rgba(255,255,255,0.9)' },
  email: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  phone: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  vid: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#818CF8' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.5 },

  // Sections
  section: { marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 10 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },

  // Info grid
  infoGrid: { gap: 6 },
  infoRow: { flexDirection: 'row', gap: 8 },
  infoLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.5)', width: 90 },
  infoValue: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', flex: 1 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: 'rgba(129,140,248,0.12)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
  linkBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#818CF8' },

  // Samples
  sampleItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  sampleTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  sampleDesc: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  // Q&A
  qaItem: { marginBottom: 14 },
  qaQ: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#F59E0B', marginBottom: 4 },
  qaA: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },

  // Scores
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  scoreLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  scoreInput: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  scoreInputText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFF', width: 30, textAlign: 'center' },
  scoreMax: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  notesInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, color: '#FFF', fontFamily: 'Inter_400Regular', fontSize: 13, minHeight: 60, textAlignVertical: 'top', marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  saveBtn: { backgroundColor: '#F59E0B', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  saveBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#0F172A' },

  // Checklist
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  checkLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', flex: 1 },
  checkLabelDone: { color: '#059669', textDecorationLine: 'line-through' },

  // Actions
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
