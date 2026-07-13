/**
 * Vendor Project Detail Screen — View project details, update status, chat, and upload files.
 * Mirrors the website vendor panel: progress slider, status buttons, team chat, file upload.
 * Mintlify: Flat UI, hairline borders, ink text, brand green accents.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getProjectApi, updateProjectApi, getProjectTasksApi, updateProjectTaskApi } from '@/services/projects';
import { pickDocument, uploadFile } from '@/services/upload';
import { sendProjectMessageApi } from '@/services/chat';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import Toast from 'react-native-toast-message';

const STATUS_FLOW = [
  { key: 'assigned', label: 'Assigned', icon: '👨‍💼', color: '#3B82F6' },
  { key: 'in_progress', label: 'In Progress', icon: '🔄', color: '#06B6D4' },
  { key: 'review', label: 'Review', icon: '🔍', color: '#A855F7' },
  { key: 'delivered', label: 'Delivered', icon: '📦', color: '#14B8A6' },
  { key: 'completed', label: 'Completed', icon: '✅', color: '#22C55E' },
];

export default function VendorProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const theme = useAppTheme();
  const s = useStyles(theme);
  const [uploadingFile, setUploadingFile] = useState(false);

  const { data: project, refetch } = useQuery({
    queryKey: ['vendor-project', id],
    queryFn: () => getProjectApi(id as string),
    enabled: !!id,
  });

  const { data: tasksData } = useQuery({
    queryKey: ['vendor-project-tasks', id],
    queryFn: () => getProjectTasksApi(id as string),
    enabled: !!id,
    refetchInterval: 10000,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) => updateProjectApi(id as string, updates as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-project', id] });
      queryClient.invalidateQueries({ queryKey: ['vendor-projects'] });
      Toast.show({ type: 'success', text1: 'Project Updated' });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update project');
    },
  });

  const taskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: string }) => updateProjectTaskApi(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-project-tasks', id] });
    },
  });

  const handleFileUpload = async () => {
    const doc = await pickDocument();
    if (!doc) return;
    setUploadingFile(true);
    try {
      const result = await uploadFile(doc.uri, doc.name, doc.mimeType || 'application/octet-stream');
      if (result?.url) {
        await sendProjectMessageApi(id as string, {
          text: `📎 File uploaded: ${doc.name}`,
          attachment_url: result.url,
          file_type: doc.mimeType,
        });
        Toast.show({ type: 'success', text1: 'File Uploaded', text2: doc.name });
      }
    } catch {
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleStatusUpdate = (newStatus: string, progress: number) => {
    Alert.alert(
      'Update Status',
      `Change project status to "${newStatus.replace('_', ' ')}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => updateMutation.mutate({ status: newStatus, progress }) },
      ]
    );
  };

  if (!project) {
    return (
      <View style={[s.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.brandGreen} />
      </View>
    );
  }

  const currentStepIdx = STATUS_FLOW.findIndex(sf => sf.key === project.status);
  const progressVal = project.status === 'completed' ? 100 : (project.progress || 0);
  const tasks = tasksData?.tasks || [];

  const statusVariant = (status: string) => {
    if (status === 'completed' || status === 'delivered') return 'success' as const;
    if (status === 'review') return 'warning' as const;
    if (status === 'in_progress') return 'info' as const;
    return 'secondary' as const;
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.ink} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Project Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {/* ── Project Info Card ────────────── */}
        <Card variant="flat" style={s.infoCard}>
          <View style={s.infoTopRow}>
            <Text style={s.projectName}>{project.service_type || project.name || project.title || 'Project'}</Text>
            <Badge text={project.status?.replace('_', ' ') || 'Active'} variant={statusVariant(project.status)} size="md" />
          </View>
          <Text style={s.projectDesc}>{project.description || 'No description'}</Text>
          <View style={s.metaGrid}>
            <View style={s.metaItem}>
              <Ionicons name="person" size={16} color={theme.stone} />
              <Text style={s.metaLabel}>Client</Text>
              <Text style={s.metaValue}>{project.customer_name || 'N/A'}</Text>
            </View>
            <View style={s.metaItem}>
              <Ionicons name="calendar" size={16} color={theme.stone} />
              <Text style={s.metaLabel}>Created</Text>
              <Text style={s.metaValue}>{project.created_at?.slice(0, 10) || 'N/A'}</Text>
            </View>
            <View style={s.metaItem}>
              <Ionicons name="pricetag" size={16} color={theme.stone} />
              <Text style={s.metaLabel}>Budget</Text>
              <Text style={s.metaValue}>{project.amount ? `₹${project.amount.toLocaleString()}` : 'TBD'}</Text>
            </View>
          </View>
        </Card>

        {/* ── Progress Tracker ────────────── */}
        <Card variant="flat" style={s.trackerCard}>
          <View style={s.trackerHeader}>
            <Text style={s.trackerTitle}>Progress</Text>
            <Text style={s.trackerPercent}>{progressVal}%</Text>
          </View>
          <View style={s.progressBarBg}>
            <View style={[s.progressBarFill, { width: `${progressVal}%` }]} />
          </View>
          <View style={s.stepsRow}>
            {STATUS_FLOW.map((step, i) => (
              <View key={step.key} style={s.stepItem}>
                <View style={[s.stepDot, i <= currentStepIdx && { backgroundColor: step.color, borderColor: step.color }]}>
                  <Text style={{ fontSize: 12 }}>{step.icon}</Text>
                </View>
                <Text style={[s.stepLabel, i <= currentStepIdx && { color: theme.ink }]}>{step.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* ── Status Actions ─────────────── */}
        <View style={s.actionRow}>
          {project.status === 'assigned' && (
            <Button title="🚀 Start Work" variant="primary" size="md" fullWidth
              onPress={() => handleStatusUpdate('in_progress', 10)}
              loading={updateMutation.isPending} />
          )}
          {project.status === 'in_progress' && (
            <Button title="🔍 Submit for Review" variant="primary" size="md" fullWidth
              onPress={() => handleStatusUpdate('review', 90)}
              loading={updateMutation.isPending} />
          )}
          {project.status === 'review' && (
            <Button title="📦 Mark Delivered" variant="primary" size="md" fullWidth
              onPress={() => handleStatusUpdate('delivered', 100)}
              loading={updateMutation.isPending} />
          )}
          <View style={s.actionBtnRow}>
            <Button title="📁 Upload File" variant="secondary" size="md"
              onPress={handleFileUpload}
              loading={uploadingFile}
              style={{ flex: 1 }} />
            <Button title="💬 Team Chat" variant="secondary" size="md"
              onPress={() => router.push(`/(vendor)/chat-thread/${id}` as any)}
              style={{ flex: 1 }} />
          </View>
        </View>

        {/* ── Tasks ──────────────────────── */}
        {tasks.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Tasks</Text>
            {tasks.map((task: any) => (
              <Animated.View key={task.id} entering={FadeInDown.duration(400)}>
                <View style={s.taskCard}>
                  <View style={s.taskHeader}>
                    <Text style={s.taskTitle}>{task.title}</Text>
                    <Badge text={task.status?.replace('_', ' ') || 'todo'} variant={task.status === 'done' ? 'success' : 'secondary'} size="sm" />
                  </View>
                  {task.description && <Text style={s.taskDesc}>{task.description}</Text>}
                  {task.deadline && <Text style={s.taskDue}>Due: {task.deadline.slice(0, 10)}</Text>}
                  <View style={s.taskActions}>
                    {task.status !== 'done' && (
                      <TouchableOpacity
                        style={s.taskDoneBtn}
                        onPress={() => taskMutation.mutate({ taskId: task.id, status: task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'review' : 'done' })}
                      >
                        <Ionicons name="checkmark" size={14} color={theme.brandGreen} />
                        <Text style={s.taskDoneBtnText}>
                          {task.status === 'todo' ? 'Start' : task.status === 'in_progress' ? 'Review' : 'Complete'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const HP = spacing.containerMargin;
const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: HP, paddingVertical: spacing.md, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.headlineMd, color: theme.ink },
  content: { paddingHorizontal: HP, paddingTop: spacing.md },

  // Info Card
  infoCard: { padding: spacing.md, backgroundColor: theme.white, borderWidth: 1, borderColor: theme.hairline, borderRadius: radius.lg, marginBottom: spacing.md },
  infoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  projectName: { ...typography.headlineMd, color: theme.ink, flex: 1 },
  projectDesc: { ...typography.bodyMd, color: theme.steel, lineHeight: 22, marginBottom: 14 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, borderTopWidth: 1, borderTopColor: theme.hairline, paddingTop: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaLabel: { ...typography.labelSm, color: theme.stone },
  metaValue: { ...typography.labelMd, color: theme.ink, fontWeight: '700' },

  // Tracker
  trackerCard: { padding: spacing.md, backgroundColor: theme.white, borderWidth: 1, borderColor: theme.hairline, borderRadius: radius.lg, marginBottom: spacing.md },
  trackerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  trackerTitle: { ...typography.labelLg, color: theme.ink },
  trackerPercent: { ...typography.headlineSm, color: theme.primary, fontWeight: '700' },
  progressBarBg: { height: 4, backgroundColor: theme.surfaceContainer, borderRadius: 2, overflow: 'hidden', marginBottom: 16 },
  progressBarFill: { height: '100%', backgroundColor: theme.brandGreen, borderRadius: 2 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepItem: { alignItems: 'center', flex: 1, gap: 4 },
  stepDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.surfaceContainer, borderWidth: 1, borderColor: theme.hairline, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { ...typography.labelSm, color: theme.stone, fontSize: 9, textAlign: 'center' },

  // Actions
  actionRow: { gap: 10, marginBottom: spacing.lg },
  actionBtnRow: { flexDirection: 'row', gap: 10 },

  // Tasks
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.headlineMd, color: theme.ink, marginBottom: spacing.sm },
  taskCard: { backgroundColor: theme.white, padding: spacing.md, borderRadius: radius.md, marginBottom: 8, borderWidth: 1, borderColor: theme.hairline },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  taskTitle: { ...typography.labelLg, color: theme.ink, flex: 1 },
  taskDesc: { ...typography.bodySm, color: theme.stone, marginTop: 4 },
  taskDue: { ...typography.labelMd, color: theme.brandError, marginTop: 8 },
  taskActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  taskDoneBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, backgroundColor: 'rgba(0,212,164,0.1)', borderWidth: 1, borderColor: 'rgba(0,212,164,0.2)' },
  taskDoneBtnText: { ...typography.labelSm, color: theme.primary },
});
