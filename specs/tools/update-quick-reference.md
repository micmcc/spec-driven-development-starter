# Quick Reference Generator

## Metadata

- **Type**: Tool Specification
- **Priority**: Medium
- **Status**: Active
- **Dependencies**: Database schema specifications, Data model specifications

## Objective

Generate a concise, developer-friendly quick reference document that extracts key patterns, conventions, and data model information from specifications to provide immediate guidance for AI-assisted development.

## Context

Developers and AI assistants need quick access to project-specific patterns, data models, naming conventions, and common code structures. This tool automatically generates a cheat sheet that serves as an immediate reference during development without requiring deep specification diving.

## Functional Requirements

### Content Extraction
- [ ] Parse database schema specifications for table structures
- [ ] Extract data model patterns and field types
- [ ] Identify naming conventions and coding standards
- [ ] Collect API endpoint patterns and route structures
- [ ] Gather common validation rules and constraints

### Reference Generation
- [ ] Generate structured markdown quick reference document
- [ ] Organize content by development concern (data, API, UI, etc.)
- [ ] Include code examples and usage patterns
- [ ] Provide cross-references between related concepts
- [ ] Add quick navigation and table of contents

### Pattern Recognition
- [ ] Automatically identify recurring patterns in specifications
- [ ] Extract naming conventions from examples
- [ ] Detect validation patterns and business rules
- [ ] Recognize architectural patterns and principles
- [ ] Identify technology-specific implementation guidelines

### Content Organization
- [ ] Categorize information by development discipline
- [ ] Prioritize most commonly needed information
- [ ] Provide quick lookup sections for common tasks
- [ ] Include examples with explanatory context
- [ ] Cross-link related concepts and dependencies

## Non-Functional Requirements

### Usability
- [ ] Quick reference readable in under 5 minutes
- [ ] Information organized for rapid lookup during development
- [ ] Examples immediately applicable to current development tasks
- [ ] Clear formatting with appropriate visual hierarchy

### Accuracy
- [ ] Generated content reflects current specifications exactly
- [ ] No outdated or conflicting information
- [ ] Examples are syntactically correct and runnable
- [ ] Cross-references are valid and current

### Maintainability
- [ ] Automatic updates when specifications change
- [ ] Consistent formatting and structure across generations
- [ ] Clear source attribution for all extracted information
- [ ] Version tracking for reference document changes

## Technical Interface

### Input Parameters
```
options: object = {}
  - specsDirectory: string = "./specs"
  - outputPath: string = "./docs/copilot-quick-reference.md"
  - includeExamples: boolean = true
  - includeNavigation: boolean = true
  - verboseLogging: boolean = false
  - schemaFile: string = "specs/product-overview/db-schema.md"
  - dataModelFile: string = "specs/product-overview/data-model.md"
```

### Source Specifications
```
Primary Sources:
- Database schema (table structures, relationships)
- Data model specifications (field types, validation)
- API route specifications (endpoint patterns)
- Architecture guidelines (patterns, conventions)

Secondary Sources:
- Feature specifications (domain patterns)
- Test specifications (validation examples)
- Technical requirements (constraints, standards)
```

### Output Format
```markdown
# Quick Reference

## Data Models
### [Entity Name]
- field: type (constraints)
- relationships: related_entity[]

## API Patterns
### Authentication
- Headers: Authorization: Bearer {token}
- Response: { user: {...}, token: string }

## Validation Rules
### Email Validation
- Pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Required: true

## Common Patterns
### Error Handling
- Format: { error: string, code: string, details?: object }
```

### Return Values
```
Success: {
  status: "success",
  sectionsGenerated: string[],
  patternCount: number,
  outputSize: number
}

Error: {
  status: "error",
  message: string,
  missingSpecs: string[],
  partialContent: boolean
}
```

### CLI Interface
```bash
update-quick-reference [options]
  --specs-dir <path>     Specifications directory (default: ./specs)
  --output <path>        Output file path (default: ./docs/copilot-quick-reference.md)
  --include-examples     Include code examples (default: true)
  --include-nav          Include navigation (default: true)
  --schema-file <path>   Database schema file path
  --verbose             Enable detailed logging
  --help                Show usage information
```

## Algorithm Specification

### Discovery Phase
1. Locate and validate specification source files
2. Parse database schema for entity definitions
3. Extract data model patterns and field types
4. Scan API specifications for endpoint patterns
5. Identify architectural patterns and conventions

### Analysis Phase
1. Analyze entity relationships and dependencies
2. Extract field validation rules and constraints
3. Identify naming patterns and conventions
4. Collect common response formats and structures
5. Categorize patterns by development concern

### Generation Phase
1. Organize content into logical reference sections
2. Generate navigation and table of contents
3. Format code examples with appropriate syntax highlighting
4. Add cross-references between related concepts
5. Write formatted output to target file

### Validation Phase
1. Verify generated content accuracy against sources
2. Check internal consistency and cross-references
3. Validate markdown formatting and syntax
4. Ensure all critical patterns are included
5. Confirm readability and usability standards

## Content Structure Specification

### Data Models Section
```
For each entity:
- Entity name and description
- Field definitions with types and constraints
- Relationship mappings
- Common query patterns
- Validation rules
```

### API Patterns Section
```
For each pattern category:
- Authentication and authorization patterns
- Request/response formats
- Error handling conventions
- Status code usage
- Header requirements
```

### Validation Rules Section
```
For each validation type:
- Field validation patterns
- Business rule constraints
- Error message formats
- Client-side validation examples
- Server-side validation examples
```

### Common Patterns Section
```
For each development pattern:
- Code structure examples
- Naming conventions
- Error handling approaches
- Response formatting
- State management patterns
```

## Validation and Testing

### Test Categories
- [ ] Unit tests for specification parsing logic
- [ ] Content accuracy tests against known specifications
- [ ] Format validation tests for generated markdown
- [ ] Integration tests for complete generation workflow
- [ ] Usability tests for reference document effectiveness

### Test Data Requirements
- [ ] Sample database schemas with various entity types
- [ ] API specifications with different pattern types
- [ ] Data model specifications with validation rules
- [ ] Architecture documents with coding conventions

### Success Criteria
- [ ] All specified patterns extracted correctly
- [ ] Generated reference is immediately useful for development
- [ ] Content accurately reflects current specifications
- [ ] Format is consistent and well-organized
- [ ] Examples are syntactically correct and complete

## Technology Portability

### Core Algorithm (Language Agnostic)
1. **Specification Parsing**: Structured text analysis and pattern extraction
2. **Content Organization**: Hierarchical categorization and cross-referencing
3. **Template Generation**: Structured document generation with formatting
4. **Pattern Recognition**: Regular expression and heuristic-based pattern extraction

### Platform Considerations
- [ ] Markdown formatting compatibility across renderers
- [ ] File encoding handling (UTF-8 primary)
- [ ] Path handling for cross-platform compatibility
- [ ] Memory management for large specification sets

### Language Implementation Notes
- **Node.js**: Use markdown parsing libraries and template engines
- **Python**: Use markdown and regex libraries with template processing
- **Go**: Use text/template and regexp packages
- **Rust**: Use pulldown-cmark and regex crates
- **Java**: Use CommonMark and template engines

## Integration Requirements

### Documentation Workflow
- [ ] Integration with documentation generation pipelines
- [ ] Compatibility with static site generators
- [ ] Version control friendly output format
- [ ] Integration with IDE documentation viewers

### Development Environment
- [ ] VS Code integration for quick reference viewing
- [ ] Command palette access for reference updates
- [ ] Integration with development server hot reload
- [ ] Keyboard shortcuts for quick reference access

### Quality Assurance
- [ ] Automated testing of generated content accuracy
- [ ] Link validation for cross-references
- [ ] Spell checking and grammar validation
- [ ] Accessibility compliance for generated documentation