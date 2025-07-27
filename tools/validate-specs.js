#!/usr/bin/env node
/**
 * validate-specs.js
 * Validates YAML frontmatter against JSON Schema and emits a spec-index.json
 *
 * Usage:
 *   node tools/validate-specs.js
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ROOT = process.cwd();
const DEFAULT_GLOBS = process.env.FRONTMATTER_PATHS || 'specs/**/*.md,planning/**/*.md,README.md,TODO.md';
const schemaPath = path.resolve(ROOT, 'schemas/spec-frontmatter.schema.json');
if (!fs.existsSync(schemaPath)) {
  console.error(`Schema not found at ${schemaPath}`);
  process.exit(1);
}
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

function run() {
  const patterns = DEFAULT_GLOBS.split(',').map(s => s.trim()).filter(Boolean);
  const files = patterns.flatMap(pat => glob.sync(pat, { nodir: true }));

  if (files.length === 0) {
    console.log('No files matched for validation.');
    process.exit(0);
  }

  const index = [];
  let errorCount = 0;

  for (const file of files) {
    const abs = path.resolve(ROOT, file);
    const src = fs.readFileSync(abs, 'utf8');
    const fm = matter(src);
    const data = fm.data || {};

    const ok = validate(data);
    if (!ok) {
      errorCount++;
      console.error(`\n✖ ${file}`);
      for (const err of validate.errors) {
        console.error(`  - ${err.instancePath || '(root)'} ${err.message}`);
      }
    } else {
      index.push({
        file: file.replace(/\\/g, '/'),
        id: data.id,
        title: data.title,
        type: data.type,
        status: data.status,
        domain: data.domain || 'general',
        owner: data.owner || 'unassigned',
        last_reviewed: data.last_reviewed || null,
        depends_on: data.depends_on || [],
        implements: data.implements || [],
        covers_tests: data.covers_tests || [],
        code_refs: data.code_refs || []
      });
    }
  }

  // Write index for downstream dashboards
  const outDir = path.resolve(ROOT, 'out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'spec-index.json'), JSON.stringify(index, null, 2), 'utf8');
  console.log(`\nWrote out/spec-index.json with ${index.length} entries.`);

  if (errorCount > 0) {
    console.error(`\nValidation failed with ${errorCount} file(s) containing errors.`);
    process.exit(1);
  } else {
    console.log('\nValidation passed.');
  }
}

run();