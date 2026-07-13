/**
 * Blogs Listing Screen — Browse blog articles from KaryaSaarthi.
 * Mintlify: Flat UI, hairline borders, ink text.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { colors, spacing, typography, radius } from '@/utils/theme';

const { width } = Dimensions.get('window');

export default function BlogsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: blogs = [], refetch, isRefetching } = useQuery({
    queryKey: ['customer-blogs'],
    queryFn: async () => {
      try {
        const { data } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
        return data || [];
      } catch { return []; }
    },
  });

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={s.title}>Blogs & Insights</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brandGreen} />}>
        {/* Featured (first blog) */}
        {blogs.length > 0 && (
          <TouchableOpacity style={s.featured} activeOpacity={0.8} onPress={() => router.push(`/(customer)/blogs/${blogs[0].id}` as any)}>
            <View style={s.featuredContent}>
              <View style={s.featuredBadge}><Text style={s.featuredBadgeText}>{blogs[0].category || 'FEATURED'}</Text></View>
              <Text style={s.featuredTitle} numberOfLines={2}>{blogs[0].title}</Text>
              <Text style={s.featuredMeta}>{blogs[0].author || 'KaryaSaarthi'} • {blogs[0].read_time || '5 min read'}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Blog List */}
        <View style={s.list}>
          {(blogs.length > 1 ? blogs.slice(1) : blogs).map((blog: any, i: number) => (
            <TouchableOpacity key={blog.id || i} style={s.blogCard} activeOpacity={0.7} onPress={() => router.push(`/(customer)/blogs/${blog.id}` as any)}>
              <View style={s.blogInfo}>
                <Text style={s.blogCat}>{(blog.category || blog.tags?.[0] || 'ARTICLE').toUpperCase()}</Text>
                <Text style={s.blogTitle} numberOfLines={2}>{blog.title}</Text>
                <Text style={s.blogExcerpt} numberOfLines={2}>{blog.excerpt || blog.short_description || ''}</Text>
                <View style={s.blogMeta}>
                  <Text style={s.blogAuthor}>{blog.author || 'KaryaSaarthi'}</Text>
                  <Text style={s.blogDate}>{blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {blogs.length === 0 && (
            <View style={s.empty}>
              <Ionicons name="newspaper-outline" size={56} color={colors.stone} />
              <Text style={s.emptyText}>No blogs available yet</Text>
              <Text style={s.emptySub}>Check back soon for new insights!</Text>
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.surfaceContainerLow },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md, gap: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.headlineMd, color: colors.ink },
  featured: { marginHorizontal: spacing.containerMargin, borderRadius: radius.lg, backgroundColor: colors.brandGreen, overflow: 'hidden', marginTop: spacing.md, padding: 20 },
  featuredContent: { },
  featuredBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, alignSelf: 'flex-start', marginBottom: 12 },
  featuredBadgeText: { ...typography.microUppercase, color: colors.white, letterSpacing: 1 },
  featuredTitle: { ...typography.headlineSm, color: colors.white, lineHeight: 28 },
  featuredMeta: { ...typography.labelSm, color: colors.surfaceContainer, marginTop: 10 },
  list: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.md, gap: 14 },
  blogCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.hairline },
  blogInfo: { },
  blogCat: { ...typography.microUppercase, color: colors.primary, letterSpacing: 1, marginBottom: 4 },
  blogTitle: { ...typography.labelLg, color: colors.ink, lineHeight: 20 },
  blogExcerpt: { ...typography.bodySm, color: colors.steel, marginTop: 4, lineHeight: 18 },
  blogMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  blogAuthor: { ...typography.labelSm, color: colors.primary },
  blogDate: { ...typography.labelSm, color: colors.stone },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { ...typography.headlineSm, color: colors.stone },
  emptySub: { ...typography.bodySm, color: colors.stone },
});
