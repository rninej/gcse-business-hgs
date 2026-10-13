'use client';

// /debug — school onboarding: the data-protection & privacy pack schools ask
// for before they can sign off on the platform. Three documents — Privacy
// Policy, Data Processing Agreement, Terms of Service — each printable ALONE
// using the invoice's body-class print mode: everything else on the page is
// hidden and only the chosen document prints, A4, serif, black on white.
//
// Every factual claim was verified against the codebase (2026, R42):
//   - teacher passwords: scrypt, salted per password (src/lib/passwords.ts)
//   - student logins: AES-256-GCM encrypted copy so teachers can re-issue
//     forgotten logins (src/lib/passwords.ts) — disclosed honestly below
//   - sessions: one HMAC-SHA-256-signed httpOnly cookie (src/lib/session.ts)
//   - storage: Google Firebase Realtime Database, EU region europe-west1
//   - AI marking sends question + mark scheme + answer text only; feedback
//     adds the display name, quiz title and score (src/lib/ai.ts)
//   - providers: Google Gemini, Groq, Z.ai (src/lib/ai.ts)

import { useMemo, useState, type ReactNode } from 'react';
import { Landmark, Printer, ScrollText, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type DocId = 'privacy' | 'dpa' | 'terms';

/** Per-document print mode — mirrors the invoice pattern: body class added,
 *  window.print(), removed again on afterprint (plus a 3s safety net). */
function printDoc(id: DocId) {
  document.body.classList.add(`print-${id}`);
  const cleanup = () => {
    document.body.classList.remove(`print-${id}`);
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
  setTimeout(cleanup, 3000);
}

const CONTACT = 'hello@gcsebusiness.co.uk';
const longDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// ---------- tiny typographic helpers shared by all three documents ----------

function H3({ children }: { children: ReactNode }) {
  return <h4 className="text-[12.5pt] font-bold mt-6 mb-2">{children}</h4>;
}
function P({ children }: { children: ReactNode }) {
  return <p className="mb-2.5">{children}</p>;
}
function UL({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-6 mb-3 space-y-2">{children}</ul>;
}
function LI({ children }: { children: ReactNode }) {
  return <li className="pl-0.5">{children}</li>;
}
function DocFoot({ line }: { line: string }) {
  return (
    <p className="mt-8 pt-3 border-t border-neutral-300 text-[9.5pt] text-neutral-600 break-inside-avoid">
      {line}
    </p>
  );
}

function DocSheet({
  id,
  title,
  meta,
  children,
}: {
  id: DocId;
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <article
      id={`doc-${id}`}
      className="legal-sheet bg-white text-neutral-900 rounded-xl border border-neutral-200/90 shadow-sm p-6 sm:p-10 font-serif text-[11pt] leading-relaxed"
    >
      <header className="mb-6 pb-4 border-b-2 border-neutral-800 break-inside-avoid">
        <p className="text-[10pt] uppercase tracking-[0.18em] text-neutral-600">
          gcsebusiness · gcse.business
        </p>
        <h3 className="text-[17pt] font-bold tracking-tight mt-1.5">{title}</h3>
        <p className="text-[9.5pt] text-neutral-600 mt-1.5">{meta}</p>
      </header>
      {children}
    </article>
  );
}

function DocBlock({
  id,
  icon: Icon,
  name,
  blurb,
  children,
}: {
  id: DocId;
  icon: LucideIcon;
  name: string;
  blurb: string;
  children: ReactNode;
}) {
  return (
    <div className={`doc-block doc-block-${id}`}>
      <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Icon className="h-4 w-4 text-primary" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight">{name}</span>
            <span className="block text-xs text-muted-foreground leading-tight mt-0.5">{blurb}</span>
          </span>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => printDoc(id)}>
          <Printer className="h-4 w-4" /> Print {name === 'Data Processing Agreement' ? 'the DPA' : name}
        </Button>
      </div>
      {children}
    </div>
  );
}

// ---------- 1. Privacy Policy ----------

function PrivacyDoc({ date }: { date: string }) {
  return (
    <DocSheet id="privacy" title="Privacy Policy" meta={`Version 1.0 · Effective ${date}`}>
      <H3>1. Who we are and how to reach us</H3>
      <P>
        gcsebusiness (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates gcse.business, a quiz and revision
        platform for Edexcel GCSE (9–1) Business used in schools. Questions about this policy or
        about your data can be sent to {CONTACT} — please mark data-protection enquiries
        &ldquo;Data protection&rdquo;.
      </P>
      <P>
        Where your school provides the platform, responsibility is split: we are the controller for
        teacher accounts and for running the service, while the school is the controller for its
        students&rsquo; data and we process that data on the school&rsquo;s behalf under our Data
        Processing Agreement (available on request, and printed alongside this policy).
      </P>

      <H3>2. The short version</H3>
      <div className="my-4 rounded-md border border-neutral-300 bg-neutral-50 p-4 break-inside-avoid">
        <UL>
          <LI>We collect only what the platform needs to run: names and usernames, logins, quiz work and progress.</LI>
          <LI>No advertising, no tracking cookies, no analytics profiles — and your data is never sold.</LI>
          <LI>Student data lives in the EU, on Google Firebase, encrypted in transit.</LI>
          <LI>Written answers are marked by AI — we send the answer text, and nothing that identifies the student (details in §5).</LI>
          <LI>Schools can delete students and classes at any time; everything else is deleted within 30 days of the licence ending.</LI>
        </UL>
      </div>

      <H3>3. What we collect</H3>
      <P><strong>Teacher and staff accounts.</strong> Your full name, school email address and a password. Passwords are stored only as a salted scrypt hash — even we cannot read or recover them.</P>
      <P>
        <strong>Student accounts.</strong> A username, a display name, class membership and a
        password, all set up by the school. Student passwords are also held in an encrypted form the
        class teacher can view and re-issue, so a forgotten login never has to stop a lesson — which
        is why students must never reuse a password from any other service on this platform.
      </P>
      <P><strong>Work and progress.</strong> Quiz answers (including written answers), marks and mark-scheme breakdowns, completion and timing information, streaks and badges, avatar choices, feedback text and in-app notifications.</P>
      <P><strong>Technical records.</strong> A single essential sign-in cookie (httpOnly, 30 days), preferences such as dark mode and unfinished drafts stored locally in the browser, and short-lived server logs kept for security and troubleshooting.</P>
      <P>
        <strong>What we never collect.</strong> Students&rsquo; email addresses, phone numbers, home
        addresses, dates of birth or payment card details (invoicing is handled by email), precise
        location, or anything used to build advertising profiles.
      </P>

      <H3>4. Where your data lives, and for how long</H3>
      <P>
        Account and work data is stored in Google Firebase&rsquo;s Realtime Database, hosted in the
        EU (europe-west1 region). Data is kept while the licence is active. Teachers can delete
        students and classes at any time from the dashboard; everything else is deleted within 30
        days of the licence ending or of a written request from the school.
      </P>

      <H3>5. AI marking, feedback and quiz generation — exactly what is sent</H3>
      <P>
        Some marking and feedback is performed by AI through our providers (Google Gemini, Groq and
        Z.ai). Connections are encrypted, and each request carries only what the task needs:
      </P>
      <UL>
        <LI><strong>To mark a written answer:</strong> the question, its mark scheme and the answer text — no name or identifier is attached.</LI>
        <LI><strong>To write feedback:</strong> the student&rsquo;s display name (as set by the teacher), the quiz title, the score and the topic breakdown.</LI>
        <LI><strong>To generate a quiz:</strong> only the teacher&rsquo;s brief and chosen topics — no student data at all.</LI>
      </UL>
      <P>Our providers&rsquo; API terms restrict the use of submitted content to processing the request.</P>

      <H3>6. How we protect it</H3>
      <UL>
        <LI>Every connection uses HTTPS/TLS.</LI>
        <LI>Teacher passwords are scrypt-hashed with a unique salt per password.</LI>
        <LI>Teacher-recoverable student logins use AES-256-GCM encryption.</LI>
        <LI>Sessions are HMAC-SHA-256-signed, httpOnly cookies.</LI>
        <LI>Every request is authorisation-checked on the server, and the database is protected by security rules.</LI>
        <LI>Access to the production system is limited to the operator.</LI>
      </UL>

      <H3>7. Who else can see it</H3>
      <P>
        We never sell personal data, and we never share it for advertising or marketing. We use a
        short list of sub-processors — Google LLC (Firebase, EU-hosted database; Gemini, AI marking),
        Groq Inc. (AI marking) and Zhipu AI / Z.ai (AI marking) — listed in full in the Data
        Processing Agreement. We would disclose data only if legally compelled, and we would tell
        the school wherever the law allows us to.
      </P>

      <H3>8. Your rights</H3>
      <P>
        Under the UK GDPR and the Data Protection Act 2018 you can ask to access, correct, delete,
        restrict or object to the processing of your data, or ask for a portable copy. Students
        normally exercise these rights through their school. We respond within one calendar month.
        If you are unhappy with our answer you may complain to the Information Commissioner&rsquo;s
        Office (ico.org.uk, 0303 123 1113).
      </P>

      <H3>9. Children</H3>
      <P>
        The platform is designed for 14–16 year-olds and is delivered through schools: there is no
        profiling, no behavioural advertising, no in-app purchasing, and we limit data to what the
        classroom needs. We follow the ICO&rsquo;s Age Appropriate Design Code principles. Any
        parental consents are the school&rsquo;s to obtain as controller.
      </P>

      <H3>10. International transfers</H3>
      <P>
        The primary database is in the EU. The AI providers in §5 may process the limited content
        described there outside the UK or EEA, only under their enterprise API terms with
        appropriate safeguards. No full student records are ever transferred.
      </P>

      <H3>11. Changes to this policy</H3>
      <P>
        We post the current version on this page and notify schools by email of material changes.
        Continuing to use the platform after a change takes effect means accepting it.
      </P>

      <DocFoot line={`gcsebusiness · gcse.business · ${CONTACT} — Privacy Policy v1.0, effective ${date}.`} />
    </DocSheet>
  );
}

// ---------- 2. Data Processing Agreement ----------

function DpaDoc({ date, year }: { date: string; year: number }) {
  const [school, setSchool] = useState({ name: '', contact: '', address1: '', address2: '' });
  const set =
    (k: keyof typeof school) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setSchool((s) => ({ ...s, [k]: e.target.value }));
  const field =
    'h-8 px-2.5 text-[10.5pt] border-dashed border-neutral-400 text-neutral-900 placeholder:text-neutral-400';

  return (
    <DocSheet
      id="dpa"
      title="Data Processing Agreement"
      meta={`Reference DPA-${year}-01 · Version 1.0 · Made ${date}`}
    >
      <P>
        This Data Processing Agreement (&ldquo;Agreement&rdquo;) is made on {date} between:
      </P>
      <div className="my-3 ml-4 space-y-1.5 break-inside-avoid">
        <p className="font-semibold">
          (1){' '}
          <Input
            className={`${field} w-64 max-w-full inline-block align-baseline`}
            value={school.name}
            onChange={set('name')}
            placeholder="School legal name"
            aria-label="School legal name"
          />
          , of
        </p>
        <div className="pl-6 space-y-1.5">
          <Input className={`${field} w-72 max-w-full`} value={school.address1} onChange={set('address1')} placeholder="Address line 1" aria-label="School address line 1" />
          <Input className={`${field} w-72 max-w-full`} value={school.address2} onChange={set('address2')} placeholder="Address line 2 (optional)" aria-label="School address line 2" />
        </div>
        <p>
          (the <strong>&ldquo;School&rdquo;</strong> — the data controller); and
        </p>
        <p>
          (2) <strong>gcsebusiness</strong>, operator of the gcse.business platform, {CONTACT} (
          <strong>&ldquo;gcsebusiness&rdquo;</strong>, <strong>&ldquo;we&rdquo;</strong> — the data
          processor).
        </p>
      </div>

      <H3>1. Purpose and roles</H3>
      <P>
        The School provides gcsebusiness to its staff and students. Under Article 28 of the UK GDPR,
        the School is the controller of the student personal data processed through the platform and
        gcsebusiness is the processor. Where gcsebusiness contracts directly with a teacher (the
        teacher-account relationship), gcsebusiness is the controller for that account data and its
        Privacy Policy applies.
      </P>

      <H3>2. Details of processing</H3>
      <table className="w-full my-4 text-[10pt] border-collapse break-inside-avoid">
        <tbody>
          {[
            ['Data subjects', 'Students of the School; staff of the School.'],
            [
              'Categories of personal data',
              'Usernames, display names, login credentials, class membership, quiz answers and written work, marks and mark-scheme breakdowns, progress and attainment records, feedback and notifications.',
            ],
            [
              'Purposes of processing',
              'Operating the platform for the School — accounts, quiz delivery, marking (including AI marking), reporting and analytics.',
            ],
            ['Duration', 'The licence term, ending 30 days after expiry or termination.'],
          ].map(([k, v]) => (
            <tr key={k}>
              <th scope="row" className="border border-neutral-300 bg-neutral-100 px-2.5 py-1.5 align-top text-left font-semibold w-44">
                {k}
              </th>
              <td className="border border-neutral-300 px-2.5 py-1.5 align-top">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <H3>3. Processor obligations</H3>
      <P>gcsebusiness shall:</P>
      <UL>
        <LI><strong>3.1</strong> process personal data only on the School&rsquo;s documented instructions (this Agreement and the platform&rsquo;s normal operation), and inform the School if an instruction appears to breach the UK GDPR;</LI>
        <LI><strong>3.2</strong> ensure that everyone with access to the data is bound by confidentiality;</LI>
        <LI><strong>3.3</strong> implement the technical and organisational measures in §5;</LI>
        <LI><strong>3.4</strong> not engage another processor without the School&rsquo;s authorisation (see §4);</LI>
        <LI><strong>3.5</strong> assist the School with data-subject requests and with its duties on security, breaches and prior consultations;</LI>
        <LI><strong>3.6</strong> notify the School without undue delay — and in any event within 24 hours of becoming aware — of a personal-data breach, with enough detail for the School to meet its own reporting duties to the ICO;</LI>
        <LI><strong>3.7</strong> delete or return all student personal data within 30 days of the end of the licence, unless retention is required by law;</LI>
        <LI><strong>3.8</strong> make available the information needed to demonstrate compliance and allow the School (or its auditor) reasonable access to evidence.</LI>
      </UL>

      <H3>4. Sub-processors</H3>
      <table className="w-full my-4 text-[10pt] border-collapse break-inside-avoid">
        <thead>
          <tr className="bg-neutral-100">
            <th className="border border-neutral-300 px-2.5 py-1.5 text-left font-semibold">Provider</th>
            <th className="border border-neutral-300 px-2.5 py-1.5 text-left font-semibold">Role</th>
            <th className="border border-neutral-300 px-2.5 py-1.5 text-left font-semibold">Personal data they see</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-neutral-300 px-2.5 py-1.5">Google LLC (Firebase)</td>
            <td className="border border-neutral-300 px-2.5 py-1.5">EU-hosted database (europe-west1)</td>
            <td className="border border-neutral-300 px-2.5 py-1.5">All platform data, as hosting provider.</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 px-2.5 py-1.5">Google LLC (Gemini)</td>
            <td className="border border-neutral-300 px-2.5 py-1.5">AI marking &amp; feedback</td>
            <td className="border border-neutral-300 px-2.5 py-1.5">Question, mark scheme and answer text only.</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 px-2.5 py-1.5">Groq Inc.</td>
            <td className="border border-neutral-300 px-2.5 py-1.5">AI marking &amp; feedback</td>
            <td className="border border-neutral-300 px-2.5 py-1.5">Question, mark scheme and answer text only.</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 px-2.5 py-1.5">Zhipu AI (Z.ai)</td>
            <td className="border border-neutral-300 px-2.5 py-1.5">AI marking &amp; feedback</td>
            <td className="border border-neutral-300 px-2.5 py-1.5">Question, mark scheme and answer text only.</td>
          </tr>
        </tbody>
      </table>
      <P>
        The School gives general authorisation to this list. gcsebusiness will give at least 14
        days&rsquo; notice of any change, and the School may object and terminate the licence for
        cause.
      </P>

      <H3>5. Security measures (UK GDPR Article 32)</H3>
      <UL>
        <LI>TLS 1.2 or higher on every connection.</LI>
        <LI>Salted scrypt hashing for teacher passwords.</LI>
        <LI>AES-256-GCM encryption for teacher-recoverable student logins.</LI>
        <LI>HMAC-SHA-256-signed, httpOnly session cookies.</LI>
        <LI>Server-side authorisation checks on every API request, backed by database security rules.</LI>
        <LI>Least-privilege access (single operator); no student data held on local devices or in print.</LI>
      </UL>

      <H3>6. International transfers</H3>
      <P>
        The primary database stays in the EU (europe-west1). Where an AI sub-processor processes the
        limited content described in §4 outside the UK or EEA, transfers rely on appropriate
        safeguards such as the UK IDTA or the Addendum to the EU Standard Contractual Clauses — and
        only the minimum content is ever transferred.
      </P>

      <H3>7. US schools — FERPA</H3>
      <P>
        Where the School is subject to the US Family Educational Rights and Privacy Act (FERPA), the
        parties agree that gcsebusiness acts as a &ldquo;school official&rdquo; with a legitimate
        educational interest: it performs a service the School would otherwise perform for itself,
        is under the School&rsquo;s direct control as to the use and maintenance of education
        records, and will not disclose personally identifiable information from education records
        without the School&rsquo;s authorisation unless legally required.
      </P>

      <H3>8. Term, termination and precedence</H3>
      <P>
        This Agreement lasts for the licence term plus the deletion period in §3.7. Clauses 3.7,
        3.8 and 6 survive termination. If this Agreement conflicts with the Terms of Service, this
        Agreement prevails on data-protection matters.
      </P>

      <H3>9. Signatures</H3>
      <div className="avoid-break mt-4 grid sm:grid-cols-2 gap-10">
        <div>
          <p className="font-semibold mb-8">
            Signed for the School{school.name ? ` — ${school.name}` : ''}
          </p>
          <div className="h-9 border-b border-neutral-800" />
          <p className="text-[9.5pt] text-neutral-600 mt-1">
            Signature{school.contact ? ` — ${school.contact}` : ''}
          </p>
          <div className="h-9 border-b border-neutral-800 mt-6" />
          <p className="text-[9.5pt] text-neutral-600 mt-1">Name &amp; position</p>
          <div className="h-9 border-b border-neutral-800 mt-6" />
          <p className="text-[9.5pt] text-neutral-600 mt-1">Date</p>
        </div>
        <div>
          <p className="font-semibold mb-8">Signed for gcsebusiness</p>
          <div className="h-9 border-b border-neutral-800" />
          <p className="text-[9.5pt] text-neutral-600 mt-1">Signature</p>
          <div className="h-9 border-b border-neutral-800 mt-6" />
          <p className="text-[9.5pt] text-neutral-600 mt-1">Name &amp; position</p>
          <div className="h-9 border-b border-neutral-800 mt-6" />
          <p className="text-[9.5pt] text-neutral-600 mt-1">Date</p>
        </div>
      </div>

      <DocFoot line={`gcsebusiness · gcse.business · ${CONTACT} — Data Processing Agreement v1.0 (DPA-${year}-01), made ${date}.`} />
    </DocSheet>
  );
}

// ---------- 3. Terms of Service ----------

function TermsDoc({ date }: { date: string }) {
  return (
    <DocSheet id="terms" title="Terms of Service" meta={`Version 1.0 · Effective ${date}`}>
      <H3>1. The agreement</H3>
      <P>
        These terms apply between gcsebusiness and (a) the school or department holding a licence
        (the &ldquo;School&rdquo;) and (b) the staff and students using the platform on the
        School&rsquo;s behalf. Creating an account or using gcse.business means accepting them.
      </P>

      <H3>2. The service</H3>
      <P>
        gcse.business is a learning platform for Edexcel GCSE (9–1) Business (specification 1BS0):
        teacher-built and AI-generated quizzes, AI examiner marking of written answers, analytics
        and reports, flashcards and gamification, installable as an app. We keep the service
        improving; we will not remove core functionality during a licence term.
      </P>

      <H3>3. Accounts</H3>
      <P>
        Teacher accounts are for school staff; student accounts are created and managed by the
        School. Each account belongs to one person — keep credentials safe. Student logins are
        recoverable by the class teacher, so students must never reuse a personal password here.
        Tell us promptly about any unauthorised access.
      </P>

      <H3>4. Acceptable use</H3>
      <P>You must not:</P>
      <UL>
        <LI>share logins with anyone outside the School;</LI>
        <LI>use the platform to impersonate, harass or disrupt others;</LI>
        <LI>attempt to break, overload or reverse-engineer the service, or extract the question bank in bulk;</LI>
        <LI>upload unlawful material in quiz briefs, answers or feedback.</LI>
      </UL>
      <P>
        Teachers should review generated questions before assigning them — every question can be
        edited first, and the teacher&rsquo;s judgement is final.
      </P>

      <H3>5. Content and intellectual property</H3>
      <UL>
        <LI><strong>Our platform materials</strong> (software, question bank, notes, mark schemes, characters, branding) are owned by gcsebusiness and licensed to the School for the licence term, for classroom and student use. No resale, and no redistribution outside the School.</LI>
        <LI><strong>Your content</strong> (class lists, quiz briefs, custom questions, feedback you write) remains yours; you give us the limited licence needed to host and process it to run the service.</LI>
        <LI><strong>Student work</strong> remains the student&rsquo;s and the School&rsquo;s; we display it only to the student and their teachers.</LI>
        <LI><strong>Generated quizzes</strong> may be printed and used in class by the subscribing School while its licence is active.</LI>
      </UL>

      <H3>6. AI marking and academic judgement</H3>
      <P>
        AI marks are assistive. Teachers can review and override any mark, and exam-board mark
        schemes and teacher judgement always prevail. The platform is a revision tool, not a
        promise of exam outcomes.
      </P>

      <H3>7. Availability and support</H3>
      <P>
        We target 99.5% monthly availability, excluding planned maintenance (announced by email and
        scheduled outside school hours where possible) and events beyond our control. We act
        promptly on significant outages, but the department licence carries no uptime service
        credits. Support: {CONTACT}, answered within one school day.
      </P>

      <H3>8. Fees</H3>
      <P>
        Fees are as invoiced — a department licence, annual, with no per-student charges. If the
        service materially fails within 30 days of purchase, we will, at the School&rsquo;s choice,
        fix the issue or refund the unused portion of the term.
      </P>

      <H3>9. Ending the agreement</H3>
      <P>
        The School may stop using the service at any time. We may suspend accounts for breach of
        these terms, after warning where practical. On termination, student data is deleted or
        returned as described in the Data Processing Agreement.
      </P>

      <H3>10. Liability</H3>
      <P>
        The service is provided as-is to the fullest extent the law allows. Neither party is liable
        for indirect or consequential loss (for example, lost teaching time). gcsebusiness&rsquo;s
        total liability is capped at the fees paid in the 12 months before the claim. Nothing in
        these terms limits liability for death, personal injury or fraud.
      </P>

      <H3>11. Changes to these terms</H3>
      <P>
        We will email the School at least 30 days before material changes take effect; continued use
        after that means acceptance.
      </P>

      <H3>12. Governing law</H3>
      <P>These terms are governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction.</P>

      <H3>13. Contact</H3>
      <P>
        gcsebusiness · gcse.business · {CONTACT}. A copy of our Privacy Policy and Data Processing
        Agreement is available on request.
      </P>

      <DocFoot line={`gcsebusiness · gcse.business · ${CONTACT} — Terms of Service v1.0, effective ${date}.`} />
    </DocSheet>
  );
}

// ---------- section ----------

export function LegalDocsSection() {
  const today = useMemo(() => new Date(), []);
  const date = longDate(today);
  const year = today.getFullYear();

  return (
    <section aria-labelledby="legal-h" id="legal-section">
      <div className="no-print">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          School onboarding
        </p>
        <h2 id="legal-h" className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
          Data protection &amp; privacy pack
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
          Because schools handle sensitive student data, these are the documents their data
          protection lead usually asks for before sign-off. Each Print button prints that document
          alone — A4, black on white, ready to post or save as a PDF and email. Fill in the
          school&rsquo;s details on the DPA before printing it; the signature blocks flow through
          automatically.
        </p>
      </div>

      <div className="legal-stack max-w-[50rem] space-y-10 mt-6">
        <DocBlock
          id="privacy"
          icon={ShieldCheck}
          name="Privacy Policy"
          blurb="What data is collected, how it is stored and encrypted, and the promise it is never sold or shared."
        >
          <PrivacyDoc date={date} />
        </DocBlock>

        <DocBlock
          id="dpa"
          icon={Landmark}
          name="Data Processing Agreement"
          blurb="The GDPR / FERPA agreement between the school and gcsebusiness — roles, security measures, sub-processors and signatures."
        >
          <DpaDoc date={date} year={year} />
        </DocBlock>

        <DocBlock
          id="terms"
          icon={ScrollText}
          name="Terms of Service"
          blurb="Acceptable use, who owns the content, AI-marking expectations, uptime targets and liability."
        >
          <TermsDoc date={date} />
        </DocBlock>
      </div>
    </section>
  );
}
