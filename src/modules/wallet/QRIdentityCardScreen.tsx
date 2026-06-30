import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
// @ts-ignore
import KeepAwake from 'react-native-keep-awake';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';
import { tierColor } from './walletUtils';

export const QRIdentityCardScreen = () => {
  const route = useRoute<any>();
  const viewShotRef = useRef<any>(null);

  const {
    beneficiaryName = 'Ramu',
    evidenceCount = 0,
    trustScore = 0,
    tier = 'Unverified',
    badges = { residence: false, employment: false, identity: false },
    walletHash = '',
  } = route.params || {};

  const qrPayload = JSON.stringify({
    id: 'ben_' + Date.now(),
    name: beneficiaryName,
    evidence_count: evidenceCount,
    trust_score: trustScore,
    badges: Object.entries(badges).filter(([_, v]) => v).map(([k]) => k),
    wallet_hash: walletHash,
    generated_at: new Date().toISOString(),
    version: 'PP-1.0',
  });

  const tierC = tierColor(tier);

  const saveToGallery = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied');
          return;
        }
      }

      const uri = await viewShotRef.current?.capture();
      if (!uri) return;

      const destPath = `${RNFS.DownloadDirectoryPath}/ProofPath_ID_${Date.now()}.png`;
      await RNFS.copyFile(uri.replace('file://', ''), destPath);
      Alert.alert('Saved!', `Identity QR saved to Downloads.`);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save QR image.');
    }
  };

  return (
    <View style={styles.root}>
      <KeepAwake />
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvasParchment} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={styles.card}>
          {/* Card header */}
          <View style={styles.cardHeader}>
            <View style={styles.logoMark}>
              <Icon name="shield-check" size={20} color={Colors.primaryOnDark} />
            </View>
            <Text style={styles.cardTitle}>ProofPath Identity</Text>
            <Text style={styles.cardVersion}>PP-1.0</Text>
          </View>

          {/* Name */}
          <Text style={styles.name}>{beneficiaryName}</Text>
          <Text style={styles.nameScript}>रामू · রামু</Text>

          {/* QR Code */}
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrPayload}
              size={220}
              color={Colors.surfaceBlack}
              backgroundColor={Colors.canvas}
              logoMargin={4}
            />
          </View>

          {/* Trust pill */}
          <View style={[styles.trustPill, { backgroundColor: tierC + '22', borderColor: tierC }]}>
            <Text style={[styles.trustPillScore, { color: tierC }]}>{trustScore} pts</Text>
            <View style={styles.trustDivider} />
            <Text style={[styles.trustPillLabel, { color: tierC }]}>{tier}</Text>
          </View>

          {/* Badges row */}
          <View style={styles.badgesRow}>
            <QRBadge icon="home" label="Residence" active={badges.residence} color={Colors.badgeGreen} />
            <QRBadge icon="briefcase" label="Employment" active={badges.employment} color={Colors.badgeBlue} />
            <QRBadge icon="shield-account" label="Identity" active={badges.identity} color={Colors.badgeGold} />
          </View>

          {/* Hash fingerprint */}
          <View style={styles.hashRow}>
            <Icon name="fingerprint" size={14} color={Colors.inkMuted48} />
            <Text style={styles.hashText} numberOfLines={1}>
              {walletHash ? walletHash.substring(0, 20) + '…' : 'No hash'}
            </Text>
          </View>

          {/* Footer note */}
          <Text style={styles.offlineNote}>This QR can be scanned without internet</Text>
        </ViewShot>

        {/* Evidence count */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{evidenceCount}</Text>
            <Text style={styles.statLabel}>Evidence Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{trustScore}%</Text>
            <Text style={styles.statLabel}>Trust Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="wifi-off" size={20} color={Colors.success} />
            <Text style={styles.statLabel}>Works Offline</Text>
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={saveToGallery} activeOpacity={0.85}>
          <Icon name="download" size={20} color={Colors.onPrimary} style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>Save QR to Gallery</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          This QR code encodes verified identity metadata only. No private documents are transmitted.
        </Text>
      </ScrollView>
    </View>
  );
};

const QRBadge = ({ icon, label, active, color }: { icon: string; label: string; active: boolean; color: string }) => (
  <View style={[styles.qrBadge, active ? { borderColor: color, backgroundColor: color + '15' } : {}]}>
    <Icon name={icon} size={18} color={active ? color : Colors.hairline} />
    <Text style={[styles.qrBadgeLabel, { color: active ? color : Colors.inkMuted48 }]}>{label}</Text>
    {active && <Icon name="check-circle" size={10} color={color} />}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvasParchment },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  card: {
    backgroundColor: Colors.canvas,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    width: '100%',
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cardTitle: { ...Typography.bodyStrong, color: Colors.ink, flex: 1 },
  cardVersion: { ...Typography.finePrint, color: Colors.inkMuted48 },

  name: { ...Typography.displayMd, color: Colors.ink, marginBottom: 4 },
  nameScript: { ...Typography.caption, color: Colors.inkMuted48, marginBottom: Spacing.md },

  qrWrapper: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: Colors.canvasParchment,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },

  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    marginBottom: Spacing.md,
    gap: 8,
  },
  trustPillScore: { ...Typography.bodyStrong },
  trustDivider: { width: 1, height: 16, backgroundColor: Colors.hairline },
  trustPillLabel: { ...Typography.captionStrong },

  badgesRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.md },
  qrBadge: {
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
    width: 80,
    gap: 3,
  },
  qrBadgeLabel: { ...Typography.finePrint, textAlign: 'center' },

  hashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
    width: '100%',
  },
  hashText: { ...Typography.finePrint, fontFamily: 'monospace', flex: 1 },

  offlineNote: {
    ...Typography.finePrint,
    color: Colors.inkMuted48,
    textAlign: 'center',
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.canvasParchment,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { ...Typography.displayMd, color: Colors.ink, marginBottom: 4 },
  statLabel: { ...Typography.finePrint, color: Colors.bodyMuted, textAlign: 'center' },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.inkMuted48 + '44' },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  saveBtnText: { color: Colors.onPrimary, fontSize: 17, fontWeight: '400', letterSpacing: -0.374 },

  disclaimer: { ...Typography.finePrint, color: Colors.inkMuted48, textAlign: 'center' },
});
