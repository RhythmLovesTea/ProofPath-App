import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CampListScreen } from './CampListScreen';
import { CreateCampScreen } from './CreateCampScreen';
import { BeneficiaryRegistrationScreen } from './BeneficiaryRegistrationScreen';
import { SlotBookingScreen } from './SlotBookingScreen';
import { CampDayCheckInScreen } from './CampDayCheckInScreen';
import { CampDashboardScreen } from './CampDashboardScreen';
import { DARK_HEADER } from '../../navigation/headerOptions';

const Stack = createNativeStackNavigator();

export const CampNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: true, ...DARK_HEADER }}>
    <Stack.Screen name="CampList" component={CampListScreen} options={{ headerShown: false, title: 'Camps' }} />
    <Stack.Screen name="CreateCamp" component={CreateCampScreen} options={{ title: 'New Camp' }} />
    <Stack.Screen name="BeneficiaryRegistration" component={BeneficiaryRegistrationScreen} options={{ title: 'Register Person' }} />
    <Stack.Screen name="SlotBooking" component={SlotBookingScreen} options={{ title: 'Book Slot' }} />
    <Stack.Screen name="CampDayCheckIn" component={CampDayCheckInScreen} options={{ title: 'Day Check-In' }} />
    <Stack.Screen name="CampDashboard" component={CampDashboardScreen} options={{ title: 'Camp Dashboard' }} />
  </Stack.Navigator>
);
