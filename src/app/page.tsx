'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Clock,
  EyeOff,
  Upload,
  CheckCircle2,
  FileText,
  Key,
  Database,
  ArrowRight,
  Activity,
  AlertCircle,
  Network,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { PairwiseChannelsBar } from '@/components/Common/PairwiseChannelsBar';
import { RecordList } from '@/components/PatientVault/RecordList';
import { ActiveGrantsList } from '@/components/PatientVault/ActiveGrantsList';
import { UploadEncryptModal } from '@/components/PatientVault/UploadEncryptModal';
import { QRScanner } from '@/components/DoctorPortal/QRScanner';
import { ZKPPlayground } from '@/components/ZKPStudio/ZKPPlayground';
import { AuditLedgerView } from '@/components/AuditTrail/AuditLedgerView';
import { IdentityRole, PatientRecord, ConsentGrant } from '@/types';
import { getStoredRecords, getStoredGrants } from '@/lib/storage/recordStore';
import { DEFAULT_PAIRWISE_CHANNELS } from '@/lib/crypto/didPeer';

export default function Home() {
  const [role, setRole] = useState<IdentityRole>('PATIENT');
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor' | 'zkp' | 'audit'>('patient');
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [grants, setGrants] = useState<ConsentGrant[]>([]);
  const [activeChannel, setActiveChannel] = useState(DEFAULT_PAIRWISE_CHANNELS[0]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const loadData = () => {
    setRecords(getStoredRecords());
    setGrants(getStoredGrants());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = (newRole: IdentityRole) => {
    setRole(newRole);
    if (newRole === 'DOCTOR') setActiveTab('doctor');
    else if (newRole === 'INSURER_TPA') setActiveTab('zkp');
    else setActiveTab('patient');
  };

  return (
    <div className="min-h-screen bg-paperNavy bg-radial-mesh flex flex-col">
      {/* Navigation Header */}
      <Navbar
        currentRole={role}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner / Architecture Snapshot */}
        <div className="relative overflow-hidden rounded-3xl border border-borderNavy bg-gradient-to-r from-cardNavy via-subNavy/60 to-cardNavy p-6 sm:p-8 shadow-glow-card">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-surgicalTeal/10 border border-surgicalTeal/30 text-surgicalTeal text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Zero-Knowledge Clinical Privacy & Sovereign Consent</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-textBone tracking-tight">
                Your Health. Your Data. <span className="text-surgicalTeal">Your Sovereignty.</span>
              </h1>
              <p className="text-xs sm:text-sm text-textMuted leading-relaxed">
                MedVault eliminates centralized medical honeypots using{' '}
                <strong className="text-textBone">client-side AES-256-GCM envelope encryption</strong>,{' '}
                <strong className="text-textBone">W3C did:peer anti-correlation</strong>, and{' '}
                <strong className="text-textBone">AnonCreds ZKP predicates</strong>. Consent is time-bounded by 15-minute auto-destruct tokens verifiable on Polygon PoS in under 150ms.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
              <div className="p-3 bg-paperNavy/80 border border-borderNavy rounded-xl text-center">
                <div className="text-lg font-black text-surgicalTeal font-mono">&lt; 150ms</div>
                <div className="text-[10px] text-textMuted uppercase font-semibold">Verify Latency</div>
              </div>
              <div className="p-3 bg-paperNavy/80 border border-borderNavy rounded-xl text-center">
                <div className="text-lg font-black text-surgicalTeal font-mono">0 Bytes</div>
                <div className="text-[10px] text-textMuted uppercase font-semibold">Server Plaintext</div>
              </div>
              <div className="p-3 bg-paperNavy/80 border border-borderNavy rounded-xl text-center col-span-2 sm:col-span-1">
                <div className="text-lg font-black text-surgicalTeal font-mono">1-Click</div>
                <div className="text-[10px] text-textMuted uppercase font-semibold">Instant Revoke</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === 'patient' && (
          <div className="space-y-6">
            {/* Pairwise Anti-Correlation Selector */}
            <PairwiseChannelsBar onSelectChannel={ch => setActiveChannel(ch)} />

            {/* Patient Vault Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-textBone flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-surgicalTeal" />
                  <span>Sovereign Medical Vault</span>
                </h2>
                <p className="text-xs text-textMuted mt-0.5">
                  Documents are encrypted in your browser with AES-256-GCM. Decryption keys never leave your device.
                </p>
              </div>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2.5 bg-surgicalTeal text-paperNavy font-bold rounded-xl text-xs hover:bg-tealHover shadow-glow-teal transition-all flex items-center space-x-2 self-start sm:self-auto"
              >
                <Upload className="w-4 h-4" />
                <span>Upload & Encrypt Document</span>
              </button>
            </div>

            {/* Live Active Consent Grants Section */}
            <ActiveGrantsList
              grants={grants}
              patientDID={activeChannel.peerDID}
              onGrantUpdated={loadData}
            />

            {/* Patient Clinical Records List */}
            <RecordList
              records={records}
              patientDID={activeChannel.peerDID}
              onGrantCreated={loadData}
            />
          </div>
        )}

        {activeTab === 'doctor' && (
          <div className="space-y-6">
            <QRScanner />
          </div>
        )}

        {activeTab === 'zkp' && (
          <div className="space-y-6">
            <ZKPPlayground />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <AuditLedgerView />
          </div>
        )}
      </main>

      {/* Upload Encrypted Modal */}
      {isUploadOpen && (
        <UploadEncryptModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          patientDID={activeChannel.peerDID}
          onRecordUploaded={newRecord => {
            loadData();
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-borderNavy bg-cardNavy/50 mt-16 py-6 text-center text-xs text-textMuted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MedVault DID — Sovereign Clinical Identity & Verifiable Consent Ledger</span>
          <span className="font-mono text-[11px] text-surgicalTeal">
            W3C DID Core 1.0 · Hyperledger Aries did:peer · ABDM HL7 FHIR R4
          </span>
        </div>
      </footer>
    </div>
  );
}
