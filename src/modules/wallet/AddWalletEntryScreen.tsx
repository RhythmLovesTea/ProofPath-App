import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDBConnection } from '../../shared/db/schema';
import { computeWalletHash } from './walletUtils';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

const ENTRY_TYPES = [
  { label: 'Employment Record', icon: 'briefcase' },
  { label: 'Residence Proof', icon: 'home' },
  { label: 'Skills Record', icon: 'wrench' },
  { label: 'Medical Record', icon: 'hospital-box' },
  { label: 'Education Record', icon: 'school' },
  { label: 'Community Vouch', icon: 'account-group' },
];

type EmploymentData = {
  employer_name: string;
  role: string;
  start_date: string;
  end_date: string;
  monthly_wage: string;
  employer_phone: string;
  notes: string;
};

type ResidenceData = {
  address: string;
  city: string;
  state: string;
  duration: string;
  type: string;
};

export const AddWalletEntryScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedType, setSelectedType] = useState('');
  const [saving, setSaving] = useState(false);

  const [empData, setEmpData] = useState<EmploymentData>({
    employer_name: '', role: '', start_date: '', end_date: '',
    monthly_wage: '', employer_phone: '', notes: '',
  });
  const [resData, setResData] = useState<ResidenceData>({
    address: '', city: '', state: '', duration: '', type: 'rented',
  });

  const residenceTypes = ['rented', 'owner', 'slum', 'temporary'];

  const handleSave = async () => {
    if (!selectedType) return;
    setSaving(true);
    try {
      const db = await getDBConnection();
      const id = 'we_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const beneficiaryId = 'ben_123'; // MVP: pull from store in production

      let dataJson = '{}';
      if (selectedType === 'Employment Record') dataJson = JSON.stringify(empData);
      else if (selectedType === 'Residence Proof') dataJson = JSON.stringify(resData);

      await db.executeSql(
        `INSERT INTO wallet_entries (id, beneficiary_id, entry_type, data_json, created_at) VALUES (?,?,?,?,?)`,
        [id, beneficiaryId, selectedType, dataJson, Date.now()]
      );

      // Recompute wallet hash
      const evRes = await db.executeSql(`SELECT * FROM evidence_items WHERE beneficiary_id = ?`, [beneficiaryId]);
      const ev: any[] = [];
      for (let i = 0; i < evRes[0].rows.length; i++) ev.push(evRes[0].rows.item(i));
      const newHash = await computeWalletHash(ev);

      // Audit log
      await db.executeSql(
        `INSERT INTO audit_log (id, action, entity_type, entity_id, timestamp, details) VALUES (?,?,?,?,?,?)`,
        ['aud_' + Date.now(), 'CREATE_WALLET_ENTRY', 'WalletEntry', id, Date.now(),
          `Added ${selectedType}. New wallet hash: ${newHash.substring(0, 12)}`]
      );

      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Type grid */}
      <Text style={styles.sectionLabel}>Select Entry Type</Text>
      <View style={styles.grid}>
        {ENTRY_TYPES.map(t => (
          <TouchableOpacity
            key={t.label}
            style={[
              styles.gridCell,
              selectedType === t.label && styles.gridCellActive
            ]}
            onPress={() => setSelectedType(t.label)}
            activeOpacity={0.7}
          >
            <Icon
              name={t.icon}
              size={26}
              color={selectedType === t.label ? Colors.primary : Colors.inkMuted48}
            />
            <Text style={[
              styles.gridLabel,
              selectedType === t.label && { color: Colors.primary }
            ]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Employment form */}
      {selectedType === 'Employment Record' && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Employment Details</Text>
          <Field label="Employer Name" value={empData.employer_name}
            onChange={v => setEmpData(d => ({ ...d, employer_name: v }))} />
          <Field label="Role / Designation" value={empData.role}
            onChange={v => setEmpData(d => ({ ...d, role: v }))} />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field label="Start Date" value={empData.start_date} placeholder="YYYY-MM-DD"
                onChange={v => setEmpData(d => ({ ...d, start_date: v }))} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="End Date / 'current'" value={empData.end_date} placeholder="current"
                onChange={v => setEmpData(d => ({ ...d, end_date: v }))} />
            </View>
          </View>
          <Field label="Monthly Wage (optional)" value={empData.monthly_wage} keyboard="numeric"
            onChange={v => setEmpData(d => ({ ...d, monthly_wage: v }))} />
          <Field label="Employer Phone (optional)" value={empData.employer_phone} keyboard="phone-pad"
            onChange={v => setEmpData(d => ({ ...d, employer_phone: v }))} />
          <Field label="Notes" value={empData.notes} multiline
            onChange={v => setEmpData(d => ({ ...d, notes: v }))} />
        </View>
      )}

      {/* Residence form */}
      {selectedType === 'Residence Proof' && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Residence Details</Text>
          <Field label="Address" value={resData.address} multiline
            onChange={v => setResData(d => ({ ...d, address: v }))} />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field label="City" value={resData.city}
                onChange={v => setResData(d => ({ ...d, city: v }))} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="State" value={resData.state}
                onChange={v => setResData(d => ({ ...d, state: v }))} />
            </View>
          </View>
          <Field label="Duration of Stay (e.g. 2 years)" value={resData.duration}
            onChange={v => setResData(d => ({ ...d, duration: v }))} />
          <Text style={styles.fieldLabel}>Type of Residence</Text>
          <View style={styles.chipRow}>
            {residenceTypes.map(rt => (
              <TouchableOpacity
                key={rt}
                style={[styles.chip, resData.type === rt && styles.chipActive]}
                onPress={() => setResData(d => ({ ...d, type: rt }))}
              >
                <Text style={[styles.chipText, resData.type === rt && { color: Colors.primary }]}>
                  {rt.charAt(0).toUpperCase() + rt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {selectedType && !['Employment Record', 'Residence Proof'].includes(selectedType) && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{selectedType}</Text>
          <Text style={[Typography.body, { color: Colors.inkMuted48 }]}>
            This entry type will be saved with basic metadata. Extended fields coming soon.
          </Text>
        </View>
      )}

      {selectedType ? (
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Icon name="check-circle" size={20} color={Colors.onPrimary} style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Entry'}</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

const Field = ({
  label, value, onChange, multiline = false, keyboard = 'default', placeholder = '',
}: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; keyboard?: any; placeholder?: string;
}) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <RNTextInput
      style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      keyboardType={keyboard}
      placeholder={placeholder}
      placeholderTextColor={Colors.inkMuted48}
    />
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvas },
  sectionLabel: {
    ...Typography.tagline,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: 10,
    marginBottom: Spacing.md,
  },
  gridCell: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: Colors.surfacePearl,
  },
  gridCellActive: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary + '66',
  },
  gridLabel: { ...Typography.finePrint, marginTop: 5, textAlign: 'center', color: Colors.inkMuted48 },

  form: {
    margin: Spacing.lg,
    backgroundColor: Colors.canvasParchment,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  formTitle: { ...Typography.tagline, marginBottom: Spacing.md },
  row: { flexDirection: 'row' },
  fieldLabel: { ...Typography.captionStrong, color: Colors.inkMuted80, marginBottom: 6 },
  input: {
    backgroundColor: Colors.canvas,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    ...Typography.body,
    height: 44,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.canvas,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '12' },
  chipText: { ...Typography.caption, color: Colors.inkMuted80 },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingVertical: 14,
  },
  saveBtnText: { color: Colors.onPrimary, fontSize: 17, fontWeight: '400', letterSpacing: -0.374 },
});
