import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MedVault DID — Sovereign Clinical Identity & Verifiable Consent Ledger',
  description:
    'Patient-Owned Healthcare Records & Verifiable Consent Ledger built on W3C DID, Hyperledger Aries did:peer, AnonCreds ZKP Predicates, and Polygon PoS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-paperNavy text-textBone antialiased selection:bg-surgicalTeal selection:text-paperNavy">
        {children}
      </body>
    </html>
  );
}
