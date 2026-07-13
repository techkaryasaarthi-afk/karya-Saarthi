/**
 * Contact Screen — Contact information and support form.
 * Mintlify: Flat UI, hairline borders, ink text.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors, spacing, typography, radius, useAppTheme } from '@/utils/theme';
import { APP_INFO } from '@/utils/constants';
import Button from '@/components/ui/Button';

export default function ContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const s = useStyles(theme);

  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert('Required', 'Please enter a message');
      return;
    }
    Linking.openURL(`mailto:${APP_INFO.SUPPORT_EMAIL}?subject=Support Request&body=${encodeURIComponent(message)}`);
    setMessage('');
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.ink} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Contact Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.contactCard}>
          <Text style={s.cardTitle}>Get in Touch</Text>
          <Text style={s.cardDesc}>Have a question or need assistance? We're here to help.</Text>
          
          <TouchableOpacity style={s.contactItem} onPress={() => Linking.openURL(`mailto:${APP_INFO.SUPPORT_EMAIL}`)}>
            <Ionicons name="mail" size={20} color={theme.primary} />
            <Text style={s.contactText}>{APP_INFO.SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.contactItem} onPress={() => Linking.openURL(`tel:${APP_INFO.SUPPORT_PHONE}`)}>
            <Ionicons name="call" size={20} color={theme.primary} />
            <Text style={s.contactText}>{APP_INFO.SUPPORT_PHONE}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.contactItem} onPress={() => Linking.openURL(`https://wa.me/${APP_INFO.HR_WHATSAPP.replace(/\s+/g, '').replace('+', '')}`)}>
            <Ionicons name="logo-whatsapp" size={20} color={theme.brandGreen} />
            <Text style={s.contactText}>Chat on WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>Send us a message</Text>
        <TextInput
          style={s.textArea}
          placeholder="How can we help you?"
          placeholderTextColor={theme.stone}
          multiline
          numberOfLines={5}
          value={message}
          onChangeText={setMessage}
          textAlignVertical="top"
        />
        <Button title="Send Message" onPress={handleSend} variant="primary" style={{ marginTop: spacing.md }} />
      </ScrollView>
    </View>
  );
}

const HP = spacing.containerMargin;
const useStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.surfaceContainerLow },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: HP, paddingVertical: spacing.md, backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.headlineMd, color: theme.ink },
  content: { paddingHorizontal: HP, paddingTop: spacing.xl, paddingBottom: 60 },
  
  contactCard: { backgroundColor: theme.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: theme.hairline, marginBottom: spacing.xl },
  cardTitle: { ...typography.headlineMd, color: theme.ink, marginBottom: 8 },
  cardDesc: { ...typography.bodySm, color: theme.stone, marginBottom: 20 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.hairline },
  contactText: { ...typography.labelMd, color: theme.ink },

  sectionTitle: { ...typography.headlineMd, color: theme.ink, marginBottom: spacing.sm },
  textArea: { backgroundColor: theme.white, borderWidth: 1, borderColor: theme.hairline, borderRadius: radius.md, padding: 16, ...typography.bodyMd, color: theme.ink, minHeight: 120 },
});
