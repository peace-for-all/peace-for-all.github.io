# Valia Walsk — portfolio

A hand-authored static portfolio for a product-minded software engineer whose work crosses Android, backend, and production systems, published with GitHub Pages at <https://peace-for-all.github.io/>.

The site uses semantic HTML, one shared CSS file, and a dependency-free ES-module console. It has no analytics, cookies, remote fonts, or third-party embeds. Trace progress is the only persistent state; it stays in local browser storage under `valia.trace.v1`.

The home page exposes two progressive WebMCP site tools to compatible browser agents: one highlights case studies by engineering focus, and one operates the existing visible console. The review-response case file adds a shared investigation: an agent can reveal connected evidence for an ambiguous marketplace message and place a non-authoritative assessment on the same page the visitor sees. All tools reuse public client-side data and existing UI behavior; no model, account, API key, or remote MCP server is part of the site. Browsers without WebMCP support retain manual controls and the full written case study.

The [WebMCP Challenge submission notes](challenge/WEBMCP_CHALLENGE.md) contain the judge journey, under-three-minute demo script, draft submission description, and completion checklist.

## Local verification

```sh
python3 scripts/check_site.py
node tests/command-core.test.mjs
python3 -m http.server 8000
```

This is configured as an account-level GitHub Pages site, so the GitHub repository must be named exactly `peace-for-all.github.io`. Links use the site-root `/` prefix. For a local preview, serve this repository and open `http://localhost:8000/`.

## Remaining content review

Before treating the site as final:

1. Review the production-system case study for confidentiality and factual accuracy.
2. Review Earned and EcoWatch against their current implementations.
3. Keep the published White Sea photograph derivatives metadata-free; retain the original outside the repository.
4. Regenerate `assets/social-preview.png` from the SVG whenever its wording or design changes.
5. Add Play, F-Droid, or source links only when each destination is public and reviewed. After Play publication, cross-link the site and Google Play Developer Profile.

The included workflow validates and deploys every push to `main`. After renaming the repository, set **Settings → Pages → Source** to **GitHub Actions** once if it is not already selected.
