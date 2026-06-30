import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDBConnection } from '../../shared/db/schema';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';
import { EvidenceStrengthMeter } from './EvidenceStrengthMeter';
import { EmptyState } from '../../shared/components/EmptyState';

type EvidenceItem = {
  id: string;
  type: string;
  hash_sha256: string;
  verified_by: string;
  extracted_data_json: string;
  created_at: number;
};

const ICON_MAP: Record<string, string> = {
  'Electricity Bill': 'lightning-bolt',
  'Water Bill': 'water',
  'Employer Letter': 'briefcase-outline',
  'Rent Receipt': 'home-outline',
  'School Record': 'school-outline',
  'Medical Record': 'hospital-box-outline',
  'Photograph': 'camera-outline',
  'Witness Statement': 'account-voice',
  'Other': 'file-document-outline',
};

export const EvidenceHomeScreen = () => {
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const dummyBeneficiaryId = 'ben_123';

  const fetchEvidence = async () => {
    try {
      const db = await getDBConnection();
      const results = await db.executeSql(`SELECT * FROM evidence_items ORDER BY created_at DESC`);
      const data: EvidenceItem[] = [];
      for (let i = 0; i < results[0].rows.length; i++) data.push(results[0].rows.item(i));
      setEvidenceItems(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (isFocused) fetchEvidence(); }, [isFocused]);

  const renderCard = ({ item }: { item: EvidenceItem }) => {
    let snippet = '';
    try {
      const parsed = JSON.parse(item.extracted_data_json || '{}');
      snippet = parsed.name || parsed.address || parsed.statement_text?.substring(0, 50) || '';
    } catch (_) {}

    const fingerprint = item.hash_sha256
      ? '···' + item.hash_sha256.slice(-8)
      : 'Pending';

    const icon = ICON_MAP[item.type] || 'file-document-outline';

    return (
      <View style={styles.card} accessibilityRole="none">
        <View style={[styles.cardAccent, { backgroundColor: item.verified_by ? Colors.success : Colors.primary }]} />
        <View style={styles.cardLeft}>
          <View style={[
            styles.iconBox,
            { backgroundColor: item.verified_by ? Colors.successBg : Colors.canvasParchment }
          ]}>
            <Icon
              name={icon}
              size={22}
              color={item.verified_by ? Colors.success : Colors.primary}
              accessibilityLabel={item.type}
            />
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardType}>{item.type}</Text>
            <View style={[
              styles.verifiedPill,
              { backgroundColor: item.verified_by ? Colors.successBg : Colors.warningBg }
            ]}>
              <Icon
                name={item.verified_by ? 'check-decagram' : 'clock-outline'}
                size={11}
                color={item.verified_by ? Colors.success : Colors.warning}
                accessibilityElementsHidden
              />
              <Text style={[
                styles.verifiedText,
                { color: item.verified_by ? Colors.success : Colors.warning }
              ]}>
                {item.verified_by ? 'NGO Verified' : 'Unverified'}
              </Text>
            </View>
          </View>

          {snippet ? <Text style={styles.snippet} numberOfLines={1}>{snippet}</Text> : null}

          <View style={styles.cardFooter}>
            <Icon name="fingerprint" size={12} color={Colors.inkMuted48} accessibilityElementsHidden />
            <Text style={styles.hashText}>{fingerprint}</Text>
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={evidenceItems}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 120 + insets.bottom },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <EvidenceStrengthMeter evidenceItems={evidenceItems} />
            <View style={styles.quickRow}>
              <QuickAction
                icon="text-box-check-outline"
                label="Affidavit"
                onPress={() => navigation.navigate('AffidavitGenerator')}
              />
              <QuickAction
                icon="account-voice"
                label="Witness"
                onPress={() => navigation.navigate('WitnessStatement')}
              />
              <QuickAction
                icon="shield-lock-outline"
                label="Audit Trail"
                onPress={() => navigation.navigate('AuditLog')}
              />
            </View>
            <Text style={styles.sectionTitle}>My Evidence ({evidenceItems.length})</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="file-document-outline"
            title="No evidence added yet"
            subtitle="Tap the + button to add your first document, photo, or audio statement."
            ctaLabel="Add Evidence"
            onCta={() => navigation.navigate('AddEvidence', { beneficiaryId: dummyBeneficiaryId })}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 88 + insets.bottom }]}
        onPress={() => navigation.navigate('AddEvidence', { beneficiaryId: dummyBeneficiaryId })}
        accessibilityRole="button"
        accessibilityLabel="Add evidence"
      >
        <Icon name="plus" size={28} color={Colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const QuickAction = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
    <Icon name={icon} size={20} color={Colors.primary} accessibilityElementsHidden />
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvasParchment },
  list: { padding: Spacing.lg },

  header: { marginBottom: Spacing.md },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderRadius: 16,
    paddingVertical: 8,
    gap: 4,
    minHeight: 72,
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionLabel: { ...Typography.captionStrong, color: Colors.ink, marginTop: 4 },

  sectionTitle: { ...Typography.cardTitle, color: Colors.ink },

  card: {
    flexDirection: 'row',
    backgroundColor: Colors.canvas,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  cardAccent: { width: 4, marginRight: Spacing.sm },
  cardLeft: { marginRight: Spacing.sm },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardType: { ...Typography.cardTitle, flex: 1, marginRight: 8 },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 3,
  },
  verifiedText: { ...Typography.finePrint, fontWeight: '600' },
  snippet: { ...Typography.body, color: Colors.inkMuted80, marginBottom: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hashText: { ...Typography.finePrint, fontFamily: 'monospace', color: Colors.inkMuted48, flex: 1 },
  dateText: { ...Typography.finePrint, color: Colors.inkMuted48 },

  fab: {
    position: 'absolute',
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
