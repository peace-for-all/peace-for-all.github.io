#!/usr/bin/env python3
"""Dependency-free checks for this static site."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE = "/"
HTML = sorted(ROOT.rglob("*.html"))
errors = []

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.duplicate_ids, self.links, self.headings, self.landmarks = set(), [], [], [], set()
        self.images = []
        self.scripts = []
        self.command_targets = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            if a["id"] in self.ids: self.duplicate_ids.append(a["id"])
            self.ids.add(a["id"])
        if tag == "a" and "href" in a: self.links.append(a["href"])
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}: self.headings.append(int(tag[1]))
        if tag in {"header", "nav", "main", "footer"}: self.landmarks.add(tag)
        if tag == "img": self.images.append(a)
        if tag == "script" and "src" in a: self.scripts.append(a["src"])
        if "data-command" in a and tag == "a": self.command_targets.append(a.get("href", ""))

for path in HTML:
    page = Page()
    text = path.read_text(encoding="utf-8")
    try: page.feed(text)
    except Exception as exc: errors.append(f"{path.relative_to(ROOT)}: invalid HTML: {exc}")
    if page.headings.count(1) != 1: errors.append(f"{path.relative_to(ROOT)}: expected exactly one h1")
    if page.duplicate_ids: errors.append(f"{path.relative_to(ROOT)}: duplicate ids: {', '.join(page.duplicate_ids)}")
    for before, after in zip(page.headings, page.headings[1:]):
        if after > before + 1: errors.append(f"{path.relative_to(ROOT)}: heading skips h{before} to h{after}")
    if "main" not in page.landmarks: errors.append(f"{path.relative_to(ROOT)}: missing main landmark")
    for image in page.images:
        if "alt" not in image: errors.append(f"{path.relative_to(ROOT)}: image missing alt")
    for href in page.links:
        if href.startswith(("mailto:", "https://", "http://")): continue
        parsed = urlparse(href)
        if not parsed.path:
            target = path
        elif parsed.path.startswith(BASE):
            target = ROOT / (parsed.path.removeprefix(BASE) or "index.html")
        elif parsed.path.startswith("/"):
            errors.append(f"{path.relative_to(ROOT)}: root link misses {BASE} prefix: {href}")
            continue
        else:
            target = path.parent / parsed.path
        if target.is_dir(): target = target / "index.html"
        if not target.exists(): errors.append(f"{path.relative_to(ROOT)}: broken link {href}")
        if parsed.fragment and target == path and parsed.fragment not in page.ids: errors.append(f"{path.relative_to(ROOT)}: missing fragment {href}")
    for src in page.scripts:
        parsed = urlparse(src)
        target = ROOT / parsed.path.lstrip("/")
        if not target.exists(): errors.append(f"{path.relative_to(ROOT)}: missing script {src}")
        if parsed.path.endswith(".js") and 'type="module"' not in text: errors.append(f"{path.relative_to(ROOT)}: JavaScript must use type=module")
    for href in page.command_targets:
        if not href: errors.append(f"{path.relative_to(ROOT)}: command link has no target")

css = ROOT / "assets/site.css"
if css.stat().st_size >= 20_000: errors.append("assets/site.css: exceeds 20 KB uncompressed")
trace_ids = []
for path in ROOT.glob("case-studies/*.html"):
    trace_ids.extend(re.findall(r'data-trace="([^"]+)"', path.read_text(encoding="utf-8")))
if sorted(trace_ids) != ["1", "2", "3", "4"]: errors.append(f"trace ids must be exactly 1–4; found {trace_ids}")
after_hours = ROOT / "after-hours.html"
if not after_hours.exists(): errors.append("after-hours.html: missing")
elif not all(fragment in after_hours.read_text(encoding="utf-8") for fragment in ['href="/#projects"', 'href="/#contact"']): errors.append("after-hours.html: missing projects/contact links")
placeholder_files = [p.relative_to(ROOT) for p in ROOT.rglob("*") if p.is_file() and p.suffix in {".html", ".xml", ".txt", ".svg", ".md"} and re.search(r"YOUR-(?:GITHUB-HANDLE|PROFESSIONAL-EMAIL)|YOUR NAME", p.read_text(encoding="utf-8", errors="ignore"))]
print(f"Checked {len(HTML)} HTML pages; CSS is {css.stat().st_size} bytes.")
if placeholder_files: errors.append("publication placeholders remain in: " + ", ".join(map(str, placeholder_files)))
if errors:
    print("\n".join(f"ERROR: {e}" for e in errors), file=sys.stderr)
    raise SystemExit(1)
print("Local structure and links: OK")
