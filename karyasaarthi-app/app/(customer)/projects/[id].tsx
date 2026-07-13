/**
 * Project Detail Screen — View individual project timeline, tasks, and leave ratings.
 * Mintlify: Flat cards, hairline borders, ink typography, brand green accents.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import api from '@/services/api';
import { getProjectTasksApi, submitRatingApi } from '@/services/projects';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = useStyles(theme);

  const { data, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/projects/${id}`);
      return data?.project || data;
    },
    enabled: !!id,
  });

  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['projectTasks', id],
    queryFn: () => getProjectTasksApi(id as string),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleRateSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    setSubmittingRating(true);
    try {
      await submitRatingApi({ project_id: Number(id), rating, review });
      Alert.alert('Success', 'Rating submitted successfully');
      setRatingModalVisible(false);
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const project = data || {};
  const vendorName = project.vendor_name || project.vendor?.fullname || 'Assigning...';
  const amount = project.amount ?? project.budget;
  const serviceName = project.service_type || project.service_name || 'N/A';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.projectName}>{project.service_type || project.name || project.title || 'Project'}</Text>
        <Badge text={project.status || 'Active'} variant="info" size="md" />

        <Card variant="flat" style={styles.infoCard}>
          <InfoRow icon="calendar" label="Created" value={project.created_at?.slice(0, 10) || 'Not set'} theme={theme} />
          <InfoRow icon="person" label="Vendor" value={vendorName} theme={theme} />
          <InfoRow icon="pricetag" label="Amount" value={amount ? `Rs. ${amount}` : 'TBD'} theme={theme} />
          <InfoRow icon="document-text" label="Service" value={serviceName} theme={theme} />
        </Card>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{project.description || 'No description available'}</Text>

        <Text style={styles.sectionTitle}>Tasks</Text>
        {isLoadingTasks ? (
          <ActivityIndicator color={theme.brandGreen} style={{ marginTop: spacing.md }} />
        ) : tasksData?.tasks?.length ? (
          tasksData.tasks.map((task: any) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Badge text={task.status} variant={task.status === 'completed' ? 'success' : 'secondary'} size="sm" />
              </View>
              {task.description && <Text style={styles.taskDesc}>{task.description}</Text>}
              {task.due_date && <Text style={styles.taskDue}>Due: {task.due_date.slice(0, 10)}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.description}>No tasks available</Text>
        )}

        <Button title="Chat with Team" onPress={() => router.push(`/(customer)/chat/${id}` as any)} variant="secondary" size="md" fullWidth style={{ marginTop: spacing.xl }} icon={<Ionicons name="chatbubble-outline" size={18} color={theme.primary} />} />

        {project.status === 'completed' && !project.rating && (
          <Button title="Rate Vendor" onPress={() => setRatingModalVisible(true)} variant="primary" size="md" fullWidth style={{ marginTop: spacing.md }} icon={<Ionicons name="star" size={18} color={theme.primary} />} />
        )}
      </ScrollView>

      <Modal visible={ratingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Vendor</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={32} color={theme.brandGreen} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Write a review (optional)"
              placeholderTextColor={theme.stone}
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setRatingModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Submit" variant="primary" onPress={handleRateSubmit} loading={submittingRating} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoRow({ icon, label, value, theme }: { icon: string; label: string; value: string; theme: ThemeColors }) {
  const infoStyles = getInfoStyles(theme);
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon as any} size={18} color={theme.stone} />
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const getInfoStyles = (theme: ThemeColors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  label: { ...typography.bodyMd, color: theme.stone, width: 80 },
  value: { ...typography.labelLg, color: theme.ink, flex: 1 },
});

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.headlineMd, color: theme.ink },
  content: { paddingHorizontal: spacing.containerMargin, paddingBottom: 40, paddingTop: spacing.md },
  projectName: { ...typography.headlineLg, color: theme.ink, marginBottom: 8 },
  infoCard: { padding: spacing.md, marginTop: spacing.lg, backgroundColor: theme.surfaceContainerLow, borderWidth: 1, borderColor: theme.hairline },
  sectionTitle: { ...typography.headlineMd, color: theme.ink, marginTop: spacing.xl },
  description: { ...typography.bodyLg, color: theme.steel, lineHeight: 26, marginTop: 8 },
  taskCard: { backgroundColor: theme.white, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.sm, borderWidth: 1, borderColor: theme.hairline },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskTitle: { ...typography.labelLg, color: theme.ink, flex: 1 },
  taskDesc: { ...typography.bodySm, color: theme.stone, marginTop: 4 },
  taskDue: { ...typography.labelMd, color: theme.brandError, marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10,10,10,0.5)', justifyContent: 'center', padding: spacing.containerMargin },
  modalContent: { backgroundColor: theme.white, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: theme.hairline },
  modalTitle: { ...typography.headlineMd, color: theme.ink, textAlign: 'center', marginBottom: spacing.md },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.md },
  input: { borderWidth: 1, borderColor: theme.hairline, backgroundColor: theme.surfaceContainerLow, borderRadius: radius.md, padding: spacing.md, ...typography.bodyMd, color: theme.ink, minHeight: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
});
