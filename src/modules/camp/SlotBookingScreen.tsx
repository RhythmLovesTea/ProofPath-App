import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import PushNotification from 'react-native-push-notification';
import { getDBConnection } from '../../shared/db/schema';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

export const SlotBookingScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  
  const { campId, beneficiaryId, registrationId } = route.params;

  const [slots, setSlots] = useState<{timeStr: string, timestamp: number}[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const [campDate, setCampDate] = useState<number>(Date.now());

  useEffect(() => {
    // Setup PushNotification channel
    PushNotification.createChannel(
      {
        channelId: "proofpath-reminders",
        channelName: "ProofPath Reminders",
        channelDescription: "Reminders for document camp slots",
        playSound: false,
        soundName: "default",
        importance: 4,
        vibrate: true,
      },
      (created: boolean) => console.log(`createChannel returned '${created}'`)
    );

    const loadCampAndSlots = async () => {
      try {
        const db = await getDBConnection();
        const results = await db.executeSql(`SELECT date FROM camps WHERE id = ?`, [campId]);
        if (results[0].rows.length > 0) {
          const date = results[0].rows.item(0).date;
          setCampDate(date);
          
          // Generate slots for that date (9 AM to 5 PM, every 15 mins)
          const baseDate = new Date(date);
          baseDate.setHours(9, 0, 0, 0); // start 9 AM
          const generatedSlots = [];
          
          for (let i = 0; i < 32; i++) {
            const slotTime = new Date(baseDate.getTime() + i * 15 * 60000);
            generatedSlots.push({
              timeStr: slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: slotTime.getTime()
            });
          }
          setSlots(generatedSlots);
        }
      } catch (e) {
        console.error('Failed to load camp date', e);
      }
    };
    
    loadCampAndSlots();
  }, [campId]);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    
    try {
      const db = await getDBConnection();
      
      const qrPayload = JSON.stringify({
        beneficiaryId,
        campId,
        slotTime: selectedSlot
      });

      await db.executeSql(
        `UPDATE camp_registrations 
         SET slot_time = ?, check_in_qr = ? 
         WHERE id = ?`,
        [selectedSlot, qrPayload, registrationId]
      );
      
      setQrData(qrPayload);
      setConfirmed(true);

      // Schedule notification 24 hours before
      const slotDate = new Date(selectedSlot);
      const reminderDate = new Date(selectedSlot - 24 * 60 * 60 * 1000);
      
      // Only schedule if reminder date is in the future
      if (reminderDate.getTime() > Date.now()) {
        PushNotification.localNotificationSchedule({
          channelId: "proofpath-reminders",
          title: "Upcoming Camp Slot",
          message: `Your ProofPath slot is tomorrow at ${slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Please bring your documents.`,
          date: reminderDate,
          allowWhileIdle: true,
        });
      }

    } catch (e) {
      console.error('Failed to book slot', e);
    }
  };

  if (confirmed && qrData) {
    return (
      <View style={styles.successContainer}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary, marginBottom: 16 }}>Slot Booked!</Text>
        <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 24 }}>
          Please show this QR code at the camp on the day of your appointment.
        </Text>
        
        <Card style={styles.qrCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <View style={styles.qrWrapper}>
              <QRCode value={qrData} size={200} />
            </View>
            <Text variant="titleMedium" style={{ marginTop: 16 }}>
              {new Date(selectedSlot!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280' }}>
              {new Date(selectedSlot!).toLocaleDateString()}
            </Text>
          </Card.Content>
        </Card>
        
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('CampList')}
          style={styles.doneBtn}
        >
          Return to Camps
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Select a Time Slot</Text>
      
      <View style={styles.slotsGrid}>
        {slots.map(slot => {
          const isSelected = selectedSlot === slot.timestamp;
          return (
            <TouchableOpacity 
              key={slot.timestamp}
              style={[
                styles.slotItem, 
                isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedSlot(slot.timestamp)}
            >
              <Text style={[styles.slotText, isSelected && { color: '#ffffff' }]}>
                {slot.timeStr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button 
        mode="contained" 
        onPress={handleConfirm} 
        disabled={!selectedSlot} 
        style={styles.button}
      >
        Confirm Booking
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, backgroundColor: Colors.canvasParchment },
  successContainer: { flex: 1, padding: Spacing.xl, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.canvasParchment },
  title: { ...Typography.tagline, marginBottom: Spacing.md, color: Colors.ink },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'space-between' },
  slotItem: { 
    width: '30%', 
    paddingVertical: 12, 
    borderWidth: 1, 
    borderColor: Colors.hairline, 
    borderRadius: Radii.md, 
    alignItems: 'center' 
  },
  slotText: { fontWeight: '500', color: Colors.ink },
  button: { marginTop: Spacing.lg, marginBottom: Spacing.xl, paddingVertical: 8 },
  qrCard: { width: '100%', marginBottom: Spacing.xl, backgroundColor: Colors.canvas, borderWidth: 1, borderColor: Colors.hairline },
  qrWrapper: { padding: Spacing.md, backgroundColor: Colors.canvasParchment, borderRadius: Radii.md, elevation: 0 },
  doneBtn: { width: '100%', paddingVertical: 8 }
});
