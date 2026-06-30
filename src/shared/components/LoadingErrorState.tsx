/**
 * LoadingState + ErrorState — network operation feedback components.
 * Used across all screens that do async data fetching.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radii, Typography } from '../theme';

// ── Loading ────────────────────────────────────────────────────────────────────

interface LoadingProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingProps> = ({ message = 'Loading…' }) => (
  <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// ── Error ──────────────────────────────────────────────────────────────────────

interface ErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorProps> = ({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
}) => (
  <View style={styles.container} accessibilityRole="alert">
    <View style={styles.iconWrap}>
      <Icon
        name="alert-circle-outline"
        size={48}
        color={Colors.error}
        accessibilityLabel={`Error: ${title}`}
      />
    </View>
    <Text style={styles.errorTitle}>{title}</Text>
    <Text style={styles.errorMessage}>{message}</Text>
    {onRetry ? (
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="refresh" size={16} color={Colors.onPrimary} style={{ marginRight: 6 }} />
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

// ── Fallback for AI extraction failures ────────────────────────────────────────

export const AIFallbackBanner: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
  <View style={styles.fallbackBanner} accessibilityRole="alert">
    <View style={styles.fallbackLeft}>
      <Icon name="robot-off-outline" size={20} color={Colors.warning} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.fallbackTitle}>AI extraction unavailable</Text>
        <Text style={styles.fallbackBody}>
          You can still fill in the details manually — your data will not be lost.
        </Text>
      </View>
    </View>
    <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Icon name="close" size={18} color={Colors.inkMuted48} accessibilityLabel="Dismiss" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.section,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: Colors.dividerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.inkMuted48,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  errorTitle: {
    ...Typography.tagline,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    color: Colors.ink,
  },
  errorMessage: {
    ...Typography.body,
    color: Colors.inkMuted48,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    minHeight: 48,
  },
  retryText: { color: Colors.onPrimary, fontSize: 15, fontWeight: '400' },

  fallbackBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warningBg,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '44',
  },
  fallbackLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  fallbackTitle: { ...Typography.captionStrong, color: Colors.warning, marginBottom: 2 },
  fallbackBody: { ...Typography.finePrint, color: Colors.inkMuted80 },
});
