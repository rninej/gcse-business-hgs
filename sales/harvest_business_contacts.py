#!/usr/bin/env python3
"""Harvest UK secondary-school business-department email addresses.

Public staff directories publish these addresses for parents to use; this
collects them so a teacher can be written to once, by name, instead of a
school office guessing who to forward to. Polite by design: one request per
page, a browser user agent, and only addresses that sit next to a business or
economics role.

Usage: python3 harvest_business_contacts.py [max_pages]
Output: harvested.csv (domain, name, role, email, source)
"""
import csv
import re
import sys
import time
import urllib.parse
import urllib.request
from html import unescape

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

QUERIES = [
    '"head of business studies" email sch.uk',
    '"subject leader business studies" email sch.uk',
    '"head of business and economics" email sch.uk',
    '"curriculum leader business" email sch.uk',
    '"leader of learning business" email sch.uk',
    '"head of business" "business studies" staff list email sch.uk',
    '"business studies" department contact email staff list school',
    '"head of economics and business" email school',
    '"head of business studies" "staff contact" academy',
    '"business studies" "subject leader" "@" school staff',
    '"head of enterprise" business email school sch.uk',
    '"business and economics" "head of department" email school',
    '"second in business" email school sch.uk',
    '"teacher of business studies" email staff contacts school',
    '"head of business" email "sixth form" college',
    '"programme lead business" email college',
    '"head of business" email grammar school staff',
    '"business studies" staff emails pdf school',
    '"curriculum staff" business email sch.uk',
    '"head of business studies" email "11-18" school',
]

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
ROLE_RE = re.compile(r"business|enterprise|economics", re.I)
NAME_RE = re.compile(r"\b(?:Mr|Mrs|Ms|Miss|Dr|Mx)\.?\s+[A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+)?")


def get(url: str, timeout: int = 12) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-GB,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read(1_500_000)
    return raw.decode("utf-8", "ignore")


def ddg(query: str):
    url = "https://lite.duckduckgo.com/lite/?q=" + urllib.parse.quote(query)
    try:
        html = get(url)
    except Exception as e:  # noqa: BLE001
        print(f"  search failed: {e}", file=sys.stderr)
        return []
    links = re.findall(r'uddg=([^&"]+)', html)
    if not links:
        links = re.findall(r'href="(https?://[^"]+)"', html)
    out, seen = [], set()
    for link in links:
        link = unescape(urllib.parse.unquote(link))
        if "duckduckgo.com" in link or link in seen:
            continue
        seen.add(link)
        out.append(link)
    return out[:12]


def text_of(html: str) -> str:
    html = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", unescape(html))


def harvest(page_url: str):
    try:
        html = get(page_url, timeout=15)
    except Exception:  # noqa: BLE001
        return []
    host = urllib.parse.urlparse(page_url).netloc.lower().replace("www.", "")
    text = text_of(html)
    found = []
    for m in EMAIL_RE.finditer(text):
        email = m.group(0).strip(".,;:").lower()
        if not re.match(r"^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$", email):
            continue
        domain = email.split("@")[1]
        if domain != host and not domain.endswith("." + host) and not host.endswith("." + domain):
            continue
        window = text[max(0, m.start() - 220): m.end() + 90]
        if not ROLE_RE.search(window):
            continue
        name = NAME_RE.search(text[max(0, m.start() - 260): m.start()])
        found.append(
            {
                "domain": host,
                "name": name.group(0).strip() if name else "",
                "role": re.sub(r"\s+", " ", window)[-90:].strip(),
                "email": email,
                "source": page_url,
            }
        )
    return found


def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 90
    rows, seen_email, seen_page = [], set(), set()
    for q in QUERIES:
        print(f"query: {q}", file=sys.stderr)
        for link in ddg(q):
            if link in seen_page:
                continue
            seen_page.add(link)
            for row in harvest(link):
                if row["email"] in seen_email:
                    continue
                seen_email.add(row["email"])
                rows.append(row)
            if len(seen_page) >= limit:
                break
            time.sleep(0.4)
        if len(seen_page) >= limit:
            break
    with open("harvested.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["domain", "name", "role", "email", "source"])
        w.writeheader()
        w.writerows(rows)
    print(f"{len(rows)} addresses from {len(seen_page)} pages", file=sys.stderr)


if __name__ == "__main__":
    main()
