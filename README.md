# Spec Driven Product Design Tool

This project is a workspace for teams to collaboratively design and evolve software product specifications, use cases, tests, and architectural guidance. It enables AI-assisted development by producing structured inputs (specs) that can be used with tools like GitHub Copilot to generate and evolve implementation code.

## Product Intent

This tool supports collaborative specification design for product teams, enabling them to define and refine product requirements, use cases, and tests in a shared environment.

## Folder Structure

- `specs/`: All feature descriptions, requirements, and design documents.
- `specs/product-overview/`: Foundational product documents (intent, use cases, architecture, UX, data model)
- `specs/tests/`: Test cases described in natural language.
- `src/`: Application source code for managing specs, tests, and user flows.
- `infra/`: Deployment and infrastructure scripts.

## Getting Started

1. Open this folder in VS Code with GitHub Copilot enabled.
2. Start with `specs/product-intent.md` and related foundational documents in `specs/product-overview/`.
3. Use Copilot or Copilot Chat to generate or evolve code based on specs.
4. Update specs and regenerate tests or supporting components accordingly.

## 🧠 Spec-Driven Workflow

Start with foundational product intent and use cases in `specs/product-overview/`, then add or evolve feature and test specs in `specs/features/` and `specs/tests/`. Use these to drive AI-assisted code generation and refinement using Copilot.

## Sample Prompt

Define the specification for collaborative spec editing, including roles, permissions, and version control behavior, to guide implementation and testing.


## 💬 Prompt Snippets for Copilot Development

While GenAI may assist in exploring and defining specifications outside of VS Code, this project is designed to pair those specs with GitHub Copilot to generate, refine, and maintain implementation code.

These prompt snippets can be used in Copilot Chat or inserted as comments to guide Copilot:

### Generate Component from Spec
```
gencomp → Generate a [React] component for the feature described in `specs/features/[feature-name].md`. Implement [specific functionality].
```

### Refactor Based on Updated Spec
```
refspec → Refactor `src/[file].js` based on changes in `specs/features/[feature-name].md`. The new requirement is [description].
```

### Generate Tests from Spec
```
gentest → Generate test cases for `src/[file].js` based on the scenarios described in `specs/tests/[test-file].md`.
```

### Align UI with UX Flow
```
alignux → Update the UI in `src/[component].js` to follow the flow in `specs/features/[feature-name].md`, focusing on [UX behavior].
```

### Explain Code Based on Spec
```
explain → Explain how the code in `src/[file].js` implements the requirements in `specs/features/[feature-name].md`.
```

### Generate Deployment Script
```
gendeploy → Generate a deployment script based on `specs/deployment.md`.
```

These snippets accelerate development and keep implementation in sync with evolving specifications.
