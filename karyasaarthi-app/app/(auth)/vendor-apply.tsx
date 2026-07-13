/**
 * Vendor Apply Screen — Multi-step vendor hiring application.
 * Step 1: Basic Info + Resume Link
 * Step 2: Work Samples (3-5 links)
 * Step 3: Written Questions (5 questions)
 * Mintlify: Flat white cards, mint-green step progress, ink typography.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Linking, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { submitStep1, submitStep2, submitStep3 } from '@/services/vendor';
import { colors, spacing, typography, radius } from '@/utils/theme';
import { APP_INFO } from '@/utils/constants';

const { width: SW } = Dimensions.get('window');

const STEPS = [
  { num: 1, label: 'Basic Info' },
  { num: 2, label: 'Work Samples' },
  { num: 3, label: 'Questions' },
];

export default function VendorApplyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1 state
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [companies, setCompanies] = useState('');
  const [certifications, setCertifications] = useState('');
  const [resumeLink, setResumeLink] = useState('');

  // Step 2 state
  const [samples, setSamples] = useState([
    { url: '', title: '', description: '' },
    { url: '', title: '', description: '' },
    { url: '', title: '', description: '' },
  ]);

  // Step 3 state
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [q4, setQ4] = useState('');
  const [q5, setQ5] = useState('');

  const updateSample = (index: number, field: string, value: string) => {
    setSamples((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addSample = () => {
    if (samples.length < 5) setSamples((prev) => [...prev, { url: '', title: '', description: '' }]);
  };

  const removeSample = (index: number) => {
    if (samples.length > 3) setSamples((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStep1 = useCallback(async () => {
    if (!fullname.trim()) return Toast.show({ type: 'error', text1: 'Full name is required' });
    if (!email.trim() || !email.includes('@')) return Toast.show({ type: 'error', text1: 'Valid email is required' });
    if (!phone.trim() || phone.length < 10) return Toast.show({ type: 'error', text1: 'Valid phone number is required' });

    setLoading(true);
    try {
      const result = await submitStep1({
        fullname: fullname.trim(), email: email.trim().toLowerCase(), phone: phone.trim(),
        education: education.trim(), experience_years: parseInt(experience) || 0,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        previous_companies: companies.trim(), certifications: certifications.trim(),
        resume_link: resumeLink.trim(),
      });
      setApplicationId(result.application.id);
      setCurrentStep(2);
      Toast.show({ type: 'success', text1: 'Step 1 saved!', text2: 'Now add your work samples' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
    } finally { setLoading(false); }
  }, [fullname, email, phone, education, experience, skills, companies, certifications, resumeLink]);

  const handleStep2 = useCallback(async () => {
    const validSamples = samples.filter((s) => s.url.trim());
    if (validSamples.length < 3) return Toast.show({ type: 'error', text1: 'Minimum 3 work sample links required' });
    for (const s of validSamples) {
      if (!s.title.trim()) return Toast.show({ type: 'error', text1: 'Each sample needs a title' });
    }

    setLoading(true);
    try {
      await submitStep2(applicationId!, { work_samples: validSamples });
      setCurrentStep(3);
      Toast.show({ type: 'success', text1: 'Step 2 saved!', text2: 'Now answer the questions' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
    } finally { setLoading(false); }
  }, [samples, applicationId]);

  const handleStep3 = useCallback(async () => {
    if (!q1.trim() || !q2.trim() || !q3.trim() || !q4.trim() || !q5.trim()) {
      return Toast.show({ type: 'error', text1: 'All questions must be answered' });
    }

    setLoading(true);
    try {
      await submitStep3(applicationId!, {
        q1_projects_experience: q1.trim(), q2_pricing: q2.trim(),
        q3_guidelines_corrections: q3.trim(), q4_teaching_ability: q4.trim(),
        q5_sample_sharing: q5.trim(),
      });
      setSubmitted(true);
      Toast.show({ type: 'success', text1: '🎉 Application Submitted!', text2: 'Our HR team will review it.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit';
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
    } finally { setLoading(false); }
  }, [q1, q2, q3, q4, q5, applicationId]);

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <View style={s.container}>
        <View style={[s.headerFlat, { paddingTop: insets.top + 12 }]}>
          <Text style={s.brandTitle}>Karya Saarthi</Text>
          <Text style={s.brandTagline}>Your Trusted Work Companion</Text>
        </View>
        <View style={s.successWrap}>
          <View style={s.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.brandGreen} />
          </View>
          <Text style={s.successTitle}>Application Submitted! 🎉</Text>
          <Text style={s.successDesc}>Thank you for applying. Our HR team will review your application within 2-3 business days.</Text>
          <View style={s.successTimeline}>
            <Text style={s.timelineTitle}>What happens next?</Text>
            {[
              { icon: 'document-text', text: 'HR reviews your resume & samples (Day 1-3)' },
              { icon: 'call', text: 'Interview call scheduled (Day 4)' },
              { icon: 'checkmark-done', text: 'Selection & onboarding (Day 5-15)' },
              { icon: 'briefcase', text: 'First project assigned (Day 19+)' },
            ].map((item, i) => (
              <View key={i} style={s.timelineItem}>
                <View style={s.timelineDot}>
                  <Ionicons name={item.icon as any} size={16} color={colors.brandGreen} />
                </View>
                <Text style={s.timelineText}>{item.text}</Text>
              </View>
            ))}
          </View>
          <Button title="Back to Home" onPress={() => router.replace('/(auth)/welcome')} variant="primary" size="lg" fullWidth style={{ marginTop: spacing.lg }} />
        </View>
      </View>
    );
  }

  // ── Main Application Form ───────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <View style={[s.headerFlat, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={s.brandTitle}>Vendor Application</Text>
        <Text style={s.brandTagline}>Join our network of professionals</Text>
        
        {/* Contact bar */}
        <View style={s.contactBar}>
          <TouchableOpacity style={s.contactItem} onPress={() => Linking.openURL(`mailto:${APP_INFO.HR_EMAIL}`)}>
            <Ionicons name="mail" size={14} color={colors.stone} />
            <Text style={s.contactItemText}>{APP_INFO.HR_EMAIL}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.contactItem} onPress={() => Linking.openURL(`https://wa.me/919311025753`)}>
            <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
            <Text style={s.contactItemText}>{APP_INFO.HR_WHATSAPP}</Text>
          </TouchableOpacity>
        </View>

        {/* Step Progress */}
        <View style={s.stepRow}>
          {STEPS.map((step, i) => (
            <React.Fragment key={step.num}>
              <View style={s.stepItem}>
                <View style={[s.stepCircle, currentStep >= step.num && s.stepCircleActive, currentStep === step.num && s.stepCircleCurrent]}>
                  {currentStep > step.num ? (
                    <Ionicons name="checkmark" size={14} color={colors.primary} />
                  ) : (
                    <Text style={[s.stepNum, currentStep >= step.num && s.stepNumActive]}>{step.num}</Text>
                  )}
                </View>
                <Text style={[s.stepLabel, currentStep >= step.num && s.stepLabelActive]}>{step.label}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={[s.stepLine, currentStep > step.num && s.stepLineActive]} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={s.formCard}>
            {/* ── STEP 1 ────────────────────────────────────────────── */}
            {currentStep === 1 && (
              <>
                <View style={s.stepHeader}>
                  <View style={s.stepIconWrap}><Ionicons name="document-text" size={22} color={colors.ink} /></View>
                  <View>
                    <Text style={s.stepTitle}>Basic Information</Text>
                    <Text style={s.stepSubtitle}>Tell us about yourself & share your resume</Text>
                  </View>
                </View>
                <View style={s.infoBox}>
                  <Ionicons name="information-circle" size={18} color={colors.info} />
                  <Text style={s.infoText}>We check: Name, contact details, education, work experience, skills, certifications</Text>
                </View>
                <Input label="Full Name *" icon="person-outline" value={fullname} onChangeText={setFullname} autoCapitalize="words" />
                <Input label="Email Address *" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <Input label="Phone Number *" icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <Input label="Educational Qualifications" icon="school-outline" value={education} onChangeText={setEducation} />
                <Input label="Experience (years)" icon="time-outline" value={experience} onChangeText={setExperience} keyboardType="numeric" />
                <Input label="Skills (comma separated)" icon="code-slash-outline" value={skills} onChangeText={setSkills} />
                <Input label="Previous Companies/Clients" icon="business-outline" value={companies} onChangeText={setCompanies} />
                <Input label="Certifications/Achievements" icon="ribbon-outline" value={certifications} onChangeText={setCertifications} />
                <Input label="Resume/CV Link (Google Drive, etc.)" icon="link-outline" value={resumeLink} onChangeText={setResumeLink} autoCapitalize="none" />
                <Button title="Save & Continue →" onPress={handleStep1} loading={loading} variant="primary" size="lg" fullWidth style={{ marginTop: spacing.md }} />
              </>
            )}

            {/* ── STEP 2 ────────────────────────────────────────────── */}
            {currentStep === 2 && (
              <>
                <View style={s.stepHeader}>
                  <View style={s.stepIconWrap}><Ionicons name="images" size={22} color={colors.ink} /></View>
                  <View>
                    <Text style={s.stepTitle}>Work Samples</Text>
                    <Text style={s.stepSubtitle}>Share 3-5 links to your best work</Text>
                  </View>
                </View>
                <View style={s.infoBox}>
                  <Ionicons name="information-circle" size={18} color={colors.info} />
                  <Text style={s.infoText}>Samples should be similar to projects we do (thesis, website, design, etc.). Original work only.</Text>
                </View>
                {samples.map((sample, i) => (
                  <View key={i} style={s.sampleCard}>
                    <View style={s.sampleHeader}>
                      <Text style={s.sampleLabel}>Sample {i + 1} {i < 3 ? '*' : ''}</Text>
                      {i >= 3 && (
                        <TouchableOpacity onPress={() => removeSample(i)}>
                          <Ionicons name="close-circle" size={22} color={colors.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Input label="Link (Google Drive, etc.) *" icon="link-outline" value={sample.url} onChangeText={(v) => updateSample(i, 'url', v)} autoCapitalize="none" />
                    <Input label="Title *" icon="text-outline" value={sample.title} onChangeText={(v) => updateSample(i, 'title', v)} />
                    <Input label="Description (optional)" icon="document-text-outline" value={sample.description} onChangeText={(v) => updateSample(i, 'description', v)} />
                  </View>
                ))}
                {samples.length < 5 && (
                  <TouchableOpacity style={s.addBtn} onPress={addSample}>
                    <Ionicons name="add-circle" size={20} color={colors.ink} />
                    <Text style={s.addBtnText}>Add Another Sample</Text>
                  </TouchableOpacity>
                )}
                <Button title="Save & Continue →" onPress={handleStep2} loading={loading} variant="primary" size="lg" fullWidth style={{ marginTop: spacing.md }} />
              </>
            )}

            {/* ── STEP 3 ────────────────────────────────────────────── */}
            {currentStep === 3 && (
              <>
                <View style={s.stepHeader}>
                  <View style={s.stepIconWrap}><Ionicons name="help-circle" size={22} color={colors.ink} /></View>
                  <View>
                    <Text style={s.stepTitle}>Written Application</Text>
                    <Text style={s.stepSubtitle}>Please answer all questions honestly & in detail</Text>
                  </View>
                </View>
                <View style={s.questionCard}>
                  <Text style={s.qLabel}>Question 1:</Text>
                  <Text style={s.qText}>How many projects have you completed so far? What is your total experience in years?</Text>
                  <Input label="Your Answer *" icon="create-outline" value={q1} onChangeText={setQ1} multiline />
                </View>
                <View style={s.questionCard}>
                  <Text style={s.qLabel}>Question 2:</Text>
                  <Text style={s.qText}>What is your minimum and maximum charge? Do you charge per page, per project, or hourly?</Text>
                  <Input label="Your Answer *" icon="create-outline" value={q2} onChangeText={setQ2} multiline />
                </View>
                <View style={s.questionCard}>
                  <Text style={s.qLabel}>Question 3:</Text>
                  <Text style={s.qText}>Can you create projects according to both student and company guidelines? Are you ready to do unlimited corrections?</Text>
                  <Input label="Your Answer *" icon="create-outline" value={q3} onChangeText={setQ3} multiline />
                </View>
                <View style={s.questionCard}>
                  <Text style={s.qLabel}>Question 4:</Text>
                  <Text style={s.qText}>If a student wants to understand how their project was made (for viva/presentation), can you explain and provide teaching sessions?</Text>
                  <Input label="Your Answer *" icon="create-outline" value={q4} onChangeText={setQ4} multiline />
                </View>
                <View style={s.questionCard}>
                  <Text style={s.qLabel}>Question 5:</Text>
                  <Text style={s.qText}>Can we show your sample work to potential clients? (Removing student name & personal details, just to show quality)</Text>
                  <Input label="Your Answer *" icon="create-outline" value={q5} onChangeText={setQ5} multiline />
                </View>
                <Button title="Submit Application" onPress={handleStep3} loading={loading} variant="primary" size="lg" fullWidth style={{ marginTop: spacing.md }} />
              </>
            )}
          </View>
          <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },

  // Flat header
  headerFlat: { paddingHorizontal: spacing.containerMargin, paddingBottom: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.hairline, backgroundColor: colors.white },
  backBtn: { position: 'absolute', left: 16, top: 52, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  brandTitle: { ...typography.headlineMd, color: colors.ink, marginTop: 4 },
  brandTagline: { ...typography.bodySm, color: colors.steel, marginTop: 2 },

  // Contact bar
  contactBar: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 10, paddingVertical: 6, width: '100%' },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactItemText: { ...typography.labelMd, color: colors.stone },

  // Step progress
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, width: '100%', paddingHorizontal: 10 },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.hairline, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { borderColor: colors.brandGreen, backgroundColor: colors.brandGreen },
  stepCircleCurrent: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepNum: { ...typography.labelMd, color: colors.stone },
  stepNumActive: { color: colors.white },
  stepLabel: { ...typography.labelSm, color: colors.stone, maxWidth: 70, textAlign: 'center' },
  stepLabelActive: { color: colors.ink, fontWeight: '600' },
  stepLine: { width: 40, height: 2, backgroundColor: colors.hairline, marginHorizontal: 6 },
  stepLineActive: { backgroundColor: colors.brandGreen },

  // Form
  scrollContent: { paddingHorizontal: spacing.containerMargin, paddingTop: 16 },
  formCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.hairline },

  // Step headers
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.md },
  stepIconWrap: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { ...typography.headlineSm, color: colors.ink },
  stepSubtitle: { ...typography.bodySm, color: colors.steel, marginTop: 2 },

  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(55, 114, 207, 0.08)', borderRadius: radius.md, padding: 12, marginBottom: spacing.md },
  infoText: { ...typography.bodySm, color: colors.brandTag, flex: 1 },

  sampleCard: { borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.lg, padding: 12, marginBottom: 12 },
  sampleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sampleLabel: { ...typography.labelLg, color: colors.ink },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.lg, borderStyle: 'dashed', marginBottom: 16, backgroundColor: colors.surfaceContainerLow },
  addBtnText: { ...typography.labelMd, color: colors.ink },

  questionCard: { borderLeftWidth: 3, borderLeftColor: colors.brandGreen, backgroundColor: colors.surfaceContainerLow, borderRadius: radius.md, padding: 14, marginBottom: 14 },
  qLabel: { ...typography.labelLg, color: colors.ink, marginBottom: 4 },
  qText: { ...typography.bodyMd, color: colors.steel, marginBottom: 10 },

  // Success
  successWrap: { flex: 1, paddingHorizontal: spacing.containerMargin, paddingTop: spacing.xl, alignItems: 'center' },
  successIcon: { marginBottom: spacing.md },
  successTitle: { ...typography.headlineLg, color: colors.ink, textAlign: 'center' },
  successDesc: { ...typography.bodyMd, color: colors.steel, textAlign: 'center', marginTop: 8, paddingHorizontal: 10 },
  successTimeline: { width: '100%', backgroundColor: colors.surfaceContainerLow, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg },
  timelineTitle: { ...typography.labelLg, color: colors.ink, marginBottom: 12 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  timelineDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,212,164,0.12)', alignItems: 'center', justifyContent: 'center' },
  timelineText: { ...typography.bodyMd, color: colors.steel, flex: 1 },
});
