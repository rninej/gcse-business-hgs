// Public home for the school-onboarding documents. The same three documents
// are rendered from components/debug/LegalDocsSection (which is also used by
// the internal /debug dashboard) — one source of truth, no duplicated clauses.

import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { LegalDocsSection } from '@/components/debug/LegalDocsSection';

export const metadata: Metadata = {
  title: 'Privacy policy, DPA and terms | gcsebusiness',
  description:
    'The privacy policy, data processing agreement and terms of service for gcsebusiness — the documents a school data protection lead asks for, ready to print or download.',
  alternates: { canonical: '/legal' },
};

export default function LegalPage() {
  return (
    <MarketingShell>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">School onboarding</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          The documents your data protection lead will ask for.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Print any document on its own as a clean A4 PDF, or download it as an editable Word file. Fill in the
          school&apos;s details on the DPA first — they flow into the signature blocks and the download.
        </p>
      </div>

      <div className="mt-8">
        <LegalDocsSection />
      </div>
    </MarketingShell>
  );
}
