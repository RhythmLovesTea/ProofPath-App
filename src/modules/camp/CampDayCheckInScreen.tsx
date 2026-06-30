import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Text,
  TextInput,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Camera } from 'react-native-camera-kit';
import { getDBConnection } from '../../shared/db/schema';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

type BeneficiaryStatus = 'Registered' | 'Checked In' | 'Documents Submitted' | 'Processing' | 'Approved' | 'Needs Follow-up';

type BeneficiaryResult = {
  id: string;
  name: string;
  phone: string;
  regId: string;
  status: BeneficiaryStatus;
};

const STATUS_FLOW: BeneficiaryStatus[] = [
  'Checked In', 'Documents Submitted', 'Processing', 'Approved', 'Needs Follow-up',
];

export const CampDayCheckInScreen = () => {
  const route = useRoute<any>();
  const campId = route.params?.campId;

  const [mode, setMode] = useState<'qr' | 'phone'>('qr');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searchResults, setSearchResults] = useState<BeneficiaryResult[]>([]);
  const [selectedBen, setSelectedBen] = useState<BeneficiaryResult | null>(null);
  const [cameraActive, setCameraActive] = useState(true);

  const lookupByQR = async (qrData: string) => {
    try {
      const payload = JSON.parse(qrData);
      if (payload.beneficiaryId && payload.campId === campId) {
        const db = await getDBConnection();
        const results = await db.executeSql(
          `SELECT b.id, b.name, b.phone, r.id as regId, r.status
           FROM beneficiaries b
           JOIN camp_registrations r ON b.id = r.beneficiary_id
           WHERE b.id = ? AND r.camp_id = ?`,
          [payload.beneficiaryId, campId]
        );
        if (results[0].rows.length > 0) {
          const item = results[0].rows.item(0);
          setSelectedBen(item);
          setCameraActive(false);
          if (item.status === 'Registered') updateStatus(item.regId, 'Checked In');
        } else {
          Alert.alert('Not Found', 'Beneficiary not registered for this camp.');
        }
      } else {
        Alert.alert('Invalid QR', 'This QR code does not belong to this camp.');
      }
    } catch (_) {}
  };

  const lookupByPhone = async () => {
    if (phoneSearch.length < 4) return;
    try {
      const db = await getDBConnection();
      const results = await db.executeSql(
        `SELECT b.id, b.name, b.phone, r.id as regId, r.status
         FROM beneficiaries b
         JOIN camp_registrations r ON b.id = r.beneficiary_id
         WHERE r.camp_id = ? AND b.phone LIKE ?`,
        [campId, `%${phoneSearch}`]
      );
      const res: BeneficiaryResult[] = [];
      for (let i = 0; i < results[0].rows.length; i++) res.push(results[0].rows.item(i));
      setSearchResults(res);
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (regId: string, newStatus: BeneficiaryStatus) => {
    try {
      const db = await getDBConnection();
      await db.executeSql(
        `UPDATE camp_registrations SET status = ?, sync_status = 'local' WHERE id = ?`,
        [newStatus, regId]
      );
      setSelectedBen(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (e) { console.error(e); }
  };

  // ── Selected beneficiary view ──────────────────────────────────────────────
  if (selectedBen) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <View style={styles.personCard}>
          <View style={styles.personAvatar}>
            <Icon name="account" size={36} color={Colors.primaryOnDark} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.personName}>{selectedBen.name}</Text>
            <Text style={styles.personPhone}>{selectedBen.phone}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: Colors.successBg }]}>
            <Text style={[styles.statusPillText, { color: Colors.success }]}>{selectedBen.status}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Update Status</Text>
        <View style={styles.statusGrid}>
          {STATUS_FLOW.map(st => (
            <TouchableOpacity
              key={st}
              style={[
                styles.statusBtn,
                selectedBen.status === st && { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
              ]}
              onPress={() => updateStatus(selectedBen.regId, st)}
              accessibilityRole="button"
              accessibilityLabel={st}
            >
              <Text style={[styles.statusBtnText, selectedBen.status === st && { color: Colors.primary }]}>{st}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.rescanBtn}
          onPress={() => { setSelectedBen(null); setCameraActive(true); setSearchResults([]); }}
          accessibilityRole="button"
          accessibilityLabel="Scan another beneficiary"
        >
          <Icon name="qrcode-scan" size={16} color={Colors.primary} />
          <Text style={styles.rescanText}>Scan / Lookup Another</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Scanner / search view ─────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* Mode toggle */}
      <View style={styles.modeRow}>
        {(['qr', 'phone'] as const).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.modeChip, mode === m && styles.modeChipActive]}
            onPress={() => setMode(m)}
            accessibilityRole="radio"
            accessibilityState={{ selected: mode === m }}
          >
            <Icon name={m === 'qr' ? 'qrcode-scan' : 'phone-outline'} size={16}
              color={mode === m ? Colors.primary : Colors.inkMuted48} />
            <Text style={[styles.modeChipText, mode === m && { color: Colors.primary }]}>
              {m === 'qr' ? 'Scan QR' : 'Phone Lookup'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'qr' && (
        <View style={styles.cameraWrap}>
          <Camera
            style={StyleSheet.absoluteFill}
            cameraType={'Back' as any}
            scanBarcode
            onReadCode={(event: any) => {
              if (!cameraActive) return;
              const raw = event?.nativeEvent?.codeStringValue || event?.codeStringValue || '';
              lookupByQR(raw);
            }}
          />
          <View style={styles.scanOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanHint}>Point camera at slot QR code</Text>
          </View>
        </View>
      )}

      {mode === 'phone' && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.searchRow}>
            <View style={styles.searchInput}>
              <Icon name="phone" size={18} color={Colors.inkMuted48} />
              <TextInput
                style={styles.searchField}
                value={phoneSearch}
                onChangeText={setPhoneSearch}
                placeholder="Last 4 digits of phone"
                placeholderTextColor={Colors.inkMuted48}
                keyboardType="phone-pad"
                onSubmitEditing={lookupByPhone}
                accessibilityLabel="Phone number search"
              />
            </View>
            <TouchableOpacity style={styles.searchBtn} onPress={lookupByPhone} accessibilityRole="button" accessibilityLabel="Search">
              <Icon name="magnify" size={22} color={Colors.onPrimary} />
            </TouchableOpacity>
          </View>

          {searchResults.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.resultCard}
              onPress={() => {
                setSelectedBen(item);
                if (item.status === 'Registered') updateStatus(item.regId, 'Checked In');
              }}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.name}`}
            >
              <Icon name="account" size={20} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultPhone}>{item.phone}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: Colors.canvasParchment }]}>
                <Text style={styles.statusPillText}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {searchResults.length === 0 && phoneSearch.length >= 4 && (
            <Text style={styles.noResults}>No results. Tap the search button.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvasParchment },
  content: { padding: Spacing.lg, paddingBottom: 60 },

  modeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.hairline,
    minHeight: 44,
  },
  modeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '12' },
  modeChipText: { ...Typography.captionStrong, color: Colors.inkMuted48 },

  cameraWrap: { flex: 1, position: 'relative' },
  scanOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: Colors.primary, borderRadius: Radii.md, backgroundColor: 'transparent', marginBottom: Spacing.lg },
  scanHint: { ...Typography.caption, color: Colors.onDark, textAlign: 'center' },

  searchRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.canvas,
    minHeight: 48,
  },
  searchField: { flex: 1, fontSize: 16, color: Colors.ink },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
    minHeight: 64,
  },
  resultName: { ...Typography.bodyStrong },
  resultPhone: { ...Typography.caption, color: Colors.inkMuted48 },
  noResults: { ...Typography.caption, color: Colors.inkMuted48, textAlign: 'center', marginTop: Spacing.xl },

  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  personAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.canvasParchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personName: { ...Typography.bodyStrong, marginBottom: 2 },
  personPhone: { ...Typography.caption, color: Colors.inkMuted48 },
  statusPill: { borderRadius: Radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { ...Typography.finePrint, fontWeight: '600', color: Colors.inkMuted80 },

  sectionLabel: { ...Typography.captionStrong, color: Colors.inkMuted48, marginBottom: Spacing.sm },
  statusGrid: { gap: Spacing.sm, marginBottom: Spacing.xl },
  statusBtn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.canvas,
    minHeight: 48,
    justifyContent: 'center',
  },
  statusBtnText: { ...Typography.body, color: Colors.inkMuted80 },

  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  rescanText: { ...Typography.body, color: Colors.primary },
});
