import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export const getDBConnection = async () => {
  return SQLite.openDatabase({ name: 'proofpath.db', location: 'default' });
};

export const createTables = async (db: SQLite.SQLiteDatabase) => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS beneficiaries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      age INTEGER,
      gender TEXT,
      language TEXT,
      created_at INTEGER,
      sync_status TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS camps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date INTEGER,
      location TEXT,
      capacity INTEGER,
      document_type TEXT,
      organiser_ngoid TEXT,
      sync_status TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS camp_registrations (
      id TEXT PRIMARY KEY,
      beneficiary_id TEXT,
      camp_id TEXT,
      slot_time INTEGER,
      status TEXT,
      notes TEXT,
      check_in_qr TEXT,
      acknowledgement_token TEXT,
      sync_status TEXT,
      FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries (id),
      FOREIGN KEY (camp_id) REFERENCES camps (id)
    );`,
    `CREATE TABLE IF NOT EXISTS evidence_items (
      id TEXT PRIMARY KEY,
      beneficiary_id TEXT,
      type TEXT,
      file_path TEXT,
      extracted_data_json TEXT,
      verified_by TEXT,
      verified_at INTEGER,
      hash_sha256 TEXT,
      created_at INTEGER,
      sync_status TEXT DEFAULT 'local',
      FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries (id)
    );`,
    `CREATE TABLE IF NOT EXISTS affidavits (
      id TEXT PRIMARY KEY,
      beneficiary_id TEXT,
      evidence_ids_json TEXT,
      generated_pdf_path TEXT,
      status TEXT,
      created_at INTEGER,
      sync_status TEXT DEFAULT 'local',
      FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries (id)
    );`,
    `CREATE TABLE IF NOT EXISTS wallet_entries (
      id TEXT PRIMARY KEY,
      beneficiary_id TEXT,
      entry_type TEXT,
      data_json TEXT,
      employer_signature TEXT,
      created_at INTEGER,
      sync_status TEXT DEFAULT 'local',
      FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries (id)
    );`,
    `CREATE TABLE IF NOT EXISTS trust_vouches (
      id TEXT PRIMARY KEY,
      voucher_beneficiary_id TEXT,
      vouchee_beneficiary_id TEXT,
      timestamp INTEGER,
      voucher_role TEXT,
      FOREIGN KEY (voucher_beneficiary_id) REFERENCES beneficiaries (id),
      FOREIGN KEY (vouchee_beneficiary_id) REFERENCES beneficiaries (id)
    );`,
    `CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      action TEXT,
      entity_type TEXT,
      entity_id TEXT,
      timestamp INTEGER,
      details TEXT
    );`
  ];

  for (const query of queries) {
    await db.executeSql(query);
  }
};
