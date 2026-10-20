import { ethers } from 'ethers';
import { AccessScope, ConsentGrant, AuditLogEntry } from '@/types';

export const CONSENT_REGISTRY_ABI = [
  'event ConsentGranted(bytes32 indexed grantId, address indexed patient, string recipientDid, bytes32 recordHash, uint256 expiresAt, uint8 scope)',
  'event ConsentRevoked(bytes32 indexed grantId, address indexed patient, uint256 timestamp)',
  'event AccessLogged(bytes32 indexed grantId, string accessorDid, uint256 timestamp, bool accessGranted)',
  'function grantConsent(bytes32 grantId, string patientDid, string recipientDid, bytes32 recordHash, uint256 durationSeconds, uint8 scope, string predicateProofHash) external returns (bytes32)',
  'function revokeConsent(bytes32 grantId) external',
  'function verifyConsent(bytes32 grantId, string accessorDid) external view returns (bool isValid, string reason, uint256 remainingSeconds, uint8 scope, bytes32 recordHash)',
  'function getPatientGrants(address patient) external view returns (bytes32[])',
];

export const MOCK_POLYGON_CONTRACT_ADDRESS = '0x8fB0496E7262E25e79E537025fB228B1d923C472';

// In-browser fallback ledger for zero-friction testing and high-speed mock transactions
class MockConsentLedger {
  private grants: Map<string, ConsentGrant> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private blockNumber = 58291420;

  constructor() {
    this.seedDefaultLogs();
  }

  private seedDefaultLogs() {
    this.auditLogs = [
      {
        id: 'log-1',
        timestamp: Date.now() - 3600000,
        action: 'CLIENT_ENCRYPT',
        actorDID: 'did:peer:2.Ez6MksPatientMasterDID',
        actorRole: 'PATIENT',
        targetRecordId: 'REC-001',
        details: 'Client-side envelope encryption completed with AES-256-GCM. 0 bytes plaintext transmitted.',
        txHash: '0x9a8c1f4e5d6b7a8c9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
        blockNumber: this.blockNumber - 140,
      },
      {
        id: 'log-2',
        timestamp: Date.now() - 1800000,
        action: 'CONSENT_GRANTED',
        actorDID: 'did:peer:2.Ez6MksPatientMasterDID',
        actorRole: 'PATIENT',
        targetRecordId: 'REC-001',
        details: '15-minute ephemeral QR access granted to Dr. Priya Sharma (Apollo)',
        txHash: '0x3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e',
        blockNumber: this.blockNumber - 52,
      },
    ];
  }

  public async grantConsentOnChain(
    grant: Omit<ConsentGrant, 'onChainTxHash' | 'status'>
  ): Promise<{ grantId: string; txHash: string; latencyMs: number }> {
    const startTime = performance.now();
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    this.blockNumber += 1;

    const fullGrant: ConsentGrant = {
      ...grant,
      status: 'ACTIVE',
      onChainTxHash: txHash,
    };

    this.grants.set(grant.grantId, fullGrant);

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      action: 'CONSENT_GRANTED',
      actorDID: grant.patientDID,
      actorRole: 'PATIENT',
      targetRecordId: grant.recordId,
      details: `Ephemeral consent token issued for ${grant.recipientName}. Scope: ${grant.scope}. Expires in ${Math.round((grant.expiresAt - grant.grantedAt) / 60000)} mins.`,
      txHash,
      blockNumber: this.blockNumber,
    });

    const latencyMs = Number((performance.now() - startTime).toFixed(1));
    return { grantId: grant.grantId, txHash, latencyMs };
  }

  public async revokeConsentOnChain(
    grantId: string,
    patientDID: string
  ): Promise<{ txHash: string; latencyMs: number }> {
    const startTime = performance.now();
    const grant = this.grants.get(grantId);
    if (!grant) {
      throw new Error('Grant not found on ledger');
    }

    grant.status = 'REVOKED';
    this.grants.set(grantId, grant);
    this.blockNumber += 1;

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      action: 'CONSENT_REVOKED',
      actorDID: patientDID,
      actorRole: 'PATIENT',
      targetRecordId: grant.recordId,
      details: `Patient invoked 1-Click Revocation for grant ${grantId.slice(0, 10)}... Access blocked immediately.`,
      txHash,
      blockNumber: this.blockNumber,
    });

    const latencyMs = Number((performance.now() - startTime).toFixed(1));
    return { txHash, latencyMs };
  }

  public async verifyConsentOnChain(
    grantId: string,
    accessorDID: string
  ): Promise<{
    isValid: boolean;
    reason: string;
    remainingSeconds: number;
    grant?: ConsentGrant;
    latencyMs: number;
    txHash: string;
  }> {
    const startTime = performance.now();
    const grant = this.grants.get(grantId);

    if (!grant) {
      const latencyMs = Number((performance.now() - startTime).toFixed(1));
      return {
        isValid: false,
        reason: 'Consent grant ID not found in on-chain registry',
        remainingSeconds: 0,
        latencyMs,
        txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      };
    }

    if (grant.status === 'REVOKED') {
      const latencyMs = Number((performance.now() - startTime).toFixed(1));
      return {
        isValid: false,
        reason: 'Access denied: Consent was explicitly REVOKED by the patient',
        remainingSeconds: 0,
        grant,
        latencyMs,
        txHash: grant.onChainTxHash || '',
      };
    }

    const now = Date.now();
    if (now > grant.expiresAt) {
      grant.status = 'EXPIRED';
      const latencyMs = Number((performance.now() - startTime).toFixed(1));
      return {
        isValid: false,
        reason: 'Access denied: 15-minute ephemeral token has EXPIRED',
        remainingSeconds: 0,
        grant,
        latencyMs,
        txHash: grant.onChainTxHash || '',
      };
    }

    const remainingSeconds = Math.max(0, Math.floor((grant.expiresAt - now) / 1000));
    const latencyMs = Number((performance.now() - startTime).toFixed(1));

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      action: 'RECORD_VERIFIED',
      actorDID: accessorDID,
      actorRole: 'DOCTOR',
      targetRecordId: grant.recordId,
      details: `Doctor validated cryptographic signature and on-chain consent in ${latencyMs}ms. Remaining window: ${remainingSeconds}s.`,
      txHash: grant.onChainTxHash || '0xverified',
      blockNumber: this.blockNumber,
    });

    return {
      isValid: true,
      reason: 'Cryptographically verified on Polygon PoS ledger',
      remainingSeconds,
      grant,
      latencyMs,
      txHash: grant.onChainTxHash || '',
    };
  }

  public getGrants(): ConsentGrant[] {
    return Array.from(this.grants.values());
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }
}

// Global Singleton for mock ledger during session
export const ledgerService = new MockConsentLedger();
