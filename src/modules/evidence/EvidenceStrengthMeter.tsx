import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

interface Props { evidenceItems: any[]; }

export const EvidenceStrengthMeter: React.FC<Props> = ({ evidenceItems }) => {
  let score = 0;
  const types = new Set<string>();
  let addressProof = false;
  let identityCount = 0;
  let employerLetter = false;
  let witnessStatement = false;
  let photograph = false;
  let ngoVerified = false;

  evidenceItems.forEach(item => {
    types.add(item.type);
    if (['Electricity Bill', 'Water Bill', 'Rent Receipt'].includes(item.type)) addressProof = true;
    if (item.type === 'Employer Letter') employerLetter = true;
    if (item.type === 'Witness Statement') witnessStatement = true;
    if (item.type === 'Photograph') photograph = true;
    if (item.verified_by) ngoVerified = true;
    try {
      const parsed = JSON.parse(item.extracted_data_json || '{}');
      if (parsed.name) identityCount++;
    } catch (_) {}
  });

  if (addressProof) score += 20;
  if (identityCount >= 2) score += 20;
  if (employerLetter) score += 15;
  if (witnessStatement) score += 15;
  if (photograph) score += 15;
  if (ngoVerified) score += 10;
  if (types.size >= 3) score += 5;
  score = Math.min(score, 100);

  const color = score > 60 ? Colors.success : score > 30 ? Colors.warning : Colors.error;

  const label =
    score === 0 ? 'No evidence yet' :
    score <= 30 ? 'Weak — add more evidence' :
    score <= 60 ? 'Moderate — keep adding' :
    score <= 80 ? 'Strong identity' :
    'Excellent identity';

  const R = 86;
  const SW = 16;
  const CX = 100;
  const CY = 100;

  const drawArc = (pct: number) => {
    const angle = (pct / 100) * Math.PI;
    const ex = CX - R * Math.cos(angle);
    const ey = CY - R * Math.sin(angle);
    return `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${ex} ${ey}`;
  };

  const actions: { icon: string; text: string; done: boolean }[] = [
    { icon: 'home-outline', text: 'Address proof (bill or receipt)', done: addressProof },
    { icon: 'briefcase-outline', text: 'Employer letter', done: employerLetter },
    { icon: 'account-voice', text: 'Witness statement', done: witnessStatement },
    { icon: 'camera-outline', text: 'Photograph', done: photograph },
    { icon: 'check-decagram', text: 'NGO verification', done: ngoVerified },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>Evidence Strength</Text>
      <View style={styles.gaugeWrap}>
        <Svg width={200} height={120} viewBox="0 0 200 120">
          <Path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
            stroke={Colors.hairline}
            strokeWidth={SW}
            fill="none"
            strokeLinecap="round"
          />
          {score > 0 && (
            <Path
              d={drawArc(score)}
              stroke={score > 60 ? Colors.success : score > 30 ? Colors.warning : Colors.error}
              strokeWidth={SW}
              fill="none"
              strokeLinecap="round"
            />
          )}
        </Svg>
        <Text style={styles.scoreNum}>{score}</Text>
        <Text style={[styles.label, { color }]}>{label}</Text>
        <Text style={styles.itemCount}>{evidenceItems.length} item{evidenceItems.length !== 1 ? 's' : ''} added</Text>
      </View>

      <Text style={[styles.status, { color }]}>{label}</Text>

      <View style={styles.divider} />
      <View>
        {actions.filter(a => !a.done).slice(0, 3).map((a, i) => (
          <View key={i} style={styles.actionRow} accessibilityRole="none">
            <Icon name={a.icon} size={18} color={Colors.inkMuted48} accessibilityElementsHidden />
            <Text style={styles.actionText}>{a.text}</Text>
            <View style={styles.plusWrap}>
              <Icon name="plus" size={14} color={Colors.onPrimary} />
            </View>
          </View>
        ))}
        {actions.filter(a => !a.done).length === 0 && (
          <View style={styles.allDoneRow}>
            <Icon name="check-all" size={16} color={Colors.success} />
            <Text style={[styles.actionText, { color: Colors.success }]}>All key evidence collected!</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.canvas,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  caption: { ...Typography.caption, textAlign: 'center', marginBottom: Spacing.sm },
  gaugeWrap: { alignItems: 'center' },
  scoreNum: { fontSize: 48, fontWeight: '700', color: Colors.ink, marginTop: -12 },
  label: { ...Typography.bodyStrong, marginTop: 2, marginBottom: 2 },
  itemCount: { ...Typography.caption, marginBottom: Spacing.xs },
  status: { ...Typography.bodyStrong, marginBottom: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.dividerSoft, marginVertical: Spacing.sm },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, minHeight: 48 },
  allDoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  actionText: { ...Typography.body, flex: 1, color: Colors.inkMuted80 },
  plusWrap: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
