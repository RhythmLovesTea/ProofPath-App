import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export const EvidenceScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Evidence Module</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
