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
        self.ids, self.links, self.headings, self.landmarks = set(), [], [], set()
        self.images = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a: self.ids.add(a["id"])
        if tag == "a" and "href" in a: self.links.append(a["href"])
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}: self.headings.append(int(tag[1]))
        if tag in {"header", "nav", "main", "footer"}: self.landmarks.add(tag)
        if tag == "img": self.images.append(a)

for path in HTML:
    page = Page()
    text = path.read_text(encoding="utf-8")
    try: page.feed(text)
    except Exception as exc: errors.append(f"{path.relative_to(ROOT)}: invalid HTML: {exc}")
    if page.headings.count(1) != 1: errors.append(f"{path.relative_to(ROOT)}: expected exactly one h1")
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

css = ROOT / "assets/site.css"
if css.stat().st_size >= 20_000: errors.append("assets/site.css: exceeds 20 KB uncompressed")
placeholder_files = [p.relative_to(ROOT) for p in ROOT.rglob("*") if p.is_file() and p.suffix in {".html", ".xml", ".txt", ".svg", ".md"} and re.search(r"YOUR-(?:GITHUB-HANDLE|PROFESSIONAL-EMAIL)|YOUR NAME", p.read_text(encoding="utf-8", errors="ignore"))]
print(f"Checked {len(HTML)} HTML pages; CSS is {css.stat().st_size} bytes.")
if placeholder_files: errors.append("publication placeholders remain in: " + ", ".join(map(str, placeholder_files)))
if errors:
    print("\n".join(f"ERROR: {e}" for e in errors), file=sys.stderr)
    raise SystemExit(1)
print("Local structure and links: OK")
