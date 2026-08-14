/**
 * Profile Screen — Full-featured user profile.
 * Mintlify: Flat UI, hairline borders, ink text, brand green toggles and accents.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  TextInput, Switch, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { updateProfileApi, changePasswordApi } from '@/services/auth';
import { clearAllNotifications } from '@/services/notifications';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import { APP_INFO } from '@/utils/constants';
import { getSecure, setSecure, deleteSecure } from '@/utils/storage';
import Toast from 'react-native-toast-message';

type ModalType = 'editProfile' | 'changePassword' | 'aboutCompany' | null;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, setUser } = useAuthStore();
  const theme = useAppTheme();
  const st = useStyles(theme);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Edit profile state
  const [editName, setEditName] = useState(user?.fullname || '');
  const [editPhone, setEditPhone] = useState('');

  // Change password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  React.useEffect(() => {
    getSecure('notifications_enabled').then(val => { setNotificationsEnabled(val !== 'false'); });
  }, []);

  const profileMutation = useMutation({
    mutationFn: (updates: { fullname?: string; phone?: string }) => updateProfileApi(updates),
    onSuccess: (data) => {
      if (data?.fullname) { setUser({ ...user!, fullname: data.fullname }); }
      Toast.show({ type: 'success', text1: 'Profile Updated', text2: 'Your changes have been saved' });
      setActiveModal(null);
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Update Failed', text2: 'Could not update your profile' });
    },
  });

  const handleSaveProfile = () => {
    if (!editName.trim()) { Alert.alert('Error', 'Name cannot be empty'); return; }
    const updates: any = {};
    if (editName.trim() !== user?.fullname) updates.fullname = editName.trim();
    if (editPhone.trim()) updates.phone = editPhone.trim();
    if (Object.keys(updates).length === 0) { setActiveModal(null); return; }
    profileMutation.mutate(updates);
  };

  const passwordMutation = useMutation({
    mutationFn: () => changePasswordApi(currentPw, newPw),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Password Changed', text2: 'Your password has been updated' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setActiveModal(null);
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Current password is incorrect' });
    },
  });

  const handleChangePassword = () => {
    if (!currentPw || !newPw || !confirmPw) { Alert.alert('Error', 'Please fill all fields'); return; }
    if (newPw.length < 8) { Alert.alert('Error', 'New password must be at least 8 characters'); return; }
    if (newPw !== confirmPw) { Alert.alert('Error', 'New passwords do not match'); return; }
    passwordMutation.mutate();
  };



  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await setSecure('notifications_enabled', value ? 'true' : 'false');
    if (!value) await clearAllNotifications();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const MENU_SECTIONS = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', sub: 'Name, phone, photo', action: () => { setEditName(user?.fullname || ''); setActiveModal('editProfile'); } },
        { icon: 'lock-closed-outline', label: 'Change Password', sub: 'Update your password', action: () => { setCurrentPw(''); setNewPw(''); setConfirmPw(''); setActiveModal('changePassword'); } },
        { icon: 'receipt-outline', label: 'My Invoices', sub: 'View & pay invoices', action: () => router.push('/(customer)/invoices' as any) },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', sub: 'Push & in-app alerts', toggle: true, value: notificationsEnabled, onToggle: handleNotificationToggle },
      ],
    },
    {
      title: 'More',
      items: [
        { icon: 'shield-checkmark-outline', label: 'Privacy Policy', sub: 'How we handle your data', action: () => Linking.openURL(`${APP_INFO.WEBSITE}/privacy`) },
        { icon: 'document-outline', label: 'Terms of Service', sub: 'Usage terms & conditions', action: () => Linking.openURL(`${APP_INFO.WEBSITE}/terms`) },
        { icon: 'alert-circle-outline', label: 'Disclaimer', sub: 'Legal disclaimer', action: () => Linking.openURL(`${APP_INFO.WEBSITE}/disclaimer`) },
        { icon: 'business-outline', label: 'About Us', sub: 'Karyanex Private Limited', action: () => setActiveModal('aboutCompany') },
      ],
    },
  ];

  return (
    <View style={[st.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Profile Header ────────────────────────────────── */}
        <View style={st.profileHeader}>
          <View style={st.avatarBorder}>
            <Avatar name={user?.fullname} size={80} />
          </View>
          <Text style={st.userName}>{user?.fullname || 'Guest User'}</Text>
          <Text style={st.userEmail}>{user?.email || 'Not logged in'}</Text>
          <View style={st.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color={theme.primary} />
            <Text style={st.roleText}>{user?.role?.toUpperCase() || 'GUEST'}</Text>
          </View>
          <TouchableOpacity
            style={st.editBtn}
            onPress={() => { setEditName(user?.fullname || ''); setActiveModal('editProfile'); }}
          >
            <Ionicons name="create-outline" size={16} color={theme.ink} />
            <Text style={st.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Menu Sections ────────────────────────────────── */}
        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={st.menuSection}>
            <Text style={st.sectionTitle}>{section.title}</Text>
            <View style={st.menuCard}>
              {section.items.map((item: any, ii: number) => (
                <TouchableOpacity
                  key={ii}
                  style={[st.menuItem, ii < section.items.length - 1 && st.menuItemBorder]}
                  activeOpacity={item.toggle ? 1 : 0.7}
                  onPress={item.toggle ? undefined : item.action}
                >
                  <View style={st.menuIconWrap}>
                    <Ionicons name={item.icon as any} size={20} color={theme.ink} />
                  </View>
                  <View style={st.menuContent}>
                    <Text style={st.menuLabel}>{item.label}</Text>
                    <Text style={st.menuSub}>{item.sub}</Text>
                  </View>
                  {item.toggle ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: theme.hairline, true: theme.brandGreen }}
                      thumbColor={theme.white}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={theme.stone} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Logout ────────────────────────────────────────── */}
        <TouchableOpacity style={st.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={theme.brandError} />
          <Text style={st.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={st.version}>{APP_INFO.NAME} v{APP_INFO.VERSION}</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ══════════ EDIT PROFILE MODAL ══════════ */}
      <Modal visible={activeModal === 'editProfile'} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.modalOverlay}>
          <View style={st.modalSheet}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={st.modalClose}>
                <Ionicons name="close" size={22} color={theme.ink} />
              </TouchableOpacity>
            </View>

            <View style={st.fieldGroup}>
              <Text style={st.fieldLabel}>Full Name</Text>
              <TextInput style={st.fieldInput} value={editName} onChangeText={setEditName} placeholder="Enter your full name" placeholderTextColor={theme.stone} />
            </View>
            <View style={st.fieldGroup}>
              <Text style={st.fieldLabel}>Email</Text>
              <View style={[st.fieldInput, st.fieldDisabled]}>
                <Text style={st.fieldDisabledText}>{user?.email}</Text>
                <Ionicons name="lock-closed" size={14} color={theme.stone} />
              </View>
            </View>
            <View style={st.fieldGroup}>
              <Text style={st.fieldLabel}>Phone (optional)</Text>
              <TextInput style={st.fieldInput} value={editPhone} onChangeText={setEditPhone} placeholder="+91 XXXXXXXXXX" placeholderTextColor={theme.stone} keyboardType="phone-pad" />
            </View>

            <TouchableOpacity style={[st.primaryBtn, profileMutation.isPending && { opacity: 0.7 }]} onPress={handleSaveProfile} disabled={profileMutation.isPending}>
              {profileMutation.isPending ? <ActivityIndicator size="small" color={theme.white} /> : <Text style={st.primaryBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══════════ CHANGE PASSWORD MODAL ══════════ */}
      <Modal visible={activeModal === 'changePassword'} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.modalOverlay}>
          <View style={st.modalSheet}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={st.modalClose}>
                <Ionicons name="close" size={22} color={theme.ink} />
              </TouchableOpacity>
            </View>

            <View style={st.fieldGroup}>
              <Text style={st.fieldLabel}>Current Password</Text>
              <View style={st.fieldInputRow}>
                <TextInput style={st.fieldInputFlex} value={currentPw} onChangeText={setCurrentPw} secureTextEntry={!showCurrentPw} placeholder="Enter current password" placeholderTextColor={theme.stone} />
                <TouchableOpacity onPress={() => setShowCurrentPw(!showCurrentPw)}><Ionicons name={showCurrentPw ? 'eye-off' : 'eye'} size={20} color={theme.stone} /></TouchableOpacity>
              </View>
            </View>
            <View style={st.fieldGroup}>
              <Text style={st.fieldLabel}>New Password</Text>
              <View style={st.fieldInputRow}>
                <TextInput style={st.fieldInputFlex} value={newPw} onChangeText={setNewPw} secureTextEntry={!showNewPw} placeholder="Min. 8 characters" placeholderTextColor={theme.stone} />
                <TouchableOpacity onPress={() => setShowNewPw(!showNewPw)}><Ionicons name={showNewPw ? 'eye-off' : 'eye'} size={20} color={theme.stone} /></TouchableOpacity>
              </View>
            </View>
            <View style={st.fieldGroup}>
              <Text style={st.fieldLabel}>Confirm New Password</Text>
              <TextInput style={st.fieldInput} value={confirmPw} onChangeText={setConfirmPw} secureTextEntry placeholder="Re-enter new password" placeholderTextColor={theme.stone} />
            </View>

            {newPw.length > 0 && (
              <View style={st.pwStrength}>
                <View style={[st.pwBar, { width: newPw.length >= 12 ? '100%' : newPw.length >= 8 ? '66%' : '33%', backgroundColor: newPw.length >= 12 ? theme.brandGreen : newPw.length >= 8 ? theme.warning : theme.brandError }]} />
                <Text style={st.pwStrengthText}>{newPw.length >= 12 ? 'Strong' : newPw.length >= 8 ? 'Medium' : 'Weak'}</Text>
              </View>
            )}

            <TouchableOpacity style={[st.primaryBtn, passwordMutation.isPending && { opacity: 0.7 }]} onPress={handleChangePassword} disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? <ActivityIndicator size="small" color={theme.white} /> : <Text style={st.primaryBtnText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══════════ ABOUT COMPANY MODAL ══════════ */}
      <Modal visible={activeModal === 'aboutCompany'} animationType="slide" transparent>
        <View style={st.modalOverlay}>
          <View style={[st.modalSheet, { maxHeight: '92%' }]}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>About Us</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={st.modalClose}>
                <Ionicons name="close" size={22} color={theme.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

              {/* Brand header */}
              <View style={st.aboutBrand}>
                <View style={st.aboutLogoWrap}>
                  <Ionicons name="briefcase" size={32} color={theme.brandGreen} />
                </View>
                <Text style={st.aboutBrandName}>Karya Saarthi</Text>
                <Text style={st.aboutBrandLegal}>A Brand of Karyanex Private Limited</Text>
                <Text style={st.aboutTagline}>Your digital growth partner — expert academic, technical &amp; business services for students and companies across India.</Text>
              </View>

              {/* Legal Info */}
              <View style={st.aboutSection}>
                <Text style={st.aboutSectionTitle}>🏛️ Legal Information</Text>
                {[
                  { label: 'Registered Company', value: 'Karyanex Private Limited' },
                  { label: 'Trade Name', value: 'Karya Saarthi' },
                  { label: 'CIN', value: 'U85500BR2026PTC085054' },
                  { label: 'GST Number', value: '10AAMCK8870B1ZN' },
                  { label: 'Incorporated Under', value: 'Companies Act, 2013' },
                ].map((row, i) => (
                  <View key={i} style={st.aboutInfoRow}>
                    <Text style={st.aboutInfoLabel}>{row.label}</Text>
                    <Text style={st.aboutInfoValue}>{row.value}</Text>
                  </View>
                ))}
                <View style={st.aboutNotice}>
                  <Ionicons name="information-circle-outline" size={14} color={theme.stone} />
                  <Text style={st.aboutNoticeText}>
                    All transactions, contracts, and legal obligations are governed under the name Karyanex Private Limited.
                  </Text>
                </View>
              </View>

              {/* Social Media */}
              <View style={st.aboutSection}>
                <Text style={st.aboutSectionTitle}>🌐 Connect With Us</Text>
                <View style={st.socialGrid}>
                  {[
                    { icon: 'globe-outline', label: 'Website', url: 'https://karyasaarthi.com' },
                    { icon: 'logo-instagram', label: 'Instagram', url: 'https://instagram.com/karyasaarthi' },
                    { icon: 'logo-linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/karyasaarthi' },
                    { icon: 'logo-youtube', label: 'YouTube', url: 'https://youtube.com/@karyasaarthi' },
                    { icon: 'logo-twitter', label: 'Twitter / X', url: 'https://x.com/karyasaarthi' },
                    { icon: 'chatbubble-ellipses-outline', label: 'WhatsApp', url: 'https://wa.me/918001234567' },
                  ].map((s, i) => (
                    <TouchableOpacity key={i} style={st.socialBtn} onPress={() => Linking.openURL(s.url)}>
                      <Ionicons name={s.icon as any} size={22} color={theme.ink} />
                      <Text style={st.socialBtnLabel}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Contact */}
              <View style={st.aboutSection}>
                <Text style={st.aboutSectionTitle}>📬 Contact Us</Text>
                {[
                  { icon: 'mail-outline', label: 'support@karyasaarthi.com', url: 'mailto:support@karyasaarthi.com' },
                  { icon: 'call-outline', label: '+91 800 123 4567', url: 'tel:+918001234567' },
                ].map((c, i) => (
                  <TouchableOpacity key={i} style={st.aboutContactRow} onPress={() => Linking.openURL(c.url)}>
                    <Ionicons name={c.icon as any} size={18} color={theme.brandGreen} />
                    <Text style={st.aboutContactText}>{c.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.stone} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quick Links */}
              <View style={st.aboutSection}>
                <Text style={st.aboutSectionTitle}>📄 Legal Documents</Text>
                {[
                  { label: 'Privacy Policy', url: `${APP_INFO.WEBSITE}/privacy` },
                  { label: 'Terms of Service', url: `${APP_INFO.WEBSITE}/terms` },
                  { label: 'Disclaimer', url: `${APP_INFO.WEBSITE}/disclaimer` },
                  { label: 'Refund Policy', url: `${APP_INFO.WEBSITE}/refund` },
                ].map((l, i) => (
                  <TouchableOpacity key={i} style={st.aboutContactRow} onPress={() => Linking.openURL(l.url)}>
                    <Ionicons name="document-text-outline" size={18} color={theme.stone} />
                    <Text style={st.aboutContactText}>{l.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.stone} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Footer */}
              <Text style={st.aboutFooter}>
                © 2026 Karyanex Private Limited. All rights reserved.{'\n'}
                Karya Saarthi v{APP_INFO.VERSION}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },

  profileHeader: { alignItems: 'center', paddingVertical: 32, paddingBottom: 28, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  avatarBorder: { borderWidth: 2, borderColor: theme.hairline, borderRadius: 44, padding: 3 },
  userName: { ...typography.headlineMd, color: theme.ink, marginTop: 14 },
  userEmail: { ...typography.bodyMd, color: theme.stone, marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,212,164,0.1)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, marginTop: 10 },
  roleText: { ...typography.microUppercase, color: theme.primary, letterSpacing: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, borderWidth: 1, borderColor: theme.hairline, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, backgroundColor: theme.surfaceContainer },
  editBtnText: { ...typography.labelMd, color: theme.ink },

  menuSection: { paddingHorizontal: spacing.containerMargin, marginTop: 24 },
  sectionTitle: { ...typography.labelSm, color: theme.stone, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' },
  menuCard: { backgroundColor: theme.white, borderRadius: radius.xl, borderWidth: 1, borderColor: theme.hairline, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: theme.hairline },
  menuIconWrap: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: theme.surfaceContainerLow, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuContent: { flex: 1 },
  menuLabel: { ...typography.labelLg, color: theme.ink },
  menuSub: { ...typography.bodySm, color: theme.stone, marginTop: 2 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32, marginHorizontal: spacing.containerMargin, paddingVertical: 14, borderRadius: radius.xl, backgroundColor: theme.surfaceContainer, borderWidth: 1, borderColor: theme.hairline },
  logoutText: { ...typography.labelLg, color: theme.brandError },
  version: { ...typography.bodySm, color: theme.stone, textAlign: 'center', marginTop: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(10,10,10,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: theme.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '85%', borderWidth: 1, borderColor: theme.hairline },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { ...typography.headlineMd, color: theme.ink },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surfaceContainer, alignItems: 'center', justifyContent: 'center' },

  fieldGroup: { marginBottom: 18 },
  fieldLabel: { ...typography.labelMd, color: theme.stone, marginBottom: 8 },
  fieldInput: { backgroundColor: theme.white, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, ...typography.bodyMd, color: theme.ink, borderWidth: 1, borderColor: theme.hairline },
  fieldDisabled: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surfaceContainerLow },
  fieldDisabledText: { ...typography.bodyMd, color: theme.stone },
  fieldInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: theme.hairline, gap: 10 },
  fieldInputFlex: { flex: 1, ...typography.bodyMd, color: theme.ink },

  pwStrength: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  pwBar: { height: 4, borderRadius: 2 },
  pwStrengthText: { ...typography.labelSm, color: theme.stone },

  primaryBtn: { backgroundColor: theme.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8, width: '100%' },
  primaryBtnText: { ...typography.labelLg, color: theme.white },

  // About Company Modal
  aboutBrand: { alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: theme.hairline, marginBottom: 16 },
  aboutLogoWrap: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(0,212,164,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 1, borderColor: theme.hairline },
  aboutBrandName: { ...typography.headlineLg, color: theme.ink, textAlign: 'center' },
  aboutBrandLegal: { ...typography.bodySm, color: theme.stone, textAlign: 'center', marginTop: 3 },
  aboutTagline: { ...typography.bodyMd, color: theme.steel, textAlign: 'center', marginTop: 10, lineHeight: 22, paddingHorizontal: 8 },

  aboutSection: { marginBottom: 20 },
  aboutSectionTitle: { ...typography.labelLg, color: theme.ink, marginBottom: 10, fontWeight: '700' },
  aboutInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  aboutInfoLabel: { ...typography.bodySm, color: theme.stone, flex: 1 },
  aboutInfoValue: { ...typography.labelMd, color: theme.ink, flex: 1.5, textAlign: 'right' },
  aboutNotice: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 10, backgroundColor: theme.surfaceContainerLow, borderRadius: radius.md, padding: 10 },
  aboutNoticeText: { ...typography.bodySm, color: theme.stone, flex: 1, lineHeight: 18 },

  socialGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.surfaceContainerLow, borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.hairline },
  socialBtnLabel: { ...typography.labelMd, color: theme.ink },

  aboutContactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  aboutContactText: { ...typography.bodyMd, color: theme.ink, flex: 1 },

  aboutFooter: { ...typography.bodySm, color: theme.stone, textAlign: 'center', marginTop: 20, lineHeight: 20 },
});
