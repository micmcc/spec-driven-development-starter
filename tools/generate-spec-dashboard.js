#!/usr/bin/env node
/**
 * generate-spec-dashboard.js
 * - Reads out/spec-index.json (produced by validate-specs.js)
 * - Emits docs/spec-dashboard.md with:
 *   - Counts by type/status/domain/owner
 *   - Gap analysis (features without tests, orphan tests, missing depends_on targets)
 *   - Mermaid dependency graph from depends_on
 *
 * Usage:
 *   node tools/generate-spec-dashboard.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const INDEX = path.resolve(ROOT, 'out/spec-index.json');
const OUT_MD = path.resolve(ROOT, 'docs/spec-dashboard.md');

function ensureIndex() {
  if (!fs.existsSync(INDEX)) {
    console.error('spec-index.json not found. Run `node tools/validate-specs.js` first.');
    process.exit(1);
  }
}

function countBy(arr, keyFn) {
  const m = new Map();
  for (const x of arr) {
    const k = keyFn(x);
    m.set(k, (m.get(k) || 0) + 1);
  }
  return Array.from(m.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
}

function tableFromEntries(entries, headers) {
  const [h1, h2] = headers;
  let md = `| ${h1} | ${h2} |\n|---|---:|\n`;
  for (const [k,v] of entries) {
    md += `| ${k || '—'} | ${v} |\n`;
  }
  return md + '\n';
}

function main() {
  ensureIndex();
  const data = JSON.parse(fs.readFileSync(INDEX, 'utf8'));

  // Indices
  const byId = new Map(data.map(x => [x.id, x]));
  const byType = countBy(data, x => x.type);
  const byStatus = countBy(data, x => x.status);
  const byDomain = countBy(data, x => x.domain || 'general');
  const byOwner = countBy(data, x => x.owner || 'unassigned');

  // Gap analysis
  const features = data.filter(x => x.type === 'feature');
  const tests = data.filter(x => x.type === 'test');
  const testsCovered = new Set(features.flatMap(f => (f.covers_tests || [])));
  const orphanTests = tests.filter(t => !testsCovered.has(t.id));

  const featuresWithoutTests = features.filter(f => !Array.isArray(f.covers_tests) || f.covers_tests.length === 0);

  const missingDependsTargets = [];
  for (const s of data) {
    for (const dep of (s.depends_on || [])) {
      if (!byId.has(dep)) {
        missingDependsTargets.push({ id: s.id, file: s.file, missing: dep });
      }
    }
  }

  // Dependency graph (Mermaid)
  // Edge: current --> dependency
  const edges = [];
  for (const s of data) {
    for (const dep of (s.depends_on || [])) {
      if (byId.has(dep)) {
        edges.push([s.id, dep]);
      }
    }
  }

  // Build Markdown
  let md = `# Spec Dashboard\n\n`;
  md += `Generated from \`out/spec-index.json\`. Update by running:\n\n`;
  md += "```bash\nnode tools/validate-specs.js && node tools/generate-spec-dashboard.js\n```\n\n";

  md += `## Overview\n\n`;
  md += `### By Type\n` + tableFromEntries(byType, ['Type', 'Count']);
  md += `### By Status\n` + tableFromEntries(byStatus, ['Status', 'Count']);
  md += `### By Domain\n` + tableFromEntries(byDomain, ['Domain', 'Count']);
  md += `### By Owner\n` + tableFromEntries(byOwner, ['Owner', 'Count']);

  md += `## Gap Analysis\n\n`;
  md += `### Features without Tests (${featuresWithoutTests.length})\n`;
  if (featuresWithoutTests.length === 0) {
    md += `- None ✅\n\n`;
  } else {
    md += `| ID | Title | File |\n|---|---|---|\n`;
    for (const f of featuresWithoutTests) {
      md += `| ${f.id} | ${f.title} | ${f.file} |\n`;
    }
    md += `\n`;
  }

  md += `### Orphan Tests (not referenced by any feature) (${orphanTests.length})\n`;
  if (orphanTests.length === 0) {
    md += `- None ✅\n\n`;
  } else {
    md += `| ID | Title | File |\n|---|---|---|\n`;
    for (const t of orphanTests) {
      md += `| ${t.id} | ${t.title} | ${t.file} |\n`;
    }
    md += `\n`;
  }

  md += `### Missing \`depends_on\` Targets (${missingDependsTargets.length})\n`;
  if (missingDependsTargets.length === 0) {
    md += `- None ✅\n\n`;
  } else {
    md += `| Source ID | File | Missing Target ID |\n|---|---|---|\n`;
    for (const m of missingDependsTargets) {
      md += `| ${m.id} | ${m.file} | ${m.missing} |\n`;
    }
    md += `\n`;
  }

  md += `## Dependencies (Mermaid)\n\n`;
  if (edges.length === 0) {
    md += `- No dependencies found.\n`;
  } else {
    md += "```mermaid\ngraph LR\n";
    // Group nodes by type for styling (optional basic styling)
    for (const [id, s] of byId.entries()) {
      const label = `${id}(${s.title.replace(/[\(\)]/g, '')})`;
      md += `  ${id}[${label}]\n`;
    }
    for (const [a,b] of edges) {
      md += `  ${a} --> ${b}\n`;
    }
    md += "```\n";
  }

  // Write file
  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_MD, md, 'utf8');
  console.log(`Wrote ${path.relative(ROOT, OUT_MD)}`);
}

main();