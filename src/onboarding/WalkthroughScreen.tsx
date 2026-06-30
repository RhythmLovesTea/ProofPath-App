import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Radii } from '../shared/theme';

const SLIDES = [
  {
    icon: 'qrcode',
    headline: 'Share securely',
    tagline: 'Show your QR to employers and hospitals.',
    taglineLocal: 'Verified offline. No internet required.',
    taglineLocalSecondary: 'बिना इंटरनेट के सत्यापित करें।',
    bg: '#0058bc',
    accentColor: Colors.canvas,
  },
];

export const WalkthroughScreen = ({ navigation }: any) => {
  const [step] = useState(0);
  const slide = SLIDES[step];
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  const handleNext = () => {
    navigation.navigate('NamePhoneEntry');
  };

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
  const floatScale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
    <View style={[styles.root, { backgroundColor: slide.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={slide.bg} />

      <View pointerEvents="none" style={styles.ambientLayer}>
        <Animated.View
          style={[
            styles.ambientBlob,
            {
              transform: [{ translateY: floatY }, { scale: floatScale }],
            },
          ]}
        />
      </View>
      <View pointerEvents="none" style={styles.topGlow} />

      <View style={styles.page}>
        <View style={styles.spacer} />

        <View style={styles.body}>
          <View style={styles.iconCircle}>
            <Icon name={slide.icon} size={62} color="#0058bc" />
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.headline}>{slide.headline}</Text>
            <Text style={styles.tagline}>{slide.tagline}</Text>
            <View style={styles.microcopy}>
              <Text style={styles.taglineLocal}>{slide.taglineLocal}</Text>
              <Text style={styles.taglineLocalSecondary}>{slide.taglineLocalSecondary}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.dotsRow} accessibilityLabel="Step 1 of 3">
            <View style={styles.dotActive} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel="Get Started"
          >
            <Text style={styles.nextBtnText}>Get Started</Text>
            <Icon name="arrow-right" size={22} color={Colors.canvas} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0058bc' },
  ambientLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientBlob: {
    width: Dimensions.get('window').width * 1.2,
    height: Dimensions.get('window').width * 1.2,
    borderRadius: 9999,
    backgroundColor: '#adc6ff',
    opacity: 0.2,
    shadowColor: '#adc6ff',
    shadowOpacity: 0.4,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 48, paddingBottom: 32 },
  spacer: { flex: 1 },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: Colors.canvas,
    shadowColor: 'rgba(0,0,0,0.18)',
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  headline: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.8,
    textAlign: 'center',
    color: Colors.canvas,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
    textAlign: 'center',
    color: '#d8e2ff',
    marginTop: 10,
  },
  microcopy: {
    marginTop: 18,
    gap: 4,
  },
  taglineLocal: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    color: '#d8e2ff',
    opacity: 0.9,
  },
  taglineLocalSecondary: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    color: '#d8e2ff',
    opacity: 0.7,
  },
  copyBlock: { paddingHorizontal: 16 },
  footer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingBottom: 8,
    gap: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.canvas,
    opacity: 0.3,
  },
  dotActive: {
    width: 32,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.canvas,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111928',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    minHeight: 58,
    overflow: 'hidden',
  },
  nextBtnText: { fontSize: 18, fontWeight: '700', color: Colors.canvas, letterSpacing: -0.2 },
});
