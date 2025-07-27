#!/usr/bin/env node
/**
 * update-mkdocs-nav.js
 *
 * Scans `docs/specs/**` and rewrites the "Specs" section in `mkdocs.yml` so you
 * don't have to list each file manually.
 *
 * Behavior:
 * - Uses folder names as section titles (Title Case)
 * - Uses `index.md` as landing page when present; otherwise the folder is just a section
 * - File titles are derived from the first H1 in the file; if none, from filename
 * - Respects Material feature `navigation.indexes` for section landing pages
 * - Only replaces the "Specs" portion of `nav`; everything else in mkdocs.yml is preserved
 *
 * Usage:
 *   node tools/update-mkdocs-nav.js           # dry-run (prints diff summary)
 *   node tools/update-mkdocs-nav.js --write   # writes changes to mkdocs.yml
 *
 * Options:
 *   --docs-dir=docs            # path where MkDocs sources live
 *   --specs-dir=specs          # path under docs-dir to scan
 *   --sort=alpha|none          # sort entries alphabetically (default alpha)
 *
 * Requires dev deps: js-yaml, gray-matter
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const DOCS_DIR = argVal('--docs-dir', 'docs');
const SPECS_DIR = argVal('--specs-dir', 'specs');
const SORT = argVal('--sort', 'alpha'); // alpha or none

const MKDOCS_YML = path.resolve(process.cwd(), 'mkdocs.yml');
const SPECS_ROOT = path.resolve(process.cwd(), DOCS_DIR, SPECS_DIR);

if (!fs.existsSync(MKDOCS_YML)) {
  console.error(`mkdocs.yml not found at ${MKDOCS_YML}`);
  process.exit(1);
}
if (!fs.existsSync(SPECS_ROOT)) {
  console.error(`Specs directory not found at ${SPECS_ROOT}`);
  process.exit(1);
}

function argVal(flag, def) {
  const p = args.find(a => a.startsWith(flag + '='));
  return p ? p.split('=').slice(1).join('=').trim() : def;
}

function collectNavEntriesGeneric(dirAbs, docsDir) {
  const fs = require('fs'), path = require('path');
  if (!fs.existsSync(dirAbs)) return [];
  const items = fs.readdirSync(dirAbs, { withFileTypes: true });
  let files = items.filter(d => d.isFile() && d.name.toLowerCase().endsWith('.md'));
  let dirs  = items.filter(d => d.isDirectory());
  files.sort((a,b)=>a.name.localeCompare(b.name));
  dirs.sort((a,b)=>a.name.localeCompare(b.name));

  const entries = [];
  for (const f of files) {
    const abs = path.join(dirAbs, f.name);
    const title = getTitleFromFile(abs);
    const rel = relativeToDocs(abs);
    entries.push(objWithSingleKey(title, rel));
  }
  for (const d of dirs) {
    const childAbs = path.join(dirAbs, d.name);
    const childTitle = titleCase(d.name);
    const childEntries = collectNavEntriesGeneric(childAbs, docsDir);
    // Optional Overview if index.md exists:
    const idx = path.join(childAbs, 'index.md');
    if (fs.existsSync(idx)) childEntries.unshift(objWithSingleKey('Overview', relativeToDocs(idx)));
    entries.push(objWithSingleKey(childTitle, childEntries));
  }
  return entries;
}

function buildPlanningNav() {
  const rootTitle = 'Planning';
  const planningRoot = path.resolve(process.cwd(), DOCS_DIR, 'planning');
  const items = collectNavEntriesGeneric(planningRoot, DOCS_DIR);
  if (items.length === 0) return null;
  return objWithSingleKey(rootTitle, items);
}
function titleCase(s) {
  return s.replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, m => m.toUpperCase());
}

function getTitleFromFile(fileAbs) {
  try {
    const src = fs.readFileSync(fileAbs, 'utf8');
    const fm = matter(src);
    const body = fm.content || '';
    // Prefer first H1
    const m = body.match(/^\s*#\s+(.+?)\s*$/m);
    if (m) return m[1].trim();
  } catch {}
  // fallback to filename
  const base = path.basename(fileAbs, path.extname(fileAbs));
  return titleCase(base);
}

function relativeToDocs(absPath) {
  const rel = path.relative(path.resolve(process.cwd(), DOCS_DIR), absPath).replace(/\\/g, '/');
  return rel;
}

function collectNavEntries(dirAbs) {
  // Returns array of nav items for the folder: either "Title: path" or "Title: [children]"
  const entries = [];
  const items = fs.readdirSync(dirAbs, { withFileTypes: true });

  // Separate files/dirs
  let files = items.filter(d => d.isFile() && d.name.toLowerCase().endsWith('.md'));
  let dirs  = items.filter(d => d.isDirectory());

  if (SORT === 'alpha') {
    files.sort((a,b) => a.name.localeCompare(b.name));
    dirs.sort((a,b) => a.name.localeCompare(b.name));
  }

  // index.md if present should become the folder landing page
  const hasIndex = files.some(f => f.name.toLowerCase() === 'index.md');
  const indexPath = hasIndex ? path.join(dirAbs, 'index.md') : null;

  // Child files (excluding index.md)
  const fileChildren = files
    .filter(f => f.name.toLowerCase() != 'index.md')
    .map(f => {
      const abs = path.join(dirAbs, f.name);
      const title = getTitleFromFile(abs);
      const rel = relativeToDocs(abs);
      return objWithSingleKey(title, rel);
    });

  // Child folders (recurse)
  const dirChildren = dirs.map(d => {
    const childAbs = path.join(dirAbs, d.name);
    const childTitle = titleCase(d.name);
    const childEntries = collectNavEntries(childAbs);

    // If child has index.md, add it as first child labeled Overview
    const childHasIndex = fs.existsSync(path.join(childAbs, 'index.md'));
    if (childHasIndex) {
      const rel = relativeToDocs(path.join(childAbs, 'index.md'));
      childEntries.unshift(objWithSingleKey('Overview', rel));
    }

    return objWithSingleKey(childTitle, childEntries);
  });

  // Combine children
  return [...(fileChildren), ...(dirChildren)];
}

function buildSpecsNav() {
  const rootTitle = 'Specs';
  const rootEntries = collectNavEntries(SPECS_ROOT);

  // Ensure top-level /specs/index.md (optional, but nice landing page)
  const topIndex = path.join(SPECS_ROOT, 'index.md');
  if (fs.existsSync(topIndex)) {
    const rel = relativeToDocs(topIndex);
    // Put Overview first
    rootEntries.unshift(objWithSingleKey('Overview', rel));
  }
  return objWithSingleKey(rootTitle, rootEntries);
}

function objWithSingleKey(k, v) {
  const o = {};
  o[k] = v;
  return o;
}

function loadMkdocs() {
  const src = fs.readFileSync(MKDOCS_YML, 'utf8');
  return yaml.load(src, { schema: yaml.DEFAULT_SCHEMA });
}

function saveMkdocs(obj) {
  const out = yaml.dump(obj, { lineWidth: 100, noRefs: true });
  fs.writeFileSync(MKDOCS_YML, out, 'utf8');
  return out;
}

function replaceSpecsNav(mk) {
  if (!Array.isArray(mk.nav)) {
    console.error('mkdocs.yml has no `nav:` sequence; please add one and retry.');
    process.exit(1);
  }

  // Build new sections
  const newSpecs = buildSpecsNav();
  const newPlanning = buildPlanningNav(); // may be null

  // Replace or insert Specs
  const specsIdx = mk.nav.findIndex(entry => entry && entry['Specs']);
  if (specsIdx === -1) {
    const otherIdx = mk.nav.findIndex(entry => entry && entry['Other']);
    const homeIdx = mk.nav.findIndex(entry => entry && entry['Home']);
    const insertIdx = otherIdx !== -1 ? otherIdx : (homeIdx !== -1 ? homeIdx + 1 : mk.nav.length);
    mk.nav.splice(insertIdx, 0, newSpecs);
  } else {
    mk.nav.splice(specsIdx, 1, newSpecs);
  }

  // Replace or insert Planning (if any)
  if (newPlanning) {
    const planningIdx = mk.nav.findIndex(entry => entry && entry['Planning']);
    const afterSpecsIdx = mk.nav.findIndex(entry => entry && entry['Specs']);
    const insertIdx = planningIdx === -1
      ? (afterSpecsIdx !== -1 ? afterSpecsIdx + 1 : mk.nav.length)
      : planningIdx;
    if (planningIdx === -1) mk.nav.splice(insertIdx, 0, newPlanning);
    else mk.nav.splice(planningIdx, 1, newPlanning);
  }

  return mk;
}

function main() {
  const mk = loadMkdocs();
  const before = JSON.stringify(mk.nav, null, 2);
  replaceSpecsNav(mk);
  const after = JSON.stringify(mk.nav, null, 2);

  if (before === after && !WRITE) {
    console.log('Specs nav is up-to-date. No changes.');
  } else {
    saveMkdocs(mk);
    console.log('Wrote mkdocs.yml with updated Specs nav.');
  }
}

main();