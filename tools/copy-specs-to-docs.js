#!/usr/bin/env node
'use strict';
/**
 * copy-specs-to-docs.js
 * Copies Markdown files into MkDocs' docs/ tree, preserving structure, and
 * injects an `edit_url` so "Edit this page" points back to the source in GitHub.
 *
 * - specs/    -> docs/specs/
 * - planning/ -> docs/planning/
 * - README.md -> docs/project-readme.md  (avoids conflict with docs/index.md)
 * - TODO.md   -> docs/planning/TODO.md   (and fixes internal links)
 *
 * Env (optional):
 *   REPO_URL    e.g. https://github.com/micmcc/spec-driven-development-starter
 *   EDIT_BRANCH e.g. main
 *
 * The script will also read repo/branch from mkdocs.yml if present:
 *   repo_url: https://github.com/...  and  edit_uri: edit/<branch>/
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');

// Read mkdocs.yml to get repo_url and edit_uri (branch)
function loadMkdocsConfig() {
  try {
    const src = fs.readFileSync(path.resolve(process.cwd(), 'mkdocs.yml'), 'utf8');
    return yaml.load(src) || {};
  } catch {
    return {};
  }
}

const mkcfg = loadMkdocsConfig();
const REPO_URL = process.env.REPO_URL || mkcfg.repo_url || 'https://github.com/miccullough/spec-driven-development-starter';

// Infer branch from edit_uri: e.g., "edit/main/" or "edit/main/docs/"
let inferredBranch = 'main';
if (mkcfg && typeof mkcfg.edit_uri === 'string') {
  const m = mkcfg.edit_uri.match(/edit\/(.+?)\//);
  if (m && m[1]) inferredBranch = m[1];
}
const EDIT_BRANCH = process.env.EDIT_BRANCH || inferredBranch;

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

// Build a GitHub edit URL for a given repo-relative path
function makeEditUrl(editPath) {
  const clean = (editPath || '').replace(/^\/+/, '').replace(/\\/g, '/');
  return `${REPO_URL}/edit/${EDIT_BRANCH}/${clean}`;
}

function writeWithEditUrl(srcAbs, destAbs, editPath, debug = false) {
  const raw = fs.readFileSync(srcAbs, 'utf8');
  const fm = matter(raw);
  const data = fm.data || {};
  data.edit_url = makeEditUrl(editPath);   // inject page-level edit link
  const out = matter.stringify(fm.content, data);
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  fs.writeFileSync(destAbs, out, 'utf8');
  if (debug) {
    console.log(`[copy+edit] ${path.relative(process.cwd(), srcAbs)} -> ${path.relative(process.cwd(), destAbs)} (edit_url: ${data.edit_url})`);
  }
}

function copyMdTree(srcDir, destDir, debug = false) {
  if (!fs.existsSync(srcDir)) return { copied: 0, dirs: 0, files: 0 };
  ensureDir(destDir);
  let stats = { copied: 0, dirs: 1, files: 0 };

  // COPY LOOP: iterate entries under srcDir
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const rawName = entry.name;
    const name = rawName.replace(/\s+$/, ''); // trim trailing whitespace in filenames
    if (rawName !== name) {
      console.warn(`[warn] Trimming trailing whitespace in filename: "${rawName}" -> "${name}"`);
    }

    const s = path.join(srcDir, rawName); // use raw name for source
    const d = path.join(destDir, name);   // use sanitized name for destination

    if (entry.isDirectory()) {
      const sub = copyMdTree(s, d, debug);
      stats.copied += sub.copied; stats.dirs += sub.dirs; stats.files += sub.files;
    } else if (entry.isFile()) {
      const lower = name.toLowerCase();
      if (lower.endsWith('.md')) {
        const editPath = path.relative(process.cwd(), s).replace(/\\/g, '/');
        writeWithEditUrl(s, d, editPath, debug);
        stats.copied += 1; stats.files += 1;
      }
    }
  }
  return stats;
}

function parseArg(name, def) {
  const p = process.argv.find(a => a.startsWith(`--${name}=`));
  return p ? p.substring(name.length + 3) : def;
}
function hasFlag(name) { return process.argv.includes(`--${name}`); }

function rewriteTodoLinks(todoPath, debug = false) {
  try {
    let content = fs.readFileSync(todoPath, 'utf8');
    // Convert links like "](/planning/TODO.something.md)" or "](planning/TODO.something.md)" to "](TODO.something.md)"
    content = content.replace(/\]\(\/?planning\/([^\)]+)\)/g, "](\$1)");
    fs.writeFileSync(todoPath, content, 'utf8');
    if (debug) console.log(`[rewrite] normalized links inside ${path.relative(process.cwd(), todoPath)}`);
  } catch (e) {
    console.warn('[rewrite] failed to normalize links in', todoPath, e.message);
  }
}

function main() {
  const ROOT = process.cwd();
  const debug = hasFlag('debug');

  // Primary mapping (specs -> docs/specs), overridable
  const fromSpecs = parseArg('from', 'specs');
  const toSpecs = parseArg('to', 'docs/specs');

  const SRC_SPECS = path.resolve(ROOT, fromSpecs);
  const DEST_SPECS = path.resolve(ROOT, toSpecs);

  if (!fs.existsSync(SRC_SPECS)) {
    console.error(`[copy-specs-to-docs] Source not found: ${path.relative(ROOT, SRC_SPECS)}`);
    process.exit(1);
  }
  const s1 = copyMdTree(SRC_SPECS, DEST_SPECS, debug);
  console.log(`[copy-specs-to-docs] Copied ${s1.copied} Markdown file(s) from ${path.relative(ROOT, SRC_SPECS)} -> ${path.relative(ROOT, DEST_SPECS)}`);

  // Secondary mapping: planning -> docs/planning (if planning/ exists)
  const SRC_PLAN = path.resolve(ROOT, 'planning');
  const DEST_PLAN = path.resolve(ROOT, 'docs/planning');
  if (fs.existsSync(SRC_PLAN)) {
    const s2 = copyMdTree(SRC_PLAN, DEST_PLAN, debug);
    console.log(`[copy-specs-to-docs] Copied ${s2.copied} Markdown file(s) from ${path.relative(ROOT, SRC_PLAN)} -> ${path.relative(ROOT, DEST_PLAN)}`);
  }

  // Root README.md -> docs/project-readme.md (avoid conflict with docs/index.md)
  ensureDir(path.join(ROOT, 'docs'));
  const readmeSrc = path.join(ROOT, 'README.md');
  const readmeDst = path.join(ROOT, 'docs', 'project-readme.md');
  if (fs.existsSync(readmeSrc)) {
    writeWithEditUrl(readmeSrc, readmeDst, 'README.md', debug);
  }

  // Root TODO.md -> docs/planning/TODO.md and fix links to siblings (also add edit_url)
  const todoSrc = path.join(ROOT, 'TODO.md');
  const todoDstDir = path.join(ROOT, 'docs', 'planning');
  const todoDst = path.join(todoDstDir, 'TODO.md');
  if (fs.existsSync(todoSrc)) {
    ensureDir(todoDstDir);
    writeWithEditUrl(todoSrc, todoDst, 'TODO.md', debug);
    rewriteTodoLinks(todoDst, debug);
  }
}

if (require.main === module) {
  try { main(); } catch (err) { console.error(err); process.exit(1); }
}

module.exports = { copyMdTree };