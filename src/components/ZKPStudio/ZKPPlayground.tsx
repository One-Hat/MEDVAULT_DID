'use client';

import React, { useState } from 'react';
import { Shield, CheckCircle2, XCircle, Cpu, EyeOff, Sparkles, Hash, ArrowRight } from 'lucide-react';
import { ClinicalVitalMetric, ZKPProofPayload } from '@/types';
import { generateZKPPredicateProof, verifyZKPPredicateProof } from '@/lib/crypto/zkpPredicates';

const SAMPLE_METRICS: ClinicalVitalMetric[] = [
  {
    code: '2339-0',
    name: 'Fasting Blood Glucose',
    value: 108,
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
    code: '8480-6',
    name: 'Systolic Blood Pressure',
    value: 124,
    unit: 'mmHg',
    referenceRange: '90 - 120 mmHg',
    interpretation: 'NORMAL',
  },
  {
    code: '2093-3',
    name: 'Total Cholesterol',
    value: 185,
    unit: 'mg/dL',
    referenceRange: '< 200 mg/dL',
    interpretation: 'NORMAL',
  },
];

export const ZKPPlayground: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<ClinicalVitalMetric>(SAMPLE_METRICS[0]);
  const [operator, setOperator] = useState<'<=' | '>=' | '<' | '>'>('<=');
  const [threshold, setThreshold] = useState<number>(140);
  const [generatedProof, setGeneratedProof] = useState<ZKPProofPayload | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
    latencyMs: number;
  } | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  const handleGenerate = async () => {
    setIsComputing(true);
    setVerificationResult(null);
    try {
      const proof = await generateZKPPredicateProof(
        selectedMetric,
        operator,
        threshold,
        'did:peer:2.Ez6MksPatientMasterDID'
      );
      setGeneratedProof(proof);
    } catch (e) {
      console.error(e);
    } finally {
      setIsComputing(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!generatedProof) return;
    setIsComputing(true);
    try {
      const result = await verifyZKPPredicateProof(generatedProof);
      setVerificationResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-textBone flex items-center space-x-2">
          <EyeOff className="w-5 h-5 text-surgicalTeal" />
          <span>AnonCreds Zero-Knowledge Predicate Studio</span>
        </h3>
        <p className="text-xs text-textMuted mt-1">
          Prove clinical requirements (e.g. Glucose &le; 140 mg/dL or Age &ge; 18) to insurance TPAs without disclosing exact readings or health records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Patient Proof Generator */}
        <div className="p-6 bg-cardNavy border border-borderNavy rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-surgicalTeal">
              Step 1: Patient Assertion Setup
            </span>
            <span className="text-[11px] text-textMuted">W3C AnonCreds v1.0</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-textMuted mb-1">
              Select Clinical Vital to Prove
            </label>
            <select
              value={selectedMetric.code}
              onChange={e => {
                const found = SAMPLE_METRICS.find(m => m.code === e.target.value);
                if (found) {
                  setSelectedMetric(found);
                  if (found.code === '2339-0') setThreshold(140);
                  if (found.code === '4548-4') setThreshold(6.5);
                  if (found.code === '8480-6') setThreshold(130);
                  if (found.code === '2093-3') setThreshold(200);
                  setGeneratedProof(null);
                  setVerificationResult(null);
                }
              }}
              className="w-full bg-subNavy border border-borderNavy rounded-xl p-2.5 text-xs text-textBone focus:outline-none focus:ring-1 focus:ring-surgicalTeal"
            >
              {SAMPLE_METRICS.map(m => (
                <option key={m.code} value={m.code}>
                  {m.name} ({m.code}) — Current actual: {m.value} {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-textMuted mb-1">Condition</label>
              <select
                value={operator}
                onChange={e => setOperator(e.target.value as any)}
                className="w-full bg-subNavy border border-borderNavy rounded-xl p-2.5 text-xs text-textBone focus:outline-none focus:ring-1 focus:ring-surgicalTeal"
              >
                <option value="<=">&le; (Less than or equal)</option>
                <option value=">=">&ge; (Greater than or equal)</option>
                <option value="<">&lt; (Strictly less than)</option>
                <option value=">">&gt; (Strictly greater than)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-textMuted mb-1">
                Threshold ({selectedMetric.unit})
              </label>
              <input
                type="number"
                step="0.1"
                value={threshold}
                onChange={e => setThreshold(parseFloat(e.target.value) || 0)}
                className="w-full bg-subNavy border border-borderNavy rounded-xl p-2.5 text-xs text-textBone focus:outline-none focus:ring-1 focus:ring-surgicalTeal"
              />
            </div>
          </div>

          <div className="p-3 bg-subNavy/50 rounded-xl border border-borderNavy text-xs text-textMuted space-y-1">
            <span className="text-textBone font-semibold">Assertion to Prove:</span>
            <p className="font-mono text-surgicalTeal text-xs">
              {selectedMetric.name} {operator} {threshold} {selectedMetric.unit}
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isComputing}
            className="w-full py-3 bg-surgicalTeal text-paperNavy font-bold rounded-xl text-xs hover:bg-tealHover shadow-glow-teal transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Zero-Knowledge Commitment</span>
          </button>

          {/* Generated Proof Payload display */}
          {generatedProof && (
            <div className="p-4 bg-subNavy rounded-xl border border-surgicalTeal/30 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-surgicalTeal font-bold">
                <span>Proof Commitment Hash:</span>
                <span>{generatedProof.isSatisfied ? 'VALID' : 'UNSATISFIED'}</span>
              </div>
              <p className="text-[11px] text-textBone break-all bg-cardNavy p-2 rounded border border-borderNavy">
                {generatedProof.proofHash}
              </p>
              <div className="flex items-center justify-between text-[11px] text-textMuted pt-1">
                <span>Blinding Nonce:</span>
                <span className="text-textBone">{generatedProof.commitmentNonce}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-textMuted">
                <span>Algorithm:</span>
                <span className="text-textBone">{generatedProof.verifierAlgorithm}</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Insurer / TPA Verification Portal */}
        <div className="p-6 bg-cardNavy border border-borderNavy rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-textMuted">
                Step 2: Insurer / Auditor Verification
              </span>
              <span className="text-[11px] text-surgicalTeal font-medium">Zero-Leakage Adjudication</span>
            </div>

            <div className="p-4 bg-subNavy/30 rounded-xl border border-borderNavy text-xs text-textMuted space-y-2">
              <p className="text-textBone font-semibold">How this eliminates privacy honeypots:</p>
              <p>
                The insurance auditor verifies that the patient satisfies medical prerequisites (e.g. for surgery coverage or discount tiers) without receiving any lab PDFs, doctor notes, or exact numerical values.
              </p>
            </div>

            {generatedProof ? (
              <div className="p-4 bg-subNavy rounded-xl border border-borderNavy space-y-3">
                <div className="text-xs text-textMuted">Ready to verify predicate proof for:</div>
                <div className="text-sm font-bold text-textBone font-mono">
                  {generatedProof.predicate.label}
                </div>
                <button
                  onClick={handleVerifyProof}
                  disabled={isComputing}
                  className="w-full py-2.5 bg-cardNavy hover:bg-borderNavy border border-surgicalTeal/40 text-surgicalTeal font-bold rounded-lg text-xs transition-all flex items-center justify-center space-x-2"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Execute ZKP Verification Algorithm</span>
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-textMuted border border-dashed border-borderNavy rounded-xl">
                Generate a proof in Step 1 to verify it here.
              </div>
            )}
          </div>

          {/* Verification Outcome */}
          {verificationResult && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                verificationResult.isValid
                  ? 'bg-surgicalTeal/10 border-surgicalTeal/40 text-surgicalTeal'
                  : 'bg-warmCoral/10 border-warmCoral/40 text-warmCoral'
              }`}
            >
              <div className="flex items-center space-x-2 text-xs font-bold">
                {verificationResult.isValid ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>
                  {verificationResult.isValid
                    ? 'Cryptographically Validated'
                    : 'Predicate Requirement Failed'}
                </span>
                <span className="ml-auto font-mono text-[10px] bg-cardNavy px-2 py-0.5 rounded text-textBone">
                  {verificationResult.latencyMs} ms
                </span>
              </div>
              <p className="text-xs text-textBone mt-2">{verificationResult.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
