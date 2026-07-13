/**
 * Blog Detail Screen — Read full blog post.
 * Mintlify: Flat UI, ink typography, hairline borders, brand green tags.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import RenderHtml from 'react-native-render-html';
import { supabase } from '@/utils/supabase';
import { colors, spacing, typography, radius } from '@/utils/theme';

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { data: blog, isLoading, isError } = useQuery({
    queryKey: ['blog-detail', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('blogs').select('*').eq('id', Number(id)).single();
        if (error) throw error;
        return data || null;
      } catch { return null; }
    },
    enabled: !!id,
  });

  const handleShare = () => {
    Share.share({
      title: blog?.title || 'KaryaSaarthi Blog',
      message: `Check out this article: ${blog?.title}\nhttps://karyasaarthi.com/blogs/${blog?.slug || id}`,
    });
  };

  if (isLoading) {
    return (
      <View style={[s.c, { paddingTop: insets.top }]}>
        <View style={s.loadingWrap}>
          <Text style={s.loadingText}>Loading article...</Text>
        </View>
      </View>
    );
  }

  if (!blog || isError) {
    return (
      <View style={[s.c, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </TouchableOpacity>
        </View>
        <View style={s.loadingWrap}>
          <Text style={s.loadingText}>Article not found.</Text>
        </View>
      </View>
    );
  }

  const htmlStyles = {
    body: { color: colors.steel, fontSize: 16, lineHeight: 26 },
    p: { marginBottom: 12 },
    li: { marginBottom: 4 },
    table: { borderWidth: 1, borderColor: colors.hairline, marginVertical: 10, flex: 1 },
    th: { backgroundColor: colors.surfaceContainer, padding: 8, fontWeight: 'bold' as any, borderWidth: 1, borderColor: colors.hairline },
    td: { padding: 8, borderWidth: 1, borderColor: colors.hairline },
    h1: { color: colors.ink, marginBottom: 8 },
    h2: { color: colors.ink, marginBottom: 8 },
    h3: { color: colors.ink, marginBottom: 8 },
  };

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      {/* Flat Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleShare} style={s.shareBtn}>
          <Ionicons name="share-outline" size={22} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.content}>
          {/* Category */}
          {blog.category && (
            <View style={s.catBadge}><Text style={s.catText}>{blog.category.toUpperCase()}</Text></View>
          )}

          {/* Title */}
          <Text style={s.title}>{blog.title}</Text>

          {/* Meta */}
          <View style={s.meta}>
            <View style={s.metaItem}>
              <Ionicons name="person" size={14} color={colors.stone} />
              <Text style={s.metaText}>{blog.author || 'KaryaSaarthi'}</Text>
            </View>
            <View style={s.metaItem}>
              <Ionicons name="calendar" size={14} color={colors.stone} />
              <Text style={s.metaText}>{blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</Text>
            </View>
            {blog.read_time && (
              <View style={s.metaItem}>
                <Ionicons name="time" size={14} color={colors.stone} />
                <Text style={s.metaText}>{blog.read_time}</Text>
              </View>
            )}
          </View>

          {/* Body */}
          <View style={{ marginTop: spacing.md }}>
            <RenderHtml
              contentWidth={width - spacing.containerMargin * 2}
              source={{ html: blog.content || blog.body || blog.excerpt || '<p>No content available.</p>' }}
              tagsStyles={htmlStyles}
            />
          </View>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <View style={s.tags}>
              {blog.tags.map((tag: string, i: number) => (
                <View key={i} style={s.tag}><Text style={s.tagText}>#{tag}</Text></View>
              ))}
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.white },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.bodyMd, color: colors.stone },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.containerMargin, paddingVertical: 12, gap: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  shareBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.lg },
  catBadge: { backgroundColor: 'rgba(0,212,164,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.sm, alignSelf: 'flex-start', marginBottom: 12 },
  catText: { ...typography.microUppercase, color: colors.primary, letterSpacing: 1 },
  title: { ...typography.headlineLg, color: colors.ink, lineHeight: 32 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typography.labelMd, color: colors.stone },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.xl },
  tag: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  tagText: { ...typography.labelSm, color: colors.ink },
});
