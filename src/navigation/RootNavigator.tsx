import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppStore } from '../shared/store';
import { LanguageSelectScreen } from '../onboarding/LanguageSelectScreen';
import { WalkthroughScreen } from '../onboarding/WalkthroughScreen';
import { NamePhoneEntryScreen } from '../onboarding/NamePhoneEntryScreen';
import { PinSetupScreen } from '../onboarding/PinSetupScreen';
import { ProofPathIDScreen } from '../onboarding/ProofPathIDScreen';
import { CampNavigator } from '../modules/camp/CampNavigator';
import { EvidenceNavigator } from '../modules/evidence/EvidenceNavigator';
import { WalletNavigator } from '../modules/wallet/WalletNavigator';
import { EmployerScannerScreen } from '../modules/wallet/EmployerScannerScreen';
import { SettingsNavigator } from '../modules/settings/SettingsNavigator';
import { SyncBanner } from '../shared/components/SyncBanner';
import { Colors, Radii, Spacing } from '../shared/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 64 + insets.bottom;

  return (
    <>
      <SyncBanner />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.canvas,
            borderTopColor: Colors.dividerSoft,
            paddingBottom: Math.max(insets.bottom, 8),
            height: tabBarHeight,
            paddingTop: 8,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.inkMuted48,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.1 },
          tabBarIconStyle: { marginTop: 2 },
          tabBarItemStyle: { borderRadius: Radii.pill, marginHorizontal: Spacing.xs },
        }}
      >
        <Tab.Screen
          name="Camp"
          component={CampNavigator}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Icon
                name="tent"
                color={color}
                size={size}
                style={{ backgroundColor: focused ? '#DBEAFE' : 'transparent', borderRadius: 999, padding: focused ? 6 : 0 }}
              />
            ),
            tabBarLabel: 'Camps',
          }}
        />
        <Tab.Screen
          name="Evidence"
          component={EvidenceNavigator}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Icon name="file-document" color={color} size={size} style={{ backgroundColor: focused ? '#DBEAFE' : 'transparent', borderRadius: 999, padding: focused ? 6 : 0 }} />
            ),
            tabBarLabel: 'Evidence',
          }}
        />
        <Tab.Screen
          name="Wallet"
          component={WalletNavigator}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Icon name="card-account-details" color={color} size={size} style={{ backgroundColor: focused ? '#DBEAFE' : 'transparent', borderRadius: 999, padding: focused ? 6 : 0 }} />
            ),
            tabBarLabel: 'Wallet',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsNavigator}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Icon name="cog-outline" color={color} size={size} style={{ backgroundColor: focused ? '#DBEAFE' : 'transparent', borderRadius: 999, padding: focused ? 6 : 0 }} />
            ),
            tabBarLabel: 'Settings',
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const OnboardingStack = () => {
  const { completeOnboarding } = useAppStore();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="Walkthrough" component={WalkthroughScreen} />
      <Stack.Screen name="NamePhoneEntry" component={NamePhoneEntryScreen} />
      <Stack.Screen name="PinSetup" component={PinSetupScreen} />
      <Stack.Screen name="ProofPathID">
        {() => <ProofPathIDScreen onContinue={completeOnboarding} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export const RootNavigator = () => {
  const hasCompletedOnboarding = useAppStore(state => state.hasCompletedOnboarding);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
      {/* Deep link: proofpath://verify */}
      <Stack.Screen
        name="EmployerVerify"
        component={EmployerScannerScreen}
        options={{ headerShown: true, title: 'Verify Worker' }}
      />
    </Stack.Navigator>
  );
};
