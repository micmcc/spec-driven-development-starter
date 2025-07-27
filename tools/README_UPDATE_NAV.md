# MkDocs Nav Generator

This tool scans `docs/specs/**` and updates the **Specs** section of `mkdocs.yml` automatically.

## Files
- `tools/update-mkdocs-nav.js` — build/refresh the Specs nav
- `.github/workflows/spec-nav-autoupdate.yml` — CI to open a PR with the updated nav

## Install (dev deps)
```bash
npm i -D js-yaml gray-matter
```

## Usage (local)
```bash
# Dry run (writes to stdout only)
node tools/update-mkdocs-nav.js

# Apply changes to mkdocs.yml
node tools/update-mkdocs-nav.js --write
```

### Options
- `--docs-dir=docs` (default) — MkDocs docs source directory
- `--specs-dir=specs` (default) — path under docs-dir to scan
- `--sort=alpha|none` (default alpha)

## CI
Enable the included workflow to keep nav fresh:
- On push to `main` or via "Run workflow", it updates the nav and opens a PR if there are changes.

## Notes
- Folder names become section titles (Title Case).
- If a folder has an `index.md`, a section landing page **Overview** is added before other items.
- File titles are taken from the first `# H1` when available; otherwise derived from the filename.
- The script only replaces the **Specs** entry in `nav:` and leaves the rest of `mkdocs.yml` untouched.