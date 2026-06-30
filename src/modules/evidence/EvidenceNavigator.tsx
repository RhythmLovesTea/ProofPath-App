import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EvidenceHomeScreen } from './EvidenceHomeScreen';
import { AddEvidenceScreen } from './AddEvidenceScreen';
import { AIExtractionScreen } from './AIExtractionScreen';
import { WitnessStatementScreen } from './WitnessStatementScreen';
import { AffidavitGeneratorScreen } from './AffidavitGeneratorScreen';
import { AuditLogScreen } from './AuditLogScreen';
import { DARK_HEADER } from '../../navigation/headerOptions';

const Stack = createNativeStackNavigator();

export const EvidenceNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: true, ...DARK_HEADER }}>
    <Stack.Screen name="EvidenceHome" component={EvidenceHomeScreen} options={{ title: 'Evidence Builder' }} />
    <Stack.Screen name="AddEvidence" component={AddEvidenceScreen} options={{ title: 'Add Evidence' }} />
    <Stack.Screen name="AIExtraction" component={AIExtractionScreen} options={{ title: 'AI Review' }} />
    <Stack.Screen name="WitnessStatement" component={WitnessStatementScreen} options={{ title: 'Witness Statement' }} />
    <Stack.Screen name="AffidavitGenerator" component={AffidavitGeneratorScreen} options={{ title: 'Generate Affidavit' }} />
    <Stack.Screen name="AuditLog" component={AuditLogScreen} options={{ title: 'Audit Trail' }} />
  </Stack.Navigator>
);
