import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDBConnection } from '../../shared/db/schema';
import { computeTrustScore, tierColor, TrustTier } from './walletUtils';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

type BreakdownKey = 'evidence' | 'ngoVerified' | 'witnessStatements' | 'communityVouches' | 'ngoVouches';

const RULES = [
  { key: 'evidence' as BreakdownKey, icon: 'file-document-outline', label: '1 evidence item', pts: '10 pts each', color: '#3b82f6' },
  { key: 'ngoVerified' as BreakdownKey, icon: 'check-decagram', label: 'NGO-verified evidence', pts: '+15 pts each', color: '#059669' },
  { key: 'witnessStatements' as BreakdownKey, icon: 'account-voice', label: 'Witness statement', pts: '+10 pts each', color: '#7c3aed' },
  { key: 'communityVouches' as BreakdownKey, icon: 'account-group-outline', label: 'Community vouch', pts: '+5 pts each', color: '#d97706' },
  { key: 'ngoVouches' as BreakdownKey, icon: 'shield-account', label: 'NGO worker vouch', pts: '+20 pts each', color: '#0066cc' },
];

const IMPROVEMENTS = [
  { icon: 'lightning-bolt', text: 'Add an electricity or water bill as address proof.' },
  { icon: 'briefcase', text: 'Get an employer letter or add an employment record.' },
  { icon: 'account-voice', text: 'Record a witness statement from a neighbour or co-worker.' },
  { icon: 'check-decagram', text: 'Visit a ProofPath camp so an NGO worker can verify your documents.' },
  { icon: 'account-group', text: 'Ask community members to vouch for your identity.' },
];

export const TrustScoreScreen = () => {
  const [score, setScore] = useState(0);
  const [tier, setTier] = useState<TrustTier>('Unverified');
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const db = await getDBConnection();
        const [evRes, weRes, voRes] = await Promise.all([
          db.executeSql(`SELECT * FROM evidence_items`),
          db.executeSql(`SELECT * FROM wallet_entries`),
          db.executeSql(`SELECT * FROM trust_vouches`),
        ]);
        const ev: any[] = [], we: any[] = [], vo: any[] = [];
        for (let i = 0; i < evRes[0].rows.length; i++) ev.push(evRes[0].rows.item(i));
        for (let i = 0; i < weRes[0].rows.length; i++) we.push(weRes[0].rows.item(i));
        for (let i = 0; i < voRes[0].rows.length; i++) vo.push(voRes[0].rows.item(i));

        const { score: s, tier: t, breakdown: b } = computeTrustScore(ev, we, vo);
        setScore(s);
        setTier(t);
        setBreakdown(b);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const tierC = tierColor(tier);
  const tierThresholds = [
    { label: 'Unverified', min: 0, max: 49, color: Colors.inkMuted48 },
    { label: 'Community Verified', min: 50, max: 79, color: Colors.badgeGold },
    { label: 'NGO Verified', min: 80, max: 100, color: Colors.badgeGreen },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Score hero */}
      <View style={styles.scoreHero}>
        <Text style={styles.scoreNumber}>{score}</Text>
        <Text style={styles.scoreLabel}>out of 100</Text>
        <View style={[styles.tierPill, { backgroundColor: tierC + '22', borderColor: tierC }]}>
          <Text style={[styles.tierText, { color: tierC }]}>{tier}</Text>
        </View>

        {/* Score bar */}
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${score}%` as any, backgroundColor: tierC }]} />
          <View style={[styles.threshold50, { left: '50%' as any }]} />
          <View style={[styles.threshold80, { left: '80%' as any }]} />
        </View>
        <View style={styles.thresholdLabels}>
          <Text style={styles.thresholdText}>0</Text>
          <Text style={[styles.thresholdText, { position: 'absolute', left: '46%' }]}>50 ⟶ Community</Text>
          <Text style={[styles.thresholdText, { position: 'absolute', left: '76%' }]}>80 ⟶ NGO</Text>
        </View>
      </View>

      {/* How it's computed */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How Your Score is Computed</Text>
        {RULES.map(rule => {
          const earned = breakdown[rule.key] || 0;
          return (
            <View key={rule.key} style={styles.ruleRow}>
              <View style={[styles.ruleIcon, { backgroundColor: rule.color + '20' }]}>
                <Icon name={rule.icon} size={20} color={rule.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleLabel}>{rule.label}</Text>
                <Text style={[styles.rulePts, { color: rule.color }]}>{rule.pts}</Text>
              </View>
              <View style={styles.earnedBadge}>
                <Text style={styles.earnedText}>{earned} pts</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Tier thresholds */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trust Tiers</Text>
        {tierThresholds.map(t => (
          <View key={t.label} style={[styles.tierRow, tier === t.label && { backgroundColor: t.color + '12', borderColor: t.color }]}>
            <Icon
              name={t.label === 'NGO Verified' ? 'shield-check' : t.label === 'Community Verified' ? 'account-group-outline' : 'account-outline'}
              size={22}
              color={t.color}
            />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[styles.tierName, { color: t.color }]}>{t.label}</Text>
              <Text style={styles.tierRange}>{t.min}–{t.max} points</Text>
            </View>
            {tier === t.label && <Icon name="check-circle" size={18} color={t.color} />}
          </View>
        ))}
      </View>

      {/* How to improve */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Improve Your Score</Text>
        {IMPROVEMENTS.map((item, i) => (
          <View key={i} style={styles.improveRow}>
            <View style={styles.improveDot}>
              <Icon name={item.icon} size={16} color={Colors.primary} />
            </View>
            <Text style={styles.improveText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvasParchment },

  scoreHero: {
    backgroundColor: Colors.canvas,
    padding: Spacing.xl,
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerSoft,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: -2,
    lineHeight: 80,
  },
  scoreLabel: { ...Typography.caption, color: Colors.bodyMuted, marginBottom: Spacing.sm },
  tierPill: {
    borderRadius: Radii.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginBottom: Spacing.lg,
  },
  tierText: { ...Typography.captionStrong },
  barBg: {
    width: '100%',
    height: 10,
    backgroundColor: Colors.hairline,
    borderRadius: 5,
    overflow: 'visible',
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    minWidth: 8,
  },
  threshold50: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 18,
    backgroundColor: Colors.bodyMuted + '77',
  },
  threshold80: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 18,
    backgroundColor: Colors.bodyMuted + '77',
  },
  thresholdLabels: {
    width: '100%',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  thresholdText: { ...Typography.finePrint, color: Colors.bodyMuted },

  section: {
    backgroundColor: Colors.canvas,
    margin: Spacing.lg,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  sectionTitle: { ...Typography.tagline, marginBottom: Spacing.md },

  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  ruleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleLabel: { ...Typography.body, marginBottom: 1 },
  rulePts: { ...Typography.captionStrong },
  earnedBadge: {
    backgroundColor: Colors.canvasParchment,
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  earnedText: { ...Typography.captionStrong, color: Colors.inkMuted80 },

  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.sm,
    marginBottom: 8,
  },
  tierName: { ...Typography.bodyStrong },
  tierRange: { ...Typography.finePrint },

  improveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  improveDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  improveText: { ...Typography.body, flex: 1 },
});
