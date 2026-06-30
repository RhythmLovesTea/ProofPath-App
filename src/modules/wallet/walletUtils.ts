// Wallet utilities: trust score, hash, badge computation
import RNFS from 'react-native-fs';

export type TrustTier = 'Unverified' | 'Community Verified' | 'NGO Verified';

export type BadgeStatus = {
  residence: boolean;
  employment: boolean;
  identity: boolean;
};

export type WalletMeta = {
  trustScore: number;
  tier: TrustTier;
  badges: BadgeStatus;
  evidenceCount: number;
  walletHash: string;
};

/**
 * Compute trust score from evidence items and wallet entries.
 * Rules:
 *   1 evidence item = 10 pts
 *   NGO-verified evidence = +15 pts each
 *   Witness statement evidence = +10 pts
 *   1 community vouch = +5 pts
 *   NGO worker vouch = +20 pts
 *   50+ = Community Verified
 *   80+ = NGO Verified
 */
export const computeTrustScore = (
  evidenceItems: any[],
  walletEntries: any[],
  vouches: any[]
): { score: number; tier: TrustTier; breakdown: Record<string, number> } => {
  let score = 0;
  const breakdown: Record<string, number> = {
    evidence: 0,
    ngoVerified: 0,
    witnessStatements: 0,
    communityVouches: 0,
    ngoVouches: 0,
  };

  evidenceItems.forEach(item => {
    score += 10;
    breakdown.evidence += 10;
    if (item.verified_by) {
      score += 15;
      breakdown.ngoVerified += 15;
    }
    if (item.type === 'Witness Statement') {
      score += 10;
      breakdown.witnessStatements += 10;
    }
  });

  vouches.forEach(v => {
    if (v.voucher_role === 'ngo_worker') {
      score += 20;
      breakdown.ngoVouches += 20;
    } else {
      score += 5;
      breakdown.communityVouches += 5;
    }
  });

  score = Math.min(score, 100);

  let tier: TrustTier = 'Unverified';
  if (score >= 80) tier = 'NGO Verified';
  else if (score >= 50) tier = 'Community Verified';

  return { score, tier, breakdown };
};

export const computeBadges = (evidenceItems: any[], walletEntries: any[]): BadgeStatus => {
  const addressTypes = ['Electricity Bill', 'Water Bill', 'Rent Receipt', 'Residence Proof'];
  const residence = evidenceItems.some(e => addressTypes.includes(e.type)) ||
    walletEntries.some(w => w.entry_type === 'Residence Proof');

  const employment = walletEntries.some(w => w.entry_type === 'Employment Record') ||
    evidenceItems.some(e => e.type === 'Employer Letter');

  const identityCount = evidenceItems.filter(e =>
    ['Aadhaar', 'Voter ID', 'Ration Card', 'School Record', 'Medical Record'].includes(e.type)
  ).length;
  const identity = identityCount >= 3;

  return { residence, employment, identity };
};

/**
 * Compute the wallet hash: SHA-256 of all evidence hashes concatenated.
 * Falls back gracefully if RNFS fails.
 */
export const computeWalletHash = async (evidenceItems: any[]): Promise<string> => {
  if (evidenceItems.length === 0) return 'empty';
  const concatenated = evidenceItems
    .map(e => e.hash_sha256 || '')
    .filter(Boolean)
    .join('|');

  // Write temp file and hash it
  const tmpPath = `${RNFS.TemporaryDirectoryPath}/wallet_hash_input.txt`;
  try {
    await RNFS.writeFile(tmpPath, concatenated, 'utf8');
    const hash = await RNFS.hash(tmpPath, 'sha256');
    await RNFS.unlink(tmpPath);
    return hash;
  } catch (e) {
    // Fallback: simple string hash
    let h = 0;
    for (let i = 0; i < concatenated.length; i++) {
      h = (Math.imul(31, h) + concatenated.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(16).padStart(8, '0') + 'fallback';
  }
};

export const tierColor = (tier: TrustTier) => {
  switch (tier) {
    case 'NGO Verified': return '#059669';
    case 'Community Verified': return '#d97706';
    default: return '#6b7280';
  }
};
