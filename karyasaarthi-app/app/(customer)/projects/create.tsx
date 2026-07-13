/**
 * Create Project Screen — Multi-field form for submitting a new project request.
 * Matches the website's "New Project Request" form (service_type, description, budget).
 * Mintlify: Flat UI, hairline borders, ink text, brand green accents.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { createProjectApi } from '@/services/projects';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import Toast from 'react-native-toast-message';

const SERVICE_TYPES = [
  'Thesis Writing',
  'Project Report',
  'Research Paper',
  'Presentation',
  'Resume Building',
  'Business Plan',
  'Website Development',
  'Mobile App Development',
  'Data Analysis',
  'SEO Optimization',
  'Digital Marketing',
  'Content Writing',
  'Questionnaire Design',
  'Other',
];

export default function CreateProjectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const theme = useAppTheme();
  const s = useStyles(theme);

  const { service_name } = useLocalSearchParams<{ service_name?: string }>();
  const [serviceType, setServiceType] = useState(service_name || '');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [showServicePicker, setShowServicePicker] = useState(false);

  // If service_name is passed but not in standard list, append it so it's selectable
  const displayServices = React.useMemo(() => {
    if (service_name && !SERVICE_TYPES.includes(service_name)) {
      return [service_name, ...SERVICE_TYPES];
    }
    return SERVICE_TYPES;
  }, [service_name]);

  const createMutation = useMutation({
    mutationFn: () => createProjectApi({
      name: serviceType,
      description,
      budget: budget ? Number(budget) : undefined,
    }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Request Submitted!', text2: 'Our team will assign a vendor shortly.' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.back();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.error || 'Failed to submit project request.');
    },
  });

  const handleSubmit = () => {
    if (!serviceType) { Alert.alert('Required', 'Please select a service type'); return; }
    if (!description.trim() || description.trim().length < 20) {
      Alert.alert('Required', 'Please describe your requirements (at least 20 characters)');
      return;
    }
    createMutation.mutate();
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.ink} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Project Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info banner */}
          <View style={s.infoBanner}>
            <Ionicons name="information-circle" size={22} color={theme.primary} />
            <Text style={s.infoText}>
              Submit your requirements and our team will match you with the best vendor.
            </Text>
          </View>

          {/* Service Type Picker */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Service Type *</Text>
            <TouchableOpacity
              style={s.pickerBtn}
              onPress={() => setShowServicePicker(!showServicePicker)}
              activeOpacity={0.8}
            >
              <Ionicons name="grid-outline" size={18} color={serviceType ? theme.ink : theme.stone} />
              <Text style={[s.pickerText, !serviceType && { color: theme.stone }]}>
                {serviceType || 'Select Service Type'}
              </Text>
              <Ionicons name={showServicePicker ? 'chevron-up' : 'chevron-down'} size={18} color={theme.stone} />
            </TouchableOpacity>

            {showServicePicker && (
              <View style={s.pickerDropdown}>
                {displayServices.map((svc) => (
                  <TouchableOpacity
                    key={svc}
                    style={[s.pickerItem, serviceType === svc && s.pickerItemActive]}
                    onPress={() => { setServiceType(svc); setShowServicePicker(false); }}
                  >
                    <Text style={[s.pickerItemText, serviceType === svc && s.pickerItemTextActive]}>
                      {svc}
                    </Text>
                    {serviceType === svc && <Ionicons name="checkmark" size={18} color={theme.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Description *</Text>
            <TextInput
              style={s.textArea}
              placeholder="Describe your requirements in detail...&#10;&#10;Include: subject, pages/slides, deadline preference, specific instructions."
              placeholderTextColor={theme.stone}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={s.charCount}>{description.length}/2000</Text>
          </View>

          {/* Budget */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Budget (₹) — optional</Text>
            <View style={s.budgetRow}>
              <Ionicons name="cash-outline" size={20} color={theme.stone} />
              <TextInput
                style={s.budgetInput}
                placeholder="e.g. 5000"
                placeholderTextColor={theme.stone}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
              />
            </View>
            <Text style={s.helperText}>
              Leave blank if unsure. We'll provide a quote after reviewing your request.
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[s.submitBtn, createMutation.isPending && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
            activeOpacity={0.8}
          >
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color={theme.white} />
            ) : (
              <>
                <Ionicons name="send" size={18} color={theme.white} />
                <Text style={s.submitText}>Submit Request</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const HP = spacing.containerMargin;
const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: HP, paddingVertical: spacing.md, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.headlineMd, color: theme.ink },

  content: { paddingHorizontal: HP, paddingTop: spacing.lg },

  infoBanner: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(0,212,164,0.08)', borderRadius: radius.lg, padding: 14, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(0,212,164,0.2)' },
  infoText: { ...typography.bodySm, color: theme.ink, flex: 1, lineHeight: 20 },

  fieldGroup: { marginBottom: 22 },
  label: { ...typography.labelMd, color: theme.stone, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  pickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.white, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: theme.hairline },
  pickerText: { ...typography.bodyMd, color: theme.ink, flex: 1 },
  pickerDropdown: { backgroundColor: theme.white, borderRadius: radius.md, borderWidth: 1, borderColor: theme.hairline, marginTop: 4, maxHeight: 250, overflow: 'hidden' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  pickerItemActive: { backgroundColor: 'rgba(0,212,164,0.08)' },
  pickerItemText: { ...typography.bodyMd, color: theme.ink },
  pickerItemTextActive: { color: theme.primary, fontWeight: '700' },

  textArea: { backgroundColor: theme.white, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, ...typography.bodyMd, color: theme.ink, borderWidth: 1, borderColor: theme.hairline, minHeight: 140 },
  charCount: { ...typography.labelSm, color: theme.stone, textAlign: 'right', marginTop: 4 },

  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.white, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: theme.hairline },
  budgetInput: { flex: 1, ...typography.bodyMd, color: theme.ink },
  helperText: { ...typography.bodySm, color: theme.stone, marginTop: 6, lineHeight: 18 },

  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.primary, borderRadius: radius.full, paddingVertical: 16, marginTop: spacing.md },
  submitText: { ...typography.labelLg, color: theme.white },
  cancelBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
  cancelText: { ...typography.labelMd, color: theme.stone },
});
