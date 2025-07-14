# Spec Driven Product Design Tool

This project is a workspace for teams to collaboratively design and evolve software product specifications, use cases, tests, and architectural guidance. It enables AI-assisted development by producing structured inputs (specs) that can be used with tools like GitHub Copilot to generate and evolve implementation code.

## Product Intent

This tool supports collaborative specification design for product teams, enabling them to define and refine product requirements, use cases, and tests in a shared environment.

## Folder Structure

- `specs/`: All feature descriptions, requirements, and design documents.
- `specs/product-overview/`: Foundational product documents (intent, use cases, architecture, UX, data model)
- `specs/tests/`: Test cases described in natural language.
- `src/`: Application source code for managing specs, tests, and user flows.
- `docs/`: Documentation including Copilot quick reference.
- `.github/instructions/`: GitHub Copilot instructions for the project.
- `tools/`: Automation scripts for maintaining spec-driven workflow.
- `infra/`: Deployment and infrastructure scripts.

## Getting Started

1. Open this folder in VS Code with GitHub Copilot enabled.
2. Start with `specs/product-intent.md` and related foundational documents in `specs/product-overview/`.
3. Run `npm run update-context` to generate all Copilot context files from your specifications.
4. Use Copilot or Copilot Chat to generate or evolve code based on specs.
5. Update specs and run `npm run update-context` to keep Copilot synchronized with changes.

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

**4. Update All Context (`tools/update-all-context.js`)**

- Runs all three tools above in one command
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
```

**Via VS Code Tasks:**

- Open Command Palette (`Cmd+Shift+P`)
- Choose from: "Extract Spec Context", "Update Quick Reference", "Update Copilot Instructions"

#### Automated Context Workflow

1. **Make specification changes** in `/specs` directory
2. **Run `npm run update-context`** to update all Copilot context files
3. **GitHub Copilot automatically uses** updated context for better suggestions
4. **Implement features** following current specifications and patterns

#### Context Files Generated

- **`context-for-copilot.js`**: Raw specifications for direct context
- **`docs/copilot-quick-reference.md`**: Quick reference patterns and rules  
- **`.github/instructions/copilot-instructions.md`**: Comprehensive project instructions

This automated approach ensures GitHub Copilot always has current, comprehensive understanding of your project specifications, data models, API patterns, and architectural decisions.

## 🔄 Development Workflow Best Practices

### Spec-First Development

1. **Define or update specifications** in `/specs/` before coding
2. **Update context** with `npm run update-context`
3. **Use Copilot** to generate implementation following specs
4. **Iterate** on specs and code together

### Key Files to Keep Open

- **`context-for-copilot.js`**: Keep open for maximum Copilot context
- **`docs/copilot-quick-reference.md`**: Reference for data patterns
- **Relevant spec files**: The features you're currently implementing

### When to Update Context

- After any changes to `/specs/` directory
- Before starting new feature development  
- When onboarding new team members
- As part of your CI/CD pipeline

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
