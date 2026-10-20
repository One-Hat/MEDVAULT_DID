# MedVault DID 🛡️🩺
### **Sovereign Clinical Identity & Verifiable Consent Ledger**

> *"Your Health. Your Data. Your Sovereignty."*  
> Built for **Sage-A-Thon 2026** by Team **DextroSage** under the **Kolkata International Blockchain Association (KIBA)**.

MedVault DID is a decentralized healthcare identity and privacy-first consent platform. It eliminates centralized health data honeypots by combining **Client-Side Envelope Encryption (AES-256-GCM)**, **Hyperledger Aries Pairwise Anti-Correlation (`did:peer`)**, **AnonCreds Zero-Knowledge Predicates**, and **Polygon PoS Smart Contracts** with **ABDM / HL7 FHIR R4** standards.

---

## 🌟 Key Capabilities & Architectural Innovations

| Layer | Technology | Security & Privacy Guarantee |
| :--- | :--- | :--- |
| **Client Encryption** | Web Crypto API (`AES-256-GCM`) | **Zero Server Plaintext**: Files are encrypted in volatile browser memory before off-chain pinning. Keys never leave the patient's device. |
| **Decentralized ID** | W3C DID Core 1.0 & `did:peer` (RFC 0627) | **Anti-Correlation**: Generates isolated pairwise DID pairs per facility, preventing hospitals and insurers from cross-profiling patients. |
| **Privacy Proofs** | AnonCreds Zero-Knowledge Predicates | **Zero-Leakage Adjudication**: Proves clinical assertions (e.g. $\text{Blood Glucose} \le 140\text{ mg/dL}$) without disclosing raw records or doctor notes. |
| **Consent Ledger** | Solidity on Polygon PoS / EVM | **Sub-150ms Adjudication**: 15-minute auto-expiring ephemeral QR tokens with **1-Click on-chain revocation**. |
| **AI Privacy Layer**| Google Gemini API + Safe Harbor NLP | **PII Redaction**: Strips 18 HIPAA identifiers (names, ABHA IDs, phone numbers, MRNs) and auto-maps vitals to LOINC taxonomies. |

---

## 📖 Patient User Guide: How to Use MedVault DID

### 1. 📂 Upload & Encrypt Your Medical Documents
1. Navigate to the **Patient Vault** tab.
2. Click **"Upload & Encrypt Document"**.
3. Select your lab report, discharge summary, or prescription (PDF, JPG, PNG, or DICOM).
4. Watch the client-side pipeline in real-time:
   * **AES-256-GCM encryption** executes locally inside your browser memory.
   * SHA-256 integrity digest is calculated to protect against future tampering.
   * AI automatically scrubs all 18 HIPAA PII identifiers (Aadhaar/ABHA ID, phone, address).
   * A simulated IPFS CIDv1 is generated. **Plaintext is never sent to any server.**

### 2. 🔐 Generate 15-Minute Ephemeral QR Consent
When visiting a doctor, diagnostic clinic, or submitting an insurance claim:
1. Find your encrypted document in the **Patient Vault** and click **"Issue 15-Min QR"**.
2. Select your **Disclosure Scope**:
   * **ZKP Predicate (Maximum Privacy)**: Proves requirements (e.g., Blood Glucose $\le 140\text{ mg/dL}$ or $\text{HbA1c} \le 6.5\%$) without revealing the actual numbers or the rest of your medical history. Ideal for insurance pre-authorization and job medical checks.
   * **PII-Scrubbed Summary**: Releases clinical findings with names and personal identifiers redacted.
   * **Full Record**: Releases the temporary decryption session key for emergency consultation.
3. Choose the auto-expiry duration (default: **15 minutes**).
4. MedVault registers the grant on Polygon PoS and renders a high-security QR code.

### 3. 🚫 1-Click Instant Revocation
* You always retain 100% sovereign ownership over your data.
* If a consultation finishes early or you suspect fraud, open the **"Active Ephemeral Grants"** panel and click **"Revoke"**.
* This triggers an immediate transaction on the smart contract (`revokeConsent`), instantly locking the token and denying any subsequent access attempts.

### 4. 🩺 Doctor & Verifier Portal
1. The consulting doctor or insurance auditor switches to the **"Doctor / Verifier Portal"** tab.
2. They scan the patient's QR code or load the active token payload.
3. The platform validates the signature and on-chain status in **$<150\text{ms}$**:
   * If valid: Displays the verified ZKP condition or ephemeral decrypted record.
   * If expired or revoked: Displays an **Anti-Fraud Security Warning** and completely blocks access.

---

## 🔮 Future Roadmap & Improvements

While MedVault DID v2.0 solves the core problems of data silos, credential forgery, and data privacy leaks, the following upgrades are planned:

1. **Fully Homomorphic Encryption (FHE)**:
   * Enable diagnostic AI models to run disease prediction and anomaly detection directly over encrypted ciphertexts without ever decrypting the patient's files.
2. **WebAuthn Passkeys & Hardware Secure Enclaves**:
   * Integrate biometric hardware enclaves (Apple FaceID, Android Biometrics, YubiKey) for DID private key derivation, removing seed phrase friction for non-technical patients.
3. **Decentralized Storage Pinning (Filecoin / IPFS / Arweave)**:
   * Connect live Web3.Storage / Filecoin pinning for permanent, censorship-resistant storage of encrypted blobs.
4. **ABDM National Gateway Connector**:
   * Direct bridge to India's Ayushman Bharat Digital Mission (ABDM) Health Information Exchange & Consent Manager (HIE-CM) via sandbox APIs.
5. **Cross-Chain Interoperability (Chainlink CCIP / LayerZero)**:
   * Allow patients to verify clinical proofs across Ethereum L1, Arbitrum, Optimism, and Solana without moving underlying medical files.
6. **Mobile React Native / PWA Wallet**:
   * Native offline-first mobile wallet for emergency BLE (Bluetooth Low Energy) and NFC peer-to-peer verifiable credential exchange in disaster or low-connectivity zones.

---

## 💻 Local Development & Quick Start

### Prerequisites
* Node.js 18+ or 20+
* npm or pnpm

### Setup
```bash
# Clone the repository
git clone https://github.com/One-Hat/MEDVAULT_DID.git
cd MEDVAULT_DID

# Install dependencies
npm install

# (Optional) Add your Gemini API key for live AI PII redaction
# Create .env.local
echo "NEXT_PUBLIC_GEMINI_API_KEY=your_key_here" > .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Smart Contract Specification

The sovereign consent ledger is governed by [`MedVaultConsentRegistry.sol`](file:///src/contracts/MedVaultConsentRegistry.sol):

* `grantConsent(...)`: Issues time-bounded consent grants linked to `bytes32 grantId`.
* `revokeConsent(...)`: Only callable by the patient (`onlyGrantOwner`). Immediately revokes access.
* `verifyConsent(...)`: Gas-free read method validating token freshness, signature provenance, and non-revocation status in $<150\text{ms}$.

---

## 📄 License
MIT © 2026 Team DextroSage · Kolkata International Blockchain Association (KIBA)
