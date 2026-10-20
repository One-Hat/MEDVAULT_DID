'use client';

import React, { useState } from 'react';
import { Network, Plus, Shield, Check, Info } from 'lucide-react';
import { DEFAULT_PAIRWISE_CHANNELS, generatePairwiseDID, PairwiseDIDChannel } from '@/lib/crypto/didPeer';

interface PairwiseChannelsBarProps {
  onSelectChannel?: (channel: PairwiseDIDChannel) => void;
}

export const PairwiseChannelsBar: React.FC<PairwiseChannelsBarProps> = ({ onSelectChannel }) => {
  const [channels, setChannels] = useState<PairwiseDIDChannel[]>(DEFAULT_PAIRWISE_CHANNELS);
  const [selectedDID, setSelectedDID] = useState<string>(DEFAULT_PAIRWISE_CHANNELS[0].peerDID);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddChannel = () => {
    if (!newFacilityName.trim()) return;
    const newCh = generatePairwiseDID(newFacilityName.trim(), 'HOSPITAL');
    const updated = [...channels, newCh];
    setChannels(updated);
    setSelectedDID(newCh.peerDID);
    if (onSelectChannel) onSelectChannel(newCh);
    setNewFacilityName('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 bg-cardNavy border border-borderNavy rounded-2xl space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-surgicalTeal" />
          <span className="text-xs font-bold text-textBone uppercase tracking-wider">
            Pairwise Anti-Correlation Channels (did:peer)
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surgicalTeal/10 text-surgicalTeal border border-surgicalTeal/30">
            Aries RFC 0627
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-2.5 py-1 text-xs font-semibold bg-subNavy hover:bg-borderNavy text-textBone rounded-lg border border-borderNavy transition-colors flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5 text-surgicalTeal" />
          <span>New Facility Channel</span>
        </button>
      </div>

      <p className="text-[11px] text-textMuted leading-relaxed">
        To prevent profiling and cross-institutional surveillance, MedVault generates an isolated pairwise DID for every separate healthcare provider.
      </p>

      {/* Facility Channel Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {channels.map(ch => {
          const isSelected = selectedDID === ch.peerDID;
          return (
            <button
              key={ch.peerDID}
              onClick={() => {
                setSelectedDID(ch.peerDID);
                if (onSelectChannel) onSelectChannel(ch);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all ${
                isSelected
                  ? 'border-surgicalTeal bg-surgicalTeal/10 text-surgicalTeal ring-1 ring-surgicalTeal'
                  : 'border-borderNavy bg-subNavy/50 text-textMuted hover:text-textBone hover:bg-subNavy'
              }`}
            >
              <div className="font-semibold text-textBone flex items-center space-x-1.5">
                <span>{ch.facilityName}</span>
                {isSelected && <Check className="w-3 h-3 text-surgicalTeal" />}
              </div>
              <div className="font-mono text-[10px] text-textMuted truncate max-w-[210px] mt-0.5">
                {ch.peerDID}
              </div>
            </button>
          );
        })}
      </div>

      {/* Add Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paperNavy/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-cardNavy border border-borderNavy rounded-2xl p-6 space-y-4 shadow-glow-card">
            <h4 className="text-sm font-bold text-textBone">Establish New Pairwise DID Channel</h4>
            <p className="text-xs text-textMuted">
              Generates an isolated cryptographic did:peer keypair for this specific facility.
            </p>
            <input
              type="text"
              placeholder="e.g. Fortis Healthcare or AIIMS"
              value={newFacilityName}
              onChange={e => setNewFacilityName(e.target.value)}
              className="w-full bg-subNavy border border-borderNavy rounded-xl px-3 py-2 text-xs text-textBone focus:outline-none focus:ring-1 focus:ring-surgicalTeal"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-textMuted hover:text-textBone"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChannel}
                disabled={!newFacilityName.trim()}
                className="px-4 py-1.5 bg-surgicalTeal text-paperNavy font-bold rounded-lg text-xs hover:bg-tealHover"
              >
                Generate did:peer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
