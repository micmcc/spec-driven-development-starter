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

### update-copilot-instructions.js

Automatically updates `.github/instructions/copilot-instructions.md` based on current specifications and project structure.

**Usage:**

```bash
node tools/update-copilot-instructions.js
# or
npm run update-copilot-instructions
```

### update-spaces-mapping.js

**🆕 NEW FEATURE**: Automated Spaces Mapping Agent that automatically detects changes to spec, context, and TODO files within a Space and updates `.copilot/spaces-mapping.yaml` accordingly.

**Usage:**

```bash
node tools/update-spaces-mapping.js
# or
npm run update-spaces-mapping
```

**What it does:**
- Scans the file system for specifications, tests, source code, planning files, and infrastructure files
- Automatically categorizes files into appropriate spaces based on naming patterns and directory structure  
- Updates the spaces mapping configuration with newly discovered files
- Maintains metadata like file types and descriptions

**File Detection Rules:**
- **User Management Space**: Files with "auth", "user", "login", "registration", "profile" in path
- **Collaborative Spec Editing Space**: Files with "project", "collaboration", "collaborative", "editing", "spec" in path  
- **Test Coverage & CI/CD Space**: All test files, plus files with "test", "coverage", "jest", "ci", "cd", "devops" in path
- **Technical Architecture Space**: Files with "architecture", "technical", "adr", "infra", "db.js", "database" in path

### update-all-context.js

Updates all Copilot context files in one command: specification context, quick reference, copilot instructions, TODOs, and **automated spaces mapping**.

**Usage:**

```bash
node tools/update-all-context.js
# or
npm run update-context
```

**Files updated:**

- `context-for-copilot.js` - Specification summaries for context
- `docs/copilot-quick-reference.md` - Quick reference cheat sheet  
- `.github/instructions/copilot-instructions.md` - Comprehensive instructions
- `TODO.md` - Generated TODO list from specifications and codebase
- `.copilot/spaces-mapping.yaml` - **🆕 Automated spaces mapping updates**

**When to run:**

- After updating `/specs/product-overview/db-schema.md`
- After modifying data models or API patterns
- When adding new enum values or field constraints
- **🆕 When adding new specifications, tests, or source files**
- **🆕 When creating new planning documents or TODOs**
- **🆕 When making architectural changes affecting multiple spaces**
- As part of your development workflow when specs change

### VS Code Tasks

All tools are available as VS Code tasks:

- **Command Palette** → "Tasks: Run Task" → "Update Quick Reference"
- **Command Palette** → "Tasks: Run Task" → "Update Copilot Instructions"
- **Command Palette** → "Tasks: Run Task" → "Extract Spec Context"

## Integration with Workflow

### When to Run Updates

Run `npm run update-context` (or individual tools) whenever you modify:

- **Specifications**: Any files in `/specs/` directory
- **Database schema**: `specs/product-overview/db-schema.md`
- **Data model patterns**: Field types, naming conventions, constraints
- **API endpoints**: Adding, modifying, or removing routes
- **Project structure**: Changes to `/src/` organization
- **Feature specifications**: New features or modifications
- **Test specifications**: New test cases or patterns

### Recommended Workflow

1. **After spec changes**: Run `npm run update-context` to update all context files
2. **Before major development**: Ensure context is current for best Copilot assistance
3. **In CI/CD**: Consider adding context updates to your pipeline
4. **Git hooks**: Add to pre-commit hooks to ensure context stays synchronized

### Context Files Purpose

- **`context-for-copilot.js`**: Raw specification content for direct context injection
- **`docs/copilot-quick-reference.md`**: Developer cheat sheet for common patterns
- **`.github/instructions/copilot-instructions.md`**: Comprehensive project guidance for Copilot

This ensures GitHub Copilot always has the most current and comprehensive understanding of your project specifications and structure.
