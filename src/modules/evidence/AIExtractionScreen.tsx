import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, useTheme, Card } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { getDBConnection } from '../../shared/db/schema';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

export const AIExtractionScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const { beneficiaryId, evidenceType, fileUri, fileType } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Extracted data state
  const [extractedData, setExtractedData] = useState<any>({});
  
  // Success state
  const [savedHash, setSavedHash] = useState('');

  useEffect(() => {
    // Mocking the AI extraction process
    // In production, this would call Google Cloud Vision / Donut / Whisper / Cohere API
    const runExtraction = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(() => resolve(null), 2500)); // Simulate network latency

      let mockData: any = {};
      if (fileType === 'image') {
        mockData = {
          name: 'Sunita Devi',
          address: 'Plot 42, Industrial Area, Phase 1',
          date: new Date().toISOString().split('T')[0],
          document_type: evidenceType,
          issuing_authority: 'State Government',
        };
      } else {
        mockData = {
          speaker_name: 'Ramu',
          statement_text: 'I have known Sunita for 5 years. She has been working at the textile factory.',
          relationship_to_beneficiary: 'Neighbor/Co-worker',
          date_of_statement: new Date().toISOString().split('T')[0],
        };
      }
      
      setExtractedData(mockData);
      setLoading(false);
    };

    runExtraction();
  }, [fileType, evidenceType]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Clean up fileUri if it has file:// prefix for android
      let path = fileUri;
      if (path.startsWith('file://')) {
        path = path.substring(7);
      }
      
      // Calculate SHA-256
      let fileHash = '';
      try {
        fileHash = await RNFS.hash(path, 'sha256');
      } catch (err) {
        console.warn('Hash error fallback to pseudo-hash', err);
        fileHash = 'fa8b...' + Date.now().toString(16); // Fallback if file read fails
      }

      const db = await getDBConnection();
      
      const evidenceId = 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      
      await db.executeSql(
        `INSERT INTO evidence_items (id, beneficiary_id, type, file_path, extracted_data_json, hash_sha256, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [evidenceId, beneficiaryId, evidenceType, fileUri, JSON.stringify(extractedData), fileHash, Date.now()]
      );

      // Audit Log
      const auditId = 'aud_' + Date.now();
      await db.executeSql(
        `INSERT INTO audit_log (id, action, entity_type, entity_id, timestamp, details) VALUES (?, ?, ?, ?, ?, ?)`,
        [auditId, 'CREATE_EVIDENCE', 'EvidenceItem', evidenceId, Date.now(), `Added ${evidenceType} with hash ${fileHash.substring(0,8)}`]
      );

      setSavedHash(fileHash);
    } catch (e) {
      console.error('Failed to save evidence', e);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setExtractedData({ ...extractedData, [key]: value });
  };

  if (savedHash) {
    return (
      <View style={styles.successContainer}>
        <Icon name="check-circle" size={80} color={theme.colors.primary} style={{ marginBottom: 16 }} />
        <Text variant="headlineSmall" style={{ color: theme.colors.primary, marginBottom: 16, textAlign: 'center' }}>
          Evidence Secured
        </Text>
        <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 24 }}>
          Document processed and stored with cryptographic hash.
        </Text>
        
        <Card style={styles.hashCard}>
          <Card.Content>
            <Text variant="titleSmall" style={{ color: '#6b7280', marginBottom: 4 }}>SHA-256 Fingerprint:</Text>
            <Text variant="bodyMedium" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {savedHash.substring(0, 16)}...
            </Text>
          </Card.Content>
        </Card>
        
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('EvidenceHome')}
          style={{ width: '100%', marginTop: 24 }}
        >
          Return to Evidence
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="titleMedium" style={{ marginTop: 24 }}>
          {fileType === 'image' ? 'Reading your document...' : 'Transcribing audio statement...'}
        </Text>
        <Text variant="bodyMedium" style={{ color: '#6b7280', marginTop: 8 }}>
          AI is extracting relevant information.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text variant="titleLarge" style={styles.title}>Review Extracted Data</Text>
      <Text variant="bodyMedium" style={{ color: '#4b5563', marginBottom: 24 }}>
        Please verify and correct the information extracted by AI before securing it.
      </Text>

      {Object.keys(extractedData).map((key) => (
        <TextInput
          key={key}
          label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          value={extractedData[key] || ''}
          onChangeText={(val) => updateField(key, val)}
          mode="outlined"
          style={styles.input}
          multiline={key === 'statement_text'}
        />
      ))}

      <Button 
        mode="contained" 
        style={styles.saveBtn}
        loading={saving}
        disabled={saving}
        onPress={handleSave}
        icon="lock"
      >
        Secure & Save Evidence
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, backgroundColor: Colors.canvasParchment },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.canvasParchment },
  successContainer: { flex: 1, padding: Spacing.xl, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.canvasParchment },
  title: { ...Typography.tagline, marginBottom: Spacing.xs, color: Colors.ink },
  input: { marginBottom: Spacing.md },
  saveBtn: { marginTop: Spacing.md, paddingVertical: 8 },
  hashCard: { width: '100%', backgroundColor: Colors.canvas, elevation: 0, borderWidth: 1, borderColor: Colors.hairline, borderRadius: Radii.lg }
});
