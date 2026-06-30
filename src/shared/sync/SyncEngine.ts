/**
 * SyncEngine — ProofPath Offline-First Sync Service
 *
 * Watches network connectivity. When online, flushes all records
 * where sync_status = 'local' to the mock/real backend API.
 * Retries with exponential backoff (max 3 attempts).
 * Emits state via a Zustand-compatible event bus (syncStore).
 */
import NetInfo from '@react-native-community/netinfo';
import { getDBConnection } from '../db/schema';

const BASE_URL = 'http://10.0.2.2:3000'; // Android emulator → localhost
const MAX_RETRIES = 3;

type SyncRecord = { id: string; [key: string]: any };
type SyncState = { pending: number; lastSyncedAt: number | null; syncing: boolean };

// Module-level state (simple event bus — no dependency on React)
let _state: SyncState = { pending: 0, lastSyncedAt: null, syncing: false };
const _listeners = new Set<(s: SyncState) => void>();

export const syncStore = {
  getState: () => _state,
  subscribe: (fn: (s: SyncState) => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};

const emit = (patch: Partial<SyncState>) => {
  _state = { ..._state, ...patch };
  _listeners.forEach(fn => fn(_state));
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(() => r(null), ms));

const postWithRetry = async (
  url: string,
  body: object,
  attempt = 1
): Promise<boolean> => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch (err) {
    if (attempt >= MAX_RETRIES) return false;
    await sleep(Math.pow(2, attempt) * 800); // 800ms, 1600ms, 3200ms
    return postWithRetry(url, body, attempt + 1);
  }
};

// ── Table sync specs ─────────────────────────────────────────────────────────

const SYNC_SPECS = [
  {
    table: 'beneficiaries',
    endpoint: `${BASE_URL}/api/beneficiaries`,
    columns: 'id, name, phone, age, gender, language, created_at',
  },
  {
    table: 'camp_registrations',
    endpoint: `${BASE_URL}/api/camp_registrations`,
    columns: 'id, beneficiary_id, camp_id, slot_time, status, acknowledgement_token',
  },
  {
    table: 'evidence_items',
    endpoint: `${BASE_URL}/api/evidence_items`,
    columns: 'id, beneficiary_id, type, extracted_data_json, hash_sha256, created_at',
  },
  {
    table: 'affidavits',
    endpoint: `${BASE_URL}/api/affidavits`,
    columns: 'id, beneficiary_id, evidence_ids_json, status, created_at',
  },
];

// ── Core sync runner ─────────────────────────────────────────────────────────

export const runSync = async (): Promise<void> => {
  if (_state.syncing) return;
  emit({ syncing: true });

  try {
    const db = await getDBConnection();
    let totalSynced = 0;

    for (const spec of SYNC_SPECS) {
      const results = await db.executeSql(
        `SELECT ${spec.columns} FROM ${spec.table} WHERE sync_status = 'local'`
      );

      for (let i = 0; i < results[0].rows.length; i++) {
        const row: SyncRecord = results[0].rows.item(i);
        const ok = await postWithRetry(spec.endpoint, row);

        if (ok) {
          await db.executeSql(
            `UPDATE ${spec.table} SET sync_status = 'synced' WHERE id = ?`,
            [row.id]
          );
          totalSynced++;
        }
      }
    }

    // Audit log the sync
    if (totalSynced > 0) {
      const db2 = await getDBConnection();
      await db2.executeSql(
        `INSERT INTO audit_log (id, action, entity_type, entity_id, timestamp, details) VALUES (?,?,?,?,?,?)`,
        [`aud_sync_${Date.now()}`, 'SYNC', 'System', 'all', Date.now(), `Synced ${totalSynced} records`]
      );
    }

    emit({ syncing: false, lastSyncedAt: Date.now() });
  } catch (e) {
    console.error('[SyncEngine] Sync failed', e);
    emit({ syncing: false });
  }
};

// ── Pending count query ───────────────────────────────────────────────────────

export const refreshPendingCount = async (): Promise<number> => {
  try {
    const db = await getDBConnection();
    let total = 0;

    for (const spec of SYNC_SPECS) {
      const res = await db.executeSql(
        `SELECT COUNT(*) as cnt FROM ${spec.table} WHERE sync_status = 'local'`
      );
      total += res[0].rows.item(0).cnt;
    }

    emit({ pending: total });
    return total;
  } catch (_) {
    return 0;
  }
};

// ── Network watcher — call once at app start ──────────────────────────────────

let _unsubscribe: (() => void) | null = null;

export const startSyncEngine = () => {
  if (_unsubscribe) return; // already running

  // Refresh count immediately
  refreshPendingCount();

  _unsubscribe = NetInfo.addEventListener(state => {
    refreshPendingCount();

    if (state.isConnected && state.isInternetReachable) {
      runSync();
    }
  });
};

export const stopSyncEngine = () => {
  _unsubscribe?.();
  _unsubscribe = null;
};
