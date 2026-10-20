import { DIDDocument } from '@/types';

/**
 * W3C Decentralized Identity & Pairwise did:peer generator
 * In accordance with Hyperledger Aries RFC 0627 (did:peer)
 * Prevents cross-institutional correlation and profiling of patients.
 */

export interface PairwiseDIDChannel {
  peerDID: string;
  facilityName: string;
  facilityCategory: 'HOSPITAL' | 'LAB' | 'SPECIALIST' | 'INSURANCE';
  createdAt: number;
  document: DIDDocument;
  keyPair: {
    publicKeyHex: string;
    privateKeyHex?: string;
  };
}

// Simple base58 / hex utility for mock did:peer representation
function generateRandomHex(bytesLength: number): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(bytesLength);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return Array.from({ length: bytesLength }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
}

/**
 * Creates a pairwise did:peer:2 DID Document for a specific hospital or clinic
 */
export function generatePairwiseDID(
  facilityName: string,
  facilityCategory: 'HOSPITAL' | 'LAB' | 'SPECIALIST' | 'INSURANCE' = 'HOSPITAL'
): PairwiseDIDChannel {
  const encKey = generateRandomHex(16);
  const signKey = generateRandomHex(16);
  const peerDID = `did:peer:2.Ez6Mks${encKey}.Vz6Mku${signKey}`;

  const didDoc: DIDDocument = {
    id: peerDID,
    controller: peerDID,
    authentication: [`${peerDID}#key-1`],
    verificationMethod: [
      {
        id: `${peerDID}#key-1`,
        type: 'JsonWebKey2020',
        controller: peerDID,
        publicKeyMultibase: `z${signKey}`,
      },
    ],
    service: [
      {
        id: `${peerDID}#didcomm`,
        type: 'DIDCommMessaging',
        serviceEndpoint: `https://medvault.did/messaging/${encKey.slice(0, 8)}`,
      },
    ],
  };

  return {
    peerDID,
    facilityName,
    facilityCategory,
    createdAt: Date.now(),
    document: didDoc,
    keyPair: {
      publicKeyHex: signKey,
      privateKeyHex: generateRandomHex(32),
    },
  };
}

/**
 * Pre-seeded pairwise relationships for demonstrative healthcare networks
 */
export const DEFAULT_PAIRWISE_CHANNELS: PairwiseDIDChannel[] = [
  generatePairwiseDID('Apollo Multi-Speciality Hospital', 'HOSPITAL'),
  generatePairwiseDID('Dr. Lal PathLabs & Diagnostics', 'LAB'),
  generatePairwiseDID('Max Healthcare Oncology Centre', 'SPECIALIST'),
  generatePairwiseDID('Star Health Insurance TPA Portal', 'INSURANCE'),
];
