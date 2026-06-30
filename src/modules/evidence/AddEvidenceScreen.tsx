import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, PermissionsAndroid } from 'react-native';
import { Text, Button, SegmentedButtons, Card, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

const evidenceTypes = [
  { label: 'Electricity Bill', icon: 'lightning-bolt' },
  { label: 'Water Bill', icon: 'water' },
  { label: 'Employer Letter', icon: 'briefcase' },
  { label: 'Rent Receipt', icon: 'home' },
  { label: 'School Record', icon: 'school' },
  { label: 'Medical Record', icon: 'hospital-box' },
  { label: 'Photograph', icon: 'camera' },
  { label: 'Other', icon: 'file-document' },
];

// @ts-ignore
const audioRecorderPlayer = new AudioRecorderPlayer();

export const AddEvidenceScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  
  const beneficiaryId = route.params?.beneficiaryId;
  const initialType = route.params?.evidenceType || '';

  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [inputMethod, setInputMethod] = useState<'image' | 'audio'>('image');
  const [imageFile, setImageFile] = useState<Asset | null>(null);
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [audioPath, setAudioPath] = useState('');

  useEffect(() => {
    return () => {
      if (isRecording) audioRecorderPlayer.stopRecorder();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const onStartRecord = async () => {
    await requestPermissions();
    const result = await audioRecorderPlayer.startRecorder();
    setIsRecording(true);
    audioRecorderPlayer.addRecordBackListener((e: any) => {
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      return;
    });
    setAudioPath(result);
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    setAudioPath(result);
  };

  const pickImage = async (useCamera: boolean) => {
    const options = { mediaType: 'photo' as const, quality: 0.8 as any };
    const result = useCamera ? await launchCamera(options) : await launchImageLibrary(options);
    if (result.assets && result.assets.length > 0) {
      setImageFile(result.assets[0]);
    }
  };

  const handleProcess = () => {
    if (!selectedType) return;
    
    navigation.navigate('AIExtraction', {
      beneficiaryId,
      evidenceType: selectedType,
      fileUri: inputMethod === 'image' ? imageFile?.uri : audioPath,
      fileType: inputMethod
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {!initialType && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>1. Select Evidence Type</Text>
          <View style={styles.grid}>
            {evidenceTypes.map((item) => (
              <TouchableOpacity 
                key={item.label} 
                style={[
                  styles.gridItem, 
                  selectedType === item.label && { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedType(item.label)}
              >
                <Icon name={item.icon} size={28} color={selectedType === item.label ? theme.colors.primary : '#6b7280'} />
                <Text style={[styles.gridLabel, selectedType === item.label && { color: theme.colors.primary }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {selectedType ? (
        <View style={{ marginTop: 24 }}>
          <Text variant="titleMedium" style={styles.sectionTitle}>2. Input Method</Text>
          <SegmentedButtons
            value={inputMethod}
            onValueChange={(v) => { setInputMethod(v as any); setImageFile(null); setAudioPath(''); }}
            buttons={[
              { value: 'image', label: 'Camera / Photo' },
              { value: 'audio', label: 'Audio Record' },
            ]}
            style={{ marginBottom: 16 }}
          />

          {inputMethod === 'image' ? (
            <View>
              {imageFile ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imageFile.uri }} style={styles.imagePreview} />
                  <Button mode="text" onPress={() => setImageFile(null)}>Remove</Button>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <Button mode="outlined" icon="camera" onPress={() => pickImage(true)} style={styles.actionBtn}>
                    Take Photo
                  </Button>
                  <Button mode="outlined" icon="image" onPress={() => pickImage(false)} style={styles.actionBtn}>
                    Upload Gallery
                  </Button>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.audioContainer}>
              <Text variant="displaySmall" style={{ marginBottom: 16 }}>{recordTime}</Text>
              {!isRecording && !audioPath ? (
                <Button mode="contained" icon="microphone" onPress={onStartRecord} buttonColor="#ef4444">
                  Start Recording
                </Button>
              ) : isRecording ? (
                <Button mode="contained" icon="stop" onPress={onStopRecord} buttonColor="#374151">
                  Stop Recording
                </Button>
              ) : (
                <View style={{ width: '100%', alignItems: 'center' }}>
                  <Text style={{ color: '#10b981', marginBottom: 16 }}>Audio Captured</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Button mode="outlined" onPress={() => { setAudioPath(''); setRecordTime('00:00'); }}>Retake</Button>
                  </View>
                </View>
              )}
            </View>
          )}

          <Button 
            mode="contained" 
            style={styles.processBtn}
            disabled={!selectedType || (inputMethod === 'image' && !imageFile) || (inputMethod === 'audio' && !audioPath)}
            onPress={handleProcess}
          >
            Process with AI
          </Button>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, backgroundColor: Colors.canvasParchment },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12, color: '#374151' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { 
    width: '23%', 
    aspectRatio: 1, 
    borderWidth: 1, 
    borderColor: Colors.hairline, 
    borderRadius: Radii.md, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 12,
    padding: 4
  },
  gridLabel: { fontSize: 10, textAlign: 'center', marginTop: 4, color: '#6b7280' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1 },
  previewContainer: { alignItems: 'center' },
  imagePreview: { width: '100%', height: 250, borderRadius: Radii.md, resizeMode: 'cover', marginBottom: 8 },
  audioContainer: { alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.canvas, borderRadius: Radii.lg, borderWidth: 1, borderColor: Colors.hairline },
  processBtn: { marginTop: 32, paddingVertical: 8 }
});
