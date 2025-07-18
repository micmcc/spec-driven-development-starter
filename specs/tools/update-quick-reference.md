# Quick Reference Updater Tool

## Tool Overview

- **Name**: Quick Reference Updater
- **Purpose**: Generate developer-friendly quick reference documentation based on current project specifications
- **Category**: Documentation

## Functionality

### Description
The Quick Reference Updater analyzes the project's database schema, API patterns, and specifications to create a concise reference guide for developers using GitHub Copilot. This reference helps developers understand data model patterns, API conventions, and prompting best practices.

### Input Sources
- `/specs/product-overview/db-schema.md` - Database schema specifications
- `/specs/product-overview/api-patterns.md` - API design patterns
- `/src/**/*.js` - Source code for pattern analysis
- Existing specifications for context

### Output Targets
- `./docs/copilot-quick-reference.md` - Quick reference markdown file

### Processing Logic
1. Parse database schema from specifications to extract data model patterns
2. Analyze API route patterns from source code and specifications
3. Generate common field patterns and conventions
4. Create Copilot prompting tips based on project structure
5. Format everything into a structured markdown reference
6. Include practical examples and code snippets

## Configuration

### Required Parameters
- None (uses sensible defaults)

### Optional Parameters
- `specsDir` - Root directory for specifications (default: `./specs`)
- `outputFile` - Output file path (default: `./docs/copilot-quick-reference.md`)
- `srcDir` - Source code directory for analysis (default: `./src`)

### Environment Dependencies
- Node.js runtime environment
- File system read/write permissions
- Access to specification and source directories

## Usage

### Command Line Interface
```bash
node tools/update-quick-reference.js
```

### NPM Script Integration
```bash
npm run update-quick-ref
```

### Programmatic API
```javascript
const QuickReferenceUpdater = require('./tools/update-quick-reference.js');
const updater = new QuickReferenceUpdater();
await updater.updateQuickReference();
```

## Dependencies

### Input Dependencies
- Database schema specifications (optional)
- API pattern specifications (optional)

### File Dependencies
- `/specs` directory structure
- `/src` directory for code analysis
- `/docs` directory for output (created if needed)

### System Dependencies
- Node.js fs module
- Node.js path module

## Output Format

### File Structure
Single markdown file with structured reference sections

### Content Format
```markdown
# Quick Reference for GitHub Copilot

## Common Data Model Patterns
[Database schema patterns and conventions]

## API Patterns
[REST API conventions and examples]

## Copilot Prompting Tips
1. Reference specific files
2. Be explicit about constraints
3. Mention enum values
4. Ask for corrections
5. Specify response format
6. Check project instructions

## Common Field Patterns
- IDs: Always use UUID, never auto-increment
- Timestamps: Use TIMESTAMP with DEFAULT now()
[Additional patterns based on schema analysis]
```

### Naming Conventions
- Output file: `copilot-quick-reference.md`
- Sections: H2 headers with descriptive names
- Code examples: Fenced code blocks with language tags

## Error Handling

### Error Conditions
1. Cannot read specification files
2. Cannot analyze source code patterns
3. Output directory is not writable
4. File parsing errors

### Error Messages
- File access errors: Console error with file path
- Write errors: Console error with output path
- Analysis errors: Warning messages with graceful degradation

### Recovery Behavior
- Missing schema: Generate generic patterns section
- Missing API specs: Skip API patterns section
- Write errors: Throw exception and exit
- Parse errors: Skip problematic files and continue

## Testing

### Test Scenarios
1. **Complete specifications**: All spec files available for analysis
2. **Partial specifications**: Some spec files missing
3. **Empty schemas**: Schema files exist but are empty
4. **Complex patterns**: Multiple data models and API endpoints
5. **Custom output path**: Non-default output location
6. **Permission issues**: Read-only directories

### Expected Outcomes
- **Success**: Complete quick reference with all available patterns
- **Partial success**: Reference generated with available information
- **Failure**: Clear error message and non-zero exit code

### Validation Methods
1. Check output file exists and is valid markdown
2. Verify all major sections are present
3. Confirm data model patterns match specifications
4. Test generated examples are syntactically correct
5. Validate prompting tips are relevant to project structure