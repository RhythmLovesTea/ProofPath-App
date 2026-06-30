import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { getDBConnection } from '../../shared/db/schema';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../shared/theme';

type AuditLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: number;
  details: string;
};

export const AuditLogScreen = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const db = await getDBConnection();
        const results = await db.executeSql(
          `SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 50`
        );
        const data: AuditLog[] = [];
        for (let i = 0; i < results[0].rows.length; i++) {
          data.push(results[0].rows.item(i));
        }
        setLogs(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLogs();
  }, []);

  const getIconForAction = (action: string) => {
    if (action.includes('CREATE')) return 'plus-circle-outline';
    if (action.includes('GENERATE')) return 'file-document-outline';
    if (action.includes('SHARE')) return 'share-variant-outline';
    if (action.includes('DELETE')) return 'trash-can-outline';
    return 'information-outline';
  };

  const renderLog = ({ item }: { item: AuditLog }) => {
    const date = new Date(item.timestamp);
    
    return (
      <View style={styles.timelineRow}>
        <View style={styles.timelineLeft}>
          <View style={styles.line} />
          <View style={[styles.dot, { backgroundColor: theme.colors.primary }]}>
            <Icon name={getIconForAction(item.action)} size={16} color="#ffffff" />
          </View>
        </View>
        
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{item.action}</Text>
              <Text variant="bodySmall" style={{ color: '#6b7280' }}>
                {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Text variant="bodyMedium" style={{ marginTop: 4 }}>{item.details}</Text>
            <Text variant="bodySmall" style={styles.entityIdText}>ID: {item.entity_id}</Text>
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>System Audit Trail</Text>
      <Text variant="bodySmall" style={styles.subtitle}>
        Immutable logs for cryptographic evidence and affidavit actions.
      </Text>
      
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        renderItem={renderLog}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24, color: '#6b7280' }}>No logs recorded yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvasParchment },
  title: { padding: 16, paddingBottom: 4, fontWeight: 'bold' },
  subtitle: { paddingHorizontal: 16, paddingBottom: 16, color: '#6b7280' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  timelineRow: { flexDirection: 'row', marginBottom: 16 },
  timelineLeft: { width: 40, alignItems: 'center', position: 'relative' },
  line: { position: 'absolute', top: 0, bottom: -16, width: 2, backgroundColor: '#e5e7eb' },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 1, marginTop: 4 },
  card: { flex: 1, backgroundColor: Colors.canvas, elevation: 1, borderWidth: 1, borderColor: Colors.hairline },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entityIdText: { marginTop: 8, fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }
});
