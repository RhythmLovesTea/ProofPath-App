import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text, Chip, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDBConnection } from '../../shared/db/schema';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

export const BeneficiaryRegistrationScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  
  const campId = route.params?.campId;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [language, setLanguage] = useState('English');
  const [docsNeeded, setDocsNeeded] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [beneficiaryId, setBeneficiaryId] = useState<string | null>(null);

  const toggleDoc = (doc: string) => {
    if (docsNeeded.includes(doc)) {
      setDocsNeeded(docsNeeded.filter(d => d !== doc));
    } else {
      setDocsNeeded([...docsNeeded, doc]);
    }
  };

  const handleSave = async () => {
    if (!name || !phone) return;
    setSaving(true);
    try {
      const db = await getDBConnection();
      
      const benId = 'ben_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const regId = 'reg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      
      // Generate PP-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const random4 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const generatedToken = `PP-${dateStr}-${random4}`;

      await db.executeSql(
        `INSERT INTO beneficiaries (id, name, phone, age, gender, language, created_at, sync_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'local')`,
        [benId, name, phone, parseInt(age) || null, gender, language, Date.now()]
      );

      await db.executeSql(
        `INSERT INTO camp_registrations (id, beneficiary_id, camp_id, status, notes, acknowledgement_token, sync_status) 
         VALUES (?, ?, ?, 'Registered', ?, ?, 'local')`,
        [regId, benId, campId, `Docs needed: ${docsNeeded.join(', ')}. Notes: ${notes}`, generatedToken]
      );
      
      setBeneficiaryId(benId);
      setRegistrationId(regId);
      setToken(generatedToken);
    } catch (e) {
      console.error('Failed to register beneficiary', e);
    } finally {
      setSaving(false);
    }
  };

  if (token) {
    return (
      <View style={styles.successContainer}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary, marginBottom: 16 }}>Registration Successful!</Text>
        <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 24 }}>
          Please take a screenshot of this acknowledgement token.
        </Text>
        <View style={styles.tokenBox}>
          <Text variant="displaySmall" style={styles.tokenText}>{token}</Text>
        </View>
        
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('SlotBooking', { campId, beneficiaryId, registrationId })}
          style={styles.bookSlotBtn}
        >
          Book Slot Now
        </Button>
        <Button 
          mode="text" 
          onPress={() => navigation.goBack()}
        >
          Done
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Register Beneficiary</Text>
      
      <TextInput label="Full Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
      <TextInput label="Phone Number" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
      <View style={styles.row}>
        <TextInput label="Age" value={age} onChangeText={setAge} mode="outlined" keyboardType="numeric" style={[styles.input, { flex: 1, marginRight: 8 }]} />
        <View style={{ flex: 2 }}>
          <SegmentedButtons
            value={gender}
            onValueChange={setGender}
            buttons={[
              { value: 'Male', label: 'M' },
              { value: 'Female', label: 'F' },
              { value: 'Other', label: 'O' },
            ]}
          />
        </View>
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Language Preference</Text>
      <SegmentedButtons
        value={language}
        onValueChange={setLanguage}
        buttons={[
          { value: 'English', label: 'English' },
          { value: 'Hindi', label: 'Hindi' },
        ]}
        style={styles.input}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>Documents Needed</Text>
      <View style={styles.chipRow}>
        {['Aadhaar', 'Ration Card', 'Birth Certificate', 'Voter ID'].map(doc => (
          <Chip 
            key={doc} 
            selected={docsNeeded.includes(doc)} 
            onPress={() => toggleDoc(doc)}
            style={styles.chip}
          >
            {doc}
          </Chip>
        ))}
      </View>

      <TextInput label="Notes" value={notes} onChangeText={setNotes} mode="outlined" multiline numberOfLines={3} style={styles.input} />

      <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={styles.button}>
        Register & Generate Token
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, backgroundColor: Colors.canvasParchment },
  successContainer: { flex: 1, padding: Spacing.xl, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.canvasParchment },
  title: { ...Typography.tagline, marginBottom: Spacing.md, color: Colors.ink },
  sectionTitle: { ...Typography.bodyStrong, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  input: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { margin: 4 },
  button: { marginTop: Spacing.md, marginBottom: Spacing.xl, paddingVertical: 8 },
  tokenBox: { backgroundColor: Colors.canvas, padding: Spacing.xl, borderRadius: Radii.lg, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.hairline, width: '100%', alignItems: 'center' },
  tokenText: { fontWeight: '900', letterSpacing: 2, color: Colors.ink },
  bookSlotBtn: { width: '100%', marginBottom: Spacing.md, paddingVertical: 8 }
});
