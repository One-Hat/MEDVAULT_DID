import { PatientRecord, ConsentGrant } from '@/types';
import { DEFAULT_PAIRWISE_CHANNELS } from '@/lib/crypto/didPeer';

const INITIAL_RECORDS: PatientRecord[] = [
  {
    id: 'REC-2026-0891',
    title: 'Comprehensive Metabolic Panel & Glycemic Index',
    category: 'LAB_REPORT',
    fileName: 'metabolic_panel_cbc_aug2026.pdf',
    fileType: 'application/pdf',
    fileSize: 428000,
    uploadedAt: Date.now() - 172800000, // 2 days ago
    ipfsCID: 'bafybeihk3v9f7q2x1m4p8n0medvault7x',
    integrityHash: '0x9f83a4c281e053a6e3d92b1574a123f8b3c9d7e5f1a2b3c4d5e6f7a8b9c0d1e2',
    encryptedData: 'U2FsdGVkX19zZWNyZXQgbWVkaWNhbCByZWNvcmQgZGF0YSBlbmNyeXB0ZWQgd2l0aCBBRVMtMjU2LUdDTQ==',
    iv: 'A1B2C3D4E5F6G7H8I9J0K1L2',
    issuerDID: 'did:peer:2.Ez6MksDrLalPathLabs.Vz6MkuVerificationKey',
    issuerName: 'Dr. Lal PathLabs & Diagnostics Ltd.',
    patientDID: DEFAULT_PAIRWISE_CHANNELS[0].peerDID,
    vitals: [
      {
        code: '2339-0',
        name: 'Fasting Blood Glucose',
        value: 112,
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        interpretation: 'ELEVATED',
      },
      {
        code: '4548-4',
        name: 'Hemoglobin A1c (HbA1c)',
        value: 5.8,
        unit: '%',
        referenceRange: '< 5.7 %',
        interpretation: 'ELEVATED',
      },
      {
        code: '2093-3',
        name: 'Total Cholesterol',
        value: 178,
        unit: 'mg/dL',
        referenceRange: '< 200 mg/dL',
        interpretation: 'NORMAL',
      },
    ],
    redactedSummary:
      'Patient [REDACTED_PATIENT_NAME] evaluated at [REDACTED_CLINIC]. Fasting glucose slightly elevated at 112 mg/dL. HbA1c 5.8%. Kidney and Liver functional enzymes within normal limits.',
    signature: '0x3c9f281e05a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2',
  },
  {
    id: 'REC-2026-0421',
    title: 'Cardiovascular Stress Echocardiogram Report',
    category: 'LAB_REPORT',
    fileName: 'cardio_stress_echo_july2026.pdf',
    fileType: 'application/pdf',
    fileSize: 894000,
    uploadedAt: Date.now() - 604800000, // 7 days ago
    ipfsCID: 'bafybeic7r9x2m4p8n0k3v9f1medvault7x',
    integrityHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    encryptedData: 'U2FsdGVkX19lY2hvY2FyZGlvZ3JhbSBjaXBoZXJ0ZXh0IGJsb2Igd2l0aCB6ZXJvIGtub3dsZWRnZSBwcm9vZg==',
    iv: 'L2K1J0I9H8G7F6E5D4C3B2A1',
    issuerDID: 'did:peer:2.Ez6MksApolloHosp.Vz6MkuVerificationKey',
    issuerName: 'Apollo Multi-Speciality Hospital',
    patientDID: DEFAULT_PAIRWISE_CHANNELS[0].peerDID,
    vitals: [
      {
        code: '8867-4',
        name: 'Heart Rate at Peak Exercise',
        value: 142,
        unit: 'bpm',
        referenceRange: '130 - 165 bpm',
        interpretation: 'NORMAL',
      },
      {
        code: '8480-6',
        name: 'Systolic Blood Pressure',
        value: 128,
        unit: 'mmHg',
        referenceRange: '90 - 120 mmHg',
        interpretation: 'NORMAL',
      },
      {
        code: '8462-4',
        name: 'Diastolic Blood Pressure',
        value: 82,
        unit: 'mmHg',
        referenceRange: '60 - 80 mmHg',
        interpretation: 'NORMAL',
      },
    ],
    redactedSummary:
      'Normal exercise capacity. Left ventricular ejection fraction preserved (62%). No inducible ischemia during treadmill exercise test.',
    signature: '0x7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f',
  },
];

const STORAGE_KEY_RECORDS = 'medvault_patient_records';
const STORAGE_KEY_GRANTS = 'medvault_consent_grants';

export function getStoredRecords(): PatientRecord[] {
  if (typeof window === 'undefined') return INITIAL_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_RECORDS;
  }
}

export function saveRecord(record: PatientRecord): void {
  if (typeof window === 'undefined') return;
  const current = getStoredRecords();
  const updated = [record, ...current];
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updated));
}

export function getStoredGrants(): ConsentGrant[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GRANTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveGrant(grant: ConsentGrant): void {
  if (typeof window === 'undefined') return;
  const current = getStoredGrants();
  const updated = [grant, ...current];
  localStorage.setItem(STORAGE_KEY_GRANTS, JSON.stringify(updated));
}

export function updateGrantStatus(grantId: string, status: 'REVOKED' | 'EXPIRED'): void {
  if (typeof window === 'undefined') return;
  const current = getStoredGrants();
  const updated = current.map(g => (g.grantId === grantId ? { ...g, status } : g));
  localStorage.setItem(STORAGE_KEY_GRANTS, JSON.stringify(updated));
}
