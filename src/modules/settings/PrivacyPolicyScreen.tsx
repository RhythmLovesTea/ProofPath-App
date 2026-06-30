import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

export const PrivacyPolicyScreen = () => (
  <ScrollView style={styles.root} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}>
    <Text style={styles.h1}>Privacy Policy</Text>
    <Text style={styles.lastUpdated}>Last updated: June 2026</Text>

    <Text style={styles.h2}>Our Commitment</Text>
    <Text style={styles.body}>
      ProofPath is built on one principle: your data belongs to you. We never sell, share,
      or transmit your personal information to third parties without your explicit consent.
    </Text>

    <Text style={styles.h2}>What We Store Locally</Text>
    <Text style={styles.body}>
      All your data — beneficiary records, evidence documents, wallet entries, and affidavits —
      is stored exclusively on your device using SQLite (offline-first). Nothing leaves your
      device unless you explicitly choose to sync.
    </Text>

    <Text style={styles.h2}>Encryption</Text>
    <Text style={styles.body}>
      Sensitive data (PIN, session state) is stored using Android's EncryptedSharedPreferences
      via react-native-encrypted-storage. Evidence files are stored on the device filesystem
      with a SHA-256 hash fingerprint for tamper detection.
    </Text>

    <Text style={styles.h2}>Sync</Text>
    <Text style={styles.body}>
      When you enable sync, only records you have explicitly added are uploaded to the ProofPath
      NGO server. Files (photos, audio) are transmitted over HTTPS with TLS 1.3.
      You can delete all synced data from the server by contacting support.
    </Text>

    <Text style={styles.h2}>Your Rights</Text>
    <Text style={styles.body}>
      • Right to access — view all data in the app at any time.{'\n'}
      • Right to delete — use Wallet › Security › Delete All Data.{'\n'}
      • Right to portability — export a .ppwallet backup at any time.{'\n'}
      • Right to withdraw consent — disable sync in Settings.
    </Text>

    <Text style={styles.h2}>Contact</Text>
    <Text style={styles.body}>
      For privacy concerns, reach us via WhatsApp support or write to privacy@proofpath.in
    </Text>

    <View style={styles.badge}>
      <Text style={styles.badgeText}>🔒 No Aadhaar required. No government ID stored.</Text>
    </View>
  </ScrollView>
);

export const AboutScreen = () => (
  <ScrollView style={styles.root} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}>
    <Text style={styles.h1}>About ProofPath</Text>
    <Text style={styles.mission}>
      "Your identity. Your rights.{'\n'}आपकी पहचान। आपके अधिकार।"
    </Text>

    <Text style={styles.body}>
      ProofPath is a free, open-source tool built for migrant workers, undocumented individuals,
      and anyone who lacks formal identity documents. We believe every person deserves a dignified
      way to prove who they are.
    </Text>

    <Text style={styles.h2}>How It Works</Text>
    <Text style={styles.body}>
      1. NGO field workers organise documentation camps (Module 1).{'\n'}
      2. Beneficiaries upload informal evidence — bills, letters, photos, audio (Module 2).{'\n'}
      3. A portable digital identity wallet is built with a QR code (Module 3).{'\n'}
      4. Employers and hospitals can scan the QR to verify — no internet needed.
    </Text>

    <Text style={styles.h2}>Built by</Text>
    <Text style={styles.body}>
      ProofPath is developed by a civil-tech collective and open-source contributors.
      It is not affiliated with any government department.
    </Text>

    <View style={styles.versionBadge}>
      <Text style={styles.versionText}>Version 0.0.1 — Alpha</Text>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvas },
  h1: { ...Typography.displayMd, marginBottom: Spacing.xs },
  h2: { ...Typography.tagline, marginTop: Spacing.lg, marginBottom: Spacing.xs },
  body: { ...Typography.body, color: Colors.inkMuted80, marginBottom: Spacing.sm },
  lastUpdated: { ...Typography.finePrint, color: Colors.inkMuted48, marginBottom: Spacing.lg },
  mission: {
    ...Typography.displayLg,
    color: Colors.primary,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
    lineHeight: 38,
  },
  badge: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.successBg,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  badgeText: { ...Typography.body, color: Colors.success, textAlign: 'center' },
  versionBadge: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.canvasParchment,
    borderRadius: Radii.md,
  },
  versionText: { ...Typography.caption, color: Colors.inkMuted48 },
});
