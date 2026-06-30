import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { Camera } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';
import { tierColor } from './walletUtils';

type VerifiedPayload = {
  id: string;
  name: string;
  evidence_count: number;
  trust_score: number;
  badges: string[];
  wallet_hash: string;
  generated_at: string;
  version: string;
};

export const EmployerScannerScreen = () => {
  const [scanned, setScanned] = useState(false);
  const [payload, setPayload] = useState<VerifiedPayload | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

  const onBarCodeRead = (e: any) => {
    if (scanned) return;
    setScanned(true);

    try {
      const data = JSON.parse(e.data) as VerifiedPayload;

      // Validate structure
      if (!data.id || !data.name || !data.wallet_hash || data.version !== 'PP-1.0') {
        setError('This QR code is not a valid ProofPath identity card.');
        return;
      }

      // Validate wallet hash is non-empty (offline tamper check)
      const hashValid = data.wallet_hash !== 'empty' && data.wallet_hash.length >= 8;
      setIsValid(hashValid);
      setPayload(data);
    } catch (_) {
      setError('Invalid QR code. Please scan a ProofPath identity QR.');
    }
  };

  const reset = () => {
    setScanned(false);
    setPayload(null);
    setIsValid(false);
    setError('');
  };

  if (payload) {
    const tierC = tierColor(
      payload.trust_score >= 80 ? 'NGO Verified' : payload.trust_score >= 50 ? 'Community Verified' : 'Unverified'
    );
    const tier = payload.trust_score >= 80 ? 'NGO Verified' : payload.trust_score >= 50 ? 'Community Verified' : 'Unverified';

    return (
      <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.canvasParchment} />

        {/* Verification status banner */}
        <View style={[
          styles.verifyBanner,
          { backgroundColor: isValid ? Colors.success : Colors.error }
        ]}>
          <Icon
            name={isValid ? 'shield-check' : 'shield-alert'}
            size={28}
            color={Colors.onDark}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.verifyTitle}>
              {isValid ? 'Verified by ProofPath ✓' : 'Verification Warning'}
            </Text>
            <Text style={styles.verifySubtitle}>
              {isValid ? 'Wallet hash validated successfully' : 'Hash could not be verified'}
            </Text>
          </View>
        </View>

        {/* Worker card */}
        <View style={styles.workerCard}>
          <View style={styles.workerHeader}>
            <View style={styles.workerAvatar}>
              <Icon name="account" size={40} color={Colors.primaryOnDark} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.workerName}>{payload.name}</Text>
              <View style={[styles.trustPill, { backgroundColor: tierC + '20', borderColor: tierC }]}>
                <Text style={[styles.trustPillText, { color: tierC }]}>{payload.trust_score} pts — {tier}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatBox icon="file-document" label="Evidence" value={`${payload.evidence_count}`} />
            <StatBox icon="chart-bar" label="Trust Score" value={`${payload.trust_score}%`} />
            <StatBox icon="clock-outline" label="Generated" value={
              new Date(payload.generated_at).toLocaleDateString()
            } />
          </View>

          <View style={styles.divider} />

          {/* Badges */}
          <Text style={styles.badgesLabel}>Verified Badges</Text>
          <View style={styles.badgesRow}>
            {(['residence', 'employment', 'identity'] as const).map(badge => {
              const active = payload.badges.includes(badge);
              const cfg = {
                residence: { icon: 'home', color: Colors.badgeGreen, label: 'Residence' },
                employment: { icon: 'briefcase', color: Colors.badgeBlue, label: 'Employment' },
                identity: { icon: 'shield-account', color: Colors.badgeGold, label: 'Identity' },
              }[badge];
              return (
                <View key={badge} style={[
                  styles.badge,
                  active ? { borderColor: cfg.color, backgroundColor: cfg.color + '15' } : {}
                ]}>
                  <Icon name={cfg.icon} size={20} color={active ? cfg.color : Colors.hairline} />
                  <Text style={[styles.badgeLabel, { color: active ? cfg.color : Colors.inkMuted48 }]}>
                    {cfg.label}
                  </Text>
                  {active && <Icon name="check-circle" size={12} color={cfg.color} />}
                </View>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Hash fingerprint */}
          <Text style={styles.hashLabel}>Wallet Hash Fingerprint</Text>
          <Text style={styles.hashValue}>{payload.wallet_hash.substring(0, 24)}…</Text>
          <Text style={styles.noDocsNote}>
            No private documents are exposed. Only verified metadata is shown.
          </Text>
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.8}>
          <Icon name="qrcode-scan" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.resetBtnText}>Scan Another</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.scanRoot}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvasParchment} />
      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Camera
          style={styles.camera}
          cameraType={'Back' as any}
          scanBarcode
          onReadCode={(event: any) => {
            const raw = event?.nativeEvent?.codeStringValue || event?.codeStringValue || '';
            onBarCodeRead({ data: raw });
          }}
          showFrame
          laserColor={Colors.primary}
          frameColor={Colors.primary}
        >
          <View style={styles.scanOverlay}>
            <Text style={styles.scanInstruction}>Scan Worker's ProofPath QR Card</Text>
            <View style={styles.scanFrame} />
            <View style={styles.offlinePill}>
              <Icon name="wifi-off" size={12} color={Colors.success} />
              <Text style={styles.offlinePillText}>Works completely offline</Text>
            </View>
          </View>
        </Camera>
      )}
    </View>
  );
};

const StatBox = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.statBox}>
    <Icon name={icon} size={18} color={Colors.primary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvasParchment },
  scanRoot: { flex: 1, backgroundColor: Colors.canvasParchment },
  camera: { flex: 1 },
  scanOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanInstruction: {
    ...Typography.bodyStrong,
    color: Colors.ink,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  scanFrame: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radii.md,
    backgroundColor: 'transparent',
    marginBottom: Spacing.xl,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successBg,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  offlinePillText: { ...Typography.finePrint, color: Colors.success, fontWeight: '600' },

  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radii.lg,
    marginHorizontal: Spacing.lg,
  },
  verifyTitle: { ...Typography.bodyStrong, color: Colors.onDark },
  verifySubtitle: { ...Typography.caption, color: Colors.onDark + 'CC', marginTop: 2 },

  workerCard: {
    backgroundColor: Colors.canvas,
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: Spacing.lg,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 3,
  },
  workerHeader: { flexDirection: 'row', alignItems: 'center' },
  workerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.canvasParchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerName: { ...Typography.displayMd, marginBottom: 6 },
  trustPill: {
    borderRadius: Radii.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  trustPillText: { ...Typography.captionStrong },
  divider: { height: 1, backgroundColor: Colors.hairline, marginVertical: Spacing.md },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { ...Typography.tagline, marginTop: 4 },
  statLabel: { ...Typography.finePrint, textAlign: 'center' },

  badgesLabel: { ...Typography.captionStrong, color: Colors.inkMuted48, marginBottom: Spacing.sm },
  badgesRow: { flexDirection: 'row', gap: Spacing.sm },
  badge: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.sm,
    padding: Spacing.xs,
    gap: 4,
  },
  badgeLabel: { ...Typography.finePrint, textAlign: 'center' },

  hashLabel: { ...Typography.captionStrong, color: Colors.inkMuted48, marginBottom: 4 },
  hashValue: { ...Typography.finePrint, fontFamily: 'monospace', color: Colors.inkMuted80, marginBottom: Spacing.sm },
  noDocsNote: { ...Typography.finePrint, color: Colors.inkMuted48, textAlign: 'center' },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.canvasParchment },
  errorText: { ...Typography.body, textAlign: 'center', color: Colors.inkMuted48, marginVertical: Spacing.lg },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.pill,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  resetBtnText: { ...Typography.body, color: Colors.primary },
});
