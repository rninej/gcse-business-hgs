#!/usr/bin/env python3
"""Cold-teacher journey on the deployed site: register -> class -> students ->
library assignment -> student login -> attempt -> submit -> teacher analytics.

Every step prints the real HTTP status and what came back, so a failure shows up
at the step that caused it. Uses only stdlib.
"""
import json, sys, urllib.request, urllib.error, http.cookiejar

BASE = "https://www.gcse.business"
EMAIL = "gcse.business.hgs+qa2311@gmail.com"
PW = "JourneyCheck2026!"

def opener():
    cj = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj)), cj

def call(op, path, data=None, method=None):
    url = BASE + path
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, method=method or ("POST" if data is not None else "GET"))
    if body:
        req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "journey-check/1")
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

def step(name, ok, detail=""):
    print(f"{'PASS' if ok else 'FAIL'}  {name}{'  — ' + detail if detail else ''}")
    return ok

teacher, tcj = opener()
student, scj = opener()
fails = []

s, d = call(teacher, "/api/auth/register", {"name": "QA Journey", "email": EMAIL, "password": PW})
if s == 409:
    s, d = call(teacher, "/api/auth/login", {"role": "teacher", "identifier": EMAIL, "password": PW})
    fails.append(not step("existing QA teacher logs in", s == 200, f"{s} {d.get('error','')}"))
else:
    fails.append(not step("register teacher", s == 200, f"{s} {d.get('error','')}"))

s, d = call(teacher, "/api/teacher/plan")
plan = (d.get("plan") or {}).get("plan") if isinstance(d.get("plan"), dict) else d.get("plan")
trial = json.dumps(d)[:160]
fails.append(not step("plan shows trial", s == 200 and "trial" in trial, trial))

s, d = call(teacher, "/api/teacher/classes", {"name": "QA 11A Business"})
cid = (d.get("class") or {}).get("id") or d.get("id")
if not cid:  # already exists from an earlier run — reuse it so the check is repeatable
    s2, d2 = call(teacher, "/api/teacher/classes")
    cid = next((c["id"] for c in d2.get("classes", []) if c.get("name") == "QA 11A Business"), None)
    fails.append(not step("class exists (reused)", s2 == 200 and bool(cid), f"classes={len(d2.get('classes', []))}"))
else:
    fails.append(not step("create class", s == 200 and bool(cid), f"{s} {str(d)[:160]}"))

s, d = call(teacher, f"/api/teacher/classes/{cid}/students",
            {"names": ["Alex Test", "Sam Test"], "passwordMode": "manual", "manualPassword": "Journey2026!"})
rows = d.get("students") or d.get("created") or []
if not rows:  # students already added on an earlier run
    s2, d2 = call(teacher, "/api/teacher/students")
    rows = [{"username": x["username"], "displayName": x["displayName"]} for x in d2.get("students", [])]
fails.append(not step("add two students", s == 200 and len(rows) == 2, f"{s} {str(d)[:200]}"))
username = rows[0].get("username") if rows else None

s, d = call(teacher, "/api/quizzes")
quizzes = d.get("quizzes") or []
qid = quizzes[0].get("id") if quizzes else None
fails.append(not step("quiz library loads", s == 200 and bool(qid), f"{s} n={len(quizzes)} first={qid}"))

s, d = call(teacher, "/api/teacher/assignments", {"classId": cid, "mode": "library", "quizId": qid, "title": "QA library quiz"})
aid = d.get("assignmentId") or (d.get("assignment") or {}).get("id") or d.get("id")
fails.append(not step("set library assignment", s == 200 and bool(aid), f"{s} {str(d)[:200]}"))

s, d = call(teacher, "/api/teacher/students")
fails.append(not step("student directory lists the class", s == 200 and len(d.get("students", [])) >= 2, f"n={len(d.get('students', []))}"))

s, d = call(student, "/api/auth/login", {"role": "student", "identifier": username, "password": "Journey2026!"})
fails.append(not step("student logs in", s == 200, f"{s} {str(d)[:120]}"))

s, d = call(student, "/api/student/assignments")
names = [a.get("title") for a in (d.get("assignments") or [])]
fails.append(not step("student sees the assignment", s == 200 and len(names) >= 1, f"n={len(names)} {names[:3]}"))

s, d = call(student, f"/api/student/assignments/{aid}/start", {})
atid = d.get("attemptId")
fails.append(not step("student starts attempt", s == 200 and bool(atid), f"{s} {str(d)[:120]}"))

# answer everything with the first option / a sentence, so marking has work to do
s, d = call(student, f"/api/student/attempts/{atid}")
qs = d.get("questions") or (d.get("attempt") or {}).get("questions") or []
answers = {}
for q in qs:
    t = q.get("type")
    if t in ("mcq", "truefalse"):
        opts = q.get("options") or []
        answers[q["id"]] = opts[0] if opts else "A"
    elif t == "numeric":
        answers[q["id"]] = "100"
    else:
        answers[q["id"]] = "Because the business wants to increase its market share and profit."
s2, sub = call(student, f"/api/student/attempts/{atid}/submit", {"answers": answers, "wallMs": 95000})
fails.append(not step("student submits answers", s2 == 200 and sub.get("ok") is not False, f"{s2} {str(sub)[:200]}"))

s, d = call(student, "/api/student/overview")
score = json.dumps(d)[:200]
fails.append(not step("student overview renders", s == 200, score))

s, d = call(teacher, f"/api/teacher/assignments/{aid}/results")
blob = json.dumps(d)[:300]
rows = d.get("rows") or []
seen = any("Alex" in json.dumps(r) or r.get("status") == "submitted" or r.get("pct") is not None for r in rows)
fails.append(not step("teacher sees the submission", s == 200 and seen, f"rows={len(rows)} {blob[:160]}"))

print("\nRESULT:", "all steps passed" if not any(fails) else f"{sum(fails)} failing step(s)")
sys.exit(0 if not any(fails) else 1)
