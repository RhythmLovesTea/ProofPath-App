import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../shared/store';
import { Colors, Spacing, Radii, Typography } from '../shared/theme';
import i18n from '../shared/i18n';
import EncryptedStorage from 'react-native-encrypted-storage';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', icon: 'earth' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', icon: 'earth' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', icon: 'earth' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', icon: 'earth' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', icon: 'earth' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', icon: 'earth' },
];

export const LanguageSelectScreen = ({ navigation }: any) => {
  const { setLanguage, language } = useAppStore();

  const handleSelect = async (code: string) => {
    setLanguage(code);
    await i18n.changeLanguage(code);
    await EncryptedStorage.setItem('user_language', code).catch(() => {});
    navigation.navigate('Walkthrough');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvasParchment} />

      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Icon name="shield-check" size={36} color={Colors.primaryOnDark} />
        </View>
        <Text style={styles.headline}>ProofPath</Text>
        <Text style={styles.tagline}>Choose your language</Text>
        <Text style={styles.taglineLocal}>अपनी भाषा चुनें · আপনার ভাষা বেছে নিন</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map(lang => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.langCard, language === lang.code && styles.langCardActive]}
            onPress={() => handleSelect(lang.code)}
            accessibilityRole="radio"
            accessibilityLabel={lang.label}
            accessibilityState={{ selected: language === lang.code }}
          >
            <View style={styles.langLeft}>
              <Text style={styles.langNative}>{lang.native}</Text>
              <Text style={styles.langLabel}>{lang.label}</Text>
            </View>
            {language === lang.code ? (
              <Icon name="check-circle" size={22} color={Colors.primary} />
            ) : (
              <Icon name="chevron-right" size={22} color={Colors.inkMuted48} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.footnote}>
        No Aadhaar required · आधार की आवश्यकता नहीं
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvasParchment },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  logoMark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.canvas,
    borderWidth: 1,
    borderColor: Colors.hairline,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  headline: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.9,
    marginBottom: 4,
  },
  tagline: { ...Typography.body, color: Colors.bodyMuted, marginBottom: 4, fontSize: 16, lineHeight: 24 },
  taglineLocal: { ...Typography.finePrint, color: Colors.inkMuted48, textAlign: 'center', fontSize: 13 },

  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderWidth: 1,
    borderColor: Colors.dividerSoft,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    minHeight: 72,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
  },
  langCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  langLeft: { flex: 1 },
  langNative: { fontSize: 20, fontWeight: '700', color: Colors.ink, letterSpacing: -0.5 },
  langLabel: { ...Typography.caption, color: Colors.bodyMuted, marginTop: 2 },

  footnote: {
    ...Typography.finePrint,
    color: Colors.inkMuted48,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
});
