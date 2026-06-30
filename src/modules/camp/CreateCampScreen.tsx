import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getDBConnection } from '../../shared/db/schema';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

export const CreateCampScreen = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Simple text for MVP, ideally DateTimePicker
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('50');
  const [documentType, setDocumentType] = useState('Aadhaar');
  const [saving, setSaving] = useState(false);
  
  const navigation = useNavigation();
  const theme = useTheme();
  const documentTypes = [
    { value: 'Aadhaar', label: 'Aadhaar' },
    { value: 'Ration', label: 'Ration Card' },
    { value: 'Birth Cert', label: 'Birth Certificate' },
    { value: 'Other', label: 'Other' },
  ];

  const handleSave = async () => {
    if (!name || !date || !location || !capacity) return;
    setSaving(true);
    try {
      const db = await getDBConnection();
      const id = 'camp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const parsedDate = new Date(date).getTime();
      
      await db.executeSql(
        `INSERT INTO camps (id, name, date, location, capacity, document_type, sync_status) 
         VALUES (?, ?, ?, ?, ?, ?, 'local')`,
        [id, name, parsedDate, location, parseInt(capacity, 10), documentType]
      );
      
      navigation.goBack();
    } catch (e) {
      console.error('Failed to create camp', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="titleLarge" style={styles.title}>Create New Camp</Text>
        
        <TextInput
          label="Camp Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          contentStyle={styles.inputContent}
          outlineColor={Colors.hairline}
          activeOutlineColor={theme.colors.primary}
          textColor={Colors.ink}
          placeholderTextColor={Colors.inkMuted48}
          theme={{ colors: { onSurfaceVariant: Colors.inkMuted48 } }}
        />
        
        <TextInput
          label="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          mode="outlined"
          style={styles.input}
          contentStyle={styles.inputContent}
          outlineColor={Colors.hairline}
          activeOutlineColor={theme.colors.primary}
          textColor={Colors.ink}
          placeholderTextColor={Colors.inkMuted48}
          theme={{ colors: { onSurfaceVariant: Colors.inkMuted48 } }}
        />
        
        <TextInput
          label="Location"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          style={styles.input}
          contentStyle={styles.inputContent}
          outlineColor={Colors.hairline}
          activeOutlineColor={theme.colors.primary}
          textColor={Colors.ink}
          placeholderTextColor={Colors.inkMuted48}
          theme={{ colors: { onSurfaceVariant: Colors.inkMuted48 } }}
        />
        
        <TextInput
          label="Capacity"
          value={capacity}
          onChangeText={setCapacity}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          contentStyle={styles.inputContent}
          outlineColor={Colors.hairline}
          activeOutlineColor={theme.colors.primary}
          textColor={Colors.ink}
          placeholderTextColor={Colors.inkMuted48}
          theme={{ colors: { onSurfaceVariant: Colors.inkMuted48 } }}
        />

        <Text variant="titleMedium" style={styles.sectionTitle}>Document Type Processed</Text>
        <View style={styles.optionGrid}>
          {documentTypes.map((item) => {
            const selected = documentType === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setDocumentType(item.value)}
                style={[
                  styles.optionPill,
                  selected && { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary }
                ]}
              >
                <Text
                  variant="labelLarge"
                  style={[
                    styles.optionLabel,
                    selected && { color: theme.colors.primary, fontWeight: '700' }
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button 
          mode="contained" 
          onPress={handleSave} 
          loading={saving} 
          disabled={saving}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Save Camp
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvasParchment },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl + Spacing.md },
  title: { ...Typography.tagline, marginBottom: Spacing.md, color: Colors.ink },
  sectionTitle: { ...Typography.bodyStrong, marginTop: Spacing.sm, marginBottom: Spacing.sm },
  input: { marginBottom: Spacing.md },
  inputContent: {
    backgroundColor: Colors.canvas,
  },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  optionPill: {
    minWidth: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.pill,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
  },
  optionLabel: { color: Colors.inkMuted80, textAlign: 'center' },
  button: { marginTop: Spacing.sm, marginBottom: Spacing.md, borderRadius: 18 },
  buttonContent: { paddingVertical: 8 }
});
