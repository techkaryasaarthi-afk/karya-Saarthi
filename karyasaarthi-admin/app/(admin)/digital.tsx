/**
 * Digital Marketing Panel — Creators, Submissions, Ads, Keywords.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { digitalService, Creator, Submission } from '@/services/digital';
import { useAppTheme } from '@/utils/theme';

export default function DigitalScreen() {
  const insets = useSafeAreaInsets();
  const T = useAppTheme();
  const [activeTab, setActiveTab] = useState<'creators' | 'submissions' | 'ads'>('creators');
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'creators') {
        const res = await digitalService.getCreators();
        setCreators(res.creators || []);
      } else if (activeTab === 'submissions') {
        const res = await digitalService.getSubmissions();
        setSubmissions(res.submissions || []);
      } else if (activeTab === 'ads') {
        const res = await digitalService.getAds();
        setAds(res.ads || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const approveSubmission = async (id: number) => {
    try {
      await digitalService.reviewSubmission(id, 'approved');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: T.background }]}>
      <View style={s.header}>
        <Text style={[s.title, { color: T.ink }]}>🌐 Digital Saarthi</Text>
      </View>

      <View style={[s.tabs, { borderBottomColor: T.hairline }]}>
        {['creators', 'submissions', 'ads'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && { borderBottomColor: T.brandGreen, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[s.tabText, { color: activeTab === tab ? T.brandGreen : T.muted, textTransform: 'capitalize' }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={T.brandGreen} style={{ marginTop: 50 }} />
        ) : activeTab === 'creators' ? (
          <>
            <Text style={[s.sectionTitle, { color: T.ink }]}>Creator Roster ({creators.length})</Text>
            {creators.map(c => (
              <View key={c.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
                <View style={s.cardHeader}>
                  <View style={[s.avatar, { backgroundColor: '#8B5CF6' }]}><Text style={s.avatarText}>{c.name[0]}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: T.ink }]}>{c.name}</Text>
                    <Text style={{ color: T.muted, fontSize: 12 }}>{c.platforms?.join(', ')}</Text>
                  </View>
                  <Text style={[s.badge, { backgroundColor: c.status === 'active' ? T.success + '20' : T.hairline, color: c.status === 'active' ? T.success : T.muted }]}>
                    {c.status}
                  </Text>
                </View>
                <View style={[s.cardFooter, { borderTopColor: T.hairline }]}>
                  <Text style={{ color: T.ink, fontFamily: 'Inter_600SemiBold' }}>₹{c.rate_per_post?.toLocaleString() || 0} / post</Text>
                </View>
              </View>
            ))}
          </>
        ) : activeTab === 'submissions' ? (
          <>
            <Text style={[s.sectionTitle, { color: T.ink }]}>Content Submissions ({submissions.length})</Text>
            {submissions.map(sub => (
              <View key={sub.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
                <View style={s.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: T.ink }]}>{sub.title}</Text>
                    <Text style={{ color: T.muted, fontSize: 12 }}>{sub.platform} • {sub.content_type}</Text>
                  </View>
                  <Text style={[s.badge, { backgroundColor: sub.status === 'pending' ? T.warning + '20' : sub.status === 'approved' ? T.success + '20' : T.error + '20', color: sub.status === 'pending' ? T.warning : sub.status === 'approved' ? T.success : T.error }]}>
                    {sub.status}
                  </Text>
                </View>
                {sub.status === 'pending' && (
                  <View style={[s.cardFooter, { borderTopColor: T.hairline, flexDirection: 'row', gap: 10 }]}>
                    <TouchableOpacity style={[s.btn, { backgroundColor: T.success + '20' }]} onPress={() => approveSubmission(sub.id)}>
                      <Text style={{ color: T.success, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={[s.sectionTitle, { color: T.ink }]}>Ad Campaigns</Text>
            {ads.map(ad => (
              <View key={ad.id} style={[s.card, { backgroundColor: T.surfaceContainer, borderColor: T.hairline }]}>
                <View style={s.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: T.ink }]}>{ad.name}</Text>
                    <Text style={{ color: T.muted, fontSize: 12 }}>{ad.platform}</Text>
                  </View>
                </View>
                <View style={s.adStats}>
                  <View style={s.adStat}><Text style={[s.adStatV, { color: T.error }]}>₹{ad.spend?.toLocaleString()}</Text><Text style={s.adStatL}>Spend</Text></View>
                  <View style={s.adStat}><Text style={[s.adStatV, { color: T.ink }]}>{ad.clicks?.toLocaleString()}</Text><Text style={s.adStatL}>Clicks</Text></View>
                  <View style={s.adStat}><Text style={[s.adStatV, { color: T.success }]}>{ad.conversions}</Text><Text style={s.adStatL}>Conv.</Text></View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, marginBottom: 16 },
  tab: { paddingVertical: 12, marginRight: 24 },
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, fontFamily: 'Inter_700Bold', overflow: 'hidden' },
  cardFooter: { marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  adStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#333' },
  adStat: { alignItems: 'center' },
  adStatV: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  adStatL: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#888', marginTop: 2 },
});
