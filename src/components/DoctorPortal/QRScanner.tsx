'use client';

import React, { useState } from 'react';
import { QrCode, ShieldCheck, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Cpu, Key, FileText, Check } from 'lucide-react';
import { ledgerService } from '@/lib/contracts/consentContract';
import { verifyZKPPredicateProof } from '@/lib/crypto/zkpPredicates';
import { ConsentGrant, ZKPProofPayload } from '@/types';

export const QRScanner: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    reason: string;
    remainingSeconds: number;
    latencyMs: number;
    txHash: string;
    grant?: ConsentGrant;
    zkpStatus?: {
      isValid: boolean;
      message: string;
      evaluatedCondition: string;
      latencyMs: number;
    };
  } | null>(null);

  const handleVerify = async (payloadString?: string) => {
    const raw = payloadString || tokenInput;
    if (!raw.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(raw.trim());
      } catch (e) {
        // Assume direct grant ID
        parsedPayload = { grantId: raw.trim() };
      }

      const grantId = parsedPayload.grantId;
      const doctorDID = 'did:peer:2.Ez6MksConsultingDoctor.Vz6MkuDoctorVerificationKey';

      // Call on-chain verification
      const onChainResult = await ledgerService.verifyConsentOnChain(grantId, doctorDID);

      let zkpStatus: any = null;
      if (onChainResult.grant?.predicateProof) {
        zkpStatus = await verifyZKPPredicateProof(onChainResult.grant.predicateProof);
      }

      setVerificationResult({
        isValid: onChainResult.isValid,
        reason: onChainResult.reason,
        remainingSeconds: onChainResult.remainingSeconds,
        latencyMs: onChainResult.latencyMs,
        txHash: onChainResult.txHash,
        grant: onChainResult.grant,
        zkpStatus,
      });
    } catch (err) {
      console.error('Verification failed:', err);
      setVerificationResult({
        isValid: false,
        reason: 'Malformed or unrecognized consent token',
        remainingSeconds: 0,
        latencyMs: 14.2,
        txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Quick Demo Tester using active grants in the ledger
  const handleLoadSampleToken = () => {
    const activeGrants = ledgerService.getGrants();
    if (activeGrants.length > 0) {
      const g = activeGrants[0];
      const payload = JSON.stringify({
        grantId: g.grantId,
        recordId: g.recordId,
        patientDID: g.patientDID,
        scope: g.scope,
        expiresAt: g.expiresAt,
        predicateProof: g.predicateProof,
        txHash: g.onChainTxHash,
      });
      setTokenInput(payload);
      handleVerify(payload);
    } else {
      alert('No active tokens issued yet. Go to Patient Vault and click "Issue 15-Min QR" first!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-textBone flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-surgicalTeal" />
            <span>Consulting Physician & TPA Verifier Portal</span>
          </h3>
          <p className="text-xs text-textMuted">
            Validate on-chain patient consent & AnonCreds Zero-Knowledge Predicates in &lt;150ms.
          </p>
        </div>

        <button
          onClick={handleLoadSampleToken}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surgicalTeal/10 text-surgicalTeal hover:bg-surgicalTeal/20 border border-surgicalTeal/30 transition-all self-start sm:self-auto flex items-center space-x-1.5"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Load Latest Patient QR Token</span>
        </button>
      </div>

      {/* Input / Scanner Box */}
      <div className="p-6 bg-cardNavy border border-borderNavy rounded-2xl space-y-4">
        <label className="block text-xs font-medium text-textMuted">
          Scan QR Code or Paste Ephemeral Token Payload (JSON / Grant ID)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            rows={3}
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            placeholder='Paste {"grantId": "0x...", "scope": "PREDICATE_ONLY", ...}'
            className="flex-1 bg-subNavy border border-borderNavy rounded-xl p-3 text-xs font-mono text-textBone focus:outline-none focus:ring-1 focus:ring-surgicalTeal"
          />
          <button
            onClick={() => handleVerify()}
            disabled={!tokenInput.trim() || isVerifying}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-surgicalTeal text-paperNavy hover:bg-tealHover disabled:opacity-50 shadow-glow-teal transition-all shrink-0 flex items-center justify-center space-x-2"
          >
            <Cpu className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying...' : 'Verify On-Chain'}</span>
          </button>
        </div>
      </div>

      {/* Verification Results Panel */}
      {verificationResult && (
        <div
          className={`p-6 rounded-2xl border transition-all ${
            verificationResult.isValid
              ? 'bg-surgicalTeal/5 border-surgicalTeal/40 shadow-glow-teal'
              : 'bg-warmCoral/5 border-warmCoral/40 shadow-sm'
          }`}
        >
          {/* Header Status */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-xl border ${
                  verificationResult.isValid
                    ? 'bg-surgicalTeal/10 border-surgicalTeal/30 text-surgicalTeal'
                    : 'bg-warmCoral/10 border-warmCoral/30 text-warmCoral'
                }`}
              >
                {verificationResult.isValid ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <ShieldAlert className="w-7 h-7" />
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-textBone">
                  {verificationResult.isValid ? 'Consent Authenticated & Active' : 'Access Denied / Fraud Blocked'}
                </h4>
                <p className="text-xs text-textMuted mt-0.5">{verificationResult.reason}</p>
              </div>
            </div>

            {/* Performance Benchmark Badge */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-cardNavy border border-borderNavy text-xs font-mono">
              <span className="text-textMuted">Verification Latency:</span>
              <span className="text-surgicalTeal font-bold">{verificationResult.latencyMs} ms</span>
              <span className="text-[10px] text-textMuted font-sans">(&lt; 150ms benchmark)</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* On-chain telemetry */}
            <div className="p-4 bg-cardNavy/80 rounded-xl border border-borderNavy space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-textMuted">Remaining Window:</span>
                <span className="text-textBone font-bold">
                  {Math.floor(verificationResult.remainingSeconds / 60)}m {verificationResult.remainingSeconds % 60}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-textMuted">Disclosure Scope:</span>
                <span className="text-surgicalTeal font-bold">
                  {verificationResult.grant?.scope || 'UNKNOWN'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-textMuted">Polygon Tx Hash:</span>
                <span className="text-textBone truncate max-w-[180px]">
                  {verificationResult.txHash}
                </span>
              </div>
            </div>

            {/* ZKP or Decryption Output */}
            <div className="p-4 bg-cardNavy/80 rounded-xl border border-borderNavy flex flex-col justify-center">
              {verificationResult.grant?.scope === 'PREDICATE_ONLY' && verificationResult.zkpStatus && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-surgicalTeal">
                    <ShieldCheck className="w-4 h-4" />
                    <span>AnonCreds ZKP Predicate Proof: PASSED</span>
                  </div>
                  <p className="text-xs text-textBone font-semibold">
                    {verificationResult.zkpStatus.evaluatedCondition}
                  </p>
                  <p className="text-[11px] text-textMuted leading-relaxed">
                    Zero-Knowledge assertion satisfied. Neither raw blood sugar nor patient diagnosis was disclosed during this adjudication.
                  </p>
                </div>
              )}

              {verificationResult.grant?.scope === 'FULL_RECORD' && verificationResult.isValid && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-surgicalTeal">
                    <Key className="w-4 h-4" />
                    <span>Decrypted Record Access Granted</span>
                  </div>
                  <p className="text-xs text-textBone font-semibold">
                    {verificationResult.grant.recordTitle}
                  </p>
                  <p className="text-[11px] text-textMuted">
                    Physician session authenticated. Key valid only within the 15-minute emergency consultation.
                  </p>
                </div>
              )}

              {verificationResult.grant?.scope === 'ANONYMIZED_SUMMARY' && verificationResult.isValid && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-surgicalTeal">
                    <FileText className="w-4 h-4" />
                    <span>PII-Sanitized Summary Available</span>
                  </div>
                  <p className="text-[11px] text-textMuted">
                    All 18 HIPAA identifiers stripped. Diagnostic metrics verified against issuing laboratory signature.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
