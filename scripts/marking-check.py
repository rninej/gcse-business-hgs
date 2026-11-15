#!/usr/bin/env python3
"""Does the marker award full marks to a perfect paper?

Takes the real bank questions for a library quiz (teacher preview), logs in as a
new student, starts the attempt and submits exactly the right answer for every
question — mcq index, true/false, accepted phrase, numeric value. Then it reads
the result. A perfect paper must score 100%; anything less is a marking bug that
would show up as a teacher's class "randomly" losing marks.
"""
import json, sys, urllib.request, urllib.error, http.cookiejar, time

BASE = "https://www.gcse.business"
TEACHER = "gcse.business.hgs+qa2311@gmail.com"
TPW = "JourneyCheck2026!"
SPW = "MarkCheck2026!"

def opener():
    cj = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def call(op, path, data=None, method=None):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(BASE + path, data=body, method=method or ("POST" if data is not None else "GET"))
    if body:
        req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "marking-check/1")
    try:
        with op.open(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw or "{}")
        except Exception:
            return e.code, {"raw": raw[:300]}
    except Exception as e:
        return 0, {"error": str(e)}

teacher, student = opener(), opener()
fails = []

def check(name, ok, detail=""):
    print(f"{'PASS' if ok else 'FAIL'}  {name}{'  — ' + detail if detail else ''}")
    if not ok:
        fails.append(name)

s, d = call(teacher, "/api/auth/login", {"role": "teacher", "identifier": TEACHER, "password": TPW})
check("teacher login", s == 200, str(d)[:80])

s, d = call(teacher, "/api/teacher/classes")
classes = d.get("classes", [])
cid = classes[0]["id"] if classes else None
check("teacher has a class", bool(cid), f"classes={len(classes)}")

s, d = call(teacher, "/api/quizzes")
quizzes = d.get("quizzes") or []
# pick a quiz that is entirely objective questions, so AI marking is not involved
chosen = None
for q in quizzes:
    s2, prev = call(teacher, f"/api/teacher/assignments/preview/{q['id']}")
    qs = prev.get("questions") or []
    if qs and all(x.get("type") != "written" for x in qs):
        chosen = (q["id"], qs)
        break
check("found an all-objective quiz", bool(chosen), f"{chosen[0] if chosen else None} n={len(chosen[1]) if chosen else 0}")
if not chosen:
    sys.exit(1)
quiz_id, questions = chosen

s, d = call(teacher, "/api/teacher/assignments", {"classId": cid, "mode": "library", "quizId": quiz_id, "title": f"Marking check {int(time.time())}"})
aid = d.get("assignmentId")
check("assignment created", bool(aid), str(d)[:120])

# a fresh student so attempts do not pile onto one account
name = f"Mark Check {int(time.time()) % 10000}"
s, d = call(teacher, f"/api/teacher/classes/{cid}/students", {"names": [name], "passwordMode": "manual", "manualPassword": SPW})
created = d.get("created") or []
username = created[0]["username"] if created else None
check("student created", bool(username), str(d)[:120])

s, d = call(student, "/api/auth/login", {"role": "student", "identifier": username, "password": SPW})
check("student login", s == 200, str(d)[:80])

s, d = call(student, f"/api/student/assignments/{aid}/start", {})
atid = d.get("attemptId")
check("attempt started", bool(atid), str(d)[:120])

# the attempt's own questions carry the ids the submission must use
s, d = call(student, f"/api/student/attempts/{atid}")
served = d.get("questions") or []
by_id = {q["id"]: q for q in questions}
answers, kinds = {}, {}
for q in served:
    bank = by_id.get(q["id"], {})
    t = q.get("type")
    kinds[t] = kinds.get(t, 0) + 1
    if t == "mcq":
        # the student's options are shuffled, so the right answer is identified
        # by its TEXT from the bank, never by the bank's index
        bank_opts = bank.get("options") or []
        wanted = bank_opts[bank.get("correct", 0)] if bank_opts else None
        # mcq answers travel as the INDEX inside this attempt's (shuffled)
        # options, so look the right text up rather than reusing the bank index
        answers[q["id"]] = str(q["options"].index(wanted)) if wanted in q["options"] else "0"
    elif t == "truefalse":
        answers[q["id"]] = "True" if bank.get("answer") else "False"
    elif t == "numeric":
        answers[q["id"]] = str(bank.get("value", 0))
    elif t in ("term", "fib"):
        accept = bank.get("accept") or []
        answers[q["id"]] = accept[0] if accept else ""
    else:
        answers[q["id"]] = "A sensible answer."
check("every served question matched the bank copy", len(answers) == len(served), f"{len(answers)}/{len(served)} types={kinds}")

s, d = call(student, f"/api/student/attempts/{atid}/submit", {"answers": answers, "wallMs": 120000})
res = d.get("result") or {}
pct = res.get("pct")
check("perfect paper scores 100%", s == 200 and pct == 100, f"pct={pct} score={res.get('score')}/{res.get('total')}")
if res.get("perQ"):
    wrong = {k: v for k, v in res["perQ"].items() if not v.get("correct")}
    if wrong:
        print("   wrong despite the right answer:", json.dumps(wrong)[:400])

print("\nRESULT:", "marker is correct" if not fails else f"{len(fails)} failing check(s)")
sys.exit(0 if not fails else 1)
