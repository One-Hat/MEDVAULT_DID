'use client';

import React from 'react';
import { Shield, Key, Activity, Lock, CheckCircle2, ChevronDown, User, Stethoscope, Building2 } from 'lucide-react';
import { IdentityRole } from '@/types';

interface NavbarProps {
  currentRole: IdentityRole;
  onRoleChange: (role: IdentityRole) => void;
  activeTab: 'patient' | 'doctor' | 'zkp' | 'audit';
  onTabChange: (tab: 'patient' | 'doctor' | 'zkp' | 'audit') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-borderNavy bg-paperNavy/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-surgicalTeal to-emerald-400 flex items-center justify-center shadow-glow-teal">
              <Shield className="w-6 h-6 text-paperNavy" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-textBone">
                  MedVault <span className="text-surgicalTeal">DID</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-surgicalTeal/10 text-surgicalTeal border border-surgicalTeal/30 rounded-full">
                  v2.0 Sovereign
                </span>
              </div>
              <p className="text-[11px] text-textMuted hidden sm:block">
                Zero-Knowledge Verifiable Consent & Clinical Ledger
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-cardNavy/80 p-1 rounded-xl border border-borderNavy">
            <button
              onClick={() => onTabChange('patient')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'patient'
                  ? 'bg-surgicalTeal text-paperNavy font-semibold shadow-sm'
                  : 'text-textMuted hover:text-textBone hover:bg-subNavy'
              }`}
            >
              Patient Vault
            </button>
            <button
              onClick={() => onTabChange('doctor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'doctor'
                  ? 'bg-surgicalTeal text-paperNavy font-semibold shadow-sm'
                  : 'text-textMuted hover:text-textBone hover:bg-subNavy'
              }`}
            >
              Doctor / Verifier Portal
            </button>
            <button
              onClick={() => onTabChange('zkp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'zkp'
                  ? 'bg-surgicalTeal text-paperNavy font-semibold shadow-sm'
                  : 'text-textMuted hover:text-textBone hover:bg-subNavy'
              }`}
            >
              AnonCreds ZKP Studio
            </button>
            <button
              onClick={() => onTabChange('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-surgicalTeal text-paperNavy font-semibold shadow-sm'
                  : 'text-textMuted hover:text-textBone hover:bg-subNavy'
              }`}
            >
              On-Chain Ledger
            </button>
          </nav>

          {/* Status Indicators & Persona Switcher */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-cardNavy border border-borderNavy text-xs">
              <span className="w-2 h-2 rounded-full bg-surgicalTeal animate-pulse" />
              <span className="text-textMuted">Polygon PoS:</span>
              <span className="text-textBone font-mono text-[11px]">Chain ID 137</span>
            </div>

            {/* Persona Switcher */}
            <div className="relative">
              <select
                aria-label="Active Persona Selector"
                value={currentRole}
                onChange={e => onRoleChange(e.target.value as IdentityRole)}
                className="appearance-none bg-subNavy border border-borderNavy text-textBone text-xs font-medium rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-surgicalTeal cursor-pointer"
              >
                <option value="PATIENT">👤 Patient (Self-Sovereign)</option>
                <option value="DOCTOR">🩺 Consulting Doctor</option>
                <option value="INSURER_TPA">🏢 Insurance TPA Auditor</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-textMuted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
