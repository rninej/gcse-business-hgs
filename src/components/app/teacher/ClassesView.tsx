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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
              className="rounded-lg border bg-card p-5 text-left hover:border-primary/60 hover:shadow-md transition-all group"
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
  const [error, setError] = useState<string | null>(null);

  const [names, setNames] = useState('');
  const [pwMode, setPwMode] = useState<'auto' | 'manual'>('auto');
  const [sharedPw, setSharedPw] = useState('');
  const [creds, setCreds] = useState<CreatedCred[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editUser, setEditUser] = useState('');
  const [editPw, setEditPw] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(() => {
    api
      .get<{ class: { id: string; name: string }; students: StudentRow[] }>(`/api/teacher/classes/${classId}`)
      .then((d) => {
        setCls(d.class);
        setStudents(d.students);
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

  async function removeStudent(sid: string, name: string) {
    try {
      await api.del(`/api/teacher/classes/${classId}/students/${sid}`);
      toast({ title: `Removed ${name}`, description: 'Their results were removed too.' });
      load();
    } catch (e) {
      toast({ title: 'Could not remove', description: (e as Error).message, variant: 'destructive' });
    }
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
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(credsCsv).then(() => toast({ title: 'Copied to clipboard' }));
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5" /> Print
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
                    <TableCell className="font-medium">{s.displayName}</TableCell>
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
                        <span className="text-xs text-muted-foreground">— set in “Edit” —</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
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
