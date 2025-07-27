# Spec Portal & Dashboard (Starter)

This add-on generates a **Spec Dashboard** and publishes a **MkDocs** site for easy navigation.

## What you get
- `tools/generate-spec-dashboard.js` — builds `docs/spec-dashboard.md` with counts, gap analysis, and a Mermaid dependency graph
- `tools/copy-specs-to-docs.js` — copies `specs/**.md` into `docs/specs/` so MkDocs can publish your specs
- `mkdocs.yml` — basic Material theme config
- CI Workflows:
  - `.github/workflows/spec-dashboard-generate.yml` — validates metadata, generates dashboard, opens PR
  - `.github/workflows/spec-portal-publish.yml` — builds and deploys MkDocs to `gh-pages` on push to `main`

> Prereq: The **Frontmatter Agent** validation must already be in your repo so `out/spec-index.json` gets built.

## Local usage
```bash
# 1) Validate & build index
node tools/validate-specs.js

# 2) Generate dashboard
node tools/generate-spec-dashboard.js

# 3) Preview MkDocs locally (optional)
pip install mkdocs mkdocs-material
mkdocs serve
```

## CI usage
- Push to `main` and the **Spec Dashboard Generate** workflow will:
  1. Validate frontmatter & build `out/spec-index.json`
  2. Generate `docs/spec-dashboard.md`
  3. Open a PR with the updated dashboard

- Push to `main` and the **Spec Portal Publish** workflow will:
  1. Copy `specs/**.md` into `docs/specs/**`
  2. Rebuild the dashboard (if index exists)
  3. Deploy the MkDocs site to `gh-pages`

## Notes & Customization
- Update `repo_url` in `mkdocs.yml` to your repository.
- Adjust navigation (`nav:`) as needed.
- The Mermaid graph is embedded directly in Markdown; most doc portals render Mermaid out-of-the-box (MkDocs Material does).
- Extend `generate-spec-dashboard.js` if you want more checks (e.g., require `covers_tests` for all `feature` specs, owner must not be `unassigned`, etc.).