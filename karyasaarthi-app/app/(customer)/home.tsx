/**
 * Customer Home Screen — Mintlify-inspired redesign.
 * Flat white header, clean hairline borders, ink text, mint-green accents.
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import NotificationsModalComponent from '@/components/ui/NotificationsModal';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/utils/supabase';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import { getNotificationsApi } from '@/services/notifications';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.7;

const SERVICE_IMAGES: Record<string, any> = {
  research_paper: require('@/assets/services/research_paper.jpeg'),
  phd_thesis: require('@/assets/services/phd_thesis.jpeg'),
  journal_paper: require('@/assets/services/journal_paper.jpeg'),
  wordpress_website: require('@/assets/services/wordpress_website.jpeg'),
  mobile_app_dev: require('@/assets/services/mobile_app_dev.jpeg'),
  ecommerce_website: require('@/assets/services/ecommerce_website.jpeg'),
  website_development: require('@/assets/services/website_development.jpeg'),
  questionnaire_design: require('@/assets/services/questionnaire_design.jpeg'),
};



const getQuickActions = (theme: ThemeColors) => [
  { title: 'New\nProject', icon: 'add-circle', route: '/(customer)/projects/create', color: theme.brandGreen, iconColor: theme.primary },
  { title: 'My\nProjects', icon: 'layers', route: '/(customer)/projects', color: theme.surfaceContainer, iconColor: theme.ink },
  { title: 'My\nInvoices', icon: 'receipt', route: '/(customer)/invoices', color: theme.surfaceContainer, iconColor: theme.ink },
  { title: 'Chat\nSupport', icon: 'chatbubbles', route: '/(customer)/chat', color: theme.surfaceContainer, iconColor: theme.ink },
];

const STATS = [
  { value: '10K+', label: 'Happy Clients', icon: 'people' },
  { value: '500+', label: 'Projects Done', icon: 'briefcase' },
  { value: '4.8★', label: 'Avg Rating', icon: 'star' },
  { value: '24/7', label: 'Support', icon: 'headset' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [notificationsVisible, setNotificationsVisible] = React.useState(false);
  const theme = useAppTheme();
  const s = useStyles(theme);

  const { data: services = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['services-home'],
    queryFn: async () => {
      const { data } = await supabase.from('services').select('*').eq('is_active', true).order('total_orders', { ascending: false }).limit(8);
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: blogs = [] } = useQuery({
    queryKey: ['blogs-home'],
    queryFn: async () => {
      const { data } = await supabase.from('blogs').select('*').order('created_at', { ascending: false }).limit(3);
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events-home'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false }).limit(3);
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try { return await getNotificationsApi(); }
      catch { return { unread: 0 }; }
    },
    refetchInterval: 15000,
  });

  const unreadCount = notifData?.unread || 0;
  const quickActions = getQuickActions(theme);

  const handleChatSupport = async () => {
    try {
      const { data } = await supabase.from('users').select('id').in('role', ['admin', 'super_admin']).limit(1);
      if (data && data.length > 0) {
        router.push(`/(customer)/chat/${data[0].id}?type=dm` as any);
      } else {
        router.push('/(customer)/chat' as any);
      }
    } catch {
      router.push('/(customer)/chat' as any);
    }
  };

  return (
    <View style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.brandGreen} />}
      >
        {/* ══════════ GRADIENT HERO HEADER ══════════ */}
        <LinearGradient
          colors={[theme.heroDarkFrom, theme.heroDarkTo, '#1a4a3a']}
          style={[s.header, { paddingTop: insets.top + 16 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={s.headerRow}>
            <View style={s.brandRow}>
              <View style={s.logoWrap}>
                <Image source={require('@/assets/karyasaarthi.png')} style={s.logoImg} contentFit="contain" />
              </View>
              <View>
                <Text style={s.brandName}>KaryaSaarthi</Text>
                <Text style={s.brandSub}>Professional Services</Text>
              </View>
            </View>
            <TouchableOpacity style={s.bellBtn} onPress={() => setNotificationsVisible(true)}>
              <Ionicons name="notifications-outline" size={22} color={'#ffffff'} />
              {unreadCount > 0 && (
                <View style={s.bellBadge}>
                  <Text style={s.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <Text style={s.greeting}>Good day, {user?.fullname?.split(' ')[0] || 'there'} 👋</Text>
          <Text style={s.greetingSub}>What service do you need today?</Text>

          {/* Search */}
          <TouchableOpacity style={s.searchBar} onPress={() => router.push('/(customer)/services')} activeOpacity={0.8}>
            <Ionicons name="search" size={18} color={theme.stone} />
            <Text style={s.searchText}>Search services, projects...</Text>
            <View style={s.searchIcon}>
              <Ionicons name="options" size={16} color={theme.primary} />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* ══════════ QUICK ACTIONS ══════════ */}
        <View style={s.quickRow}>
          {quickActions.map((act, i) => (
            <TouchableOpacity key={i} style={s.quickItem} activeOpacity={0.8} onPress={() => {
              if (act.title.includes('Chat')) {
                handleChatSupport();
              } else {
                router.push(act.route as any);
              }
            }}>
              <View style={[s.quickCircle, { backgroundColor: act.color }]}>
                <Ionicons name={act.icon as any} size={24} color={act.iconColor} />
              </View>
              <Text style={s.quickLabel}>{act.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══════════ STATS BAR ══════════ */}
        <View style={s.statsBar}>
          {STATS.map((stat, i) => (
            <View key={i} style={[s.statItem, i < STATS.length - 1 && s.statItemBorder]}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ══════════════════════ SERVICES GRID ══════════════════════ */}
        {(services?.length || 0) > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View>
                <Text style={s.sectionTitle}>Popular Services</Text>
                <Text style={s.sectionSub}>What do you need help with?</Text>
              </View>
              <TouchableOpacity style={s.viewAllBtn} onPress={() => router.push('/(customer)/services')}>
                <Text style={s.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={14} color={theme.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.serviceScroll}>
              {(services || []).map((svc: any, i: number) => (
                <TouchableOpacity key={svc.id || i} style={s.serviceCard} activeOpacity={0.85} onPress={() => router.push(`/(customer)/projects/create?service_name=${encodeURIComponent(svc.name || svc.title || '')}` as any)}>
                  <View style={[s.serviceIcon, { backgroundColor: SVC_COLORS[i % SVC_COLORS.length] }]}>
                    <Ionicons name={SVC_ICONS[i % SVC_ICONS.length]} size={22} color={theme.primary} />
                  </View>
                  <Text style={s.serviceName} numberOfLines={2}>{svc.name || svc.title}</Text>
                  <Text style={s.serviceDesc} numberOfLines={1}>{svc.short_description || svc.description || ''}</Text>
                  {svc.price_range && <Text style={s.servicePrice}>{svc.price_range}</Text>}
                  <View style={s.serviceRatingRow}>
                    <Ionicons name="star" size={12} color={theme.brandGreen} />
                    <Text style={s.serviceRating}>{(4.5 + (Number(svc.id || 1) % 5) * 0.1).toFixed(1)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ══════════════════════ WHY US ══════════════════════ */}
        <View style={s.whySection}>
          <View style={s.whyBg}>
            <Text style={s.whyTitle}>Why Karya Saarthi?</Text>
            <Text style={s.whySub}>Trusted by thousands of students & businesses</Text>
            <View style={s.whyGrid}>
              {[
                { icon: 'shield-checkmark', title: 'Verified Experts', desc: '200+ vetted vendors' },
                { icon: 'time', title: 'On-Time Delivery', desc: '94% success rate' },
                { icon: 'wallet', title: 'Best Prices', desc: 'Transparent pricing' },
                { icon: 'chatbubbles', title: '24/7 Support', desc: 'Always here for you' },
              ].map((item, i) => (
                <View key={i} style={s.whyCard}>
                  <View style={s.whyIconWrap}>
                    <Ionicons name={item.icon as any} size={22} color={theme.brandGreen} />
                  </View>
                  <Text style={s.whyCardTitle}>{item.title}</Text>
                  <Text style={s.whyCardDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ══════════════════════ BLOGS ══════════════════════ */}
        {(blogs?.length || 0) > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View>
                <Text style={s.sectionTitle}>Latest Insights</Text>
                <Text style={s.sectionSub}>Stay updated with trends</Text>
              </View>
              <TouchableOpacity style={s.viewAllBtn} onPress={() => router.push('/(customer)/blogs' as any)}>
                <Text style={s.viewAllText}>Read All</Text>
                <Ionicons name="chevron-forward" size={14} color={theme.ink} />
              </TouchableOpacity>
            </View>
            {blogs.slice(0, 3).map((blog: any, i: number) => (
                <TouchableOpacity key={blog.id || i} style={s.blogCard} activeOpacity={0.85} onPress={() => blog.id ? router.push(`/(customer)/blogs/${blog.id}` as any) : router.push('/(customer)/blogs' as any)}>
                  <View style={s.blogContent}>
                    <View style={s.blogTagRow}>
                      <View style={s.blogTag}>
                        <Text style={s.blogTagText} numberOfLines={1}>{(blog.category || blog.tags?.[0] || 'Insights').toUpperCase()}</Text>
                      </View>
                      <Text style={s.blogTime}>{blog.read_time || '5 min'}</Text>
                    </View>
                    <Text style={s.blogTitle} numberOfLines={2}>{blog.title}</Text>
                  </View>
                </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ══════════════════════ EVENTS & HACKATHONS ══════════════════════ */}
        {(events?.length || 0) > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View>
                <Text style={s.sectionTitle}>Events & Hackathons</Text>
                <Text style={s.sectionSub}>Join the upcoming challenges</Text>
              </View>
            </View>
            {events.slice(0, 3).map((ev: any, i: number) => (
                <TouchableOpacity key={ev.id || i} style={s.blogCard} activeOpacity={0.85}>
                  <Image source={ev.cover_image || ev.image_url ? { uri: ev.cover_image || ev.image_url } : SERVICE_IMAGES[Object.keys(SERVICE_IMAGES)[(i + 2) % 4]]} style={s.blogImage} contentFit="cover" />
                  <View style={s.blogContent}>
                    <View style={s.blogTagRow}>
                      <View style={[s.blogTag, { backgroundColor: 'rgba(0,212,164,0.1)' }]}><Text style={[s.blogTagText, { color: theme.brandGreen }]}>{(ev.type || 'Event').toUpperCase()}</Text></View>
                      <Text style={s.blogTime}>{ev.date ? new Date(ev.date).toLocaleDateString() : 'Upcoming'}</Text>
                    </View>
                    <Text style={s.blogTitle} numberOfLines={2}>{ev.title || ev.name}</Text>
                  </View>
                </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ══════════════════════ CTA BANNER ══════════════════════ */}
        <View style={s.ctaSection}>
          <View style={s.ctaBanner}>
            <View style={s.ctaLeft}>
              <Text style={s.ctaTitle}>Need Help?</Text>
              <Text style={s.ctaSub}>Chat with our experts anytime</Text>
            </View>
            <TouchableOpacity style={s.ctaBtn} onPress={handleChatSupport}>
              <Text style={s.ctaBtnText}>Chat Now</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {notificationsVisible && (
        <React.Suspense fallback={<View />}>
          <NotificationsModalComponent visible={notificationsVisible} onClose={() => setNotificationsVisible(false)} />
        </React.Suspense>
      )}
    </View>
  );
}

const SVC_COLORS = ['#d1fae5', '#fef3c7', '#dbeafe', '#fee2e2'];
const SVC_ICONS: (keyof typeof Ionicons.glyphMap)[] = ['code-slash', 'search', 'megaphone', 'pencil', 'school', 'analytics', 'globe', 'document-text'];

const defaultServices: any[] = [];
const DEFAULT_BLOGS: any[] = [];

const HP = spacing.containerMargin;
const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },

  // Gradient Header
  header: {
    paddingHorizontal: HP,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoWrap: {
    width: 42, height: 42, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  logoImg: { width: 40, height: 40, borderRadius: radius.md },
  brandName: { ...typography.headlineMd, color: '#ffffff' },
  brandSub: { ...typography.labelSm, color: 'rgba(255,255,255,0.7)' },
  bellBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  bellBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.white },
  bellBadgeText: { fontSize: 9, fontWeight: '800', color: theme.white },

  // Greeting
  greeting: { ...typography.headlineMd, color: '#ffffff', marginTop: 20 },
  greetingSub: { ...typography.bodyMd, color: 'rgba(255,255,255,0.75)', marginTop: 2, marginBottom: 16 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  searchText: { flex: 1, ...typography.bodyMd, color: theme.stone },
  searchIcon: { width: 32, height: 32, borderRadius: radius.full, backgroundColor: 'rgba(0,212,164,0.12)', alignItems: 'center', justifyContent: 'center' },

  // Quick Actions
  quickRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: HP, paddingVertical: 22, backgroundColor: theme.white, marginTop: 0, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  quickItem: { alignItems: 'center', gap: 8, width: 70 },
  quickCircle: { width: 56, height: 56, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { ...typography.micro, color: theme.ink, textAlign: 'center', lineHeight: 14 },

  // Stats
  statsBar: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: HP, marginTop: 20, backgroundColor: theme.white, borderRadius: radius.xl, paddingVertical: 18, borderWidth: 1, borderColor: theme.hairline },
  statItem: { alignItems: 'center', flex: 1 },
  statItemBorder: { borderRightWidth: 1, borderRightColor: theme.hairline },
  statValue: { ...typography.headlineSm, color: theme.brandGreen, fontWeight: '700' },
  statLabel: { ...typography.labelSm, color: theme.stone, marginTop: 2 },

  // Section
  section: { paddingHorizontal: HP, marginTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  sectionTitle: { ...typography.headlineMd, color: theme.ink },
  sectionSub: { ...typography.bodySm, color: theme.stone, marginTop: 2 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { ...typography.labelMd, color: theme.ink },

  // Services
  serviceScroll: { gap: 12, paddingRight: HP },
  serviceCard: { width: 140, backgroundColor: theme.white, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: theme.hairline },
  serviceIcon: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  serviceName: { ...typography.labelMd, color: theme.ink, lineHeight: 18, marginBottom: 4 },
  serviceDesc: { ...typography.bodySm, color: theme.stone, marginBottom: 6 },
  servicePrice: { ...typography.labelMd, color: theme.brandGreen, marginBottom: 4 },
  serviceRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  serviceRating: { ...typography.labelSm, color: theme.steel },

  // Why Us
  whySection: { marginTop: 32, marginHorizontal: HP },
  whyBg: { borderRadius: radius.lg, padding: 20, backgroundColor: theme.surfaceContainer, borderWidth: 1, borderColor: theme.hairline },
  whyTitle: { ...typography.headlineMd, color: theme.ink },
  whySub: { ...typography.bodySm, color: theme.stone, marginTop: 4, marginBottom: 18 },
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  whyCard: { width: '48%', backgroundColor: theme.white, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: theme.hairline },
  whyIconWrap: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: 'rgba(0,212,164,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  whyCardTitle: { ...typography.labelMd, color: theme.ink },
  whyCardDesc: { ...typography.bodySm, color: theme.stone, marginTop: 3 },

  // Blogs
  blogCard: { backgroundColor: theme.white, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 14, borderWidth: 1, borderColor: theme.hairline },
  blogContent: { padding: 16 },
  blogTagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 },
  blogTag: { backgroundColor: theme.surfaceContainerHigh, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, flexShrink: 1 },
  blogTagText: { ...typography.microUppercase, color: theme.ink, letterSpacing: 0.5 },
  blogTime: { ...typography.labelSm, color: theme.stone, flexShrink: 0 },
  blogTitle: { ...typography.labelLg, color: theme.ink, lineHeight: 22 },

  // CTA
  ctaSection: { paddingHorizontal: HP, marginTop: 32 },
  ctaBanner: { borderRadius: radius.lg, padding: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.brandGreen },
  ctaLeft: { flex: 1 },
  ctaTitle: { ...typography.headlineMd, color: theme.primary },
  ctaSub: { ...typography.bodyMd, color: theme.onSecondaryContainer, marginTop: 4 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.full },
  ctaBtnText: { ...typography.labelMd, color: theme.white },
});
