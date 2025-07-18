# Copilot Instructions Updater Tool

## Tool Overview

- **Name**: Copilot Instructions Updater
- **Purpose**: Generate comprehensive GitHub Copilot instructions based on current project structure and specifications
- **Category**: Documentation

## Functionality

### Description
The Copilot Instructions Updater creates comprehensive instructions for GitHub Copilot that include project context, development workflow, architectural decisions, and coding standards. These instructions help Copilot understand the project's specific requirements and generate more appropriate code suggestions.

### Input Sources
- `/specs/product-intent.md` - Core product purpose and values
- `/specs/product-overview/` - Architecture, database schema, API patterns
- `/specs/features/` - Feature specifications
- `/src/` - Source code structure analysis
- Project root files (package.json, etc.)

### Output Targets
- `./.github/instructions/copilot-instructions.md` - Comprehensive Copilot instructions

### Processing Logic
1. Analyze current specifications to understand project scope
2. Examine project structure to identify patterns and conventions
3. Parse database schema for data model guidelines
4. Analyze API routes and patterns from source code
5. Generate workflow instructions based on spec-driven approach
6. Create coding standards and best practices guide
7. Format everything into structured markdown instructions

## Configuration

### Required Parameters
- None (uses sensible defaults)

### Optional Parameters
- `specsDir` - Root directory for specifications (default: `./specs`)
- `srcDir` - Source code directory for analysis (default: `./src`)
- `outputFile` - Output file path (default: `./.github/instructions/copilot-instructions.md`)

### Environment Dependencies
- Node.js runtime environment
- File system read/write permissions
- Access to specification and source directories

## Usage

### Command Line Interface
```bash
node tools/update-copilot-instructions.js
```

### NPM Script Integration
```bash
npm run update-copilot-instructions
```

### Programmatic API
```javascript
const CopilotInstructionsUpdater = require('./tools/update-copilot-instructions.js');
const updater = new CopilotInstructionsUpdater();
await updater.updateInstructions();
```

## Dependencies

### Input Dependencies
- Product specifications (for project context)
- Architecture documentation (for technical guidelines)

### File Dependencies
- `/specs` directory structure
- `/src` directory for code analysis
- `./.github/instructions/` directory (created if needed)

### System Dependencies
- Node.js fs module
- Node.js path module

## Output Format

### File Structure
Single markdown file with comprehensive Copilot instructions

### Content Format
```markdown
# GitHub Copilot Instructions for Spec Driven Development

## Project Context
[Project purpose and core values]

## Development Workflow
1. Always reference /specs/product-intent.md
2. Check /specs/product-overview/ for architecture
3. Implement features based on /specs/features/

## Technical Guidelines
### Database Patterns
[Schema conventions and patterns]

### API Conventions
[REST API patterns and standards]

### Code Style
[Coding standards and best practices]

## File Structure
[Project organization guidelines]

## Testing Approach
[Testing patterns and conventions]

## Common Tasks
[Frequent development tasks and patterns]
```

### Naming Conventions
- Output file: `copilot-instructions.md`
- Directory: `.github/instructions/`
- Sections: H2/H3 headers with clear hierarchy

## Error Handling

### Error Conditions
1. Cannot read specification files
2. Cannot analyze project structure
3. Output directory creation fails
4. File write permissions denied

### Error Messages
- Directory creation: Console error with path details
- File access errors: Console error with specific file
- Write errors: Console error with output location
- Analysis errors: Warning with graceful degradation

### Recovery Behavior
- Missing specs: Generate based on available information
- Missing source: Skip code analysis sections
- Directory issues: Create required directories
- Write errors: Throw exception and exit

## Testing

### Test Scenarios
1. **Full project**: Complete specifications and source code
2. **Minimal project**: Basic specs only
3. **No specifications**: Generate from source code analysis
4. **New project**: No existing .github directory
5. **Custom paths**: Non-default input and output locations
6. **Permission restrictions**: Various file system limitations

### Expected Outcomes
- **Success**: Complete instructions file with all relevant sections
- **Partial success**: Instructions generated with available information
- **Failure**: Clear error message and non-zero exit code

### Validation Methods
1. Check output file exists and is valid markdown
2. Verify all major instruction sections are present
3. Confirm project-specific guidelines are included
4. Test that technical patterns match actual codebase
5. Validate workflow instructions are actionable
6. Ensure instructions are compatible with GitHub Copilot