import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { getDBConnection } from '../../shared/db/schema';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

type BeneficiaryResult = {
  id: string;
  name: string;
  phone: string;
  status: string;
};

export const CampDashboardScreen = () => {
  const route = useRoute<any>();
  const campId = route.params?.campId;

  const [stats, setStats] = useState({
    registered: 0,
    checkedIn: 0,
    docsSubmitted: 0,
    approved: 0,
    needsFollowup: 0
  });
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryResult[]>([]);

  useEffect(() => {
    loadDashboard();
  }, [campId]);

  const loadDashboard = async () => {
    try {
      const db = await getDBConnection();
      
      const results = await db.executeSql(
        `SELECT b.id, b.name, b.phone, r.status
         FROM beneficiaries b
         JOIN camp_registrations r ON b.id = r.beneficiary_id
         WHERE r.camp_id = ?
         ORDER BY r.status DESC, b.name ASC`,
        [campId]
      );
      
      const res: BeneficiaryResult[] = [];
      let registered = 0, checkedIn = 0, docsSubmitted = 0, approved = 0, needsFollowup = 0;
      
      for (let i = 0; i < results[0].rows.length; i++) {
        const item = results[0].rows.item(i);
        res.push(item);
        
        registered++;
        if (item.status === 'Checked In') checkedIn++;
        if (item.status === 'Documents Submitted') { checkedIn++; docsSubmitted++; }
        if (item.status === 'Processing') { checkedIn++; docsSubmitted++; }
        if (item.status === 'Approved') { checkedIn++; docsSubmitted++; approved++; }
        if (item.status === 'Needs Follow-up') { checkedIn++; needsFollowup++; }
      }
      
      setBeneficiaries(res);
      setStats({ registered, checkedIn, docsSubmitted, approved, needsFollowup });
      
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Registered': return '#6b7280';
      case 'Checked In': return '#3b82f6';
      case 'Documents Submitted': return '#f59e0b';
      case 'Processing': return '#8b5cf6';
      case 'Approved': return '#10b981';
      case 'Needs Follow-up': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const exportCSV = async () => {
    if (beneficiaries.length === 0) {
      Alert.alert('Export Failed', 'No data to export.');
      return;
    }
    
    try {
      let csvContent = 'Name,Phone,Status\n';
      beneficiaries.forEach(b => {
        csvContent += `"${b.name}","${b.phone}","${b.status}"\n`;
      });
      
      const fileName = `camp_export_${campId}_${Date.now()}.csv`;
      const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      
      await RNFS.writeFile(path, csvContent, 'utf8');
      Alert.alert('Export Successful', `Saved to Downloads: ${fileName}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Export Error', 'Failed to save CSV file.');
    }
  };

  const renderFunnel = () => {
    const total = stats.registered || 1; // avoid division by zero
    const w1 = '100%';
    const w2 = `${Math.max((stats.checkedIn / total) * 100, 2)}%`;
    const w3 = `${Math.max((stats.docsSubmitted / total) * 100, 2)}%`;
    const w4 = `${Math.max((stats.approved / total) * 100, 2)}%`;

    const rows = [
      { label: 'Registered', count: stats.registered, width: w1, color: Colors.primary },
      { label: 'Checked In', count: stats.checkedIn, width: w2, color: Colors.secondary },
      { label: 'Docs Submitted', count: stats.docsSubmitted, width: w3, color: Colors.warning },
      { label: 'Approved', count: stats.approved, width: w4, color: Colors.success },
    ];

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registration Funnel</Text>
        {rows.map(row => (
          <View key={row.label} style={styles.funnelRow}>
            <Text style={styles.funnelLabel}>{row.label} ({row.count})</Text>
            <View style={styles.funnelTrack}>
              <View style={[styles.funnelFill, { width: row.width as any, backgroundColor: row.color }]} />
            </View>
            <Text style={styles.funnelPct}>{Math.round((row.count / total) * 100)}%</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <Text style={styles.pageTitle}>Camp Dashboard</Text>
              <TouchableOpacity style={styles.exportBtn} onPress={exportCSV}>
                <Text style={styles.exportText}>Export CSV</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={styles.statTopBar} />
                <Text style={[styles.statValue, { color: Colors.secondary }]}>{stats.registered}</Text>
                <Text style={styles.statLabel}>Total Registered</Text>
              </View>
              <View style={styles.statBox}>
                <View style={styles.statTopBar} />
                <Text style={[styles.statValue, { color: Colors.success }]}>{stats.approved}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statBox}>
                <View style={styles.statTopBar} />
                <Text style={[styles.statValue, { color: Colors.error }]}>{stats.needsFollowup}</Text>
                <Text style={styles.statLabel}>Needs Follow-up</Text>
              </View>
            </View>

            {renderFunnel()}

            <Text style={styles.listTitle}>Beneficiaries</Text>
          </>
        }
        data={beneficiaries}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.beneficiaryRow}>
            <View style={styles.benInfo}>
              <View style={[styles.dot, { backgroundColor: getStatusColor(item.status) }]} />
              <View>
                <Text style={styles.benName}>{item.name}</Text>
                <Text style={styles.benPhone}>{item.phone}</Text>
              </View>
            </View>
            <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '15' }]}>
              <Text style={[styles.statusChipText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvasParchment },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  pageTitle: { ...Typography.screenTitle, flexShrink: 1, marginRight: Spacing.sm },
  exportBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.canvas,
    flexShrink: 0,
  },
  exportText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statBox: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: '30%',
    backgroundColor: Colors.canvas,
    padding: Spacing.md,
    borderRadius: 16,
    alignItems: 'flex-start',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  statTopBar: { height: 4, width: '100%', borderRadius: 999, backgroundColor: Colors.hairline, marginBottom: 12 },
  statValue: { fontSize: 32, fontWeight: '700', lineHeight: 36 },
  statLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: Colors.inkMuted48,
    marginTop: 4,
    minHeight: 28,
  },
  card: {
    backgroundColor: Colors.canvas,
    marginBottom: Spacing.md,
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { ...Typography.cardTitle, marginBottom: Spacing.md },
  listTitle: { ...Typography.cardTitle, marginTop: Spacing.sm, marginBottom: Spacing.sm },
  funnelRow: { marginBottom: Spacing.sm },
  funnelLabel: { ...Typography.captionStrong, color: Colors.inkMuted48, marginBottom: 4 },
  funnelTrack: { height: 10, backgroundColor: Colors.hairline, borderRadius: Radii.pill, overflow: 'hidden' },
  funnelFill: { height: '100%', borderRadius: Radii.pill },
  funnelPct: { ...Typography.captionStrong, color: Colors.inkMuted48, alignSelf: 'flex-end', marginTop: 2 },
  beneficiaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 16,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  benInfo: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  benName: { ...Typography.cardTitle, flexShrink: 1 },
  benPhone: { ...Typography.caption, color: Colors.inkMuted48 },
  statusChip: { borderRadius: Radii.pill, paddingHorizontal: 10, paddingVertical: 6 },
  statusChipText: { ...Typography.captionStrong, fontWeight: '600' },
});
