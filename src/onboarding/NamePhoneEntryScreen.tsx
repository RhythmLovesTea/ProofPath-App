import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppStore } from '../shared/store';
import { Colors, Spacing, Radii, Typography } from '../shared/theme';

export const NamePhoneEntryScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState<'name' | 'phone' | null>(null);
  const setBeneficiaryInfo = useAppStore(state => state.setBeneficiaryInfo);

  const handleNext = () => {
    if (!name.trim()) return;
    setBeneficiaryInfo(name.trim(), phone.trim());
    navigation.navigate('PinSetup');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvasParchment} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Icon name="account-outline" size={40} color={Colors.primaryOnDark} />
          </View>
          <Text style={styles.headline}>Tell us about yourself</Text>
          <Text style={styles.sub}>
            Only your first name is required.{'\n'}No government ID needed.
          </Text>
        </View>

        {/* No Aadhaar badge */}
        <View style={styles.badge} accessibilityRole="text">
          <Icon name="shield-check" size={16} color={Colors.success} />
          <Text style={styles.badgeText}>NO Aadhaar required</Text>
        </View>

        {/* Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>Your name *</Text>
          <View style={[styles.inputWrap, focused === 'name' && styles.inputWrapFocused]}>
            <Icon name="account" size={20} color={focused === 'name' ? Colors.primary : Colors.inkMuted48} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="First name or nickname"
              placeholderTextColor={Colors.inkMuted48}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              autoCapitalize="words"
              accessibilityLabel="Your name"
            />
          </View>

          <Text style={styles.label}>Phone number (optional)</Text>
          <View style={[styles.inputWrap, focused === 'phone' && styles.inputWrapFocused]}>
            <Icon name="phone" size={20} color={focused === 'phone' ? Colors.primary : Colors.inkMuted48} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit mobile number"
              placeholderTextColor={Colors.inkMuted48}
              keyboardType="phone-pad"
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
              accessibilityLabel="Phone number"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, !name.trim() && { opacity: 0.4 }]}
          onPress={handleNext}
          disabled={!name.trim()}
          accessibilityRole="button"
          accessibilityLabel="Continue to PIN setup"
        >
          <Text style={styles.nextBtnText}>Continue</Text>
          <Icon name="arrow-right" size={18} color={Colors.onPrimary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <Text style={styles.privacy}>
          Your data stays on your device. We never sell or share it.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvasParchment },
  scroll: { flexGrow: 1, padding: Spacing.lg, justifyContent: 'center' },

  header: { alignItems: 'center', marginBottom: Spacing.lg },
  iconCircle: {
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
    marginBottom: Spacing.md,
  },
  headline: { fontSize: 32, lineHeight: 36, fontWeight: '700', color: Colors.ink, letterSpacing: -0.8, textAlign: 'center', marginBottom: 8 },
  sub: { ...Typography.body, color: Colors.bodyMuted, textAlign: 'center', fontSize: 16, lineHeight: 24 },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.success + '22',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    marginBottom: Spacing.lg,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.success + '44',
  },
  badgeText: { ...Typography.bodyStrong, color: Colors.success },

  form: { marginBottom: Spacing.lg },
  label: { ...Typography.captionStrong, color: Colors.bodyMuted, marginBottom: 8, marginTop: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderWidth: 1,
    borderColor: Colors.dividerSoft,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    marginBottom: Spacing.md,
    gap: 12,
    minHeight: 58,
  },
  inputWrapFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '06',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: Colors.ink,
    letterSpacing: -0.374,
    fontWeight: '400',
  },

  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xl,
    minHeight: 58,
    marginBottom: Spacing.md,
  },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: Colors.onPrimary, letterSpacing: -0.2 },

  privacy: { ...Typography.finePrint, color: Colors.inkMuted48, textAlign: 'center' },
});
