/**
 * NotificationService — ProofPath local push notifications
 *
 * Wraps react-native-push-notification with typed helpers.
 * Three notification types:
 *   1. Camp slot reminder — scheduled at booking time for 24h + 2h before slot
 *   2. Evidence nudge — if score < 40 and no activity in 7 days
 *   3. Affidavit ready — fires immediately when PDF is generated
 *
 * All message strings come from i18n so they respect the user's language.
 */
import PushNotification from 'react-native-push-notification';
import i18n from '../i18n';

// ── Bootstrap (call once at app start) ───────────────────────────────────────

export const initNotifications = () => {
  PushNotification.configure({
    onRegister: () => {},
    onNotification: () => {},
    permissions: { alert: true, badge: false, sound: true },
    popInitialNotification: true,
    requestPermissions: false,
  });

  PushNotification.createChannel(
    {
      channelId: 'proofpath-reminders',
      channelName: 'ProofPath Reminders',
      channelDescription: 'Slot and document reminders',
      playSound: true,
      soundName: 'default',
      importance: 4,
      vibrate: true,
    },
    () => {}
  );

  PushNotification.createChannel(
    {
      channelId: 'proofpath-alerts',
      channelName: 'ProofPath Alerts',
      channelDescription: 'Evidence and affidavit alerts',
      playSound: true,
      soundName: 'default',
      importance: 3,
      vibrate: false,
    },
    () => {}
  );
};

// ── Helper ────────────────────────────────────────────────────────────────────

const t = (key: string, opts?: object): string => (i18n.t as any)(key, opts);

// ── 1. Camp slot reminders ────────────────────────────────────────────────────

export const scheduleSlotReminders = (slotTimestamp: number, notifIdBase: string) => {
  const slotDate = new Date(slotTimestamp);
  const slotTimeStr = slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 24h before
  const remind24h = new Date(slotTimestamp - 24 * 60 * 60 * 1000);
  if (remind24h > new Date()) {
    PushNotification.localNotificationSchedule({
      channelId: 'proofpath-reminders',
      id: parseInt(notifIdBase + '24', 36) % 100000,
      title: t('notif_slot_title'),
      message: t('notif_slot_24h', { time: slotTimeStr }),
      date: remind24h,
      allowWhileIdle: true,
    });
  }

  // 2h before
  const remind2h = new Date(slotTimestamp - 2 * 60 * 60 * 1000);
  if (remind2h > new Date()) {
    PushNotification.localNotificationSchedule({
      channelId: 'proofpath-reminders',
      id: parseInt(notifIdBase + '2', 36) % 100000,
      title: t('notif_slot_title'),
      message: t('notif_slot_2h', { time: slotTimeStr }),
      date: remind2h,
      allowWhileIdle: true,
    });
  }
};

// ── 2. Evidence completeness nudge ────────────────────────────────────────────

export const scheduleEvidenceNudge = (trustScore: number, lastActivityTs: number) => {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const inactiveFor7Days = Date.now() - lastActivityTs > sevenDaysMs;

  if (trustScore < 40 && inactiveFor7Days) {
    PushNotification.localNotification({
      channelId: 'proofpath-alerts',
      id: 99901,
      title: t('notif_evidence_title'),
      message: t('notif_evidence_body', { score: trustScore }),
      allowWhileIdle: true,
    });
  }
};

// ── 3. Affidavit ready ────────────────────────────────────────────────────────

export const notifyAffidavitReady = () => {
  PushNotification.localNotification({
    channelId: 'proofpath-alerts',
    id: 99902,
    title: t('notif_affidavit_title'),
    message: t('notif_affidavit_body'),
    allowWhileIdle: true,
  });
};
