import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsHomeScreen } from './SettingsHomeScreen';
import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';
import { AboutScreen } from './AboutScreen';
import { DARK_HEADER } from '../../navigation/headerOptions';

const Stack = createNativeStackNavigator();

export const SettingsNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: true, ...DARK_HEADER }}>
    <Stack.Screen name="SettingsHome" component={SettingsHomeScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
    <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About ProofPath' }} />
  </Stack.Navigator>
);
