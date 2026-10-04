'use client';

// /debug — database engine control room. The app runs on one of two Firebase
// engines: the original Realtime Database (per-byte download billing — the
// thing that ate 641 MB in a month) or the Firestore mirror in London
// (per-document reads, 50k/day free, no byte metering). Every write goes to
// BOTH engines at all times, so this switch is safe to flip in either
// direction at any moment — that's the whole point.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  Check,
  Copy,
  Database,
  HardDrive,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface DbEvent {
  at: number;
  path: string;
  op: string;
  message: string;
}

interface CollectionCopy {
  name: string;
  records: number;
  bytes: number;
  verified: boolean;
}

interface CopyReport {
  direction: 'rtdb-to-firestore' | 'firestore-to-rtdb';
  at: number;
  ms: number;
  ok: boolean;
  totalRecords: number;
  totalBytes: number;
  pruned: number;
  collections: CollectionCopy[];
  error?: string;
}

interface Status {
  mode: 'rtdb' | 'firestore';
  probe: { ok: boolean; ms: number; error?: string; status?: number };
  health: {
    dualWriteErrors: number;
    lastDualWriteError: DbEvent | null;
    fsReadFallbacks: number;
    lastFsReadFallback: DbEvent | null;
  };
  migration: CopyReport | null;
  counts: { rtdb: Record<string, number>; fs: Record<string, number> };
}

const KB = (n: number) => `${(n / 1024).toLocaleString('en-GB', { maximumFractionDigits: 1 })} KB`;
const DT = (t: number) => new Date(t).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

const RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

export function DatabaseSection() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [switching, setSwitching] = useState<'rtdb' | 'firestore' | null>(null);
  const [pending, setPending] = useState<'rtdb' | 'firestore' | null>(null);
  const [migrating, setMigrating] = useState<'rtdb-to-firestore' | 'firestore-to-rtdb' | null>(null);
  const [result, setResult] = useState<CopyReport | null>(null);
  const [copied, setCopied] = useState(false);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      setStatus(await api.get<Status>(`/api/owner/database?t=${Date.now()}`));
      setError(null);
    } catch (e) {
      setError((e as Error).message || 'Could not load engine status.');
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, [load]);

  const armSwitch = (mode: 'rtdb' | 'firestore') => {
    setPending(mode);
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
    pendingTimer.current = setTimeout(() => setPending(null), 6000);
  };

  const switchEngine = async (mode: 'rtdb' | 'firestore') => {
    setPending(null);
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
    setSwitching(mode);
    setError(null);
    try {
      await api.put('/api/owner/database', { mode });
      await load();
    } catch (e) {
      setError((e as Error).message || 'Switch failed.');
    } finally {
      setSwitching(null);
    }
  };

  const migrate = async (direction: 'rtdb-to-firestore' | 'firestore-to-rtdb') => {
    setMigrating(direction);
    setError(null);
    setResult(null);
    try {
      const r = await api.post<CopyReport>('/api/owner/migrate', { direction });
      setResult(r);
      await load();
    } catch (e) {
      setError((e as Error).message || 'Copy failed.');
    } finally {
      setMigrating(null);
    }
  };

  const copyRules = async () => {
    try {
      await navigator.clipboard.writeText(RULES_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the snippet is selectable text anyway */
    }
  };

  const mode = status?.mode ?? 'rtdb';
  const probe = status?.probe ?? null;
  const lastReport = result ?? status?.migration ?? null;

  return (
    <section aria-labelledby="db-h" id="database-section">
      <h2 id="db-h" className="text-lg font-semibold flex items-center gap-2 flex-wrap">
        <Database className="h-5 w-5 text-primary" aria-hidden /> Database engine
        <Badge variant={mode === 'firestore' ? 'default' : 'outline'} className="gap-1">
          <Zap className="h-3 w-3" aria-hidden />
          {mode === 'firestore' ? 'Firestore (London) — active' : 'Realtime Database — active'}
        </Badge>
      </h2>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">
        Reads are served by the active engine; writes always go to <strong>both</strong> engines in
        parallel, so you can flip this switch at any time and nothing is lost — the other database
        is a live, byte-identical copy.
      </p>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-[var(--danger)] flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden /> {error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {/* ---- engine switch ---- */}
        <Card className="glass">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-primary" aria-hidden /> Active engine
              </h3>
              <Button variant="ghost" size="sm" onClick={() => void load()} disabled={migrating !== null}>
                <RefreshCw className="h-4 w-4" aria-hidden /> Refresh
              </Button>
            </div>

            <div className="grid gap-2">
              <EngineOption
                title="Realtime Database"
                subtitle="europe-west1 · the original engine. Billed per byte downloaded — 10 GB/month free."
                active={mode === 'rtdb'}
                pendingConfirm={pending === 'rtdb'}
                busy={switching === 'rtdb'}
                disabled={switching !== null}
                onPrimary={() => (pending === 'rtdb' ? void switchEngine('rtdb') : armSwitch('rtdb'))}
                onCancel={() => setPending(null)}
              />
              <EngineOption
                title="Firestore"
                subtitle="europe-west2 (London) · billed per document read (50k/day free) — no charge for bytes delivered. This is the bandwidth fix."
                active={mode === 'firestore'}
                pendingConfirm={pending === 'firestore'}
                busy={switching === 'firestore'}
                disabled={switching !== null}
                onPrimary={() => (pending === 'firestore' ? void switchEngine('firestore') : armSwitch('firestore'))}
                onCancel={() => setPending(null)}
              />
            </div>

            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
              Switching takes effect on every server instance within ~15 seconds. Switching to
              Firestore is blocked while its access probe fails, so you can never strand yourself
              on a broken engine.
            </p>
          </CardContent>
        </Card>

        {/* ---- Firestore connection ---- */}
        <Card className="glass">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden /> Firestore connection
            </h3>
            {probe === null ? (
              <p className="text-sm text-muted-foreground">Probing…</p>
            ) : probe.ok ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success)]/15">
                  <Check className="h-4 w-4 text-[var(--success)]" aria-hidden />
                </span>
                Reachable &amp; writable — read/write/delete probe passed in {probe.ms} ms.
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--danger)]/15">
                    <X className="h-4 w-4 text-[var(--danger)]" aria-hidden />
                  </span>
                  Not usable{probe.status ? ` (HTTP ${probe.status})` : ''} — {probe.error ?? 'probe failed'}
                </p>
                {probe.status === 403 ? (
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      Your Firestore security rules are refusing the app. In the Firebase console →
                      Firestore Database → Rules, paste this (it matches the open access your
                      Realtime Database already uses — the key stays server-side):
                    </p>
                    <pre className="text-[11px] leading-relaxed bg-muted/60 rounded-lg p-3 overflow-x-auto">
                      {RULES_SNIPPET}
                    </pre>
                    <Button variant="outline" size="sm" onClick={() => void copyRules()}>
                      {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                      {copied ? 'Copied' : 'Copy rules'}
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ---- migration ---- */}
        <Card className="glass">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" aria-hidden /> Copy data between engines
            </h3>
            <p className="text-sm text-muted-foreground">
              One-time mirror of the whole database (~750 KB). Re-runnable any time — it simply
              overwrites the destination again and re-verifies every collection. Run it before the
              first switch to Firestore, and after any long stretch offline.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={migrating !== null}
                onClick={() => void migrate('rtdb-to-firestore')}
              >
                {migrating === 'rtdb-to-firestore' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Database className="h-4 w-4" aria-hidden />
                )}
                {migrating === 'rtdb-to-firestore' ? 'Copying…' : 'Copy Realtime → Firestore'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={migrating !== null}
                onClick={() => void migrate('firestore-to-rtdb')}
              >
                {migrating === 'firestore-to-rtdb' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <HardDrive className="h-4 w-4" aria-hidden />
                )}
                {migrating === 'firestore-to-rtdb' ? 'Restoring…' : 'Restore Firestore → Realtime'}
              </Button>
            </div>

            {lastReport ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant={lastReport.ok ? 'default' : 'destructive'}>
                    {lastReport.ok ? 'Verified ✓' : 'Problems found'}
                  </Badge>
                  <span>
                    {lastReport.direction === 'rtdb-to-firestore' ? 'Realtime → Firestore' : 'Firestore → Realtime'} ·{' '}
                    {lastReport.totalRecords} records · {KB(lastReport.totalBytes)}
                    {lastReport.pruned > 0 ? ` · ${lastReport.pruned} stale pruned` : ''} ·{' '}
                    {(lastReport.ms / 1000).toFixed(1)}s · {DT(lastReport.at)}
                  </span>
                </div>
                <div className="rounded-lg border overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/60">
                      <tr>
                        <th className="text-left font-medium px-3 py-2">Collection</th>
                        <th className="text-right font-medium px-3 py-2">Records</th>
                        <th className="text-right font-medium px-3 py-2">Size</th>
                        <th className="text-right font-medium px-3 py-2">Verified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastReport.collections.map((c) => (
                        <tr key={c.name} className="border-t">
                          <td className="px-3 py-1.5 font-mono">{c.name}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{c.records}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">{KB(c.bytes)}</td>
                          <td className="px-3 py-1.5 text-right">
                            {c.verified ? (
                              <Check className="h-3.5 w-3.5 text-[var(--success)] inline" aria-label="verified" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-[var(--danger)] inline" aria-label="mismatch" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {lastReport.error ? (
                  <p className="text-xs text-[var(--danger)]">{lastReport.error}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No copy has been run yet.</p>
            )}
          </CardContent>
        </Card>

        {/* ---- sync health + doc counts ---- */}
        <Card className="glass">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" aria-hidden /> Sync health &amp; contents
            </h3>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Missed mirror writes</p>
                <p className="text-xl font-semibold tabular-nums">{status?.health.dualWriteErrors ?? '—'}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {status?.health.lastDualWriteError
                    ? `Last: ${DT(status.health.lastDualWriteError.at)} — ${status.health.lastDualWriteError.path}`
                    : 'Every write landed on both engines.'}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Read fallbacks (mirror served the read)</p>
                <p className="text-xl font-semibold tabular-nums">{status?.health.fsReadFallbacks ?? '—'}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {status?.health.lastFsReadFallback
                    ? `Last: ${DT(status.health.lastFsReadFallback.at)} — ${status.health.lastFsReadFallback.path}`
                    : 'The active engine has never failed a read.'}
                </p>
              </div>
            </div>
            {(status?.health.dualWriteErrors ?? 0) > 0 ? (
              <p className="text-xs text-muted-foreground">
                Mirror misses are re-synced by running a copy in the other direction. Reads are
                unaffected — they come from the active engine.
              </p>
            ) : null}

            <div className="rounded-lg border overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/60 sticky top-0">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">Collection</th>
                    <th className="text-right font-medium px-3 py-2">Realtime</th>
                    <th className="text-right font-medium px-3 py-2">Firestore</th>
                  </tr>
                </thead>
                <tbody>
                  {status === null ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-3 text-muted-foreground">Loading…</td>
                    </tr>
                  ) : (
                    Object.keys(status.counts.rtdb)
                      .concat(Object.keys(status.counts.fs).filter((k) => !(k in status.counts.rtdb)))
                      .sort()
                      .map((name) => {
                        const r = status.counts.rtdb[name];
                        const f = status.counts.fs[name];
                        const same = r === f;
                        return (
                          <tr key={name} className="border-t">
                            <td className="px-3 py-1.5 font-mono">{name}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">{r ?? '—'}</td>
                            <td className={`px-3 py-1.5 text-right tabular-nums ${same ? '' : 'text-[var(--danger)] font-semibold'}`}>
                              {f ?? '—'} {!same ? <AlertTriangle className="h-3 w-3 inline ml-0.5" aria-hidden /> : null}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Mismatched rows are normal before the first copy or after deleting things on one
              engine only — run a copy to re-mirror.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass mt-3">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" aria-hidden /> Why Firestore kills the bandwidth bill
          </h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">Realtime Database</strong> charges for every byte
              downloaded (10 GB/month free) — polls and dashboards re-downloading the same quiz data
              is what produced the 641 MB month.
            </p>
            <p>
              <strong className="text-foreground">Firestore</strong> charges per document
              <em> read</em> (50,000/day free) and nothing for the bytes themselves. The existing
              version-stamp cache sits on top unchanged: a “nothing changed” re-check is a single
              tiny document read.
            </p>
            <p>
              <strong className="text-foreground">Always switchable</strong> — every write still
              lands on the Realtime Database too (uploads there are free), so flipping back in this
              panel costs nothing and loses nothing.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function EngineOption({
  title,
  subtitle,
  active,
  pendingConfirm,
  busy,
  disabled,
  onPrimary,
  onCancel,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  pendingConfirm: boolean;
  busy: boolean;
  disabled: boolean;
  onPrimary: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 flex items-start gap-3 ${
        active ? 'border-primary/60 bg-primary/5' : 'border-border'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold flex items-center gap-2 flex-wrap">
          {title}
          {active ? (
            <Badge variant="default" className="gap-1">
              <Check className="h-3 w-3" aria-hidden /> Active
            </Badge>
          ) : null}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {active ? (
          <span className="text-xs text-muted-foreground">serving reads</span>
        ) : pendingConfirm ? (
          <>
            <Button variant="outline" size="sm" onClick={onCancel} disabled={disabled}>
              Cancel
            </Button>
            <Button size="sm" onClick={onPrimary} disabled={disabled}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
              Switch to {title.split(' ')[0]}?
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onPrimary} disabled={disabled}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
            Use this
          </Button>
        )}
      </div>
    </div>
  );
}
