# Valia Walsk — portfolio

A hand-authored static portfolio for an Android, product, and production-systems engineer, published with GitHub Pages at <https://peace-for-all.github.io/>.

The site uses semantic HTML and one shared CSS file, with no JavaScript, analytics, cookies, remote fonts, or third-party embeds.

## Local verification

```sh
python3 scripts/check_site.py
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
