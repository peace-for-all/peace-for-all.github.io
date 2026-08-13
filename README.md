# Valya Unixway — portfolio

A hand-authored static portfolio published with GitHub Pages at <https://peace-for-all.github.io/peace-for-all/>.

The site uses semantic HTML and one shared CSS file, with no JavaScript, analytics, cookies, remote fonts, or third-party embeds.

## Local verification

```sh
python3 scripts/check_site.py
python3 -m http.server 8000
```

Because this is a project Pages repository, links use the `/peace-for-all/` prefix. To preview exact paths, serve the directory containing this repository and open `http://localhost:8000/peace-for-all/`.

## Remaining content review

Before treating the site as final:

1. Review the production-system case study for confidentiality and factual accuracy.
2. Review Earned and EcoWatch against their current implementations.
3. Supply a White Sea photograph you own. Strip all metadata and create responsive AVIF, WebP, and JPEG variants before adding it. The image is intentionally omitted until then.
4. Export `assets/social-preview.svg` as a 1200×630 JPEG or PNG for broad crawler support, and update `og:image`.
5. Add Play, F-Droid, or source links only when each destination is public and reviewed. After Play publication, cross-link the site and Google Play Developer Profile.

The included workflow validates and deploys every push to `main`. In repository **Settings → Pages**, set **Source** to **GitHub Actions** once if it is not already selected.
