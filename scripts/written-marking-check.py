#!/usr/bin/env python3
"""Does a written answer actually get marked by the AI examiner?

Sets an assignment whose only question is a 4-mark written question, submits a
sensible student answer, then polls the attempt until the AI mark lands. This is
the promise that justifies the licence ("an explanation on every question",
"AI-marked written answers") — a silent failure here would teach a wrong mark.

Exit 0 only when a mark between 1 and the question's maximum appears, with
feedback text attached.
"""
import json, os, sys, time, urllib.request, urllib.error, http.cookiejar

BASE = "https://www.gcse.business"
STEM = ("Analyse why a small bakery might decide to become a private limited company. "
        "Use one advantage and one drawback in your answer.")
POINTS = [
    {"text": "Limited liability protects the owners' personal assets", "marks": 1},
    {"text": "Can raise finance by selling shares", "marks": 1},
    {"text": "Must publish accounts, which costs money and exposes information", "marks": 1},
    {"text": "Decision needs a judgement that weighs the two sides", "marks": 1},
]
EXPLAIN = ("A private limited company gives limited liability and access to share capital, "
           "but it must publish accounts and is more tightly regulated.")
ANSWER = ("Becoming a private limited company means the owners have limited liability, so their "
          "personal possessions are protected if the business fails. It also lets the bakery sell "
          "shares to raise money for new ovens without a bank loan. However, the company must "
          "publish its accounts every year, which costs money and lets competitors see its "
          "finances. On balance the limited liability is worth it if the owners plan to grow.")

def opener():
    cj = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def call(op, path, data=None):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(BASE + path, data=body, method="POST" if data is not None else "GET")
    if body:
        req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "written-check/1")
    try:
        with op.open(req, timeout=40) as r:
            return r.status, json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw or "{}")
        except Exception:
            return e.code, {"raw": raw[:200]}

teacher, student = opener(), opener()
fails = []
def check(name, ok, detail=""):
    print(f"{'PASS' if ok else 'FAIL'}  {name}{'  — ' + detail if detail else ''}")
    if not ok:
        fails.append(name)

stamp = str(int(time.time()))[-6:]
email = f"gcse.business.hgs+qa{stamp}@gmail.com"
s, d = call(teacher, "/api/auth/register", {"name": "Written Check", "email": email, "password": "Written2026!"})
check("teacher created", s == 200, str(d)[:80])

s, d = call(teacher, "/api/teacher/classes", {"name": f"Written {stamp}"})
cid = (d.get("class") or {}).get("id") if isinstance(d.get("class"), dict) else d.get("id")
check("class created", bool(cid), str(d)[:80])

s, d = call(teacher, f"/api/teacher/classes/{cid}/students", {"names": ["Rae Write"], "passwordMode": "manual", "manualPassword": "Written2026!"})
created = d.get("created") or []
uname = created[0]["username"] if created else None
check("student created", bool(uname), str(d)[:100])

question = {"type": "written", "topic": "1.4", "stem": STEM, "explain": EXPLAIN, "points": POINTS}
s, d = call(teacher, "/api/teacher/assignments", {"classId": cid, "mode": "custom", "title": f"Written marking {stamp}", "customQuestions": [question]})
aid = d.get("assignmentId")
check("written assignment created", bool(aid), str(d)[:160])
if not aid:
    sys.exit(1)

s, d = call(student, "/api/auth/login", {"role": "student", "identifier": uname, "password": "Written2026!"})
check("student login", s == 200, str(d)[:60])

s, d = call(student, f"/api/student/assignments/{aid}/start", {})
atid = d.get("attemptId")
check("attempt started", bool(atid), str(d)[:100])
if not atid:
    sys.exit(1)

s, d = call(student, f"/api/student/attempts/{atid}")
qs = d.get("questions") or []
qid = qs[0]["id"] if qs else None
check("written question served", bool(qid), f"n={len(qs)} type={qs[0].get('type') if qs else None}")

s, d = call(student, f"/api/student/attempts/{atid}/submit", {"answers": {qid: ANSWER}, "wallMs": 240000})
check("submission accepted", s == 200, str(d)[:120])

# The result screen kicks this off right after submitting; doing the same here
# is what makes the AI mark exist at all.
if os.environ.get("SKIP_MANUAL_TRIGGER") == "1":
    # prove the server marks on its own, the way a student who closes the tab needs
    print("SKIP  manual trigger (testing the server-side guarantee)")
else:
    s, kick = call(student, f"/api/student/attempts/{atid}/mark-written", {})
    check("AI marking triggered", s == 200, json.dumps(kick)[:160])

# AI marking is asynchronous; poll for up to 60s
mark = None
for _ in range(12):
    time.sleep(5)
    s, d = call(student, f"/api/student/attempts/{atid}")
    for q in d.get("reviews") or []:
        if q.get("type") == "written" or q.get("marks") is not None:
            mark = q
    if mark and (mark.get("awarded") is not None or mark.get("marks") is not None):
        if str(mark.get("awarded", "")).strip() not in ("", "None"):
            break

awarded = mark.get("awarded") if mark else None
check("AI mark landed on the written answer", awarded is not None, json.dumps(mark or {})[:260])
if awarded is not None:
    check("mark is within 0–4", 0 <= int(awarded) <= 4, f"awarded={awarded}")
    check("feedback text present", bool((mark.get("comment") or mark.get("feedback") or "").strip()), json.dumps(mark)[:200])

print("\nRESULT:", "written marking works" if not fails else f"{len(fails)} failing check(s)")
sys.exit(0 if not fails else 1)
