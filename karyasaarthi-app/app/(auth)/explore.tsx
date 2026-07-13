/**
 * Explore Screen — Public-facing page for unauthenticated users.
 * Shows Karya Saarthi services, pillars, events, blogs, contact info, and social links.
 * Mintlify: Atmospheric dark hero header, clean flat cards for items.
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, Dimensions, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { supabase } from '@/utils/supabase';
import api from '@/services/api';
import { colors, spacing, typography, radius } from '@/utils/theme';
import { APP_INFO } from '@/utils/constants';

const { width } = Dimensions.get('window');

const services = [
  { title: 'Programming & Tech', icon: 'code-slash' as const, color: '#7C3AED' },
  { title: 'Graphics & Design', icon: 'color-palette' as const, color: '#EC4899' },
  { title: 'Digital Marketing', icon: 'megaphone' as const, color: '#EF4444' },
  { title: 'Writing & Translation', icon: 'pencil' as const, color: '#059669' },
  { title: 'Video & Animation', icon: 'videocam' as const, color: '#c37d0d' },
  { title: 'AI Services', icon: 'hardware-chip' as const, color: '#3772cf' },
];

const pillars = [
  { name: 'Campus Saarthi', desc: 'Student ambassador network & academic support', icon: 'school' as const, color: '#8B5CF6' },
  { name: 'Digital Saarthi', desc: 'Web, SEO, content & social media solutions', icon: 'globe' as const, color: '#3772cf' },
  { name: 'Calling Saarthi', desc: 'Lead gen, follow-up & outreach calling', icon: 'call' as const, color: '#059669' },
  { name: 'Government Saarthi', desc: 'Tender docs, scheme advisory & compliance', icon: 'business' as const, color: '#c37d0d' },
  { name: 'Market Saarthi', desc: 'Field agents & hyperlocal marketing', icon: 'storefront' as const, color: '#d45656' },
];

const socialLinks = [
  { name: 'WhatsApp', icon: 'logo-whatsapp' as const, url: 'https://wa.me/918595025753', color: '#25D366' },
  { name: 'Instagram', icon: 'logo-instagram' as const, url: 'https://www.instagram.com/karyasaarthi/', color: '#E4405F' },
  { name: 'YouTube', icon: 'logo-youtube' as const, url: 'https://www.youtube.com/@KaryaSaarthi', color: '#FF0000' },
  { name: 'LinkedIn', icon: 'logo-linkedin' as const, url: 'https://linkedin.com/in/karya-saarthi%F0%9F%A4%9D-693a01369', color: '#0A66C2' },
  { name: 'Facebook', icon: 'logo-facebook' as const, url: 'https://www.facebook.com/profile.php?id=61576877739779', color: '#1877F2' },
  { name: 'Twitter', icon: 'logo-twitter' as const, url: 'https://x.com/karyasaarthi', color: '#1DA1F2' },
  { name: 'Telegram', icon: 'paper-plane' as const, url: 'https://t.me/karyasaarthi', color: '#0088CC' },
  { name: 'Threads', icon: 'at-circle' as const, url: 'https://www.threads.com/@karyasaarthi', color: '#0a0a0a' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: blogsData, isLoading: blogsLoading } = useQuery({
    queryKey: ['explore-blogs'],
    queryFn: async () => { 
      try {
        const { data } = await supabase.from('blogs').select('*').eq('is_active', true).order('created_at', { ascending: false });
        return { blogs: data || [] };
      } catch { return { blogs: [] }; }
    },
    staleTime: 1000 * 60 * 15,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['explore-events'],
    queryFn: async () => { 
      try {
        const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false }).limit(6);
        return { events: data || [] };
      } catch { return { events: [] }; }
    },
    staleTime: 1000 * 60 * 15,
  });

  const blogs = blogsData?.blogs || [];
  const events = eventsData?.events || [];
  const hackathons = events.filter((e: any) => e.type === 'hackathon');
  const podcasts = events.filter((e: any) => e.type === 'podcast');
  const otherEvents = events.filter((e: any) => !['hackathon', 'podcast'].includes(e.type));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Atmospheric dark hero header ────────────────────────── */}
        <LinearGradient
          colors={[colors.heroDarkFrom, colors.heroDarkTo, '#1a4a3a']}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{APP_INFO.NAME}</Text>
          <Text style={styles.headerTagline}>{APP_INFO.TAGLINE}</Text>
          <Text style={styles.headerDesc}>Your trusted partner for academic, technical & business services</Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}><Text style={styles.statNum}>10K+</Text><Text style={styles.statLabel}>Clients</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statNum}>500+</Text><Text style={styles.statLabel}>Projects</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statNum}>24/7</Text><Text style={styles.statLabel}>Support</Text></View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Services */}
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service, i) => (
              <Card key={i} variant="flat" style={styles.serviceCard}>
                <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
                  <Ionicons name={service.icon} size={22} color={colors.white} />
                </View>
                <Text style={styles.serviceText} numberOfLines={2}>{service.title}</Text>
              </Card>
            ))}
          </View>

          {/* Pillars */}
          <Text style={styles.sectionTitle}>Five Saarthi Pillars</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
            {pillars.map((pillar, i) => (
              <Card key={i} variant="elevated" style={styles.pillarCard}>
                <View style={[styles.pillarIcon, { backgroundColor: `${pillar.color}15` }]}>
                  <Ionicons name={pillar.icon} size={26} color={pillar.color} />
                </View>
                <Text style={styles.pillarName}>{pillar.name}</Text>
                <Text style={styles.pillarDesc} numberOfLines={2}>{pillar.desc}</Text>
              </Card>
            ))}
          </ScrollView>

          {/* Events */}
          {eventsLoading ? (
            <View style={styles.loadingRow}><ActivityIndicator size="small" color={colors.brandGreen} /><Text style={styles.loadingText}>Loading events...</Text></View>
          ) : events.length > 0 ? (
            <>
              {hackathons.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🏆 Hackathons</Text>
                    <Badge text={`${hackathons.length}`} variant="warning" size="sm" />
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
                    {hackathons.map((event: any) => (
                      <Card key={event.id} variant="elevated" style={styles.eventCard}>
                        <Badge text={event.status || 'Upcoming'} variant={event.status === 'live' ? 'success' : 'info'} size="sm" />
                        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                        <Text style={styles.eventMeta} numberOfLines={1}>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</Text>
                        {event.prize_pool && <Text style={styles.eventPrize}>🎯 Prize: ₹{Number(event.prize_pool).toLocaleString()}</Text>}
                        {event.venue && <Text style={styles.eventVenue} numberOfLines={1}>📍 {event.venue}</Text>}
                      </Card>
                    ))}
                  </ScrollView>
                </>
              )}
              {podcasts.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🎙️ Podcasts</Text>
                    <Badge text={`${podcasts.length}`} variant="info" size="sm" />
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
                    {podcasts.map((event: any) => (
                      <Card key={event.id} variant="elevated" style={styles.eventCard}>
                        <Badge text={event.status || 'Upcoming'} variant="info" size="sm" />
                        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                        {event.guest_name && <Text style={styles.eventMeta}>🎤 Guest: {event.guest_name}</Text>}
                        <Text style={styles.eventMeta} numberOfLines={1}>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</Text>
                      </Card>
                    ))}
                  </ScrollView>
                </>
              )}
              {otherEvents.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>📅 Upcoming Events</Text>
                    <Badge text={`${otherEvents.length}`} variant="info" size="sm" />
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
                    {otherEvents.map((event: any) => (
                      <Card key={event.id} variant="elevated" style={styles.eventCard}>
                        <Badge text={event.type || 'Event'} variant="info" size="sm" />
                        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                        <Text style={styles.eventMeta} numberOfLines={1}>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</Text>
                        {event.venue && <Text style={styles.eventVenue} numberOfLines={1}>📍 {event.venue}</Text>}
                      </Card>
                    ))}
                  </ScrollView>
                </>
              )}
            </>
          ) : (
            <Card variant="flat" style={styles.emptyEventCard}>
              <Ionicons name="calendar-outline" size={32} color={colors.stone} />
              <Text style={styles.emptyText}>Events coming soon! Stay tuned.</Text>
            </Card>
          )}

          {/* Blogs */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 Latest Blogs</Text>
          </View>
          {blogsLoading ? (
            <View style={styles.loadingRow}><ActivityIndicator size="small" color={colors.brandGreen} /><Text style={styles.loadingText}>Loading blogs...</Text></View>
          ) : blogs.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
              {blogs.slice(0, 8).map((blog: any) => (
                <Card key={blog.id} variant="elevated" style={styles.blogCard} onPress={() => Linking.openURL(`https://karyasaarthi.com/blogs/${blog.slug}`)}>
                  <Text style={styles.blogCategory}>{blog.category?.name || 'General'}</Text>
                  <Text style={styles.blogTitle} numberOfLines={3}>{blog.title}</Text>
                  <Text style={styles.blogExcerpt} numberOfLines={2}>{blog.excerpt}</Text>
                  <View style={styles.blogMeta}>
                    <Text style={styles.blogDate}>{new Date(blog.published_at || blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                    <Text style={styles.blogViews}>{blog.views || 0} views</Text>
                  </View>
                </Card>
              ))}
            </ScrollView>
          ) : (
            <Card variant="flat" style={styles.emptyEventCard}>
              <Ionicons name="document-text-outline" size={32} color={colors.stone} />
              <Text style={styles.emptyText}>Blog articles coming soon!</Text>
            </Card>
          )}

          {/* Contact */}
          <Text style={styles.sectionTitle}>📞 Contact Us</Text>
          <Card variant="elevated" style={styles.contactCard}>
            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+918595025753')}>
              <Ionicons name="call" size={20} color={colors.ink} />
              <View style={{ flex: 1 }}><Text style={styles.contactLabel}>Phone</Text><Text style={styles.contactValue}>+91 8595025753 / +91 6238521530</Text></View>
            </TouchableOpacity>
            <View style={styles.contactDivider} />
            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:support@karyasaarthi.com')}>
              <Ionicons name="mail" size={20} color={colors.ink} />
              <View style={{ flex: 1 }}><Text style={styles.contactLabel}>Email</Text><Text style={styles.contactValue}>support@karyasaarthi.com</Text></View>
            </TouchableOpacity>
            <View style={styles.contactDivider} />
            <View style={styles.contactRow}>
              <Ionicons name="location" size={20} color={colors.ink} />
              <View style={{ flex: 1 }}><Text style={styles.contactLabel}>Address</Text><Text style={styles.contactValue}>Gali No 1, Block A, Uttarakhand Enclave, Nathupura, Burari, Delhi</Text></View>
            </View>
          </Card>

          {/* Social Media */}
          <Text style={styles.sectionTitle}>🌐 Follow Us</Text>
          <View style={styles.socialGrid}>
            {socialLinks.map((link, i) => (
              <TouchableOpacity key={i} style={[styles.socialBtn, { backgroundColor: `${link.color}12` }]} onPress={() => Linking.openURL(link.url)} activeOpacity={0.7}>
                <Ionicons name={link.icon} size={22} color={link.color} />
                <Text style={[styles.socialText, { color: link.color }]} numberOfLines={1}>{link.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CTA Banner */}
          <Card variant="elevated" style={styles.ctaCard}>
            <LinearGradient colors={[colors.heroDarkFrom, colors.heroDarkTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
              <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
              <Text style={styles.ctaSubtitle}>Join 500+ satisfied clients</Text>
              <View style={styles.ctaButtons}>
                <Button title="Login" onPress={() => router.push('/(auth)/login')} variant="secondary" size="md" style={styles.ctaBtn} />
                <Button title="WhatsApp Us" onPress={() => Linking.openURL('https://wa.me/918595025753')} variant="accent" size="md" style={styles.ctaBtn} />
              </View>
            </LinearGradient>
          </Card>

          <View style={{ height: insets.bottom + 20 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: spacing.containerMargin, paddingBottom: 32, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl, alignItems: 'center' },
  backBtn: { position: 'absolute', left: 16, top: 52, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  headerTitle: { ...typography.displayLg, color: colors.white, marginTop: 8 },
  headerTagline: { ...typography.bodyMd, color: colors.onDarkMuted, fontStyle: 'italic' },
  headerDesc: { ...typography.bodySm, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4, paddingHorizontal: 16 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingVertical: 10, paddingHorizontal: spacing.md },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { ...typography.headlineSm, color: colors.brandGreen, fontWeight: '700' },
  statLabel: { ...typography.labelSm, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },
  body: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.lg },
  sectionTitle: { ...typography.headlineMd, color: colors.ink, marginBottom: spacing.sm, marginTop: spacing.lg },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.lg },
  serviceCard: { width: (width - 40 - 20) / 3, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6 },
  serviceIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  serviceText: { ...typography.labelMd, color: colors.ink, textAlign: 'center' },
  pillarCard: { width: 170, padding: spacing.md },
  pillarIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  pillarName: { ...typography.labelLg, color: colors.ink },
  pillarDesc: { ...typography.bodySm, color: colors.steel, marginTop: 4 },
  eventCard: { width: 200, padding: spacing.md },
  eventTitle: { ...typography.labelLg, color: colors.ink, marginTop: 8 },
  eventMeta: { ...typography.bodySm, color: colors.steel, marginTop: 4 },
  eventPrize: { ...typography.labelMd, color: colors.brandGreen, marginTop: 4 },
  eventVenue: { ...typography.bodySm, color: colors.stone, marginTop: 2 },
  emptyEventCard: { alignItems: 'center', padding: spacing.lg, gap: 8, marginBottom: spacing.md },
  emptyText: { ...typography.bodyMd, color: colors.stone },
  blogCard: { width: 200, padding: spacing.md },
  blogCategory: { ...typography.labelSm, color: colors.brandTag, textTransform: 'uppercase' },
  blogTitle: { ...typography.labelLg, color: colors.ink, marginTop: 4 },
  blogExcerpt: { ...typography.bodySm, color: colors.steel, marginTop: 4 },
  blogMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  blogDate: { ...typography.labelSm, color: colors.stone },
  blogViews: { ...typography.labelSm, color: colors.stone },
  contactCard: { padding: spacing.md },
  contactRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  contactLabel: { ...typography.labelMd, color: colors.ink },
  contactValue: { ...typography.bodySm, color: colors.steel, marginTop: 2 },
  contactDivider: { height: 1, backgroundColor: colors.divider, marginVertical: 4 },
  socialGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.lg },
  socialBtn: { width: (width - 40 - 30) / 4, paddingVertical: 12, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', gap: 4 },
  socialText: { ...typography.labelSm, fontWeight: '600' },
  ctaCard: { padding: 0, overflow: 'hidden', marginTop: spacing.md },
  ctaGradient: { padding: spacing.lg, alignItems: 'center' },
  ctaTitle: { ...typography.headlineMd, color: colors.white },
  ctaSubtitle: { ...typography.bodyMd, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  ctaButtons: { flexDirection: 'row', gap: 12, marginTop: spacing.md, flexWrap: 'wrap', justifyContent: 'center' },
  ctaBtn: { minWidth: 130 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: spacing.lg, justifyContent: 'center' },
  loadingText: { ...typography.bodyMd, color: colors.stone },
});
