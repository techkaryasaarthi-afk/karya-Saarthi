/**
 * Service Detail Screen — View details of a specific service and create a project request.
 * Mintlify: Flat white header, ink primary typography, mint-green brand elements.
 */

import React from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/services/api';
import { createProjectApi } from '@/services/projects';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = useStyles(theme);

  const { data } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/services/${id}`);
      return data?.service || data;
    },
    enabled: !!id,
  });

  const service = data || {};
  const requestService = useMutation({
    mutationFn: () => createProjectApi({
      name: service.title || service.name || 'Service Request',
      description: service.short_description || service.description || `Request for ${service.title || service.name || 'service'}`,
      budget: service.price_min,
    }),
    onSuccess: (result: any) => {
      Alert.alert('Request sent', 'Your service request has been created successfully.');
      const projectId = result?.project?.id;
      router.push(projectId ? (`/(customer)/projects/${projectId}` as any) : ('/(customer)/projects' as any));
    },
    onError: (error: any) => {
      Alert.alert('Request failed', error?.response?.data?.error || error?.message || 'Unable to create the request.');
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.headerBg, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.ink} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Badge text={service.category || 'Service'} variant="info" size="md" />
            <Text style={styles.title}>{service.name || service.title || 'Service Details'}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="star" size={16} color={theme.brandGreen} />
              <Text style={styles.metaText}>{service.rating || '4.8'} Rating</Text>
              <Text style={styles.metaDot}>|</Text>
              <Ionicons name="people" size={16} color={theme.stone} />
              <Text style={styles.metaText}>{service.total_orders || service.orders || '120'}+ Orders</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Card variant="flat" style={styles.priceCard}>
            <Text style={styles.priceLabel}>Starting from</Text>
            <Text style={styles.priceValue}>{service.price_range || (service.price_min ? `Rs. ${service.price_min}` : 'Contact us')}</Text>
            <Button
              title={requestService.isPending ? 'Requesting...' : 'Request This Service'}
              onPress={() => requestService.mutate()}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </Card>

          <Text style={styles.sectionTitle}>About This Service</Text>
          <Text style={styles.description}>
            {service.description || service.long_description || 'Get professional, high-quality service delivered by our expert team.'}
          </Text>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>What is Included</Text>
          {(service.features || defaultFeatures).map((feat: string, i: number) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={theme.brandGreen} />
              <Text style={styles.featureText}>{feat}</Text>
            </View>
          ))}

          <Card variant="flat" style={{ ...styles.priceCard, marginTop: spacing.xl }}>
            <Ionicons name="chatbubble-ellipses" size={32} color={theme.primary} />
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Have Questions?</Text>
            <Text style={styles.description}>Chat with our team to discuss your requirements.</Text>
            <Button title="Chat Now" onPress={() => router.push('/(customer)/chat' as any)} variant="secondary" size="md" fullWidth style={{ marginTop: spacing.md }} />
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const defaultFeatures = [
  'Expert team assignment',
  'Regular progress updates',
  'Unlimited revisions',
  'On-time delivery guarantee',
  '24/7 support',
  'Plagiarism-free work',
];

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },
  headerBg: { paddingHorizontal: spacing.containerMargin, paddingBottom: 32, borderBottomWidth: 1, borderBottomColor: theme.hairline, backgroundColor: theme.white },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surfaceContainer, alignItems: 'center', justifyContent: 'center', marginTop: 8, borderWidth: 1, borderColor: theme.hairline },
  headerContent: { marginTop: spacing.md },
  title: { ...typography.headlineLg, color: theme.ink, marginTop: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  metaText: { ...typography.bodyMd, color: theme.stone },
  metaDot: { color: theme.hairline },
  body: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.lg, paddingBottom: 40 },
  priceCard: { padding: spacing.lg, alignItems: 'center', backgroundColor: theme.white, borderWidth: 1, borderColor: theme.hairline, borderRadius: radius.xl },
  priceLabel: { ...typography.labelMd, color: theme.stone },
  priceValue: { ...typography.displayLg, color: theme.brandGreen },
  sectionTitle: { ...typography.headlineMd, color: theme.ink, marginTop: spacing.lg, marginBottom: spacing.sm },
  description: { ...typography.bodyLg, color: theme.steel, lineHeight: 26 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  featureText: { ...typography.bodyMd, color: theme.ink },
});
