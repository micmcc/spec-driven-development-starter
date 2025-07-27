# Frontmatter Agent (Starter Bundle)

This bundle helps you standardize **YAML frontmatter** across your `specs/` and `planning/` Markdown files and **validate** the metadata in CI.

## What’s included
- `schemas/spec-frontmatter.schema.json` — JSON Schema for required/optional keys
- `tools/add-frontmatter.js` — adds/normalizes frontmatter (agent)
- `tools/validate-specs.js` — validates frontmatter and writes `out/spec-index.json`
- `.github/workflows/Validate Spec Frontmatter` — validates on push/PR
- `.github/workflows/Frontmatter Auto-Fix` — on-demand PR that auto-fixes files

## Quick start (local)
1. Copy the files into your repo:
   - `schemas/spec-frontmatter.schema.json`
   - `tools/add-frontmatter.js`
   - `tools/validate-specs.js`
   - `.github/workflows/spec-frontmatter-validate.yml` (you can rename)
   - `.github/workflows/spec-frontmatter-autofix.yml`

2. Install dependencies:
   ```bash
   npm i -D gray-matter ajv ajv-formats glob js-yaml
   ```

3. Dry run (see which files need updates):
   ```bash
   node tools/add-frontmatter.js
   ```

4. Apply changes:
   ```bash
   node tools/add-frontmatter.js --write
   ```

5. Validate:
   ```bash
   node tools/validate-specs.js
   # outputs out/spec-index.json
   ```

## GitHub Actions
- **Validate Spec Frontmatter**: runs on every push/PR and fails if metadata is invalid.
- **Frontmatter Auto-Fix**: run manually from the Actions tab (`Run workflow`) to open a PR with all frontmatter fixes.

## ID Strategy
- IDs are deterministic by path: `${TYPE}-${shortHash(path)}`.
- Types map from path:
  - `specs/tests/` → `test`
  - `specs/product-overview/` → `context`
  - `specs/` → `feature`
  - `planning/` → `planning`
  - (fallback) → `doc`

## Customize
- Adjust `inferDomain()` and `inferType()` in `tools/add-frontmatter.js` to match your structure.
- Update the schema enum values if you want stricter status/domain rules.
- Set `FRONTMATTER_PATHS` env var (comma-separated globs) to add folders.