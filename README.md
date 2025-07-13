# Spec-Driven Development Starter with VS Code + Copilot

This template demonstrates how to structure your project so that GitHub Copilot can generate and evolve your code based on evolving specifications.

## Folder Structure

- `specs/`: All feature descriptions, requirements, and design documents.
- `src/`: Application source code.
- `infra/`: Deployment and infrastructure scripts.
- `specs/tests/`: Test cases described in natural language.

## Getting Started

1. Open this folder in VS Code with GitHub Copilot enabled.
2. Start with `specs/product-intent.md` and feature files.
3. Use Copilot or Copilot Chat to generate or evolve code:
   - e.g., "Implement the login component based on specs/features/login-flow.md"
4. Update test cases, ask Copilot to regenerate or extend tests accordingly.


## 🧠 Spec-Driven Workflow

This project uses a **specification-first** development model. Instead of coding from scratch, features, tests, and architecture are described in `.md` files in the `specs/` folder, and GitHub Copilot is used to generate and evolve code from those specifications.

**Workflow Steps:**

1. Create or update specs in `specs/features/` or `specs/tests/`
2. Use GitHub Copilot Chat in VS Code with prompts like:
   - "Generate the login component from `specs/features/login-flow.md`"
   - "Refactor the dashboard to match the new UX in `specs/features/dashboard.md`"
3. Review and refine Copilot's code generation
4. Update specs and repeat
5. Use deployment specs to generate infrastructure scripts

## 💬 Prompt Templates (Use in Copilot Chat)

### Generate Component from Spec
```
gencomp → Generate a [React] component for the feature described in `specs/features/[feature-name].md`. Implement [specific functionality].
```

### Refactor Code to Align with Updated Spec
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
