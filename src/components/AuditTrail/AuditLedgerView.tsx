'use client';

import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, ExternalLink, Filter, Search, Lock, UserCheck, Ban, FileCheck } from 'lucide-react';
import { AuditLogEntry } from '@/types';
import { ledgerService } from '@/lib/contracts/consentContract';

export const AuditLedgerView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const refreshLogs = () => {
    setLogs(ledgerService.getAuditLogs());
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorDID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'CONSENT_GRANTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surgicalTeal/10 text-surgicalTeal border border-surgicalTeal/30 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>CONSENT GRANTED</span>
          </span>
        );
      case 'CONSENT_REVOKED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warmCoral/10 text-warmCoral border border-warmCoral/30 flex items-center space-x-1">
            <Ban className="w-3 h-3" />
            <span>REVOKED</span>
          </span>
        );
      case 'RECORD_VERIFIED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center space-x-1">
            <UserCheck className="w-3 h-3" />
            <span>DOCTOR ACCESSED</span>
          </span>
        );
      case 'CLIENT_ENCRYPT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>AES-256 ENCRYPTED</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-textMuted/10 text-textMuted border border-textMuted/30">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-textBone flex items-center space-x-2">
            <Database className="w-5 h-5 text-surgicalTeal" />
            <span>Polygon PoS Consent Ledger & Immutable Audit Trail</span>
          </h3>
          <p className="text-xs text-textMuted">
            Cryptographic proof of every consent issuance, doctor verification, and instant revocation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-lg bg-cardNavy border border-borderNavy text-[11px] text-textMuted font-mono">
            Latest Block: <strong className="text-surgicalTeal">#58,291,424</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-cardNavy border border-borderNavy rounded-2xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Tx Hash, Actor DID, or details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-subNavy border border-borderNavy rounded-xl pl-9 pr-3 py-2 text-xs text-textBone focus:outline-none focus:ring-1 focus:ring-surgicalTeal"
          />
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="bg-subNavy border border-borderNavy rounded-xl px-3 py-2 text-xs text-textBone focus:outline-none focus:ring-1 focus:ring-surgicalTeal"
        >
          <option value="ALL">All Event Types</option>
          <option value="CONSENT_GRANTED">Consent Granted</option>
          <option value="CONSENT_REVOKED">Consent Revoked</option>
          <option value="RECORD_VERIFIED">Doctor Verification</option>
          <option value="CLIENT_ENCRYPT">Client Encryption</option>
        </select>
      </div>

      {/* Logs Table / Cards */}
      <div className="space-y-2.5">
        {filteredLogs.map(log => (
          <div
            key={log.id}
            className="p-4 bg-cardNavy border border-borderNavy hover:border-surgicalTeal/30 rounded-xl transition-all space-y-2 text-xs"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2.5">
                {getActionBadge(log.action)}
                <span className="text-[11px] font-mono text-textMuted">
                  Block #{log.blockNumber}
                </span>
              </div>
              <span className="text-[11px] text-textMuted">
                {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
              </span>
            </div>

            <p className="text-textBone leading-relaxed font-medium">{log.details}</p>

            <div className="pt-2 border-t border-borderNavy/50 flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono text-textMuted">
              <div className="truncate max-w-[320px]">
                Actor: <span className="text-textBone">{log.actorDID}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-surgicalTeal truncate max-w-[280px]">
                <span>Tx:</span>
                <span className="truncate">{log.txHash}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-xs text-textMuted border border-dashed border-borderNavy rounded-xl">
            No audit records found matching your query.
          </div>
        )}
      </div>
    </div>
  );
};
