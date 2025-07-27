---
id: FEAT-bf489e4
title: Copilot Instructions Generator
type: feature
status: draft
domain: tools
owner: unassigned
last_reviewed: '2025-07-27'
depends_on: []
implements: []
covers_tests: []
code_refs: []
edit_url: >-
  https://github.com/micmcc/spec-driven-development-starter/edit/main/specs/tools/update-copilot-instructions.md
---
# Copilot Instructions Generator

## Metadata

- **Type**: Tool Specification
- **Priority**: High
- **Status**: Active
- **Dependencies**: All specifications, Project structure analysis

## Objective

Generate comprehensive GitHub Copilot instructions that provide complete project context, coding standards, architectural patterns, and development guidelines to ensure AI-generated code aligns with project specifications and quality standards.

## Context

GitHub Copilot and other AI coding assistants work most effectively when provided with detailed, structured instructions about project context, coding patterns, architectural decisions, and quality requirements. This tool automatically generates comprehensive instructions that serve as a complete project guide for AI-assisted development.

## Functional Requirements

### Project Analysis
- [ ] Analyze complete project structure and organization
- [ ] Extract architectural patterns from specifications
- [ ] Identify coding standards and conventions
- [ ] Discover technology stack and dependencies
- [ ] Map feature specifications to implementation patterns

### Instruction Generation
- [ ] Generate structured Copilot instruction document
- [ ] Include project overview and context
- [ ] Provide detailed coding guidelines and patterns
- [ ] Add architectural constraints and decisions
- [ ] Include quality standards and testing requirements

### Content Synthesis
- [ ] Synthesize information from multiple specification sources
- [ ] Resolve conflicts between different specifications
- [ ] Prioritize guidance based on project importance
- [ ] Maintain consistency across instruction sections
- [ ] Update instructions based on specification evolution

### Quality Assurance
- [ ] Validate instruction completeness and accuracy
- [ ] Ensure instructions are actionable and specific
- [ ] Check for contradictions or unclear guidance
- [ ] Verify examples are current and correct
- [ ] Maintain appropriate detail level for AI consumption

## Non-Functional Requirements

### Comprehensiveness
- [ ] Cover all major development aspects (architecture, patterns, testing, etc.)
- [ ] Include sufficient detail for autonomous AI development
- [ ] Address edge cases and special considerations
- [ ] Provide guidance for common development scenarios

### Accuracy
- [ ] Reflect current project state and specifications exactly
- [ ] Maintain consistency with actual codebase patterns
- [ ] Include up-to-date technology and dependency information
- [ ] Ensure examples are syntactically correct and current

### Usability
- [ ] Instructions organized for easy AI consumption
- [ ] Clear sectioning and hierarchical organization
- [ ] Actionable guidance with specific examples
- [ ] Appropriate verbosity for AI processing efficiency

## Technical Interface

### Input Parameters
```
options: object = {}
  - specsDirectory: string = "./specs"
  - sourceDirectory: string = "./src"
  - outputPath: string = "./.github/instructions/copilot-instructions.md"
  - includeExamples: boolean = true
  - includeArchitecture: boolean = true
  - includePatterns: boolean = true
  - verboseLogging: boolean = false
  - templatePath: string = null
```

### Source Analysis
```
Specification Sources:
- Product intent and overview
- Architecture specifications
- Feature specifications
- Technical requirements
- Database schema
- API specifications

Code Sources:
- Source code structure analysis
- Existing patterns and conventions
- Dependency and technology analysis
- Test patterns and standards
```

### Output Structure
```markdown
# GitHub Copilot Instructions

## Project Overview
[Context, purpose, and key objectives]

## Architecture & Technology Stack
[Technical architecture, frameworks, patterns]

## Development Standards
[Coding conventions, patterns, quality standards]

## Data Models & Database
[Schema, relationships, validation patterns]

## API Design Patterns
[Endpoint patterns, authentication, error handling]

## Feature Implementation Guidelines
[Specific guidance for feature development]

## Testing Requirements
[Test patterns, coverage requirements, quality gates]

## Error Handling & Logging
[Error patterns, logging standards, monitoring]

## Security Considerations
[Security patterns, authentication, authorization]

## Performance Requirements
[Performance patterns, optimization guidelines]
```

### Return Values
```
Success: {
  status: "success",
  sectionsGenerated: string[],
  specificationsCovered: string[],
  instructionLength: number,
  generationTime: number
}

Error: {
  status: "error",
  message: string,
  missingSpecs: string[],
  analysisErrors: string[]
}
```

### CLI Interface
```bash
update-copilot-instructions [options]
  --specs-dir <path>     Specifications directory (default: ./specs)
  --source-dir <path>    Source code directory (default: ./src)
  --output <path>        Output file path (default: ./.github/instructions/copilot-instructions.md)
  --include-examples     Include code examples (default: true)
  --include-architecture Include architecture section (default: true)
  --include-patterns     Include pattern examples (default: true)
  --template <path>      Custom template file
  --verbose             Enable detailed logging
  --help                Show usage information
```

## Algorithm Specification

### Discovery and Analysis Phase
1. Scan and parse all specification documents
2. Analyze project source code structure and patterns
3. Extract technology stack and dependency information
4. Identify architectural patterns and constraints
5. Collect coding standards and conventions from existing code

### Content Synthesis Phase
1. Synthesize project overview from specifications
2. Extract and organize architectural guidance
3. Compile coding standards and pattern examples
4. Generate data model and API guidance
5. Create feature development guidelines

### Instruction Generation Phase
1. Organize content according to instruction template
2. Generate specific, actionable guidance for each section
3. Include relevant code examples and patterns
4. Add context and rationale for architectural decisions
5. Format for optimal AI assistant consumption

### Quality Validation Phase
1. Validate instruction completeness against specifications
2. Check for internal consistency and contradictions
3. Verify code examples are syntactically correct
4. Ensure guidance is specific and actionable
5. Confirm appropriate detail level for AI consumption

## Content Generation Specification

### Project Overview Section
- [ ] Product purpose and business context
- [ ] Key user scenarios and use cases
- [ ] Technical scope and boundaries
- [ ] Development philosophy and principles

### Architecture Section
- [ ] High-level architecture patterns
- [ ] Technology stack and framework choices
- [ ] Service boundaries and interfaces
- [ ] Data flow and processing patterns
- [ ] Deployment and infrastructure considerations

### Development Standards Section
- [ ] Code organization and structure patterns
- [ ] Naming conventions and style guidelines
- [ ] Module and component design patterns
- [ ] Documentation and commenting standards
- [ ] Version control and branching guidelines

### Data and API Sections
- [ ] Database schema and relationship patterns
- [ ] Data validation and business rule implementation
- [ ] API endpoint design and RESTful patterns
- [ ] Authentication and authorization implementation
- [ ] Error handling and response formatting

### Testing and Quality Sections
- [ ] Test organization and naming patterns
- [ ] Unit test and integration test patterns
- [ ] Quality gates and acceptance criteria
- [ ] Performance testing requirements
- [ ] Security testing and validation

## Validation and Testing

### Test Categories
- [ ] Content accuracy tests against specifications
- [ ] Instruction completeness validation
- [ ] Code example syntax and execution tests
- [ ] Consistency checking across instruction sections
- [ ] AI assistant effectiveness tests with generated instructions

### Test Scenarios
- [ ] Complete specification set with all sections
- [ ] Partial specifications with missing components
- [ ] Large projects with complex architectures
- [ ] Updates to existing instructions with incremental changes
- [ ] Conflicting or ambiguous specification guidance

### Success Criteria
- [ ] All major project aspects covered in instructions
- [ ] Code examples are correct and current
- [ ] Instructions enable effective AI-assisted development
- [ ] Generated code follows project patterns and standards
- [ ] Instructions are maintainable and automatically updatable

## Technology Portability

### Core Algorithm (Language Agnostic)
1. **Specification Analysis**: Multi-source document parsing and synthesis
2. **Pattern Extraction**: Code analysis and convention identification
3. **Content Generation**: Template-based document generation with examples
4. **Quality Validation**: Content verification and consistency checking

### Platform Considerations
- [ ] File system scanning and analysis across platforms
- [ ] Markdown formatting compatibility
- [ ] Code example syntax highlighting support
- [ ] Large file handling and memory management

### Language Implementation Notes
- **Node.js**: Use AST parsing libraries and template engines
- **Python**: Use AST analysis and Jinja2 templating
- **Go**: Use go/ast and text/template packages
- **Rust**: Use syn for parsing and handlebars for templating
- **Java**: Use JavaParser and template engines like Velocity

## Integration Requirements

### GitHub Integration
- [ ] Proper placement in .github/instructions directory
- [ ] GitHub Copilot automatic discovery and usage
- [ ] Integration with GitHub repository structure
- [ ] Version control friendly formatting and updates

### Development Workflow
- [ ] Integration with specification update workflows
- [ ] Automatic regeneration on specification changes
- [ ] Integration with code review processes
- [ ] Support for team collaboration and instruction evolution

### Quality Assurance
- [ ] Automated validation of instruction accuracy
- [ ] Integration with CI/CD pipelines for instruction updates
- [ ] Monitoring of AI assistant effectiveness with generated instructions
- [ ] Feedback loops for instruction quality improvement
