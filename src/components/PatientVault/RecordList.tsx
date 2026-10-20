'use client';

import React, { useState } from 'react';
import { FileText, Lock, QrCode, Eye, ShieldCheck, Hash, ExternalLink, Calendar, Building, Sparkles } from 'lucide-react';
import { PatientRecord } from '@/types';
import { ConsentModal } from './ConsentModal';

interface RecordListProps {
  records: PatientRecord[];
  patientDID: string;
  onGrantCreated: () => void;
}

export const RecordList: React.FC<RecordListProps> = ({
  records,
  patientDID,
  onGrantCreated,
}) => {
  const [selectedForConsent, setSelectedForConsent] = useState<PatientRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<PatientRecord | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map(record => (
          <div
            key={record.id}
            className="p-5 bg-cardNavy border border-borderNavy hover:border-surgicalTeal/40 rounded-2xl transition-all shadow-sm space-y-4 flex flex-col justify-between"
          >
            {/* Record Header */}
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-subNavy rounded-xl border border-borderNavy">
                    <FileText className="w-6 h-6 text-surgicalTeal" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-textBone line-clamp-1">{record.title}</h4>
                    <p className="text-xs text-textMuted flex items-center space-x-1.5 mt-0.5">
                      <Building className="w-3 h-3 text-textMuted" />
                      <span>{record.issuerName}</span>
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-surgicalTeal/10 text-surgicalTeal border border-surgicalTeal/30 rounded-full shrink-0">
                  AES-256-GCM
                </span>
              </div>

              {/* Vitals Summary / LOINC */}
              {record.vitals && record.vitals.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {record.vitals.map(vital => (
                    <span
                      key={vital.code}
                      className="px-2.5 py-1 rounded-lg bg-subNavy border border-borderNavy text-[11px] font-medium text-textBone flex items-center space-x-1.5"
                    >
                      <span className="text-textMuted font-mono text-[10px]">{vital.code}</span>
                      <span>{vital.name}:</span>
                      <strong className={vital.interpretation === 'ELEVATED' ? 'text-amber-400' : 'text-surgicalTeal'}>
                        {vital.value} {vital.unit}
                      </strong>
                    </span>
                  ))}
                </div>
              )}

              {/* Cryptographic Proof Badges */}
              <div className="mt-3.5 p-3 bg-subNavy/50 rounded-xl border border-borderNavy text-[11px] font-mono text-textMuted space-y-1">
                <div className="flex items-center justify-between">
                  <span>IPFS CID:</span>
                  <span className="text-textBone truncate max-w-[200px]">{record.ipfsCID}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>SHA-256 Digest:</span>
                  <span className="text-textBone truncate max-w-[200px]">{record.integrityHash.slice(0, 16)}...</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-borderNavy/60 flex items-center justify-between gap-2">
              <button
                onClick={() => setViewingRecord(record)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-textMuted hover:text-textBone bg-subNavy hover:bg-borderNavy transition-colors flex items-center space-x-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Decrypt & View</span>
              </button>

              <button
                onClick={() => setSelectedForConsent(record)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surgicalTeal text-paperNavy hover:bg-tealHover shadow-glow-teal transition-all flex items-center space-x-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Issue 15-Min QR</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ephemeral Consent Modal */}
      {selectedForConsent && (
        <ConsentModal
          isOpen={!!selectedForConsent}
          onClose={() => setSelectedForConsent(null)}
          record={selectedForConsent}
          patientDID={patientDID}
          onGrantCreated={() => {
            onGrantCreated();
          }}
        />
      )}

      {/* View Decrypted Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paperNavy/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-cardNavy border border-borderNavy rounded-2xl shadow-glow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-borderNavy bg-subNavy/50">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-surgicalTeal" />
                <h3 className="text-base font-semibold text-textBone">
                  Client Decrypted Clinical Preview
                </h3>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="text-textMuted hover:text-textBone text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="p-3 bg-surgicalTeal/10 border border-surgicalTeal/20 rounded-xl text-xs text-surgicalTeal">
                Decrypted purely inside your browser volatile memory via Web Crypto API. No plaintexts were sent over the network.
              </div>

              <div>
                <h4 className="text-sm font-bold text-textBone">{viewingRecord.title}</h4>
                <p className="text-xs text-textMuted font-mono mt-0.5">
                  File: {viewingRecord.fileName} ({Math.round(viewingRecord.fileSize / 1024)} KB)
                </p>
              </div>

              {viewingRecord.redactedSummary && (
                <div className="p-4 bg-subNavy rounded-xl border border-borderNavy space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-surgicalTeal">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Privacy-Preserving Diagnostic Summary</span>
                  </div>
                  <p className="text-xs text-textBone leading-relaxed">
                    {viewingRecord.redactedSummary}
                  </p>
                </div>
              )}

              {/* Vitals breakdown */}
              {viewingRecord.vitals && viewingRecord.vitals.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-textMuted uppercase mb-2">
                    Standardized FHIR / LOINC Clinical Metrics
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viewingRecord.vitals.map(v => (
                      <div key={v.code} className="p-3 bg-subNavy rounded-lg border border-borderNavy text-xs">
                        <div className="text-textMuted font-mono text-[10px]">{v.code}</div>
                        <div className="text-textBone font-semibold">{v.name}</div>
                        <div className="text-surgicalTeal font-bold mt-1">
                          {v.value} {v.unit}{' '}
                          <span className="text-[10px] text-textMuted font-normal">
                            (Ref: {v.referenceRange})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-cardNavy rounded-lg border border-borderNavy text-[11px] font-mono text-textMuted">
                <div>W3C Signature: {viewingRecord.signature}</div>
                <div>Patient DID: {viewingRecord.patientDID}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
