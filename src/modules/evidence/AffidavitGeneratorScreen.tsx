import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, Button, Checkbox, Card, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
// @ts-ignore
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { getDBConnection } from '../../shared/db/schema';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

type EvidenceItem = {
  id: string;
  type: string;
  hash_sha256: string;
  extracted_data_json: string;
};

export const AffidavitGeneratorScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [pdfPath, setPdfPath] = useState('');

  // Mock beneficiary for MVP
  const beneficiaryId = 'ben_123';
  const beneficiaryName = 'Sunita Devi';

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const db = await getDBConnection();
        const results = await db.executeSql(
          `SELECT * FROM evidence_items WHERE beneficiary_id = ? ORDER BY created_at DESC`,
          [beneficiaryId]
        );
        const data: EvidenceItem[] = [];
        const initialSelected = new Set<string>();
        for (let i = 0; i < results[0].rows.length; i++) {
          const item = results[0].rows.item(i);
          data.push(item);
          initialSelected.add(item.id);
        }
        setEvidenceItems(data);
        setSelectedIds(initialSelected);
      } catch (e) {
        console.error(e);
      }
    };
    fetchEvidence();
  }, [beneficiaryId]);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const getSelectedItems = () => evidenceItems.filter(item => selectedIds.has(item.id));

  const generateHTML = () => {
    const selected = getSelectedItems();
    
    let itemsHtml = selected.map((item, index) => {
      let details = '';
      try {
        const parsed = JSON.parse(item.extracted_data_json || '{}');
        details = Object.keys(parsed).map(k => `<b>${k}</b>: ${parsed[k]}`).join(', ');
      } catch(e) {}
      
      return `
        <div style="margin-bottom: 12px;">
          <b>${index + 1}. ${item.type}</b><br/>
          <i>Hash: ${item.hash_sha256}</i><br/>
          ${details}
        </div>
      `;
    }).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; line-height: 1.6; }
            h1 { text-align: center; text-decoration: underline; }
            .content { margin-top: 30px; font-size: 14pt; }
            .evidence-section { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; }
            .signature-line { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 10px; margin-top: 40px;}
          </style>
        </head>
        <body>
          <h1>AFFIDAVIT</h1>
          <div class="content">
            <p>I, <b>${beneficiaryName}</b>, do hereby solemnly affirm and state on oath as under:</p>
            <p>1. That I am a resident of India and my identity is supported by the documents listed below.</p>
            <p>2. That the information extracted and cryptographically hashed below constitutes my informal evidence portfolio.</p>
          </div>
          <div class="evidence-section">
            <h3>Schedule of Evidence</h3>
            ${itemsHtml}
          </div>
          <div class="footer">
            <div>
              <p>DEPONENT</p>
              <div class="signature-line">Signature / Thumb Impression</div>
            </div>
            <div>
              <p>NOTARY PUBLIC</p>
              <div class="signature-line">Stamp & Signature</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const html = generateHTML();
      
      const options = {
        html,
        fileName: `Affidavit_${beneficiaryId}_${Date.now()}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      if (file.filePath) {
        setPdfPath(file.filePath);
        
        // Save to DB
        const db = await getDBConnection();
        const affId = 'aff_' + Date.now();
        await db.executeSql(
          `INSERT INTO affidavits (id, beneficiary_id, evidence_ids_json, generated_pdf_path, status, created_at) 
           VALUES (?, ?, ?, ?, 'Generated', ?)`,
          [affId, beneficiaryId, JSON.stringify(Array.from(selectedIds)), file.filePath, Date.now()]
        );
        
        // Audit Log
        const auditId = 'aud_' + Date.now();
        await db.executeSql(
          `INSERT INTO audit_log (id, action, entity_type, entity_id, timestamp, details) VALUES (?, ?, ?, ?, ?, ?)`,
          [auditId, 'GENERATE_AFFIDAVIT', 'Affidavit', affId, Date.now(), `Generated affidavit with ${selectedIds.size} evidence items`]
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to generate PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!pdfPath) return;
    try {
      await Share.open({
        url: Platform.OS === 'android' ? `file://${pdfPath}` : pdfPath,
        type: 'application/pdf',
        title: 'Share Affidavit'
      });
      
      // Audit log share
      const db = await getDBConnection();
      await db.executeSql(
        `INSERT INTO audit_log (id, action, entity_type, entity_id, timestamp, details) VALUES (?, ?, ?, ?, ?, ?)`,
        ['aud_' + Date.now(), 'SHARE_AFFIDAVIT', 'Affidavit', pdfPath, Date.now(), 'Shared affidavit PDF externally']
      );

    } catch (e) {
      console.log('Share dismissed', e);
    }
  };

  if (pdfPath) {
    return (
      <View style={styles.successContainer}>
        <Text variant="headlineSmall" style={{ color: theme.colors.primary, marginBottom: 16 }}>Affidavit Ready</Text>
        <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 24 }}>
          The PDF has been generated and cryptographically secured.
        </Text>
        
        <Button mode="contained" icon="share-variant" onPress={handleShare} style={styles.actionBtn}>
          Share PDF
        </Button>
        <Button mode="outlined" onPress={() => navigation.navigate('EvidenceHome')} style={styles.actionBtn}>
          Back to Evidence
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text variant="titleLarge" style={styles.title}>Select Evidence to Include</Text>
      
      {evidenceItems.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 24 }}>No evidence items found.</Text>
      ) : (
        evidenceItems.map(item => (
          <TouchableOpacity key={item.id} onPress={() => toggleSelect(item.id)}>
            <Card style={[styles.card, selectedIds.has(item.id) && { borderColor: theme.colors.primary, borderWidth: 1 }]}>
              <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Checkbox status={selectedIds.has(item.id) ? 'checked' : 'unchecked'} onPress={() => toggleSelect(item.id)} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text variant="titleMedium">{item.type}</Text>
                  <Text variant="bodySmall" style={{ color: '#6b7280', fontFamily: 'monospace' }}>Hash: {item.hash_sha256.substring(0, 12)}...</Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))
      )}

      <View style={styles.previewBox}>
        <Text variant="titleMedium" style={{ textAlign: 'center', textDecorationLine: 'underline', marginBottom: 16 }}>AFFIDAVIT PREVIEW</Text>
        <Text>I, {beneficiaryName}, do hereby solemnly affirm...</Text>
        <Text style={{ marginTop: 8 }}>Including {selectedIds.size} evidence exhibits.</Text>
        <Text style={{ marginTop: 16, textAlign: 'right' }}>[Signature Space]</Text>
      </View>

      <Button 
        mode="contained" 
        loading={generating} 
        disabled={generating || selectedIds.size === 0} 
        onPress={handleGeneratePDF}
        style={{ paddingVertical: 8 }}
      >
        Generate PDF
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, backgroundColor: Colors.canvasParchment },
  successContainer: { flex: 1, padding: Spacing.xl, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.canvasParchment },
  title: { ...Typography.tagline, marginBottom: Spacing.md, color: Colors.ink },
  card: { marginBottom: Spacing.sm, backgroundColor: Colors.canvas, elevation: 0, borderWidth: 1, borderColor: Colors.hairline, borderRadius: Radii.lg },
  previewBox: { padding: Spacing.md, borderWidth: 1, borderColor: Colors.hairline, borderStyle: 'dashed', backgroundColor: Colors.canvas, marginVertical: Spacing.lg, borderRadius: Radii.md },
  actionBtn: { width: '100%', marginBottom: Spacing.md, paddingVertical: 8 }
});
