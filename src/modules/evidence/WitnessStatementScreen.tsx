import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, Switch } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

// @ts-ignore
const audioRecorderPlayer = new AudioRecorderPlayer();

export const WitnessStatementScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const beneficiaryId = route.params?.beneficiaryId || 'ben_123'; // fallback for MVP

  const [witnessName, setWitnessName] = useState('');
  const [relationship, setRelationship] = useState('');
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [playTime, setPlayTime] = useState('00:00');
  const [audioPath, setAudioPath] = useState('');
  
  const [ngoEndorsed, setNgoEndorsed] = useState(false);

  useEffect(() => {
    return () => {
      if (isRecording) audioRecorderPlayer.stopRecorder();
      if (isPlaying) audioRecorderPlayer.stopPlayer();
    };
  }, []);

  const onStartRecord = async () => {
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

  const onStartPlay = async () => {
    await audioRecorderPlayer.startPlayer(audioPath);
    setIsPlaying(true);
    audioRecorderPlayer.addPlayBackListener((e: any) => {
      setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      if (e.currentPosition === e.duration) {
        audioRecorderPlayer.stopPlayer();
        setIsPlaying(false);
      }
      return;
    });
  };

  const onStopPlay = async () => {
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setIsPlaying(false);
  };

  const handleProcess = () => {
    navigation.navigate('AIExtraction', {
      beneficiaryId,
      evidenceType: 'Witness Statement',
      fileUri: audioPath,
      fileType: 'audio'
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text variant="titleLarge" style={styles.title}>Record Witness Statement</Text>
      
      <TextInput
        label="Witness Name"
        value={witnessName}
        onChangeText={setWitnessName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Relationship to Beneficiary"
        value={relationship}
        onChangeText={setRelationship}
        mode="outlined"
        style={styles.input}
      />

      <View style={styles.audioContainer}>
        {!audioPath ? (
          <>
            <Text variant="displaySmall" style={{ marginBottom: 16 }}>{recordTime}</Text>
            {!isRecording ? (
              <Button mode="contained" icon="microphone" onPress={onStartRecord} buttonColor="#ef4444">
                Start Recording
              </Button>
            ) : (
              <Button mode="contained" icon="stop" onPress={onStopRecord} buttonColor="#374151">
                Stop Recording
              </Button>
            )}
          </>
        ) : (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text variant="displaySmall" style={{ marginBottom: 16 }}>{isPlaying ? playTime : recordTime}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {!isPlaying ? (
                <Button mode="contained" icon="play" onPress={onStartPlay}>Play</Button>
              ) : (
                <Button mode="contained" icon="stop" onPress={onStopPlay} buttonColor="#f59e0b">Stop</Button>
              )}
              <Button mode="outlined" onPress={() => { setAudioPath(''); setRecordTime('00:00'); }}>Retake</Button>
            </View>
          </View>
        )}
      </View>

      <View style={styles.switchRow}>
        <Text variant="titleMedium">NGO Worker Endorsement</Text>
        <Switch value={ngoEndorsed} onValueChange={setNgoEndorsed} color={theme.colors.primary} />
      </View>
      <Text variant="bodySmall" style={{ color: '#6b7280', marginBottom: 24 }}>
        Turn this on if you are verifying the identity of the witness in person.
      </Text>

      <Button 
        mode="contained" 
        style={styles.processBtn}
        disabled={!audioPath || !witnessName || !relationship}
        onPress={handleProcess}
      >
        Process Statement with AI
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, backgroundColor: Colors.canvasParchment },
  title: { ...Typography.tagline, marginBottom: Spacing.md, color: Colors.ink },
  input: { marginBottom: Spacing.md },
  audioContainer: { alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.canvas, borderRadius: Radii.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.hairline },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  processBtn: { paddingVertical: 8 }
});
