/**
 * SyncBanner — persistent sync status indicator.
 * Shows:
 *  • "Offline — data saved locally" when no connection
 *  • "X items waiting to sync"  when online but pending > 0
 *  • Brief "All data synced ✓" flash after a successful sync
 *  • Nothing when fully synced and online
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { syncStore, refreshPendingCount } from '../sync/SyncEngine';
import { Colors, Spacing, Typography } from '../theme';

export const SyncBanner = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [showSynced, setShowSynced] = useState(false);
  const opacity = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Listen to network state
    const unsubNet = NetInfo.addEventListener(state => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setIsOnline(online);
    });

    // Listen to sync store
    const unsubSync = syncStore.subscribe(s => {
      setPending(s.pending);
      if (!s.syncing && s.lastSyncedAt && s.pending === 0) {
        setShowSynced(true);
        setTimeout(() => setShowSynced(false), 3000);
      }
    });

    refreshPendingCount().then(p => setPending(p));

    return () => {
      unsubNet();
      unsubSync();
    };
  }, []);

  // Don't render if online, no pending, no synced flash
  if (isOnline && pending === 0 && !showSynced) return null;

  let bgColor = Colors.canvasParchment;
  let iconName = 'wifi-off';
  let message = 'Offline — data saved locally';

  if (!isOnline) {
    bgColor = Colors.canvasParchment;
    iconName = 'wifi-off';
    message = 'Offline — data saved locally';
  } else if (showSynced) {
    bgColor = Colors.successBg;
    iconName = 'cloud-check';
    message = 'All data synced ✓';
  } else if (pending > 0) {
    bgColor = Colors.warningBg;
    iconName = 'cloud-upload-outline';
    message = `${pending} item${pending !== 1 ? 's' : ''} waiting to sync`;
  }

  return (
    <Animated.View style={[styles.banner, { backgroundColor: bgColor, opacity }]}>
      <Icon name={iconName} size={14} color={showSynced ? Colors.success : (pending > 0 ? Colors.warning : '#92400E')} style={{ marginRight: 6 }} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerSoft,
    width: '100%',
  },
  text: {
    ...Typography.captionStrong,
    color: '#92400E',
  },
});
