import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Defs, LinearGradient, Rect, Stop, Circle, Ellipse } from 'react-native-svg';
import { getDBConnection } from '../../shared/db/schema';
import { Colors, Spacing, Radii, Typography } from '../../shared/theme';

type Camp = {
  id: string;
  name: string;
  date: number;
  location: string;
  capacity: number;
  document_type: string;
  sync_status: string;
  registeredCount: number;
};

type Filter = 'Upcoming' | 'Ongoing' | 'Completed';

export const CampListScreen = () => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [filter, setFilter] = useState<Filter>('Upcoming');
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const fetchCamps = async () => {
    try {
      const db = await getDBConnection();
      const results = await db.executeSql(
        `SELECT c.*, (SELECT COUNT(*) FROM camp_registrations cr WHERE cr.camp_id = c.id) as registeredCount 
         FROM camps c ORDER BY c.date DESC`
      );
      const data: Camp[] = [];
      for (let i = 0; i < results[0].rows.length; i += 1) data.push(results[0].rows.item(i));
      setCamps(data);
    } catch (e) {
      console.error('fetchCamps', e);
    }
  };

  useEffect(() => {
    if (isFocused) fetchCamps();
  }, [isFocused]);

  const filteredCamps = useMemo(() => {
    return camps.filter(c => {
      const now = Date.now();
      const isToday = new Date(c.date).toDateString() === new Date(now).toDateString();
      if (filter === 'Ongoing') return isToday;
      if (filter === 'Completed') return c.date < now && !isToday;
      return c.date > now && !isToday;
    });
  }, [camps, filter]);

  const renderCamp = ({ item }: { item: Camp }) => {
    const pct = item.capacity > 0 ? Math.round((item.registeredCount / item.capacity) * 100) : 0;
    const isFull = item.registeredCount >= item.capacity;
    const isToday = new Date(item.date).toDateString() === new Date().toDateString();
    const accent = isToday ? Colors.warning : item.date < Date.now() ? Colors.success : Colors.primary;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CampDashboard', { campId: item.id })}
        activeOpacity={0.86}
        accessibilityRole="button"
        accessibilityLabel={`Camp: ${item.name}`}
      >
        <View style={[styles.cardAccent, { backgroundColor: accent }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardLocation} numberOfLines={1}>{item.location || 'Location TBD'}</Text>
            </View>
            <View style={[styles.syncBadge, { backgroundColor: item.sync_status === 'synced' ? Colors.successBg : Colors.warningBg }]}>
              <Icon
                name={item.sync_status === 'synced' ? 'cloud-check' : 'cloud-upload-outline'}
                size={13}
                color={item.sync_status === 'synced' ? Colors.success : Colors.warning}
              />
            </View>
          </View>

          <View style={styles.metaRow}>
            <MetaChip icon="calendar-outline" label={new Date(item.date).toLocaleDateString()} />
            <MetaChip icon="file-document-outline" label={item.document_type || 'General'} />
          </View>

          <View style={styles.progressCard}>
            <View style={styles.capRow}>
              <Text style={styles.capLabel}>{item.registeredCount} / {item.capacity} registered</Text>
              <Text style={[styles.capPct, { color: isFull ? Colors.error : Colors.primary }]}>{isFull ? 'FULL' : `${pct}%`}</Text>
            </View>
            <View style={styles.barRow}>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: accent }]} />
              </View>
            </View>
          </View>

          <View style={styles.cardActions}>
            <ActionPill icon="account-plus-outline" label="Register" onPress={() => navigation.navigate('BeneficiaryRegistration', { campId: item.id })} />
            <ActionPill icon="qrcode-scan" label="Check In" onPress={() => navigation.navigate('CampDayCheckIn', { campId: item.id })} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvasParchment} />
      <Svg pointerEvents="none" style={styles.backgroundSvg} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="campBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#F6F2EC" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FFF8F3" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="campGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#DCEBFF" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#EFE4FF" stopOpacity="0.9" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#campBg)" />
        <Circle cx="6%" cy="0%" r="120" fill="#DCEBFF" fillOpacity="0.55" />
        <Ellipse cx="92%" cy="100%" rx="170" ry="120" fill="#EFE4FF" fillOpacity="0.36" />
        <Ellipse cx="50%" cy="40%" rx="140" ry="70" fill="#FFFFFF" fillOpacity="0.16" />
      </Svg>

      <View style={styles.shell}>
        <View style={styles.hero}>
          <Text style={styles.title}>Camps</Text>
          <Text style={styles.subtitle}>Manage and track your documentation camps.</Text>
        </View>

        <View style={styles.segmentWrap}>
          {(['Upcoming', 'Ongoing', 'Completed'] as Filter[]).map(f => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.segment, active && styles.segmentActive]}
                onPress={() => setFilter(f)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FlatList
          data={filteredCamps}
          keyExtractor={item => item.id}
          renderItem={renderCamp}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            filteredCamps.length === 0 && { flexGrow: 1, minHeight: Math.max(height * 0.55, 320) },
            { paddingBottom: insets.bottom + 176 },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyImageCard}>
                <View style={styles.tentScene}>
                  <View style={styles.tentBody} />
                  <View style={styles.tentFlap} />
                  <View style={styles.tentPole} />
                  <View style={styles.tentPoleRight} />
                  <View style={[styles.spark, styles.spark1]} />
                  <View style={[styles.spark, styles.spark2]} />
                  <View style={[styles.spark, styles.spark3]} />
                  <View style={[styles.spark, styles.spark4]} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>No upcoming camps</Text>
              <Text style={styles.emptyText}>
                Tap the + button to create your first documentation camp and start organizing your activities.
              </Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 110 }} />}
        />

        <TouchableOpacity
          style={[styles.createBtn, { bottom: insets.bottom + 82 }]}
          onPress={() => navigation.navigate('CreateCamp')}
          accessibilityRole="button"
          accessibilityLabel="Create Camp"
          activeOpacity={0.9}
        >
          <Text style={styles.createBtnText}>Create Camp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 78 }]}
          onPress={() => navigation.navigate('CreateCamp')}
          accessibilityRole="button"
          accessibilityLabel="Create new camp"
          activeOpacity={0.9}
        >
          <Icon name="plus" size={32} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const MetaChip = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.metaChip}>
    <Icon name={icon} size={13} color={Colors.inkMuted48} />
    <Text style={styles.metaChipText} numberOfLines={1}>{label}</Text>
  </View>
);

const ActionPill = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.actionPill} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
    <Icon name={icon} size={15} color={Colors.primary} />
    <Text style={styles.actionPillText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.canvasParchment,
  },
  backgroundSvg: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  shell: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 20,
  },
  hero: {
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...Typography.body,
    marginTop: 6,
    color: Colors.inkMuted80,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 18,
    padding: 4,
    marginBottom: 18,
  },
  segment: {
    flex: 1,
    minHeight: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.inkMuted48,
  },
  segmentTextActive: {
    color: Colors.onPrimary,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#A5B8D0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
  },
  cardAccent: {
    width: 5,
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeaderText: {
    flex: 1,
    paddingRight: 10,
  },
  cardName: {
    ...Typography.cardTitle,
    fontWeight: '800',
  },
  cardLocation: {
    ...Typography.caption,
    marginTop: 4,
  },
  syncBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4F7FB',
    borderRadius: Radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  metaChipText: {
    ...Typography.finePrint,
    color: Colors.inkMuted80,
    maxWidth: 130,
  },
  progressCard: {
    backgroundColor: '#FBFCFE',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EEF7',
    marginBottom: 12,
  },
  capRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  capLabel: {
    ...Typography.finePrint,
    color: Colors.inkMuted48,
  },
  capPct: {
    ...Typography.finePrint,
    fontWeight: '700',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.hairline,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7FD',
    borderRadius: Radii.pill,
    paddingVertical: 10,
    gap: 5,
  },
  actionPillText: {
    ...Typography.captionStrong,
    color: Colors.primary,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingHorizontal: 10,
  },
  emptyImageCard: {
    width: 220,
    height: 180,
    borderRadius: 18,
    backgroundColor: '#FFF7EE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B7A58B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 16,
  },
  tentScene: {
    width: 150,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tentBody: {
    position: 'absolute',
    bottom: 18,
    width: 92,
    height: 68,
    backgroundColor: '#D96B2B',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    transform: [{ skewX: '-12deg' }],
  },
  tentFlap: {
    position: 'absolute',
    bottom: 18,
    width: 50,
    height: 68,
    backgroundColor: '#B94817',
    left: 54,
    transform: [{ skewX: '12deg' }],
  },
  tentPole: {
    position: 'absolute',
    bottom: 14,
    left: 45,
    width: 2,
    height: 84,
    backgroundColor: '#5E5347',
    transform: [{ rotate: '-32deg' }],
  },
  tentPoleRight: {
    position: 'absolute',
    bottom: 14,
    right: 45,
    width: 2,
    height: 84,
    backgroundColor: '#5E5347',
    transform: [{ rotate: '32deg' }],
  },
  spark: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0D8A8',
    shadowColor: '#F0D8A8',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  spark1: { top: 8, left: 30 },
  spark2: { top: 18, right: 28 },
  spark3: { top: 32, left: 10 },
  spark4: { top: 38, right: 10 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.inkMuted80,
    lineHeight: 21,
  },
  createBtn: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -72 }],
    width: 144,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 5,
  },
  createBtnText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0E74D8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E74D8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
});
