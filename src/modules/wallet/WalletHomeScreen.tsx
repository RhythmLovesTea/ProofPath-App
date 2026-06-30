import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { getDBConnection } from '../../shared/db/schema';
import { useAppStore } from '../../shared/store';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';
import {
  computeTrustScore,
  computeBadges,
  computeWalletHash,
  tierColor,
  TrustTier,
  BadgeStatus,
} from './walletUtils';

type WalletEntry = {
  id: string;
  entry_type: string;
  data_json: string;
  created_at: number;
  employer_signature: string;
};

export const WalletHomeScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { beneficiaryName, language } = useAppStore();

  const [evidenceItems, setEvidenceItems] = useState<any[]>([]);
  const [walletEntries, setWalletEntries] = useState<WalletEntry[]>([]);
  const [vouches, setVouches] = useState<any[]>([]);
  const [trustScore, setTrustScore] = useState(0);
  const [tier, setTier] = useState<TrustTier>('Unverified');
  const [badges, setBadges] = useState<BadgeStatus>({ residence: false, employment: false, identity: false });
  const [walletHash, setWalletHash] = useState('');
  const [hashIntegrity, setHashIntegrity] = useState<'valid' | 'warning' | 'pending'>('pending');

  const load = useCallback(async () => {
    try {
      const db = await getDBConnection();

      const [evRes, weRes, voRes] = await Promise.all([
        db.executeSql(`SELECT * FROM evidence_items ORDER BY created_at DESC`),
        db.executeSql(`SELECT * FROM wallet_entries ORDER BY created_at DESC`),
        db.executeSql(`SELECT * FROM trust_vouches`),
      ]);

      const ev: any[] = [];
      for (let i = 0; i < evRes[0].rows.length; i++) ev.push(evRes[0].rows.item(i));

      const we: WalletEntry[] = [];
      for (let i = 0; i < weRes[0].rows.length; i++) we.push(weRes[0].rows.item(i));

      const vo: any[] = [];
      for (let i = 0; i < voRes[0].rows.length; i++) vo.push(voRes[0].rows.item(i));

      setEvidenceItems(ev);
      setWalletEntries(we);
      setVouches(vo);

      const { score, tier: t } = computeTrustScore(ev, we, vo);
      setTrustScore(score);
      setTier(t);
      setBadges(computeBadges(ev, we));

      const hash = await computeWalletHash(ev);
      setWalletHash(hash);
      setHashIntegrity('valid');
    } catch (e) {
      console.error('Wallet load error', e);
      setHashIntegrity('warning');
    }
  }, []);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  const getEntryIcon = (type: string) => {
    const map: Record<string, string> = {
      'Employment Record': 'briefcase-outline',
      'Residence Proof': 'home-outline',
      'Skills Record': 'wrench-outline',
      'Medical Record': 'hospital-box-outline',
      'Education Record': 'school-outline',
      'Community Vouch': 'account-group-outline',
    };
    return map[type] || 'file-document-outline';
  };

  const renderEntry = ({ item }: { item: WalletEntry }) => {
    let title = item.entry_type;
    let subtitle = '';
    try {
      const d = JSON.parse(item.data_json);
      if (d.employer_name) subtitle = d.employer_name;
      else if (d.address) subtitle = d.address;
    } catch (_) {}

    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={styles.timelineLine} />
          <View style={[styles.timelineDot, { backgroundColor: Colors.primary }]}>
            <Icon name={getEntryIcon(item.entry_type)} size={14} color={Colors.onPrimary} />
          </View>
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>{title}</Text>
          {subtitle ? <Text style={styles.timelineSubtitle}>{subtitle}</Text> : null}
          <Text style={styles.timelineDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
          {item.employer_signature ? (
            <View style={styles.verifiedTag}>
              <Icon name="check-decagram" size={12} color={Colors.success} />
              <Text style={[styles.verifiedTagText, { color: Colors.success }]}>NGO Verified</Text>
            </View>
          ) : (
            <View style={styles.verifiedTag}>
              <Icon name="clock-outline" size={12} color={Colors.inkMuted48} />
              <Text style={[styles.verifiedTagText, { color: Colors.inkMuted48 }]}>Unverified</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const tierC = tierColor(tier);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surfaceBlack} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        <View style={styles.heroCard}>
          <Svg pointerEvents="none" style={styles.heroBg} width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="walletHero" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={Colors.primary} />
                <Stop offset="100%" stopColor={Colors.secondary} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#walletHero)" rx="20" ry="20" />
          </Svg>
          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{(beneficiaryName || 'R').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{beneficiaryName || 'Ramu'}</Text>
              {language !== 'en' && (
                <Text style={styles.heroNameLocal}>रामू</Text>
              )}
              <TouchableOpacity
                style={styles.trustBadge}
                onPress={() => navigation.navigate('TrustScore')}
                activeOpacity={0.7}
              >
                  <Text style={[styles.trustScore, { color: tierC }]}>{trustScore}</Text>
                  <Text style={[styles.trustLabel, { color: tierC }]}>{tier}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.integrityRow}>
            {hashIntegrity === 'valid' ? (
              <>
                <Icon name="shield-check" size={14} color={Colors.success} />
                <Text style={[styles.integrityText, { color: Colors.success }]}>Wallet Integrity: Valid</Text>
              </>
            ) : hashIntegrity === 'warning' ? (
              <>
                <Icon name="shield-alert" size={14} color={Colors.warning} />
                <Text style={[styles.integrityText, { color: Colors.warning }]}>Warning: Data may have been modified</Text>
              </>
            ) : (
              <Text style={[styles.integrityText, { color: Colors.inkMuted48 }]}>Verifying wallet…</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => navigation.navigate('QRIdentityCard', {
              beneficiaryName,
              evidenceCount: evidenceItems.length,
              trustScore,
              tier,
              badges,
              walletHash,
            })}
            activeOpacity={0.85}
          >
            <Icon name="qrcode" size={22} color={Colors.onPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.qrButtonText}>Show Identity QR</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgeRow}
        >
          <BadgeCard
            label="Residence"
            icon="home"
            active={badges.residence}
            activeColor={Colors.badgeGreen}
          />
          <BadgeCard
            label="Employment"
            icon="briefcase"
            active={badges.employment}
            activeColor={Colors.badgeBlue}
          />
          <BadgeCard
            label="Identity"
            icon="shield-account"
            active={badges.identity}
            activeColor={Colors.badgeGold}
          />
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence Timeline</Text>
          {walletEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🗂️</Text>
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.emptyText}>Tap Add Entry to begin.</Text>
            </View>
          ) : (
            walletEntries.map(item => renderEntry({ item }))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const BadgeCard = ({
  label, icon, active, activeColor
}: { label: string; icon: string; active: boolean; activeColor: string }) => (
  <View style={[
    styles.badgeCard,
    active ? { backgroundColor: Colors.canvas, borderColor: activeColor } : { borderStyle: 'dashed' as const, borderColor: Colors.hairline }
  ]}>
    <Icon name={icon} size={26} color={active ? activeColor : Colors.inkMuted48} />
    <Text style={[styles.badgeLabel, { color: active ? Colors.ink : Colors.inkMuted48 }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvasParchment },
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    margin: Spacing.lg,
    padding: 24,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarLetter: { fontSize: 26, fontWeight: '700', color: Colors.primary },
  heroInfo: { flex: 1 },
  heroName: { ...Typography.heroName, marginBottom: 4 },
  heroNameLocal: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xs,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    gap: 6,
  },
  trustScore: { fontSize: 18, fontWeight: '600', letterSpacing: -0.374 },
  trustLabel: { ...Typography.captionStrong },
  integrityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 6,
  },
  integrityText: { ...Typography.captionStrong },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.canvas,
    borderRadius: 14,
    height: 52,
    width: '100%',
  },
  qrButtonText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  badgeRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  badgeCard: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: Colors.canvas,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.sm,
    alignItems: 'center',
    marginRight: Spacing.xs,
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeLabel: { ...Typography.caption, marginTop: 8, textAlign: 'center' },
  section: { paddingHorizontal: Spacing.lg },
  sectionTitle: { ...Typography.cardTitle, marginBottom: Spacing.md, color: Colors.ink },
  timelineItem: { flexDirection: 'row', marginBottom: Spacing.lg },
  timelineLeft: { width: 36, alignItems: 'center' },
  timelineLine: {
    position: 'absolute',
    top: 28,
    bottom: -Spacing.lg,
    width: 2,
    backgroundColor: Colors.hairline,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
    marginLeft: Spacing.sm,
    backgroundColor: Colors.canvas,
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  timelineTitle: { ...Typography.bodyStrong, marginBottom: 2 },
  timelineSubtitle: { ...Typography.body, marginBottom: 2 },
  timelineDate: { ...Typography.finePrint, marginBottom: 4 },
  verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedTagText: { ...Typography.finePrint, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { ...Typography.cardTitle, marginBottom: 4, color: Colors.ink },
  emptyText: { ...Typography.body, color: Colors.inkMuted48, textAlign: 'center' },
});
