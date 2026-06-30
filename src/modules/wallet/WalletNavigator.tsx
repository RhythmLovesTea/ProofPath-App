import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletHomeScreen } from './WalletHomeScreen';
import { QRIdentityCardScreen } from './QRIdentityCardScreen';
import { AddWalletEntryScreen } from './AddWalletEntryScreen';
import { TrustScoreScreen } from './TrustScoreScreen';
import { WalletSecurityScreen } from './WalletSecurityScreen';
import { EmployerScannerScreen } from './EmployerScannerScreen';
import { DARK_HEADER } from '../../navigation/headerOptions';

const Stack = createNativeStackNavigator();

export const WalletNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: true, ...DARK_HEADER }}>
    <Stack.Screen name="WalletHome" component={WalletHomeScreen} options={{ title: 'My Wallet' }} />
    <Stack.Screen name="QRIdentityCard" component={QRIdentityCardScreen} options={{ title: 'Identity Card', headerTransparent: true, headerTintColor: '#ffffff' }} />
    <Stack.Screen name="AddWalletEntry" component={AddWalletEntryScreen} options={{ title: 'Add Entry' }} />
    <Stack.Screen name="TrustScore" component={TrustScoreScreen} options={{ title: 'Trust Score' }} />
    <Stack.Screen name="WalletSecurity" component={WalletSecurityScreen} options={{ title: 'Security & Backup' }} />
    <Stack.Screen name="EmployerScanner" component={EmployerScannerScreen} options={{ title: 'Verify Worker', headerShown: false }} />
  </Stack.Navigator>
);
