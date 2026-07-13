/**
 * Application Status Screen — Vendors can track their hiring pipeline progress.
 * Mintlify: Flat white UI, hairline borders, ink text, brand green steps.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getApplicationStatus } from '@/services/vendor';
import { colors, spacing, typography, radius } from '@/utils/theme';
import { APP_INFO } from '@/utils/constants';

const PIPELINE_STEPS = [
  { num: 1, title: 'Resume & Basic Info', desc: 'Application submitted', icon: 'document-text' },
  { num: 2, title: 'Work Samples', desc: 'Portfolio reviewed by HR', icon: 'images' },
  { num: 3, title: 'Written Questions', desc: 'Answers reviewed by HR', icon: 'help-circle' },
  { num: 4, title: 'Interview', desc: '10-15 min call with HR', icon: 'videocam' },
  { num: 5, title: 'Onboarding', desc: 'Welcome to Karya Saarthi!', icon: 'checkmark-done-circle' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: colors.surfaceContainerLow, text: colors.stone, label: 'Draft' },
  submitted: { bg: 'rgba(0,102,255,0.1)', text: '#0066FF', label: 'Submitted' },
  under_review: { bg: 'rgba(245,158,11,0.1)', text: colors.warning, label: 'Under Review' },
  interview_scheduled: { bg: 'rgba(79,70,229,0.1)', text: '#4F46E5', label: 'Interview Scheduled' },
  interview_done: { bg: 'rgba(217,119,6,0.1)', text: '#D97706', label: 'Interview Done' },
  selected: { bg: 'rgba(0,212,164,0.1)', text: colors.primary, label: 'Selected 🎉' },
  onboarding: { bg: 'rgba(8,145,178,0.1)', text: '#0891B2', label: 'Onboarding' },
  active: { bg: 'rgba(0,212,164,0.1)', text: colors.brandGreen, label: 'Active Vendor ✅' },
  rejected: { bg: 'rgba(220,38,38,0.1)', text: colors.brandError, label: 'Not Selected' },
};

export default function ApplicationStatusScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['vendor-application-status', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      return getApplicationStatus(user.email);
    },
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 2,
  });

  const app = data?.application;
  const statusInfo = app ? STATUS_COLORS[app.status] || STATUS_COLORS.draft : STATUS_COLORS.draft;

  const getStepStatus = (stepNum: number) => {
    if (!app) return 'pending';
    if (app.current_step > stepNum) return 'completed';
    if (app.current_step === stepNum) return 'current';
    return 'pending';
  };

  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <Text style={s.brandTitle}>Karya Saarthi 🤝</Text>
        <Text style={s.brandSub}>Application Status</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brandGreen} />}
        contentContainerStyle={s.scrollContent}
      >
        {!app ? (
          <View style={s.emptyCard}>
            <Ionicons name="document-text-outline" size={48} color={colors.stone} />
            <Text style={s.emptyTitle}>No Application Found</Text>
            <Text style={s.emptyDesc}>You haven't submitted a vendor application yet.</Text>
          </View>
        ) : (
          <>
            {/* Status Badge Card */}
            <View style={s.statusCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={s.vendorId}>{app.vendor_id || 'Processing...'}</Text>
                  <Text style={s.appliedDate}>Applied: {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={[s.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
                </View>
              </View>
            </View>

            {/* Pipeline Timeline */}
            <View style={s.timelineCard}>
              <Text style={s.timelineTitle}>Hiring Pipeline</Text>
              {PIPELINE_STEPS.map((step) => {
                const status = getStepStatus(step.num);
                return (
                  <View key={step.num} style={s.timelineRow}>
                    <View style={s.timelineLeft}>
                      <View style={[s.timelineDot, status === 'completed' && s.dotCompleted, status === 'current' && s.dotCurrent]}>
                        {status === 'completed' ? (
                          <Ionicons name="checkmark" size={14} color={colors.white} />
                        ) : (
                          <Ionicons name={step.icon as any} size={14} color={status === 'current' ? colors.white : colors.stone} />
                        )}
                      </View>
                      {step.num < 5 && <View style={[s.timelineLine, status === 'completed' && s.lineCompleted]} />}
                    </View>
                    <View style={s.timelineRight}>
                      <Text style={[s.timelineStepTitle, status === 'current' && { color: colors.ink }]}>
                        Step {step.num}: {step.title}
                      </Text>
                      <Text style={s.timelineStepDesc}>{step.desc}</Text>
                      {status === 'current' && (
                        <View style={s.currentBadge}>
                          <Text style={s.currentBadgeText}>⏳ In Progress</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Contact Support */}
            <View style={s.supportCard}>
              <Text style={s.supportTitle}>Need Help?</Text>
              <TouchableOpacity style={s.supportBtn} onPress={() => Linking.openURL('https://wa.me/919311025753')}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={s.supportBtnText}>WhatsApp: {APP_INFO.HR_WHATSAPP}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.supportBtn} onPress={() => Linking.openURL(`mailto:${APP_INFO.HR_EMAIL}`)}>
                <Ionicons name="mail" size={20} color={colors.primary} />
                <Text style={s.supportBtnText}>Email: {APP_INFO.HR_EMAIL}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceContainerLow },
  header: { paddingHorizontal: spacing.containerMargin, paddingBottom: 20, alignItems: 'center', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  brandTitle: { ...typography.headlineLg, color: colors.ink },
  brandSub: { ...typography.labelMd, color: colors.stone, marginTop: 2 },
  scrollContent: { paddingHorizontal: spacing.containerMargin, paddingTop: 16 },

  // Empty
  emptyCard: { alignItems: 'center', paddingVertical: 60, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.hairline },
  emptyTitle: { ...typography.headlineSm, color: colors.ink, marginTop: 12 },
  emptyDesc: { ...typography.bodyMd, color: colors.stone, marginTop: 4, textAlign: 'center' },

  // Status card
  statusCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.hairline, marginBottom: 14 },
  vendorId: { ...typography.headlineSm, color: colors.primary },
  appliedDate: { ...typography.labelSm, color: colors.stone, marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  statusText: { ...typography.labelSm },

  // Timeline
  timelineCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.hairline, marginBottom: 14 },
  timelineTitle: { ...typography.headlineMd, color: colors.ink, marginBottom: 16 },
  timelineRow: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { alignItems: 'center', width: 36 },
  timelineDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: colors.hairline, backgroundColor: colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  dotCompleted: { backgroundColor: colors.brandGreen, borderColor: colors.brandGreen },
  dotCurrent: { backgroundColor: colors.ink, borderColor: colors.ink },
  timelineLine: { width: 2, flex: 1, minHeight: 30, backgroundColor: colors.hairline, marginVertical: 2 },
  lineCompleted: { backgroundColor: colors.brandGreen },
  timelineRight: { flex: 1, paddingLeft: 12, paddingBottom: 20 },
  timelineStepTitle: { ...typography.labelLg, color: colors.steel },
  timelineStepDesc: { ...typography.bodySm, color: colors.stone, marginTop: 2 },
  currentBadge: { backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  currentBadgeText: { ...typography.labelSm, color: colors.warning },

  // Support
  supportCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.hairline },
  supportTitle: { ...typography.labelLg, color: colors.ink, marginBottom: 10 },
  supportBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  supportBtnText: { ...typography.bodyMd, color: colors.steel },
});
