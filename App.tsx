import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { RootNavigator } from './src/navigation/RootNavigator';
import './src/shared/i18n';
import { getDBConnection, createTables } from './src/shared/db/schema';
import { startSyncEngine } from './src/shared/sync/SyncEngine';
import { initNotifications } from './src/shared/notifications/NotificationService';
import EncryptedStorage from 'react-native-encrypted-storage';
import i18n from './src/shared/i18n';
import { useAppStore } from './src/shared/store';
import { Colors } from './src/shared/theme';

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    background: Colors.canvasParchment,
    surface: Colors.canvas,
    surfaceVariant: '#F3F4F6',
    onSurface: Colors.ink,
    onSurfaceVariant: Colors.inkMuted80,
    outline: Colors.hairline,
    outlineVariant: Colors.hairline,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: Colors.canvasParchment,
      level1: Colors.canvas,
      level2: Colors.canvas,
      level3: Colors.canvas,
      level4: Colors.canvas,
      level5: Colors.canvas,
    },
  },
};

const App = () => {
  const setLanguage = useAppStore(state => state.setLanguage);

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Init DB
        const db = await getDBConnection();
        await createTables(db);

        // 2. Restore persisted language
        const savedLang = await EncryptedStorage.getItem('user_language').catch(() => null);
        if (savedLang) {
          setLanguage(savedLang);
          await i18n.changeLanguage(savedLang);
        }

        // 3. Start background sync engine
        startSyncEngine();

        // 4. Init local push notifications
        initNotifications();

      } catch (error) {
        console.error('App init error:', error);
      }
    };
    initApp();
  }, [setLanguage]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
