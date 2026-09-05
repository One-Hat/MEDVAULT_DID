# MEDVAULT_DID
MedVault DID is a decentralized identity and verifiable consent platform for healthcare. Built with Next.js, Web Crypto API (NIST P-256 / AES-GCM), Hyperledger Aries pairwise did:peer, and ABDM / HL7 FHIR standards to eliminate health data honeypots, enable AnonCreds ZKP predicate proofs, and prevent insurance fraud.
# MedVault DID

**Sovereign Clinical Identity & Verifiable Consent Ledger**

MedVault DID is a decentralized clinical identity and verifiable consent platform built on **W3C DID Core 1.0**, **Hyperledger Aries pairwise anti-correlation (`did:peer`)**, **AnonCreds Zero-Knowledge Predicates**, and **ABDM / HL7 FHIR** standards.

### Key Capabilities
* **Pairwise Anti-Correlation (`did:peer`)**: Generates unique cryptographic channels per facility, preventing cross-institutional tracking and eliminating central database honeypots.
* **AnonCreds ZKP Predicates**: Proves clinical necessity (e.g., blood glucose $\le 140\text{ mg/dL}$) without disclosing raw readings.
* **Client-Side Envelope Encryption**: Secures medical records in volatile browser memory using **AES-256-GCM** before off-chain pinning.
* **Anti-Fraud Adjudication**: Delivers sub-150ms signature validation for physicians and real-time fraud blocking for insurance TPAs.
* **Standards Compliant**: Direct integration with ABDM/NRCeS FHIR R4 diagnostic profiles and LOINC taxonomies.

### Quick Start
```bash
git clone [https://github.com/One-Hat/MEDVAULT_DID.git](https://github.com/One-Hat/MEDVAULT_DID.git)
cd MEDVAULT_DID
npm install
npm run dev
