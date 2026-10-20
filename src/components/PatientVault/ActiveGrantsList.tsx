'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, Ban, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConsentGrant } from '@/types';
import { ledgerService } from '@/lib/contracts/consentContract';
import { updateGrantStatus } from '@/lib/storage/recordStore';

interface ActiveGrantsListProps {
  grants: ConsentGrant[];
  patientDID: string;
  onGrantUpdated: () => void;
}

export const ActiveGrantsList: React.FC<ActiveGrantsListProps> = ({
  grants,
  patientDID,
  onGrantUpdated,
}) => {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // Live timer tick every 1000ms
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRevoke = async (grantId: string) => {
    setRevokingId(grantId);
    try {
      await ledgerService.revokeConsentOnChain(grantId, patientDID);
      updateGrantStatus(grantId, 'REVOKED');
      onGrantUpdated();
    } catch (err) {
      console.error('Revocation failed:', err);
      alert('Failed to revoke consent on-chain.');
    } finally {
      setRevokingId(null);
    }
  };

  if (grants.length === 0) {
    return (
      <div className="p-6 bg-cardNavy/40 border border-borderNavy/60 rounded-2xl text-center text-xs text-textMuted">
        No active consent tokens currently issued. All your medical documents are 100% locked.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted flex items-center space-x-1.5">
          <Clock className="w-4 h-4 text-surgicalTeal" />
          <span>Active Ephemeral Grants & Live Revocation Registry</span>
        </h4>
        <span className="text-[11px] text-surgicalTeal font-medium">
          {grants.filter(g => g.status === 'ACTIVE' && g.expiresAt > Date.now()).length} Active Sessions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {grants.map(grant => {
          const now = Date.now();
          const isExpired = now >= grant.expiresAt;
          const remainingSecs = Math.max(0, Math.floor((grant.expiresAt - now) / 1000));
          const mins = Math.floor(remainingSecs / 60);
          const secs = remainingSecs % 60;
          const isRevoked = grant.status === 'REVOKED';

          return (
            <div
              key={grant.grantId}
              className={`p-4 rounded-xl border transition-all ${
                isRevoked
                  ? 'bg-subNavy/20 border-warmCoral/30 opacity-70'
                  : isExpired
                  ? 'bg-subNavy/20 border-borderNavy opacity-60'
                  : 'bg-cardNavy border-surgicalTeal/30 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-textBone">{grant.recipientName}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        isRevoked
                          ? 'bg-warmCoral/10 text-warmCoral border border-warmCoral/30'
                          : isExpired
                          ? 'bg-textMuted/10 text-textMuted border border-textMuted/30'
                          : 'bg-surgicalTeal/10 text-surgicalTeal border border-surgicalTeal/30'
                      }`}
                    >
                      {isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-textMuted mt-0.5 truncate max-w-[280px]">
                    Record: {grant.recordTitle}
                  </p>
                </div>

                {/* Revoke Button */}
                {!isRevoked && !isExpired && (
                  <button
                    onClick={() => handleRevoke(grant.grantId)}
                    disabled={revokingId === grant.grantId}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-warmCoral/10 text-warmCoral hover:bg-warmCoral hover:text-white border border-warmCoral/30 rounded-lg transition-all flex items-center space-x-1 shrink-0"
                    title="Execute instant 1-Click on-chain revocation"
                  >
                    <Ban className="w-3 h-3" />
                    <span>{revokingId === grant.grantId ? 'Revoking...' : 'Revoke'}</span>
                  </button>
                )}
              </div>

              {/* Countdown & Scope details */}
              <div className="mt-3 pt-3 border-t border-borderNavy/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-textMuted">
                  <span>Scope:</span>
                  <span className="font-mono text-textBone font-semibold text-[11px]">
                    {grant.scope}
                  </span>
                </div>

                {!isRevoked && !isExpired ? (
                  <div className="flex items-center space-x-1 font-mono text-surgicalTeal font-bold">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span>
                      {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-textMuted">Session Inactive</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
