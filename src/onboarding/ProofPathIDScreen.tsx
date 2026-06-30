import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Defs, LinearGradient, Rect, Stop, Ellipse, Circle } from 'react-native-svg';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useAppStore } from '../shared/store';
import { Colors, Spacing, Radii, Typography } from '../shared/theme';

const STATE_CODES = ['MH', 'DL', 'UP', 'WB', 'TN', 'KA', 'GJ', 'RJ', 'MP', 'AP'];

const generateProofPathId = (state?: string) => {
  const stateCode = state || STATE_CODES[Math.floor(Math.random() * STATE_CODES.length)];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random8 = '';

  for (let i = 0; i < 8; i += 1) {
    random8 += chars[Math.floor(Math.random() * chars.length)];
  }

  return `PP-${stateCode}-${random8}`;
};

interface Props {
  onContinue: () => void;
}

export const ProofPathIDScreen: React.FC<Props> = ({ onContinue }) => {
  const [ppId, setPpId] = useState('');
  const [copied, setCopied] = useState(false);
  const { beneficiaryName } = useAppStore();
  const { height } = useWindowDimensions();

  useEffect(() => {
    const initId = async () => {
      try {
        const existing = await EncryptedStorage.getItem('proofpath_id');
        if (existing) {
          setPpId(existing);
          return;
        }

        const newId = generateProofPathId();
        await EncryptedStorage.setItem('proofpath_id', newId);
        setPpId(newId);
      } catch (_) {
        setPpId(generateProofPathId());
      }
    };

    initId();
  }, []);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(timer);
  }, [copied]);

  const idSegments = useMemo(() => {
    if (!ppId) return ['PP', '--', '--------'];
    return ppId.split('-');
  }, [ppId]);

  const handleCopy = () => {
    if (!ppId) return;
    Clipboard.setString(ppId);
    setCopied(true);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvasParchment} />

      <Svg pointerEvents="none" style={styles.backgroundSvg} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="proofpathBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#EAF4FF" stopOpacity="1" />
            <Stop offset="52%" stopColor="#F8FBFD" stopOpacity="1" />
            <Stop offset="100%" stopColor="#F5EDFF" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="proofpathCard" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.94" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.72" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#proofpathBg)" />
        <Circle cx="12%" cy="4%" r="160" fill="#CFE6FF" fillOpacity="0.28" />
        <Ellipse cx="95%" cy="92%" rx="180" ry="120" fill="#E4D1FF" fillOpacity="0.26" />
        <Ellipse cx="20%" cy="78%" rx="130" ry="95" fill="#FFFFFF" fillOpacity="0.18" />
      </Svg>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { minHeight: Math.max(height, 780) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <View style={styles.topSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Icon name="account" size={34} color="#A7B4C4" />
              </View>
            </View>
            <Text style={styles.headline}>Your ProofPath ID</Text>
            <Text style={styles.greeting}>Welcome, {beneficiaryName || 'friend'}!</Text>
          </View>

          <View style={styles.idCardShell}>
            <Svg pointerEvents="none" style={styles.cardBg} width="100%" height="100%" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="proofpathCardFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
                  <Stop offset="100%" stopColor="#FFFDFD" stopOpacity="0.84" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" rx="24" ry="24" fill="url(#proofpathCardFill)" />
            </Svg>

            <View style={styles.idCard}>
              <Text style={styles.idLabel}>YOUR UNIQUE ID</Text>

              <View style={styles.idDisplayWrap}>
                <Text style={styles.idTextLine}>{idSegments[0]} - {idSegments[1]} - {idSegments[2]}</Text>
              </View>

              <TouchableOpacity
                style={[styles.copyBtn, copied && styles.copyBtnActive]}
                onPress={handleCopy}
                accessibilityRole="button"
                accessibilityLabel="Copy ProofPath ID to clipboard"
                activeOpacity={0.85}
              >
                <Icon
                  name={copied ? 'check' : 'content-copy'}
                  size={16}
                  color={copied ? Colors.primary : '#5E8FD6'}
                  style={{ marginRight: 8 }}
                  accessibilityElementsHidden
                />
                <Text style={[styles.copyBtnText, copied && styles.copyBtnTextActive]}>
                  {copied ? 'Copied' : 'Copy ID'}
                </Text>
              </TouchableOpacity>

              <View style={styles.explanationBox}>
                <View style={styles.explanationIcon}>
                  <Icon name="account-group-outline" size={16} color="#5E8FD6" />
                </View>
                <Text style={styles.explanation}>
                  Share this ID with your NGO worker so they can link your camp registration and evidence to you.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footerSection}>
            <View style={styles.taglineBox}>
              <Text style={styles.taglineEn}>Your identity. Your rights.</Text>
              <Text style={styles.taglineHi}>आपकी पहचान। आपके अधिकार।</Text>
            </View>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to ProofPath"
              activeOpacity={0.9}
            >
              <Text style={styles.continueBtnText}>Enter ProofPath</Text>
              <Icon name="arrow-right" size={18} color={Colors.onPrimary} style={{ marginLeft: 10 }} accessibilityElementsHidden />
            </TouchableOpacity>

            <Text style={styles.footnote}>No Aadhaar required. No government ID stored.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.canvasParchment,
  },
  backgroundSvg: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 18,
    paddingBottom: 28,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  avatarWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#98B6D8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F7FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  greeting: {
    ...Typography.body,
    color: Colors.bodyMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  idCardShell: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    shadowColor: '#C7D8EE',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 5,
    marginBottom: 28,
  },
  cardBg: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  idCard: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    overflow: 'hidden',
  },
  idLabel: {
    ...Typography.captionStrong,
    color: '#6A7482',
    letterSpacing: 1.6,
    marginBottom: 14,
    textAlign: 'center',
  },
  idDisplayWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    minHeight: 92,
  },
  idTextLine: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: 3.2,
    lineHeight: 38,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF5FF',
    borderWidth: 1,
    borderColor: '#D7E6FA',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 9,
    minHeight: 40,
    marginBottom: 14,
  },
  copyBtnActive: {
    backgroundColor: '#EAF6EE',
    borderColor: '#CBE8D4',
  },
  copyBtnText: {
    color: '#5E8FD6',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  copyBtnTextActive: {
    color: Colors.primary,
  },
  explanationBox: {
    width: '100%',
    backgroundColor: 'rgba(245, 248, 252, 0.96)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(208, 221, 236, 0.95)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  explanationIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E7F0FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 10,
  },
  explanation: {
    ...Typography.caption,
    flex: 1,
    color: '#66717F',
    lineHeight: 18,
  },
  footerSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 2,
  },
  taglineBox: {
    alignItems: 'center',
    marginBottom: 18,
  },
  taglineEn: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  taglineHi: {
    ...Typography.body,
    color: Colors.bodyMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  continueBtn: {
    width: '100%',
    maxWidth: 360,
    minHeight: 56,
    borderRadius: 22,
    backgroundColor: '#0E74D8',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#0E74D8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 4,
  },
  continueBtnText: {
    color: Colors.onPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  footnote: {
    ...Typography.caption,
    color: Colors.inkMuted48,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
  },
});
