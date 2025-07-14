# Development Tools

This directory contains automation tools for maintaining the spec-driven development workflow.

## Available Tools

### spec-extractor.js

Generates context summaries from specification files for GitHub Copilot.

**Usage:**

```bash
node tools/spec-extractor.js
# or
npm run extract-specs
```

### update-quick-reference.js

Automatically updates `docs/copilot-quick-reference.md` based on current specifications.

**Usage:**

```bash
node tools/update-quick-reference.js
# or
npm run update-quick-ref
```

**When to run:**

- After updating `/specs/product-overview/db-schema.md`
- After modifying data models or API patterns
- When adding new enum values or field constraints
- As part of your development workflow when specs change

### VS Code Tasks

Both tools are available as VS Code tasks:

- **Command Palette** → "Tasks: Run Task" → "Update Quick Reference"
- **Command Palette** → "Tasks: Run Task" → "Extract Spec Context"

## Integration with Workflow

The quick reference updater should be run whenever you modify specifications that affect:

- Database schema (`db-schema.md`)
- Data model patterns
- API response formats
- Field naming conventions
- Enum values

Consider adding this to your git hooks or CI/CD pipeline to ensure the quick reference stays in sync with your specifications.
