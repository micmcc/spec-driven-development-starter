---
id: DOC-8ec9a00
title: Spec Driven Product Design Tool
type: doc
status: draft
domain: general
owner: unassigned
last_reviewed: '2025-07-27'
depends_on: []
implements: []
covers_tests: []
code_refs: []
edit_url: 'https://github.com/micmcc/spec-driven-development-starter/edit/main/README.md'
---
# Spec Driven Product Design Tool

This project is a **specification-driven development tool** designed to help product teams collaboratively define, refine, and implement product requirements, use cases, and tests. It leverages GitHub Copilot to generate code based on detailed specifications, ensuring alignment between product intent and implementation.

## Product Intent

This tool supports collaborative specification design for product teams, enabling them to define and refine product requirements, use cases, and tests in a shared environment.

## Folder Structure

- `specs/`: All feature descriptions, requirements, and design documents.
- `specs/product-overview/`: Foundational product documents (intent, use cases, architecture, UX, data model)
- `specs/tests/`: Test cases described in natural language.
- `planning/`: Centralized TODO management with area-specific planning files.
- `src/`: Application source code for managing specs, tests, and user flows.
- `docs/`: Documentation including Copilot quick reference.
- `.github/instructions/`: GitHub Copilot instructions for the project.
- `tools/`: Automation scripts for maintaining spec-driven workflow.
- `infra/`: Deployment and infrastructure scripts.

## Planning & TODO Management

This project uses a centralized planning system organized in the `/planning` folder:

- **`TODO.md`**: Dashboard with high-level overview and status
- **`planning/TODO.feature.md`**: Feature implementation tasks
- **`planning/TODO.specs.md`**: Specification completeness tracking
- **`planning/TODO.tests.md`**: Test coverage and CI/CD testing
- **`planning/TODO.techdebt.md`**: Code quality and refactoring tasks
- **`planning/TODO.devops.md`**: Infrastructure and deployment tasks
- **`planning/TODO.context.md`**: Context management and Copilot integration

Use `npm run update-todos` to automatically refresh all planning files from the current codebase and specifications.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ (local or remote)
- VS Code with GitHub Copilot extension

### Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your database connection details
   ```

3. **Set up the database:**

   ```bash
   npm run db:setup
   ```

   This creates all tables and populates them with realistic test data.

4. **Start development:**
   - Open this folder in VS Code with GitHub Copilot enabled
   - Start with `specs/product-intent.md` and related foundational documents
   - Run `npm run update-context` to generate all Copilot context files
   - Use Copilot or Copilot Chat to generate code based on specs

### Test Users

After running `npm run db:setup`, you can use these test accounts:

- **Alice** (Owner): `alice@example.com` / `password123`
- **Bob** (Admin): `bob@example.com` / `password123`  
- **Carol** (Contributor): `carol@example.com` / `password123`
- **David** (Viewer): `david@example.com` / `password123`

## 🧠 Spec-Driven Workflow

Start with foundational product intent and use cases in `specs/product-overview/`, then add or evolve feature and test specs in `specs/features/` and `specs/tests/`. Use these to drive AI-assisted code generation and refinement using Copilot.

### 🛠️ Context Management Tools

This project includes a comprehensive suite of tools that automatically keep GitHub Copilot synchronized with your specifications:

#### Available Tools

**1. Spec Extractor (`tools/spec-extractor.js`)**

- Aggregates all specifications into `context-for-copilot.js`
- Provides raw specification content for direct context injection

**2. Quick Reference Updater (`tools/update-quick-reference.js`)**

- Generates `docs/copilot-quick-reference.md` with data model patterns
- Provides a developer cheat sheet for common conventions

**3. Copilot Instructions Updater (`tools/update-copilot-instructions.js`)**

- Updates `.github/instructions/copilot-instructions.md` with comprehensive project guidance
- Automatically discovers current specifications and project structure

**4. TODO Updater (`tools/update-todos.js`)**

- Automatically scans specifications and codebase for tasks and TODOs
- Generates organized task lists in `TODO.md` with priority levels
- Tracks feature implementation status and missing specifications

**5. Update All Context (`tools/update-all-context.js`)**

- Runs all four tools above in one command
- Ensures complete Copilot context synchronization

#### Quick Usage

**Update all context files at once:**

```bash
npm run update-context
```

**Individual tools:**

```bash
npm run extract-specs              # Generate context-for-copilot.js
npm run update-quick-ref           # Update quick reference
npm run update-copilot-instructions # Update comprehensive instructions
npm run update-todos               # Generate TODO list from specifications
```

**Via VS Code Tasks:**

- Open Command Palette (`Cmd+Shift+P`)
- Choose from: "Extract Spec Context", "Update Quick Reference", "Update Copilot Instructions", "Update TODOs"

#### Automated Context Workflow

1. **Make specification changes** in `/specs` directory
2. **Run `npm run update-context`** to update all Copilot context files
3. **GitHub Copilot automatically uses** updated context for better suggestions
4. **Implement features** following current specifications and patterns

#### Context Files Generated

- **`context-for-copilot.js`**: Raw specifications for direct context
- **`docs/copilot-quick-reference.md`**: Quick reference patterns and rules  
- **`.github/instructions/copilot-instructions.md`**: Comprehensive project instructions
- **`TODO.md`**: Automatically generated task lists from specifications and codebase
- **`TODO.md`**: Organized task lists with priority levels

This automated approach ensures GitHub Copilot always has current, comprehensive understanding of your project specifications, data models, API patterns, and architectural decisions.

## 📋 Automated TODO Management

This project includes intelligent TODO management that automatically scans your specifications and codebase to generate organized task lists:

### TODO Generation Features

- **Specification Analysis**: Scans `/specs/` for missing or incomplete specifications
- **Feature Status Tracking**: Monitors implementation status of defined features
- **Technical Debt Detection**: Finds TODO/FIXME comments in source code
- **Test Coverage Analysis**: Identifies missing test implementations
- **Priority Classification**: Organizes tasks by High/Medium/Low priority

### Using TODO Management

**Generate updated TODO list:**

```bash
npm run update-todos
```

**Include in full context update:**

```bash
npm run update-context  # Includes TODO generation
```

### TODO Categories

- **🎯 Current Sprint Goals**: High and medium priority tasks
- **📋 Feature Implementation Status**: In-progress and planned features
- **🔧 Technical Debt & Code TODOs**: Source code improvements needed
- **🧪 Test Implementation Status**: Missing test coverage
- **📖 Specification Status**: Incomplete or missing specifications

The TODO system automatically discovers your project structure and provides actionable task lists to guide development priorities.

## 🏗️ Technical Architecture Space

This project includes a **Technical Architecture Space** - a comprehensive mapping system that organizes all architecture-related files, specifications, and resources. This space is defined in `.copilot/spaces-mapping.yaml` and helps developers quickly find relevant files for architectural work.

### Architecture Space Contents

The Technical Architecture Space includes:

- **Core Specifications**: 
  - `specs/product-overview/architecture.md` - Main system architecture documentation
  - `specs/technical/` - Technical implementation specifications
- **Infrastructure Files**: 
  - `infra/` - Infrastructure configuration and deployment
  - `database/` - Database setup and schema management
- **Configuration**: 
  - Environment setup, workspace configuration, and deployment settings

### Using the Architecture Space

**Finding Architecture Files:**
```bash
# View the complete architecture space mapping
cat .copilot/spaces-mapping.yaml | grep -A 50 "technical_architecture:"
```

**Common Architecture Tasks:**
- **System Design**: Start with `specs/product-overview/architecture.md`
- **Technical Specs**: Add new files to `specs/technical/`
- **Infrastructure Changes**: Update files in `infra/` and reference in spaces mapping
- **Database Changes**: Modify `database/` files and update architectural documentation

### Maintaining the Architecture Space

When making architectural changes:

1. **Update specifications** in the relevant technical spec files
2. **Update the spaces mapping** in `.copilot/spaces-mapping.yaml` if adding new files
3. **Run context updates** with `npm run update-context`
4. **Document architectural decisions** in the appropriate specification files

The spaces mapping automatically tracks dependencies and relationships between architectural components, ensuring Copilot has comprehensive context for architecture-related development.

## 🔄 Development Workflow Best Practices

### Spec-First Development

1. **Define or update specifications** in `/specs/` before coding
2. **Update context** with `npm run update-context`
3. **Use Copilot** to generate implementation following specs
4. **Iterate** on specs and code together

### Key Files to Keep Open

- **`context-for-copilot.js`**: Keep open for maximum Copilot context
- **`docs/copilot-quick-reference.md`**: Reference for data patterns
- **`.copilot/spaces-mapping.yaml`**: Architecture space and file relationships
- **Relevant spec files**: The features you're currently implementing

### When to Update Context

- After any changes to `/specs/` directory
- Before starting new feature development  
- When onboarding new team members
- As part of your CI/CD pipeline
- After updating the spaces mapping configuration

## Sample Prompt

Define the specification for collaborative spec editing, including roles, permissions, and version control behavior, to guide implementation and testing.

## 💬 Prompt Snippets for Copilot Development

While GenAI may assist in exploring and defining specifications outside of VS Code, this project is designed to pair those specs with GitHub Copilot to generate, refine, and maintain implementation code.

These prompt snippets can be used in Copilot Chat or inserted as comments to guide Copilot:

### Generate Component from Spec

```text
gencomp → Generate a [React] component for the feature described in `specs/features/[feature-name].md`. Implement [specific functionality].
```

### Refactor Based on Updated Spec

```text
refspec → Refactor `src/[file].js` based on changes in `specs/features/[feature-name].md`. The new requirement is [description].
```

### Generate Tests from Spec

```text
gentest → Generate test cases for `src/[file].js` based on the scenarios described in `specs/tests/[test-file].md`.
```

### Align UI with UX Flow

```text
alignux → Update the UI in `src/[component].js` to follow the flow in `specs/features/[feature-name].md`, focusing on [UX behavior].
```

### Explain Code Based on Spec

```text
explain → Explain how the code in `src/[file].js` implements the requirements in `specs/features/[feature-name].md`.
```

### Generate Deployment Script

```text
gendeploy → Generate a deployment script based on `specs/deployment.md`.
```

These snippets accelerate development and keep implementation in sync with evolving specifications.
