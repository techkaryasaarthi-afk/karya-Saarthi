/**
 * Services Catalog Screen — Browse all services with search and filter.
 * Connected to /api/services for live data.
 * Mintlify: Flat styling, hairline borders, ink primary typography.
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { supabase } from '@/utils/supabase';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BANNER_IMAGES: any[] = [];

const categories = ['All', 'Academic', 'Technical', 'Business', 'Government', 'Campus', 'Digital'];

export default function ServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = useStyles(theme);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: filteredServices = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['services', selectedCategory, search],
    queryFn: async () => {
      let q = supabase.from('services').select('*').eq('is_active', true);
      
      if (selectedCategory !== 'All') {
        q = q.ilike('category', selectedCategory);
      }
      if (search) {
        q = q.ilike('title', `%${search}%`);
      }
      
      const { data } = await q.order('total_orders', { ascending: false });
      return data || [];
    },
  });

  const renderService = ({ item, index }: { item: any; index: number }) => (
    <Card
      variant="elevated"
      style={styles.serviceCard}
      onPress={() => router.push(`/(customer)/projects/create?service_name=${encodeURIComponent(item.title || item.name)}` as any)}
    >
      <View style={styles.cardRow}>
        <View style={[styles.iconBg, { backgroundColor: iconColors[index % iconColors.length] }]}>
          <Ionicons name={iconNames[index % iconNames.length]} size={24} color={theme.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.serviceName} numberOfLines={1}>{item.title || item.name}</Text>
          <Text style={styles.serviceDesc} numberOfLines={2}>{item.short_description || item.description}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={theme.brandGreen} />
              <Text style={styles.ratingText}>{(4.5 + (Number(item.id || 1) % 5) * 0.1).toFixed(1)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={{ backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
          onPress={() => router.push(`/(customer)/projects/create?service_name=${encodeURIComponent(item.title || item.name)}` as any)}
        >
          <Text style={{ color: theme.white, fontSize: 12, fontWeight: '600' }}>Request</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: 0 }]}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[theme.heroDarkFrom, theme.heroDarkTo, '#1a4a3a']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.filterBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={'rgba(255,255,255,0.9)'} />
        </TouchableOpacity>
        <Text style={styles.title}>Our Services</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color={'rgba(255,255,255,0.9)'} />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={filteredServices}
        renderItem={renderService}
        keyExtractor={(item, i) => `${item.id || i}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListHeaderComponent={
          <>

            {/* Search */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={theme.stone} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search services..."
                  placeholderTextColor={theme.stone}
                  value={search}
                  onChangeText={setSearch}
                />
                {search ? (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={20} color={theme.stone} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Category pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.categoryPill, selectedCategory === item && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={theme.stone} />
              <Text style={styles.emptyText}>No services found</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const iconColors = ['#d1fae5', '#fef3c7', '#dbeafe', '#fee2e2'];
const iconNames: (keyof typeof Ionicons.glyphMap)[] = ['code-slash', 'search', 'megaphone', 'pencil', 'school', 'analytics'];

const defaultServices: any[] = [];

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.containerMargin, paddingBottom: 18,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  title: { ...typography.headlineMd, color: '#ffffff' },
  filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  searchContainer: { paddingHorizontal: spacing.containerMargin, marginTop: 16, marginBottom: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white, borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderWidth: 1.5, borderColor: theme.hairline },
  searchInput: { flex: 1, fontSize: 15, color: theme.ink },
  categoryList: { paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md, gap: 8 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1.5, borderColor: theme.hairline, backgroundColor: theme.white },
  categoryPillActive: { backgroundColor: theme.brandGreen, borderColor: theme.brandGreen },
  categoryText: { ...typography.labelMd, color: theme.stone },
  categoryTextActive: { color: theme.primary, fontWeight: '700' },
  loadingContainer: { paddingHorizontal: spacing.containerMargin, marginTop: 10 },
  listContent: { paddingBottom: 100 },
  serviceCard: { marginHorizontal: spacing.containerMargin, marginBottom: 10, padding: spacing.md, borderWidth: 1, borderColor: theme.hairline, borderRadius: radius.xl, backgroundColor: theme.white },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: { width: 52, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  serviceName: { ...typography.labelLg, color: theme.ink, fontWeight: '700' },
  serviceDesc: { ...typography.bodySm, color: theme.steel, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  price: { ...typography.labelMd, color: theme.brandGreen },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { ...typography.labelMd, color: theme.stone },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { ...typography.bodyMd, color: theme.stone, marginTop: spacing.md },
  bannerScroll: { maxHeight: 160, marginBottom: 16, marginTop: 16 },
  bannerSlide: { width: SCREEN_WIDTH - 40, height: 150, marginHorizontal: 20, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: theme.hairline },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, paddingTop: 30, backgroundColor: 'rgba(10,10,10,0.5)' },
  bannerLabel: { ...typography.headlineSm, color: theme.white },
});
