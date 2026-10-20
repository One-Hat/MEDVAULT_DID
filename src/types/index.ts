export type IdentityRole = 'PATIENT' | 'DOCTOR' | 'HOSPITAL' | 'INSURER_TPA';

export interface DIDDocument {
  id: string; // e.g., did:peer:2.Ez6Mks... or did:key:z6Mku...
  controller: string;
  authentication: string[];
  verificationMethod: Array<{
    id: string;
    type: 'JsonWebKey2020' | 'Ed25519VerificationKey2020' | 'EcdsaSecp256k1VerificationKey2019';
    controller: string;
    publicKeyJwk?: JsonWebKey;
    publicKeyMultibase?: string;
  }>;
  service?: Array<{
    id: string;
    type: string;
    serviceEndpoint: string;
  }>;
}

export interface ClinicalVitalMetric {
  code: string; // LOINC code, e.g. "2339-0" for Glucose
  name: string; // e.g. "Fasting Blood Glucose"
  value: number;
  unit: string; // e.g. "mg/dL"
  referenceRange: string; // e.g. "70 - 99 mg/dL"
  interpretation: 'NORMAL' | 'ELEVATED' | 'CRITICAL' | 'LOW';
}

export interface PatientRecord {
  id: string;
  title: string;
  category: 'LAB_REPORT' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'RADIOLOGY' | 'VACCINATION';
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: number; // Unix timestamp
  ipfsCID: string; // Mock or actual CIDv1
  integrityHash: string; // SHA-256 of the unencrypted file
  encryptedData: string; // Base64 ciphertext
  iv: string; // Base64 Initialization Vector (12 bytes for AES-GCM)
  encryptionKeyJwk?: JsonWebKey; // Patient's local private session key (never leaves local browser)
  issuerDID: string; // Hospital/Lab DID
  issuerName: string;
  patientDID: string;
  vitals?: ClinicalVitalMetric[];
  redactedSummary?: string;
  fhirBundle?: Record<string, any>;
  signature: string; // Issuer cryptographic signature
}

export type AccessScope = 'FULL_RECORD' | 'PREDICATE_ONLY' | 'ANONYMIZED_SUMMARY';

export interface ZKPPredicateCondition {
  field: string; // e.g. "bloodGlucose" or "age" or "hba1c"
  operator: '<=' | '>=' | '==' | '<' | '>';
  threshold: number | string | boolean;
  label: string; // e.g. "Blood Glucose <= 140 mg/dL"
}

export interface ZKPProofPayload {
  predicate: ZKPPredicateCondition;
  isSatisfied: boolean;
  proofHash: string; // Cryptographic hash commitment
  commitmentNonce: string;
  timestamp: number;
  verifierAlgorithm: 'AnonCreds-Pedersen-v1' | 'BBS-Plus-Disclosure';
  signerDID: string;
}

export interface ConsentGrant {
  grantId: string; // Bytes32 on-chain ID
  recordId: string;
  recordTitle: string;
  patientDID: string;
  recipientDID: string; // Target Doctor / Clinic DID or wildcard for QR
  recipientName: string;
  scope: AccessScope;
  predicateProof?: ZKPProofPayload;
  grantedAt: number;
  expiresAt: number;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  onChainTxHash?: string;
  ephemeralSessionKey?: string; // Encrypted for recipient
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: 'RECORD_UPLOAD' | 'CLIENT_ENCRYPT' | 'CONSENT_GRANTED' | 'CONSENT_REVOKED' | 'RECORD_VERIFIED' | 'ZKP_AUDITED' | 'FRAUD_DETECTED';
  actorDID: string;
  actorRole: IdentityRole;
  targetRecordId?: string;
  details: string;
  txHash: string;
  blockNumber: number;
}
