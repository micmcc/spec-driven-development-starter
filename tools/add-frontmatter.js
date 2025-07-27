#!/usr/bin/env node
// add-frontmatter.js
// Adds or normalizes YAML frontmatter for Markdown specs and planning docs.
//
// Usage:
//   node tools/add-frontmatter.js           # dry run
//   node tools/add-frontmatter.js --write   # write changes
//
// Scans (by default): specs/**.md and planning/**.md
// Configure with env var FRONTMATTER_PATHS (comma-separated globs)

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');
const crypto = require('crypto');
const yaml = require('js-yaml');

const WRITE = process.argv.includes('--write');
const ROOT = process.cwd();
const DEFAULT_GLOBS = process.env.FRONTMATTER_PATHS || 'specs/**/*.md,planning/**/*.md,README.md,TODO.md';

// extend inferType():
function inferType(file) {
  const p = file.replace(/\\/g, '/');
  const base = p.split('/').pop().toLowerCase();
  if (base === 'todo.md') return 'planning';
  if (base === 'readme.md') return 'doc';   // or 'context' if you prefer
  if (p.includes('/specs/tests/')) return 'test';
  if (p.includes('/specs/product-overview/')) return 'context';
  if (p.startsWith('specs/')) return 'feature';
  if (p.startsWith('planning/')) return 'planning';
  return 'doc';
}

function inferDomain(file) {
  // Try to infer domain as the first folder under specs/, e.g., specs/auth/*
  const p = file.replace(/\\/g, '/');
  const m = p.match(/^specs\/([^\/]+)\//);
  if (m && m[1] && !['tests', 'product-overview'].includes(m[1])) return m[1];
  return 'general';
}

function prefixForType(t) {
  switch (t) {
    case 'feature': return 'FEAT';
    case 'test': return 'TEST';
    case 'context': return 'CTX';
    case 'planning': return 'PLAN';
    default: return 'DOC';
  }
}

function shortHash(text) {
  return crypto.createHash('sha1').update(text).digest('hex').slice(0, 7);
}

function firstHeading(body) {
  const lines = body.split(/\r?\n/);
  for (const ln of lines) {
    const m = ln.match(/^#\s+(.*)$/);
    if (m) return m[1].trim();
  }
  return null;
}

function normalize(front, file, body) {
  const rel = file;
  const t = inferType(rel);
  const prefix = prefixForType(t);
  const titleFromH1 = firstHeading(body);
  const titleFromName = path.basename(rel, path.extname(rel)).replace(/[-_]/g, ' ');

  const id = front.id || `${prefix}-${shortHash(rel)}`;
  const title = front.title || titleFromH1 || titleFromName;
  const status = front.status || (t === 'planning' ? 'open' : 'draft');
  const domain = front.domain || (t === 'feature' ? inferDomain(rel) : 'general');
  const owner = front.owner || 'unassigned';
  const last_reviewed = front.last_reviewed || new Date().toISOString().slice(0,10);

  const depends_on = Array.isArray(front.depends_on) ? front.depends_on : [];
  const implementsArr = Array.isArray(front.implements) ? front.implements : [];
  const covers_tests = Array.isArray(front.covers_tests) ? front.covers_tests : [];
  const code_refs = Array.isArray(front.code_refs) ? front.code_refs : [];

  return {
    ...front,
    id, title, type: t, status, domain, owner, last_reviewed,
    depends_on, implements: implementsArr, covers_tests, code_refs
  };
}

function run() {
  const patterns = DEFAULT_GLOBS.split(',').map(s => s.trim()).filter(Boolean);
  const files = patterns.flatMap(pat => glob.sync(pat, { nodir: true }));

  if (files.length === 0) {
    console.log('No files matched. Set FRONTMATTER_PATHS or add Markdown files under specs/ or planning/.');
    process.exit(0);
  }

  let changed = 0;
  let touched = 0;

  for (const file of files) {
    const abs = path.resolve(ROOT, file);
    const src = fs.readFileSync(abs, 'utf8');
    const fm = matter(src);
    const current = fm.data || {};
    const body = fm.content || '';
    const next = normalize(current, path.relative(ROOT, abs).replace(/\\/g, '/'), body);

    const rebuilt = matter.stringify(body.replace(/^\s+$/g, ''), next);
    if (rebuilt !== src) {
      touched++;
      if (WRITE) {
        fs.writeFileSync(abs, rebuilt, 'utf8');
        changed++;
        console.log(`[WRITE] ${file}`);
      } else {
        console.log(`[DRY] Would update ${file}`);
      }
    }
  }

  if (WRITE) {
    console.log(`\nUpdated ${changed} files. Touched (detected diffs): ${touched}.`);
  } else {
    console.log(`\nDry run complete. Files needing updates: ${touched}. Run with --write to apply.`);
  }
}

run();