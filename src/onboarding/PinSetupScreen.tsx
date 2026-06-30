import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radii, Typography } from '../shared/theme';

export const PinSetupScreen = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();

  const handleSavePin = async () => {
    if (pin.length !== 4) { setError('PIN must be 4 digits'); return; }
    try {
      await EncryptedStorage.setItem('user_pin', pin);
      navigation.navigate('ProofPathID');
    } catch (e) {
      setError('Could not save PIN. Please try again.');
    }
  };

  const handleKey = (key: string) => {
    setError('');
    if (key === 'DEL') {
      setPin(p => p.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(p => p + key);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvasParchment} />

      <View style={styles.logoWrap}>
        <Icon name="lock-outline" size={44} color={Colors.primaryOnDark} />
      </View>
      <Text style={styles.headline}>Create a 4-Digit PIN</Text>
      <Text style={styles.sub}>This PIN protects your wallet and identity data.</Text>

      {/* PIN dots */}
      <View style={styles.dotsRow} accessibilityLabel={`${pin.length} digits entered`}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[styles.dot, i < pin.length && styles.dotFilled]}
            accessibilityElementsHidden
          />
        ))}
      </View>

      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
      ) : null}

      {/* Keypad */}
      <View style={styles.keypad}>
        {['1','2','3','4','5','6','7','8','9','','0','DEL'].map((key, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.key, key === '' && { opacity: 0, pointerEvents: 'none' }]}
            onPress={() => key && handleKey(key)}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={key === 'DEL' ? 'Delete' : key}
            disabled={!key}
          >
            {key === 'DEL' ? (
              <Icon name="backspace-outline" size={22} color={Colors.onDark} />
            ) : (
              <Text style={styles.keyText}>{key}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.confirmBtn, pin.length !== 4 && { opacity: 0.4 }]}
        onPress={handleSavePin}
        disabled={pin.length !== 4}
        accessibilityRole="button"
        accessibilityLabel="Confirm PIN"
      >
        <Text style={styles.confirmBtnText}>Confirm PIN</Text>
        <Icon name="arrow-right" size={18} color={Colors.onPrimary} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.canvasParchment,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  logoWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
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
    marginBottom: Spacing.lg,
  },
  headline: { fontSize: 32, lineHeight: 36, fontWeight: '700', color: Colors.ink, letterSpacing: -0.8, marginBottom: 8, textAlign: 'center' },
  sub: { ...Typography.body, color: Colors.bodyMuted, marginBottom: Spacing.xl, textAlign: 'center', fontSize: 16, lineHeight: 24, maxWidth: 320 },
  dotsRow: { flexDirection: 'row', gap: 20, marginBottom: Spacing.sm },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.hairline,
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  errorText: { ...Typography.caption, color: Colors.error, marginBottom: Spacing.md },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 288,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  key: {
    width: 96,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontSize: 28, fontWeight: '400', color: Colors.ink },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    minHeight: 58,
  },
  confirmBtnText: { color: Colors.onPrimary, fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
});
