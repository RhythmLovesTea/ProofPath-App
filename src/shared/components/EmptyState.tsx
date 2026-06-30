/**
 * EmptyState — reusable empty state component with icon + message + CTA.
 * Used across all list screens in all 3 modules.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Radii, Typography } from '../theme';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export const EmptyState: React.FC<Props> = ({
  icon = 'inbox-outline',
  title,
  subtitle,
  ctaLabel,
  onCta,
}) => (
  <View style={styles.container} accessibilityRole="text" accessibilityLabel={title}>
    <Text style={styles.emoji} accessibilityElementsHidden>
      {icon === 'tent' ? '⛺' : icon === 'file-document-outline' ? '📄' : '🗂️'}
    </Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {ctaLabel && onCta ? (
      <TouchableOpacity
        style={styles.cta}
        onPress={onCta}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.ctaText}>{ctaLabel}</Text>
      </TouchableOpacity>
    ) : null}
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
  emoji: { fontSize: 48, marginBottom: Spacing.lg },
  title: {
    ...Typography.cardTitle,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.inkMuted48,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  cta: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingVertical: 11,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  ctaText: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
