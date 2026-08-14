/**
 * Admin Profile — Full-featured profile with edit, change password, settings.
 * Dark theme with amber accents, all features working.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  TextInput, Modal, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation } from '@tanstack/react-query';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { updateProfileApi, changePasswordApi } from '@/services/auth';
import { APP_INFO } from '@/utils/constants';
import Toast from 'react-native-toast-message';

type ModalType = 'editProfile' | 'changePassword' | null;

export default function AdminProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Edit profile
  const [editName, setEditName] = useState(user?.fullname || '');

  // Change password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

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
    if (!editName.trim()) return Alert.alert('Error', 'Name required');
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
    { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
  ]);

  const MENU = [
    {
      title: 'ACCOUNT',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', sub: 'Update name & info', color: '#6366F1', action: () => { setEditName(user?.fullname || ''); setActiveModal('editProfile'); } },
        { icon: 'lock-closed-outline', label: 'Change Password', sub: 'Update your password', color: '#F59E0B', action: () => { setCurrentPw(''); setNewPw(''); setConfirmPw(''); setActiveModal('changePassword'); } },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { icon: 'people-outline', label: 'User Management', sub: 'All users & roles', color: '#3B82F6', action: () => router.push('/(admin)/users') },
        { icon: 'briefcase-outline', label: 'Projects', sub: 'All projects', color: '#10B981', action: () => router.push('/(admin)/projects') },
        { icon: 'card-outline', label: 'Invoices', sub: 'Billing & payments', color: '#EC4899', action: () => router.push('/(admin)/invoices') },
      ],
    },
    {
      title: 'APP',
      items: [
        { icon: 'chatbubbles-outline', label: 'Messages', sub: 'Chat with users', color: '#8B5CF6', action: () => router.push('/(admin)/chat') },
        { icon: 'information-circle-outline', label: 'About', sub: `v${APP_INFO.VERSION}`, color: '#64748B' },
      ],
    },
  ];

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={s.profileHeader}>
          <View style={s.avatarBorder}>
            <Avatar name={user?.fullname} size={76} />
          </View>
          <Text style={s.name}>{typeof user?.fullname === 'object' ? (user.fullname as any).fullname : user?.fullname || 'Admin'}</Text>
          <Text style={s.email}>{user?.email || ''}</Text>
          <View style={s.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#F59E0B" />
            <Text style={s.roleText}>{user?.role || 'Admin'}</Text>
          </View>
          <TouchableOpacity style={s.editHeaderBtn} onPress={() => { setEditName(user?.fullname || ''); setActiveModal('editProfile'); }}>
            <Ionicons name="create-outline" size={14} color="#F59E0B" />
            <Text style={s.editHeaderText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Menu Sections */}
        {MENU.map((sec, si) => (
          <View key={si} style={s.menuSection}>
            <Text style={s.sectionTitle}>{sec.title}</Text>
            <View style={s.menuCard}>
              {sec.items.map((item: any, ii) => (
                <TouchableOpacity key={ii} style={[s.menuItem, ii < sec.items.length - 1 && s.menuBorder]} activeOpacity={0.7} onPress={item.action}>
                  <View style={[s.menuIcon, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.menuLabel}>{item.label}</Text>
                    {item.sub && <Text style={s.menuSub}>{item.sub}</Text>}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.15)" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={s.appInfo}>
          <Text style={s.appName}>{APP_INFO.NAME}</Text>
          <Text style={s.appVer}>v{APP_INFO.VERSION}</Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={activeModal === 'editProfile'} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={s.modalClose}>
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <Text style={s.fieldLabel}>Full Name</Text>
            <TextInput style={s.fieldInput} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor="#94A3B8" />
            <Text style={s.fieldLabel}>Email</Text>
            <View style={[s.fieldInput, s.fieldDisabled]}>
              <Text style={{ color: '#94A3B8', fontSize: 15 }}>{user?.email}</Text>
              <Ionicons name="lock-closed" size={14} color="#94A3B8" />
            </View>
            <TouchableOpacity style={[s.saveBtn, profileMutation.isPending && { opacity: 0.6 }]} onPress={handleSaveProfile} disabled={profileMutation.isPending}>
              {profileMutation.isPending ? <ActivityIndicator color="#0F172A" /> : <Text style={s.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={activeModal === 'changePassword'} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={s.modalClose}>
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <Text style={s.fieldLabel}>Current Password</Text>
            <TextInput style={s.fieldInput} value={currentPw} onChangeText={setCurrentPw} secureTextEntry placeholder="Current password" placeholderTextColor="#94A3B8" />
            <Text style={s.fieldLabel}>New Password</Text>
            <TextInput style={s.fieldInput} value={newPw} onChangeText={setNewPw} secureTextEntry placeholder="Min 8 characters" placeholderTextColor="#94A3B8" />
            <Text style={s.fieldLabel}>Confirm Password</Text>
            <TextInput style={s.fieldInput} value={confirmPw} onChangeText={setConfirmPw} secureTextEntry placeholder="Re-enter password" placeholderTextColor="#94A3B8" />

            {newPw.length > 0 && (
              <View style={s.pwStrength}>
                <View style={[s.pwBar, { width: newPw.length >= 12 ? '100%' : newPw.length >= 8 ? '66%' : '33%', backgroundColor: newPw.length >= 12 ? '#059669' : newPw.length >= 8 ? '#F59E0B' : '#DC2626' }]} />
                <Text style={s.pwStrengthText}>{newPw.length >= 12 ? 'Strong' : newPw.length >= 8 ? 'Medium' : 'Weak'}</Text>
              </View>
            )}

            <TouchableOpacity style={[s.saveBtn, passwordMutation.isPending && { opacity: 0.6 }]} onPress={handleChangePassword} disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? <ActivityIndicator color="#0F172A" /> : <Text style={s.saveBtnText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A' },
  profileHeader: { alignItems: 'center', padding: 30, gap: 6 },
  avatarBorder: { borderWidth: 3, borderColor: '#F59E0B', borderRadius: 44, padding: 3 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#FFF', marginTop: 10 },
  email: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F59E0B20', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, marginTop: 6 },
  roleText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#F59E0B', textTransform: 'capitalize' },
  editHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#F59E0B30', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, marginTop: 10 },
  editHeaderText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#F59E0B' },

  // Menu
  menuSection: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 10 },
  menuCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 14 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  menuIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  menuSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 28, paddingVertical: 14, borderRadius: 14, backgroundColor: '#EF444415', borderWidth: 1, borderColor: '#EF444430' },
  logoutText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#EF4444' },
  appInfo: { alignItems: 'center', marginTop: 24 },
  appName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.3)' },
  appVer: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.15)', marginTop: 4 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#0F172A' },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#475569', marginBottom: 8, marginTop: 12 },
  fieldInput: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A', borderWidth: 1.5, borderColor: '#E2E8F0' },
  fieldDisabled: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F1F5F9' },
  saveBtn: { backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#0F172A' },
  pwStrength: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  pwBar: { height: 4, borderRadius: 2 },
  pwStrengthText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B' },
});
