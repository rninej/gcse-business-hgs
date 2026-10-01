'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  PlusCircle,
  Users,
  UserPlus,
  Printer,
  Copy,
  Trash2,
  KeyRound,
  Pencil,
  RefreshCw,
  FileDown,
  FileText,
  Mail,
  Wand2,
  UserRoundSearch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/store';
import { PageHeader, ThemedSkeleton, ErrorNote, EmptyState } from '@/components/shared';
import { ActivityHeatmap } from '@/components/app/ActivityHeatmap';
import {
  buildLoginsCsv,
  buildLoginsPdf,
  buildLoginsText,
  downloadFile,
  slugFilename,
  type LoginRow,
} from '@/lib/credentialsheet';
import { StudentProfileDialog } from './StudentProfile';

interface ClassRow { id: string; name: string; createdAt: number; studentCount: number }
interface StudentRow { id: string; username: string; displayName: string; password: string | null; createdAt: number }
interface CreatedCred { displayName: string; username: string; password: string }

export function ClassesView({ initialClassId }: { initialClassId?: string }) {
  return initialClassId ? <ClassDetail classId={initialClassId} /> : <ClassList />;
}

function ClassList() {
  const go = useApp((s) => s.go);
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    api
      .get<{ classes: ClassRow[] }>('/api/teacher/classes')
      .then((d) => setClasses(d.classes))
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(load, [load]);

  async function createClass() {
    if (newName.trim().length < 2) return;
    setCreating(true);
    try {
      await api.post('/api/teacher/classes', { name: newName.trim() });
      toast({ title: 'Class created', description: 'Now add your students.' });
      setOpen(false);
      setNewName('');
      load();
    } catch (e) {
      toast({ title: 'Could not create class', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  }

  if (error)
    return (
      <>
        <PageHeader title="Classes" />
        <ErrorNote message={error} />
      </>
    );
  if (!classes)
    return (
      <>
        <PageHeader title="Classes" />
        <ThemedSkeleton rows={3} />
      </>
    );

  return (
    <>
      <PageHeader
        title="Classes"
        sub="Create a class, then add student accounts in one go."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="h-4 w-4" /> New class</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a class</DialogTitle>
                <DialogDescription>For example “10B Business” or “Year 12 Econ &amp; Business”.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="cls-name">Class name</Label>
                <Input
                  id="cls-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="10B Business"
                  onKeyDown={(e) => e.key === 'Enter' && createClass()}
                />
              </div>
              <DialogFooter>
                <Button onClick={createClass} disabled={creating || newName.trim().length < 2}>
                  {creating ? 'Creating…' : 'Create class'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {classes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No classes yet"
          body="Create your first class above — then you can generate logins for every student in it."
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => go({ name: 't-class', classId: c.id })}
              className="rounded-lg border bg-card p-5 text-left hover:border-primary/60 card-lift transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-primary/10 p-2.5 group-hover:bg-primary/15 transition-colors">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="text-2xl font-bold tabular-nums">{c.studentCount}</span>
              </div>
              <div className="mt-4 font-semibold truncate">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {c.studentCount === 1 ? '1 student account' : `${c.studentCount} student accounts`}
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function ClassDetail({ classId }: { classId: string }) {
  const go = useApp((s) => s.go);
  const { toast } = useToast();
  const [cls, setCls] = useState<{ id: string; name: string } | null>(null);
  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [activity, setActivity] = useState<number[]>([]);
  const [quizzesBy, setQuizzesBy] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  // class-wide wrong pool — powers the "mistake fixer" card
  const [pool, setPool] = useState<{
    questions: number;
    studentsAffected: number;
    top: { id: string; stem: string; studentsWrong: number; timesWrong: number }[];
  }>({ questions: 0, studentsAffected: 0, top: [] });
  const [fixOpen, setFixOpen] = useState(false);
  const [fixing, setFixing] = useState(false);

  const [names, setNames] = useState('');
  const [pwMode, setPwMode] = useState<'auto' | 'manual'>('auto');
  const [sharedPw, setSharedPw] = useState('');
  const [creds, setCreds] = useState<CreatedCred[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // class logins sheet (share/export all credentials)
  const [loginsOpen, setLoginsOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  // edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editUser, setEditUser] = useState('');
  const [editPw, setEditPw] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // student profile dialog
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  function openProfile(sid: string) {
    setProfileId(sid);
    setProfileOpen(true);
  }

  const load = useCallback(() => {
    api
      .get<{
        class: { id: string; name: string };
        students: StudentRow[];
        activity?: number[];
        quizzesBy?: Record<string, number>;
        wrongPool?: {
          questions: number;
          studentsAffected: number;
          top: { id: string; stem: string; studentsWrong: number; timesWrong: number }[];
        };
      }>(`/api/teacher/classes/${classId}`)
      .then((d) => {
        setCls(d.class);
        setStudents(d.students);
        setActivity(d.activity ?? []);
        setQuizzesBy(d.quizzesBy ?? {});
        setPool(d.wrongPool ?? { questions: 0, studentsAffected: 0, top: [] });
      })
      .catch((e) => setError((e as Error).message));
  }, [classId]);

  useEffect(load, [load]);

  async function addStudents() {
    setAdding(true);
    try {
      const res = await api.post<{ created: CreatedCred[] }>(`/api/teacher/classes/${classId}/students`, {
        names,
        passwordMode: pwMode,
        manualPassword: pwMode === 'manual' ? sharedPw : undefined,
      });
      setCreds(res.created);
      setNames('');
      setAddOpen(false);
      load();
    } catch (e) {
      toast({ title: 'Could not add students', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  }

  function openEdit(s: StudentRow) {
    setEditing(s);
    setEditName(s.displayName);
    setEditUser(s.username);
    setEditPw(s.password ?? '');
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editing) return;
    setEditSaving(true);
    try {
      const res = await api.patch<{ ok: true; username: string; password: string | null }>(
        `/api/teacher/classes/${classId}/students/${editing.id}`,
        {
          displayName: editName,
          username: editUser,
          password: editPw.length > 0 ? editPw : undefined,
        }
      );
      toast({
        title: 'Login updated',
        description: res.password
          ? `New password: ${res.password}`
          : `${editing.displayName} now signs in as ${res.username}.`,
      });
      setEditOpen(false);
      load();
    } catch (e) {
      toast({ title: 'Could not update', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setEditSaving(false);
    }
  }

  async function regeneratePw() {
    if (!editing) return;
    setEditSaving(true);
    try {
      const res = await api.patch<{ ok: true; password: string }>(
        `/api/teacher/classes/${classId}/students/${editing.id}`,
        { regenerate: true }
      );
      setEditPw(res.password);
      toast({ title: 'New memorable password', description: res.password });
    } catch (e) {
      toast({ title: 'Could not reset password', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setEditSaving(false);
    }
  }

  // build + set one untimed assignment from the questions this class's
  // students are collectively stuck on (worst offenders first)
  async function setMistakeFixer() {
    setFixing(true);
    try {
      const res = await api.post<{ assignmentId: string; questionCount: number; poolSize: number }>(
        `/api/teacher/classes/${classId}/smart-practice`
      );
      toast({
        title: 'Mistake-fixing quiz set',
        description: `${res.questionCount} question${res.questionCount === 1 ? '' : 's'} from the class's ${res.poolSize} common slips — visible to the class now.`,
      });
      setFixOpen(false);
      go({ name: 't-assignments' });
    } catch (e) {
      toast({ title: 'Could not build the quiz', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setFixing(false);
    }
  }

  async function removeStudent(sid: string, name: string) {
    try {
      await api.del(`/api/teacher/classes/${classId}/students/${sid}`);
      toast({ title: `Removed ${name}`, description: 'Their results were removed too.' });
      load();
    } catch (e) {
      toast({ title: 'Could not remove', description: (e as Error).message, variant: 'destructive' });
    }
  }

  /** Legacy accounts (created before reversible storage) have no viewable
   *  password — one click sets a fresh memorable one so it can be shown. */
  async function setAndShow(sid: string, name: string) {
    try {
      const res = await api.patch<{ ok: true; password: string }>(
        `/api/teacher/classes/${classId}/students/${sid}`,
        { regenerate: true }
      );
      toast({ title: `New password for ${name.split(' ')[0]}`, description: res.password });
      load();
    } catch (e) {
      toast({ title: 'Could not set password', description: (e as Error).message, variant: 'destructive' });
    }
  }

  /** Set fresh passwords for every account whose password can't be shown */
  async function generateMissing() {
    if (!students) return;
    const missing = students.filter((s) => !s.password);
    if (missing.length === 0) return;
    setBulkBusy(true);
    try {
      let last: string | null = null;
      for (const s of missing) {
        const res = await api.patch<{ ok: true; password: string }>(
          `/api/teacher/classes/${classId}/students/${s.id}`,
          { regenerate: true }
        );
        last = res.password;
      }
      toast({
        title: `${missing.length} new password${missing.length === 1 ? '' : 's'} generated`,
        description: `Each student gets a fresh memorable login${last ? ` (e.g. ${last})` : ''}. Download or copy them below.`,
      });
      load();
    } catch (e) {
      toast({ title: 'Could not generate passwords', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setBulkBusy(false);
    }
  }

  function printLogins() {
    if (!students || !cls) return;
    const w = window.open('', '_blank', 'width=820,height=640');
    if (!w) {
      toast({ title: 'Pop-up blocked', description: 'Allow pop-ups to print the login sheet.' });
      return;
    }
    const rows = students
      .map(
        (s) => `<tr><td>${escapeHtml(s.displayName)}</td><td class="mono">${escapeHtml(s.username)}</td><td class="mono">${s.password ? escapeHtml(s.password) : '— set a new password —'}</td></tr>`
      )
      .join('');
    w.document.write(`<!doctype html><html><head><title>${escapeHtml(cls!.name)} — class logins</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
  h1 { font-size: 20px; margin: 0 0 2px; }
  p.sub { color: #666; font-size: 12px; margin: 0 0 18px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 7px 10px; border-bottom: 1px solid #ddd; font-size: 13px; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #555; border-bottom: 1.5px solid #999; }
  .mono { font-family: 'Courier New', monospace; }
  footer { margin-top: 20px; color: #888; font-size: 11px; }
  @media print { body { padding: 0; } }
</style></head><body>
<h1>Class logins — ${escapeHtml(cls!.name)}</h1>
<p class="sub">${students.length} students · gcsebusiness · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
<table><thead><tr><th>Student</th><th>Username</th><th>Password</th></tr></thead><tbody>${rows}</tbody></table>
<footer>Passwords stay visible (and changeable) in the class list on gcsebusiness.</footer>
<script>window.onload = function () { window.print(); }</script>
</body></html>`);
    w.document.close();
  }

  function emailLogins() {
    if (!students || !cls) return;
    const text = buildLoginsText(cls.name, students);
    const subject = `${cls!.name} — student logins (gcsebusiness)`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  }

  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async function deleteClass() {
    try {
      await api.del(`/api/teacher/classes/${classId}`);
      toast({ title: 'Class deleted' });
      go({ name: 't-classes' });
    } catch (e) {
      toast({ title: 'Could not delete class', description: (e as Error).message, variant: 'destructive' });
    }
  }

  if (error)
    return (
      <>
        <PageHeader title="Class" />
        <ErrorNote message={error} />
      </>
    );
  if (!cls || !students)
    return (
      <>
        <PageHeader title="Class" />
        <ThemedSkeleton rows={3} />
      </>
    );

  const credsCsv = creds ? ['Name,Username,Password', ...creds.map((c) => `${c.displayName},${c.username},${c.password}`)].join('\n') : '';

  return (
    <>
      <PageHeader
        title={cls.name}
        sub={`${students.length} ${students.length === 1 ? 'student' : 'students'} · usernames and passwords are always visible below`}
        actions={
          <>
            <Button variant="ghost" onClick={() => go({ name: 't-classes' })}>
              <ArrowLeft className="h-4 w-4" /> Classes
            </Button>
            <Dialog open={loginsOpen} onOpenChange={setLoginsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <KeyRound className="h-4 w-4" /> Logins
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Class logins — {cls.name}</DialogTitle>
                  <DialogDescription>
                    Every username and password in {cls.name}. Download the table, copy it, or print it for the class.
                  </DialogDescription>
                </DialogHeader>

                {students.some((s) => !s.password) ? (
                  <div className="rounded-lg border border-[var(--warn)]/50 bg-[var(--warn)]/10 p-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm">
                      <span className="font-medium">{students.filter((s) => !s.password).length} logins need a new password.</span>
                      <span className="block text-xs text-muted-foreground">
                        These accounts were made before passwords were stored viewably — generate fresh ones to hand out.
                      </span>
                    </div>
                    <Button size="sm" onClick={() => void generateMissing()} disabled={bulkBusy}>
                      <Wand2 className="h-3.5 w-3.5" /> {bulkBusy ? 'Generating…' : 'Generate now'}
                    </Button>
                  </div>
                ) : null}

                <div className="max-h-72 overflow-y-auto scroll-slim rounded-md border">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card">
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead className="font-mono">Password</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.displayName}</TableCell>
                          <TableCell className="font-mono text-sm">{s.username}</TableCell>
                          <TableCell className="font-mono text-sm font-semibold">
                            {s.password ?? <span className="text-xs font-normal text-muted-foreground">— generate above —</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => downloadFile(`${slugFilename(cls.name)}-logins.csv`, 'text/csv;charset=utf-8', buildLoginsCsv(cls.name, students as LoginRow[]))}>
                    <FileDown className="h-3.5 w-3.5" /> CSV table
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadFile(`${slugFilename(cls.name)}-logins.pdf`, 'application/pdf', buildLoginsPdf(cls.name, students as LoginRow[]))}>
                    <FileText className="h-3.5 w-3.5" /> PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(buildLoginsText(cls.name, students as LoginRow[])).then(() =>
                        toast({ title: 'Copied to clipboard' })
                      );
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy all
                  </Button>
                  <Button size="sm" variant="outline" onClick={printLogins}>
                    <Printer className="h-3.5 w-3.5" /> Print
                  </Button>
                  <Button size="sm" variant="outline" onClick={emailLogins}>
                    <Mail className="h-3.5 w-3.5" /> Email
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: “Print” opens a clean sheet — choose “Save as PDF” there for a second PDF route.
                </p>
              </DialogContent>
            </Dialog>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button><UserPlus className="h-4 w-4" /> Add students</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Add student accounts</DialogTitle>
                  <DialogDescription>
                    One student per line. Usernames come from names (e.g. amelia.watson) and each
                    student gets a memorable password like <span className="font-mono">braveotter23</span>.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="names">Student names</Label>
                    <Textarea
                      id="names"
                      value={names}
                      onChange={(e) => setNames(e.target.value)}
                      placeholder={'Amelia Watson\nBen Carter\nPriya Sharma'}
                      rows={7}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      {names.split(/\r?\n/).filter((l) => l.trim()).length} names entered
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Passwords</Label>
                    <RadioGroup value={pwMode} onValueChange={(v) => setPwMode(v as 'auto' | 'manual')} className="gap-2">
                      <div className="flex items-start gap-3 rounded-lg border p-3">
                        <RadioGroupItem value="auto" id="pw-auto" />
                        <label htmlFor="pw-auto" className="text-sm">
                          <span className="font-medium">A memorable password for each student</span>
                          <span className="block text-xs text-muted-foreground">Two friendly words and a number — easy to hand out, and you can always see and change it later.</span>
                        </label>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg border p-3">
                        <RadioGroupItem value="manual" id="pw-manual" />
                        <label htmlFor="pw-manual" className="text-sm w-full">
                          <span className="font-medium">One shared password for the class</span>
                          <span className="block text-xs text-muted-foreground mb-2">Handy for young classes — change it any time from the list below.</span>
                          <Input
                            value={sharedPw}
                            onChange={(e) => setSharedPw(e.target.value)}
                            placeholder="e.g. business10b"
                            disabled={pwMode !== 'manual'}
                            className="max-w-xs"
                          />
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addStudents} disabled={adding || names.trim().length === 0}>
                    {adding ? 'Creating accounts…' : 'Create accounts'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {/* credentials sheet */}
      {creds ? (
        <div className="mb-5 rounded-lg border bg-[var(--accent)]/30 p-4 no-print">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <KeyRound className="h-4 w-4 text-primary" /> New logins — copy or print now
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  downloadFile(
                    `${slugFilename(cls.name)}-new-logins.csv`,
                    'text/csv;charset=utf-8',
                    buildLoginsCsv(cls.name, creds as LoginRow[])
                  )
                }
              >
                <FileDown className="h-3.5 w-3.5" /> CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  downloadFile(
                    `${slugFilename(cls.name)}-new-logins.pdf`,
                    'application/pdf',
                    buildLoginsPdf(cls.name, creds as LoginRow[])
                  )
                }
              >
                <FileText className="h-3.5 w-3.5" /> PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(credsCsv).then(() => toast({ title: 'Copied to clipboard' }));
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCreds(null)}>
                Done
              </Button>
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto scroll-slim rounded-md bg-card border">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="font-mono">Password</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creds.map((c) => (
                  <TableRow key={c.username}>
                    <TableCell>{c.displayName}</TableCell>
                    <TableCell className="font-mono text-sm">{c.username}</TableCell>
                    <TableCell className="font-mono text-sm font-semibold">{c.password}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            These logins are saved — you can always view or change them in the class list.
          </p>
        </div>
      ) : null}

      <div className="rounded-lg border bg-card">
        {students.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={UserPlus}
              title="No students yet"
              body="Use “Add students” — paste your class list and every account is created in seconds."
            />
          </div>
        ) : (
          <div className="overflow-x-auto scroll-slim">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead className="w-24 text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          className="hover:text-primary hover:underline underline-offset-2 text-left"
                          onClick={() => openProfile(s.id)}
                          title={`Open ${s.displayName}'s profile`}
                        >
                          {s.displayName}
                        </button>
                        {quizzesBy[s.id] > 0 ? (
                          <Badge variant="secondary" className="text-[10px] font-normal shrink-0" title={`${quizzesBy[s.id]} quizzes submitted`}>
                            {quizzesBy[s.id]} done
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          navigator.clipboard.writeText(s.username);
                          toast({ title: 'Username copied' });
                        }}
                        title="Copy username"
                      >
                        {s.username}
                      </button>
                    </TableCell>
                    <TableCell>
                      {s.password ? (
                        <button
                          className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(s.password ?? '');
                            toast({ title: 'Password copied' });
                          }}
                          title="Copy password"
                        >
                          {s.password}
                        </button>
                      ) : (
                        <button
                          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                          onClick={() => void setAndShow(s.id, s.displayName)}
                          title="This account predates viewable passwords — set a new memorable one"
                        >
                          <KeyRound className="h-3 w-3" /> Set &amp; show
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 px-2.5 text-xs"
                          onClick={() => openProfile(s.id)}
                          aria-label={`Open ${s.displayName}'s profile`}
                          title="Profile — stats, progress graph, every quiz and answer"
                        >
                          <UserRoundSearch className="h-4 w-4" />
                          <span className="hidden sm:inline">Profile</span>
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={`Edit ${s.displayName} login`} onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-[var(--danger)]" aria-label={`Remove ${s.displayName}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove {s.displayName}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Their account and all their results are deleted. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep student</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90"
                                onClick={() => removeStudent(s.id, s.displayName)}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* class activity — every submitted quiz from any student in this class,
          as a 12-week heatmap (same grid the students see for themselves) */}
      {students.length > 0 ? (
        <ActivityHeatmap
          activity={activity}
          title="Class activity"
          className="mt-6"
          footerNote={
            activity.length === 0 ? (
              <span>No quizzes yet — squares appear as students submit work.</span>
            ) : (
              (() => {
                const ranked = students
                  .map((s) => ({ name: s.displayName, n: quizzesBy[s.id] ?? 0 }))
                  .filter((x) => x.n > 0)
                  .sort((a, b) => b.n - a.n);
                if (ranked.length === 0) return <span>No quizzes yet — squares appear as students submit work.</span>;
                const top = ranked[0];
                const tied = ranked.filter((x) => x.n === top.n).map((x) => x.name);
                return (
                  <span>
                    Most active:{' '}
                    <span className="font-medium text-foreground">
                      {tied.length > 1 ? `${tied.join(', ')} — ${top.n} quizzes each` : `${top.name} — ${top.n} quiz${top.n === 1 ? '' : 'zes'}`}
                    </span>
                  </span>
                );
              })()
            )
          }
        />
      ) : null}

      {/* mistake fixer — one untimed quiz built from what this class is
          collectively stuck on (questions tripping the most students first) */}
      {pool.questions > 0 ? (
        <section
          className="relative mt-6 rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card/80 to-[var(--warn)]/10 p-4 sm:p-6 overflow-hidden backdrop-blur-xl shadow-[inset_0_1px_0_0_rgb(255_255_255/0.45)]"
          aria-label="Class mistake fixer"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shine_1.6s_0.5s_ease-out_1]" aria-hidden />
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary" aria-hidden>
              <Wand2 className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm sm:text-base tabular-nums">
                {pool.questions} question{pool.questions === 1 ? '' : 's'} still tripping this class
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pool.studentsAffected} student{pool.studentsAffected === 1 ? '' : 's'} currently stuck on something — build one auto-marked revision quiz from the worst offenders.
              </p>
              {pool.top.length > 0 ? (
                <ul className="mt-3 space-y-1.5">
                  {pool.top.map((t) => (
                    <li key={t.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5 tabular-nums shrink-0">
                        {t.studentsWrong} student{t.studentsWrong === 1 ? '' : 's'}
                      </Badge>
                      <span className="truncate">{t.stem}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <Button className="shadow-[0_8px_24px_-8px_var(--primary)]" onClick={() => setFixOpen(true)}>
              <Wand2 className="h-4 w-4" /> Set mistake-fixing quiz
            </Button>
          </div>
        </section>
      ) : null}

      {/* confirm — the quiz is published to the whole class immediately */}
      <AlertDialog open={fixOpen} onOpenChange={setFixOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Set a mistake-fixing quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              One untimed quiz, no due date, built from the {pool.questions} question{pool.questions === 1 ? '' : 's'} this class is stuck on (up to the 20 worst). It appears on every student&rsquo;s dashboard immediately and marks itself as usual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={() => void setMistakeFixer()} disabled={fixing}>
              <Wand2 className="h-4 w-4" /> {fixing ? 'Building…' : 'Set it for the class'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* student profile dialog */}
      <StudentProfileDialog studentId={profileId} open={profileOpen} onOpenChange={setProfileOpen} />

      {/* edit login dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editing?.displayName}&rsquo;s login</DialogTitle>
            <DialogDescription>
              Change their name, username or password. They use the new details next time they sign in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="e-name">Name</Label>
              <Input id="e-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-user">Username</Label>
              <Input
                id="e-user"
                value={editUser}
                onChange={(e) => setEditUser(e.target.value.toLowerCase())}
                autoCapitalize="none"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Lowercase letters and dots, e.g. amelia.watson</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-pw">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="e-pw"
                  value={editPw}
                  onChange={(e) => setEditPw(e.target.value)}
                  className="font-mono"
                  placeholder="e.g. braveotter23"
                />
                <Button variant="outline" className="shrink-0" onClick={() => void regeneratePw()} disabled={editSaving}>
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Type your own, or press “New” for a fresh memorable password.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => void saveEdit()} disabled={editSaving || editUser.trim().length < 3 || editName.trim().length < 2}>
              {editSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border p-4 no-print">
        <div className="text-sm">
          <div className="font-medium">Delete this class</div>
          <div className="text-xs text-muted-foreground">Removes the class, its students, their results and its assignments.</div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-[var(--danger)] border-[var(--danger)]/40 hover:bg-[var(--danger)]/10">
              <Trash2 className="h-4 w-4" /> Delete class
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {cls.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This deletes {students.length} student account{students.length === 1 ? '' : 's'} and every result in this class. It cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90" onClick={deleteClass}>
                Delete everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
