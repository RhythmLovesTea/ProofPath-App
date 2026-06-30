import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EncryptedStorage from 'react-native-encrypted-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import RNFS from 'react-native-fs';
import { getDBConnection } from '../../shared/db/schema';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

const rnBiometrics = new ReactNativeBiometrics();

export const WalletSecurityScreen = () => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    checkBiometrics();
    loadBiometricSetting();
  }, []);

  const checkBiometrics = async () => {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      setBiometricAvailable(available);
    } catch (_) {}
  };

  const loadBiometricSetting = async () => {
    try {
      const val = await EncryptedStorage.getItem('biometric_enabled');
      setBiometricEnabled(val === 'true');
    } catch (_) {}
  };

  const handleChangePin = async () => {
    if (!oldPin || !newPin || !confirmPin) {
      Alert.alert('Error', 'Please fill all PIN fields.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Error', 'New PIN and confirm PIN do not match.');
      return;
    }
    if (newPin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits.');
      return;
    }

    try {
      const storedPin = await EncryptedStorage.getItem('user_pin');
      if (storedPin !== oldPin) {
        Alert.alert('Incorrect PIN', 'The current PIN you entered is wrong.');
        return;
      }
      await EncryptedStorage.setItem('user_pin', newPin);
      setOldPin(''); setNewPin(''); setConfirmPin('');
      Alert.alert('Success', 'PIN changed successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to change PIN.');
    }
  };

  const toggleBiometric = async (enabled: boolean) => {
    if (enabled && !biometricAvailable) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
      return;
    }
    if (enabled) {
      try {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: 'Verify fingerprint to enable biometric unlock'
        });
        if (success) {
          await EncryptedStorage.setItem('biometric_enabled', 'true');
          setBiometricEnabled(true);
        }
      } catch (e) {
        Alert.alert('Error', 'Biometric verification failed.');
      }
    } else {
      await EncryptedStorage.setItem('biometric_enabled', 'false');
      setBiometricEnabled(false);
    }
  };

  const exportBackup = async () => {
    try {
      setSaving(true);
      const db = await getDBConnection();

      const [evRes, weRes, benRes] = await Promise.all([
        db.executeSql(`SELECT * FROM evidence_items`),
        db.executeSql(`SELECT * FROM wallet_entries`),
        db.executeSql(`SELECT * FROM beneficiaries`),
      ]);

      const evidence: any[] = [], entries: any[] = [], beneficiaries: any[] = [];
      for (let i = 0; i < evRes[0].rows.length; i++) evidence.push(evRes[0].rows.item(i));
      for (let i = 0; i < weRes[0].rows.length; i++) entries.push(weRes[0].rows.item(i));
      for (let i = 0; i < benRes[0].rows.length; i++) beneficiaries.push(benRes[0].rows.item(i));

      const payload = JSON.stringify({ version: 'PP-1.0', exported_at: Date.now(), beneficiaries, evidence, entries });

      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const fileName = `ProofPath_backup_${dateStr}.ppwallet`;
      const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      await RNFS.writeFile(destPath, payload, 'utf8');
      Alert.alert('Backup Saved', `Saved to Downloads as ${fileName}`);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Export failed.');
    } finally {
      setSaving(false);
    }
  };

  const deleteAllData = async () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently erase ALL your wallet data, evidence records, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDBConnection();
              const tables = ['evidence_items', 'wallet_entries', 'camp_registrations', 'beneficiaries', 'affidavits', 'audit_log'];
              for (const table of tables) {
                await db.executeSql(`DELETE FROM ${table}`);
              }
              await EncryptedStorage.clear();
              Alert.alert('Done', 'All data has been erased.');
            } catch (e) {
              Alert.alert('Error', 'Failed to delete data.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>

      {/* Change PIN */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="lock-reset" size={22} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Change PIN</Text>
        </View>
        <PinInput label="Current PIN" value={oldPin} onChange={setOldPin} />
        <PinInput label="New PIN" value={newPin} onChange={setNewPin} />
        <PinInput label="Confirm New PIN" value={confirmPin} onChange={setConfirmPin} />
        <TouchableOpacity style={styles.actionBtn} onPress={handleChangePin}>
          <Text style={styles.actionBtnText}>Update PIN</Text>
        </TouchableOpacity>
      </View>

      {/* Biometric */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="fingerprint" size={22} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Biometric Unlock</Text>
        </View>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Use fingerprint to unlock wallet</Text>
            {!biometricAvailable && (
              <Text style={styles.switchNote}>Not available on this device</Text>
            )}
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={toggleBiometric}
            trackColor={{ true: Colors.primary, false: Colors.hairline }}
            disabled={!biometricAvailable}
          />
        </View>
      </View>

      {/* Export */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="database-export-outline" size={22} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Backup & Export</Text>
        </View>
        <Text style={[Typography.body, { color: Colors.inkMuted48, marginBottom: Spacing.md }]}>
          Export all wallet data as a .ppwallet file saved to your device Downloads folder.
        </Text>
        <TouchableOpacity style={styles.actionBtn} onPress={exportBackup} disabled={saving}>
          <Icon name="download" size={18} color={Colors.onPrimary} style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>{saving ? 'Exporting…' : 'Export Backup'}</Text>
        </TouchableOpacity>
      </View>

      {/* Danger zone */}
      <View style={[styles.section, styles.dangerSection]}>
        <View style={styles.sectionHeader}>
          <Icon name="alert-octagon-outline" size={22} color={Colors.error} />
          <Text style={[styles.sectionTitle, { color: Colors.error }]}>Danger Zone</Text>
        </View>
        <Text style={[Typography.body, { color: Colors.inkMuted48, marginBottom: Spacing.md }]}>
          Permanently delete all your ProofPath data from this device. This cannot be undone.
        </Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={deleteAllData}>
          <Icon name="trash-can-outline" size={18} color={Colors.error} style={{ marginRight: 6 }} />
          <Text style={styles.deleteBtnText}>Delete All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const PinInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <RNTextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      secureTextEntry
      keyboardType="number-pad"
      maxLength={8}
      placeholderTextColor={Colors.inkMuted48}
      placeholder="••••"
    />
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvasParchment },
  section: {
    backgroundColor: Colors.canvas,
    margin: Spacing.lg,
    marginBottom: 0,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  dangerSection: {
    borderColor: Colors.error + '44',
    backgroundColor: Colors.errorBg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.md },
  sectionTitle: { ...Typography.tagline },
  fieldLabel: { ...Typography.captionStrong, color: Colors.inkMuted80, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    ...Typography.body,
    height: 44,
    backgroundColor: Colors.canvasParchment,
    letterSpacing: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  switchLabel: { ...Typography.body, flex: 1 },
  switchNote: { ...Typography.finePrint, color: Colors.inkMuted48 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
  },
  actionBtnText: { color: Colors.onPrimary, fontSize: 15, fontWeight: '400' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.pill,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  deleteBtnText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
});
