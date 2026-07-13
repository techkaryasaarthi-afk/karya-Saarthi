/**
 * Vendor Profile — Full-featured profile with edit, password, biometric, logout.
 * Mintlify: Flat UI, hairline borders, ink text, brand green toggles.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  TextInput, Switch, Modal, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { updateProfileApi, changePasswordApi } from '@/services/auth';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import { APP_INFO } from '@/utils/constants';
import { getSecure, setSecure, deleteSecure } from '@/utils/storage';
import Toast from 'react-native-toast-message';

type ModalType = 'editProfile' | 'changePassword' | null;

export default function VendorProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, setUser } = useAuthStore();
  const theme = useAppTheme();
  const st = useStyles(theme);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [editName, setEditName] = useState(user?.fullname || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);



  const profileMutation = useMutation({
    mutationFn: (updates: { fullname?: string }) => updateProfileApi(updates),
    onSuccess: (data) => {
      if (data?.fullname) setUser({ ...user!, fullname: data.fullname });
      Toast.show({ type: 'success', text1: 'Profile Updated' });
      setActiveModal(null);
    },
    onError: () => Toast.show({ type: 'error', text1: 'Update Failed' }),
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePasswordApi(currentPw, newPw),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Password Changed' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setActiveModal(null);
    },
    onError: () => Toast.show({ type: 'error', text1: 'Current password incorrect' }),
  });

  const handleSaveProfile = () => {
    if (!editName.trim()) return Alert.alert('Error', 'Name cannot be empty');
    if (editName.trim() === user?.fullname) { setActiveModal(null); return; }
    profileMutation.mutate({ fullname: editName.trim() });
  };

  const handleChangePassword = () => {
    if (!currentPw || !newPw || !confirmPw) return Alert.alert('Error', 'Fill all fields');
    if (newPw.length < 8) return Alert.alert('Error', 'Min 8 characters');
    if (newPw !== confirmPw) return Alert.alert('Error', 'Passwords do not match');
    passwordMutation.mutate();
  };



  const handleLogout = () => Alert.alert('Logout', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/welcome'); } },
  ]);

  const MENU = [
    { title: 'Account', items: [
      { icon: 'person-outline', label: 'Edit Profile', sub: 'Name & details', action: () => { setEditName(user?.fullname || ''); setActiveModal('editProfile'); } },
      { icon: 'lock-closed-outline', label: 'Change Password', sub: 'Update password', action: () => { setCurrentPw(''); setNewPw(''); setConfirmPw(''); setActiveModal('changePassword'); } },
      { icon: 'wallet-outline', label: 'Earnings', sub: 'View payments', action: () => router.push('/(vendor)/earnings' as any) },
    ]},
    { title: 'More', items: [
      { icon: 'chatbubbles-outline', label: 'Support', sub: 'Chat with us', action: () => router.push('/(vendor)/chat' as any) },
      { icon: 'information-circle-outline', label: 'About', sub: `v${APP_INFO.VERSION}` },
    ]},
  ];

  return (
    <View style={[st.container, { paddingTop: 0 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gradient Header */}
        <LinearGradient
          colors={[theme.heroDarkFrom, theme.heroDarkTo, '#1a4a3a']}
          style={[st.profileHeader, { paddingTop: insets.top + 20 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={st.avatarBorder}><Avatar name={user?.fullname} size={80} /></View>
          <Text style={st.userName}>{user?.fullname || 'Vendor'}</Text>
          <Text style={st.userEmail}>{user?.email || ''}</Text>
          <View style={st.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color={theme.brandGreen} />
            <Text style={st.roleText}>VENDOR</Text>
          </View>
        </LinearGradient>

        {/* Menu */}
        {MENU.map((sec, si) => (
          <View key={si} style={st.menuSection}>
            <Text style={st.sectionTitle}>{sec.title}</Text>
            <View style={st.menuCard}>
              {sec.items.map((item: any, ii) => (
                <TouchableOpacity key={ii} style={[st.menuItem, ii < sec.items.length - 1 && st.menuBorder]} activeOpacity={item.toggle ? 1 : 0.7} onPress={item.toggle ? undefined : item.action}>
                  <View style={st.menuIconWrap}><Ionicons name={item.icon} size={20} color={theme.ink} /></View>
                  <View style={{ flex: 1 }}><Text style={st.menuLabel}>{item.label}</Text><Text style={st.menuSub}>{item.sub}</Text></View>
                  {item.toggle ? <Switch value={item.value} onValueChange={item.onToggle} trackColor={{ false: theme.hairline, true: theme.brandGreen }} thumbColor={theme.white} /> : <Ionicons name="chevron-forward" size={18} color={theme.stone} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={st.logoutBtn} onPress={handleLogout}><Ionicons name="log-out-outline" size={20} color={theme.brandError} /><Text style={st.logoutText}>Logout</Text></TouchableOpacity>
        <Text style={st.version}>{APP_INFO.NAME} v{APP_INFO.VERSION}</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={activeModal === 'editProfile'} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.modalOverlay}>
          <View style={st.modalSheet}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={st.modalClose}><Ionicons name="close" size={22} color={theme.ink} /></TouchableOpacity>
            </View>
            <Text style={st.fieldLabel}>Full Name</Text>
            <TextInput style={st.fieldInput} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={theme.stone} />
            <Text style={st.fieldLabel}>Email</Text>
            <View style={[st.fieldInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surfaceContainerLow }]}>
              <Text style={{ color: theme.stone, fontSize: 15 }}>{user?.email}</Text>
              <Ionicons name="lock-closed" size={14} color={theme.stone} />
            </View>
            <TouchableOpacity style={[st.primaryBtn, profileMutation.isPending && { opacity: 0.6 }]} onPress={handleSaveProfile} disabled={profileMutation.isPending}>
              {profileMutation.isPending ? <ActivityIndicator color={theme.white} /> : <Text style={st.primaryBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={activeModal === 'changePassword'} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.modalOverlay}>
          <View style={st.modalSheet}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={st.modalClose}><Ionicons name="close" size={22} color={theme.ink} /></TouchableOpacity>
            </View>
            <Text style={st.fieldLabel}>Current Password</Text>
            <TextInput style={st.fieldInput} value={currentPw} onChangeText={setCurrentPw} secureTextEntry placeholder="Current password" placeholderTextColor={theme.stone} />
            <Text style={st.fieldLabel}>New Password</Text>
            <TextInput style={st.fieldInput} value={newPw} onChangeText={setNewPw} secureTextEntry={!showPw} placeholder="Min 8 characters" placeholderTextColor={theme.stone} />
            <Text style={st.fieldLabel}>Confirm Password</Text>
            <TextInput style={st.fieldInput} value={confirmPw} onChangeText={setConfirmPw} secureTextEntry placeholder="Re-enter password" placeholderTextColor={theme.stone} />
            <TouchableOpacity style={[st.primaryBtn, passwordMutation.isPending && { opacity: 0.6 }]} onPress={handleChangePassword} disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? <ActivityIndicator color={theme.white} /> : <Text style={st.primaryBtnText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarBorder: {
    borderWidth: 3,
    borderColor: theme.brandGreen,
    borderRadius: 46,
    padding: 3,
    backgroundColor: 'rgba(0,212,164,0.15)',
  },
  userName: { ...typography.headlineMd, color: '#ffffff', marginTop: 14 },
  userEmail: { ...typography.bodyMd, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,212,164,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, marginTop: 10 },
  roleText: { ...typography.microUppercase, color: theme.brandGreen, letterSpacing: 1 },
  menuSection: { paddingHorizontal: spacing.containerMargin, marginTop: 24 },
  sectionTitle: { ...typography.labelSm, color: theme.stone, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' },
  menuCard: { backgroundColor: theme.white, borderRadius: radius.xl, borderWidth: 1, borderColor: theme.hairline, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: theme.hairline },
  menuIconWrap: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: theme.surfaceContainerLow, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuLabel: { ...typography.labelLg, color: theme.ink },
  menuSub: { ...typography.bodySm, color: theme.stone, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32, marginHorizontal: spacing.containerMargin, paddingVertical: 14, borderRadius: radius.xl, backgroundColor: theme.surfaceContainer, borderWidth: 1, borderColor: theme.hairline },
  logoutText: { ...typography.labelLg, color: theme.brandError },
  version: { ...typography.bodySm, color: theme.stone, textAlign: 'center', marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10,10,10,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: theme.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: theme.hairline },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { ...typography.headlineMd, color: theme.ink },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { ...typography.labelMd, color: theme.stone, marginBottom: 8, marginTop: 12 },
  fieldInput: { backgroundColor: theme.white, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: theme.ink, borderWidth: 1, borderColor: theme.hairline },
  primaryBtn: { backgroundColor: theme.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { ...typography.labelLg, color: theme.white },
});
