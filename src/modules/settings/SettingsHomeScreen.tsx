import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useAppStore } from '../../shared/store';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';
import i18n from '../../shared/i18n';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
];

export const SettingsHomeScreen = () => {
  const navigation = useNavigation<any>();
  const { language, setLanguage } = useAppStore();

  const [campNotif, setCampNotif] = useState(true);
  const [evidenceNotif, setEvidenceNotif] = useState(true);
  const [affidavitNotif, setAffidavitNotif] = useState(true);

  const saveNotifPref = async (key: string, val: boolean) => {
    try {
      await EncryptedStorage.setItem(`notif_${key}`, String(val));
    } catch (_) {}
  };

  const handleLanguageChange = async (code: string) => {
    setLanguage(code);
    await i18n.changeLanguage(code);
    try {
      await EncryptedStorage.setItem('user_language', code);
    } catch (_) {}
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      'Hi ProofPath Support,\nI need help with:\n[describe your issue]\n\nApp version: 0.0.1'
    );
    Linking.openURL(`https://wa.me/911800000000?text=${msg}`).catch(() =>
      Alert.alert('Error', 'Could not open WhatsApp.')
    );
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Language */}
      <SectionHeader icon="translate" label="Language" />
      <View style={styles.card}>
        {LANGUAGES.map(lang => (
          <TouchableOpacity
            key={lang.code}
            style={styles.langRow}
            onPress={() => handleLanguageChange(lang.code)}
            accessibilityRole="radio"
            accessibilityState={{ selected: language === lang.code }}
            accessibilityLabel={lang.label}
          >
            <Text style={[styles.langLabel, language === lang.code && { color: Colors.primary, fontWeight: '600' }]}>
              {lang.label}
            </Text>
            {language === lang.code && (
              <Icon name="check-circle" size={20} color={Colors.primary} accessibilityElementsHidden />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications */}
      <SectionHeader icon="bell-outline" label="Notification Preferences" />
      <View style={styles.card}>
        <NotifRow
          icon="calendar-clock"
          label="Camp slot reminders"
          value={campNotif}
          onChange={v => { setCampNotif(v); saveNotifPref('camp', v); }}
        />
        <View style={styles.divider} />
        <NotifRow
          icon="file-document-outline"
          label="Evidence completeness nudges"
          value={evidenceNotif}
          onChange={v => { setEvidenceNotif(v); saveNotifPref('evidence', v); }}
        />
        <View style={styles.divider} />
        <NotifRow
          icon="text-box-check-outline"
          label="Affidavit ready alerts"
          value={affidavitNotif}
          onChange={v => { setAffidavitNotif(v); saveNotifPref('affidavit', v); }}
        />
      </View>

      {/* Support & Info */}
      <SectionHeader icon="information-outline" label="Support & Information" />
      <View style={styles.card}>
        <NavRow icon="whatsapp" label="Contact Support" onPress={openWhatsApp} color="#25D366" />
        <View style={styles.divider} />
        <NavRow icon="shield-outline" label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
        <View style={styles.divider} />
        <NavRow icon="information" label="About ProofPath" onPress={() => navigation.navigate('About')} />
      </View>

      {/* Data & Privacy */}
      <SectionHeader icon="lock-outline" label="Data & Privacy" />
      <View style={styles.card}>
        <NavRow
          icon="shield-account-outline"
          label="Wallet Security & Backup"
          onPress={() => navigation.navigate('Wallet', { screen: 'WalletSecurity' })}
        />
      </View>

      <Text style={styles.version}>ProofPath v0.0.1 — Built for migrant workers</Text>
    </ScrollView>
  );
};

const SectionHeader = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.sectionHeader}>
    <Icon name={icon} size={16} color={Colors.inkMuted48} accessibilityElementsHidden />
    <Text style={styles.sectionTitle}>{label}</Text>
  </View>
);

const NotifRow = ({
  icon, label, value, onChange,
}: { icon: string; label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <View style={styles.notifRow} accessibilityRole="switch" accessibilityLabel={label}>
    <Icon name={icon} size={20} color={Colors.primary} style={{ marginRight: 12 }} accessibilityElementsHidden />
    <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ true: Colors.primary, false: Colors.hairline }}
    />
  </View>
);

const NavRow = ({
  icon, label, onPress, color,
}: { icon: string; label: string; onPress: () => void; color?: string }) => (
  <TouchableOpacity
    style={styles.navRow}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Icon name={icon} size={20} color={color || Colors.primary} style={{ marginRight: 12 }} accessibilityElementsHidden />
    <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
    <Icon name="chevron-right" size={18} color={Colors.inkMuted48} accessibilityElementsHidden />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvasParchment },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
    gap: 6,
  },
  sectionTitle: { ...Typography.finePrint, fontWeight: '600', color: Colors.inkMuted48, textTransform: 'uppercase', letterSpacing: 0.8 },
  card: {
    backgroundColor: Colors.canvas,
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.hairline,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    minHeight: 48,
  },
  langLabel: { ...Typography.body, color: Colors.ink },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    minHeight: 52,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    minHeight: 52,
  },
  rowLabel: { ...Typography.body },
  divider: { height: 1, backgroundColor: Colors.dividerSoft, marginLeft: Spacing.md + 32 },
  version: { ...Typography.finePrint, color: Colors.inkMuted48, textAlign: 'center', marginTop: Spacing.xl },
});
