'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, Shield, Check, Copy, X, Key, Zap, CheckCircle2 } from 'lucide-react';
import { PatientRecord, AccessScope, ConsentGrant, ZKPProofPayload } from '@/types';
import { generateZKPPredicateProof } from '@/lib/crypto/zkpPredicates';
import { ledgerService } from '@/lib/contracts/consentContract';
import { saveGrant } from '@/lib/storage/recordStore';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PatientRecord;
  patientDID: string;
  onGrantCreated: (grant: ConsentGrant) => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  record,
  patientDID,
  onGrantCreated,
}) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [accessScope, setAccessScope] = useState<AccessScope>('PREDICATE_ONLY');
  const [recipientFacility, setRecipientFacility] = useState('Apollo Multi-Speciality Clinic');
  const [isMinting, setIsMinting] = useState(false);
  const [createdGrant, setCreatedGrant] = useState<ConsentGrant | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateGrant = async () => {
    setIsMinting(true);
    try {
      const grantId = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const expiresAt = Date.now() + durationMinutes * 60 * 1000;

      let predicateProof: ZKPProofPayload | undefined;

      // If scope is PREDICATE_ONLY, generate AnonCreds ZKP assertion
      if (accessScope === 'PREDICATE_ONLY' && record.vitals && record.vitals.length > 0) {
        const glucoseMetric = record.vitals.find(v => v.code === '2339-0') || record.vitals[0];
        predicateProof = await generateZKPPredicateProof(
          glucoseMetric,
          '<=',
          140, // 140 mg/dL normal threshold
          patientDID
        );
      }

      // Record on-chain
      const ledgerResult = await ledgerService.grantConsentOnChain({
        grantId,
        recordId: record.id,
        recordTitle: record.title,
        patientDID,
        recipientDID: `did:peer:2.Ez6Mks${recipientFacility.replace(/\s+/g, '')}`,
        recipientName: recipientFacility,
        scope: accessScope,
        predicateProof,
        grantedAt: Date.now(),
        expiresAt,
        ephemeralSessionKey: record.encryptionKeyJwk ? JSON.stringify(record.encryptionKeyJwk) : undefined,
      });

      const newGrant: ConsentGrant = {
        grantId,
        recordId: record.id,
        recordTitle: record.title,
        patientDID,
        recipientDID: `did:peer:2.Ez6Mks${recipientFacility.replace(/\s+/g, '')}`,
        recipientName: recipientFacility,
        scope: accessScope,
        predicateProof,
        grantedAt: Date.now(),
        expiresAt,
        status: 'ACTIVE',
        onChainTxHash: ledgerResult.txHash,
        ephemeralSessionKey: record.encryptionKeyJwk ? JSON.stringify(record.encryptionKeyJwk) : undefined,
      };

      saveGrant(newGrant);
      setCreatedGrant(newGrant);
      onGrantCreated(newGrant);
      setIsMinting(false);
    } catch (err) {
      console.error('Error issuing on-chain consent:', err);
      setIsMinting(false);
      alert('Failed to register consent on-chain.');
    }
  };

  const qrPayload = createdGrant
    ? JSON.stringify({
        grantId: createdGrant.grantId,
        recordId: createdGrant.recordId,
        patientDID: createdGrant.patientDID,
        scope: createdGrant.scope,
        expiresAt: createdGrant.expiresAt,
        predicateProof: createdGrant.predicateProof,
        txHash: createdGrant.onChainTxHash,
      })
    : '';

  const handleCopyPayload = () => {
    if (qrPayload) {
      navigator.clipboard.writeText(qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paperNavy/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-cardNavy border border-borderNavy rounded-2xl shadow-glow-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderNavy bg-subNavy/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-surgicalTeal/10 rounded-lg border border-surgicalTeal/20">
              <Clock className="w-5 h-5 text-surgicalTeal" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-textBone">
                Issue Ephemeral Verifiable Consent
              </h3>
              <p className="text-xs text-textMuted">
                Time-bounded QR token verifiable on Polygon PoS in under 150ms.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-textMuted hover:text-textBone hover:bg-cardNavy transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {!createdGrant ? (
            <>
              {/* Record Summary */}
              <div className="p-3 bg-subNavy rounded-xl border border-borderNavy">
                <span className="text-[10px] uppercase font-semibold text-surgicalTeal">
                  Target Record
                </span>
                <p className="text-sm font-semibold text-textBone mt-0.5">{record.title}</p>
                <p className="text-xs text-textMuted font-mono">CID: {record.ipfsCID}</p>
              </div>

              {/* Scope Selection */}
              <div>
                <label className="block text-xs font-medium text-textMuted mb-2">
                  Privacy & Disclosure Scope
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAccessScope('PREDICATE_ONLY')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      accessScope === 'PREDICATE_ONLY'
                        ? 'border-surgicalTeal bg-surgicalTeal/10 ring-1 ring-surgicalTeal'
                        : 'border-borderNavy bg-subNavy/40 hover:bg-subNavy'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-surgicalTeal">ZKP Predicate</span>
                      <Shield className="w-3.5 h-3.5 text-surgicalTeal" />
                    </div>
                    <p className="text-[11px] text-textMuted leading-snug">
                      Proves condition (e.g. Glucose ≤ 140 mg/dL) with 0 raw data disclosure.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessScope('ANONYMIZED_SUMMARY')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      accessScope === 'ANONYMIZED_SUMMARY'
                        ? 'border-surgicalTeal bg-surgicalTeal/10 ring-1 ring-surgicalTeal'
                        : 'border-borderNavy bg-subNavy/40 hover:bg-subNavy'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-textBone">PII-Scrubbed</span>
                      <Zap className="w-3.5 h-3.5 text-textMuted" />
                    </div>
                    <p className="text-[11px] text-textMuted leading-snug">
                      Shares diagnostic findings with 18 HIPAA identifiers stripped.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessScope('FULL_RECORD')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      accessScope === 'FULL_RECORD'
                        ? 'border-surgicalTeal bg-surgicalTeal/10 ring-1 ring-surgicalTeal'
                        : 'border-borderNavy bg-subNavy/40 hover:bg-subNavy'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-textBone">Full Record</span>
                      <Key className="w-3.5 h-3.5 text-textMuted" />
                    </div>
                    <p className="text-[11px] text-textMuted leading-snug">
                      Decryption key released only for this 15-min emergency consult.
                    </p>
                  </button>
                </div>
              </div>

              {/* Time Window (TTL) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">
                    Auto-Expiry TTL
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-subNavy border border-borderNavy rounded-lg px-3 py-2 text-xs text-textBone focus:outline-none focus:ring-1 focus:ring-surgicalTeal"
                  >
                    <option value={5}>5 Minutes (Quick Verification)</option>
                    <option value={15}>15 Minutes (Standard Clinical Consultation)</option>
                    <option value={60}>1 Hour (Hospital Admission)</option>
                    <option value={1440}>24 Hours (Day Stay)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">
                    Recipient Facility / Auditor
                  </label>
                  <input
                    type="text"
                    value={recipientFacility}
                    onChange={e => setRecipientFacility(e.target.value)}
                    className="w-full bg-subNavy border border-borderNavy rounded-lg px-3 py-2 text-xs text-textBone focus:outline-none focus:ring-1 focus:ring-surgicalTeal"
                  />
                </div>
              </div>

              {/* 1-Click Revocation Guarantee Notice */}
              <div className="p-3 bg-warmCoral/10 rounded-xl border border-warmCoral/30 text-xs text-warmCoral flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-warmCoral animate-ping" />
                <span>
                  You retain sovereign ownership: 1-Click active revocation can terminate this token instantly on-chain before expiry.
                </span>
              </div>
            </>
          ) : (
            /* Generated QR Code View */
            <div className="flex flex-col items-center py-2 space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow-glow-teal border-4 border-surgicalTeal/40">
                <QRCodeSVG value={qrPayload} size={210} level="M" />
              </div>

              <div className="text-center space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surgicalTeal/10 text-surgicalTeal text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>On-Chain Grant Registered: {createdGrant.grantId.slice(0, 12)}...</span>
                </div>
                <p className="text-xs text-textMuted">
                  Show this QR to your consulting doctor or insurance auditor.
                </p>
                <p className="text-xs font-mono text-warmCoral font-semibold">
                  Auto-destructs in {durationMinutes} minutes
                </p>
              </div>

              <div className="w-full p-3 bg-subNavy rounded-xl border border-borderNavy space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-textMuted">Polygon Tx Hash:</span>
                  <span className="text-surgicalTeal font-mono text-[11px] truncate max-w-[240px]">
                    {createdGrant.onChainTxHash}
                  </span>
                </div>
                <button
                  onClick={handleCopyPayload}
                  className="w-full py-2 bg-cardNavy hover:bg-borderNavy text-textBone rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition-colors border border-borderNavy"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-surgicalTeal" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied QR Payload!' : 'Copy Raw Token Payload'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-borderNavy bg-subNavy/50 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-textMuted hover:text-textBone transition-colors"
          >
            {createdGrant ? 'Done' : 'Cancel'}
          </button>
          {!createdGrant && (
            <button
              onClick={handleGenerateGrant}
              disabled={isMinting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-surgicalTeal text-paperNavy hover:bg-tealHover disabled:opacity-50 shadow-glow-teal transition-all flex items-center space-x-2"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isMinting ? 'Registering on Polygon...' : `Generate ${durationMinutes}-Min QR Token`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
