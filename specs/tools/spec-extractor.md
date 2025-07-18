# Specification Extractor Tool

## Tool Overview

- **Name**: Specification Extractor
- **Purpose**: Aggregate all project specifications into a single context file for GitHub Copilot integration
- **Category**: Context Generation

## Functionality

### Description
The Specification Extractor scans the project's specification files and creates a consolidated context file that GitHub Copilot can use to understand the project's requirements, architecture, features, and test cases. This enables Copilot to provide more accurate and contextually relevant code suggestions.

### Input Sources
- `/specs/product-intent.md` - Core product purpose and values
- `/specs/product-overview/architecture.md` - Technical architecture documentation
- `/specs/features/*.md` - Individual feature specifications
- `/specs/tests/*.md` - Test case specifications

### Output Targets
- `./context-for-copilot.js` - Consolidated context file in JavaScript comment format

### Processing Logic
1. Read product intent from main specification file
2. Read architecture documentation from product overview
3. Scan features directory for all markdown files and aggregate their content
4. Scan tests directory for all markdown files and aggregate their content
5. Format all content into a structured JavaScript comment block
6. Include generation timestamp for tracking freshness

## Configuration

### Required Parameters
- None (uses sensible defaults)

### Optional Parameters
- `specsDir` - Root directory for specifications (default: `./specs`)
- `outputPath` - Output file path (default: `./context-for-copilot.js`)

### Environment Dependencies
- Node.js runtime environment
- File system read/write permissions
- Access to specification directories

## Usage

### Command Line Interface
```bash
node tools/spec-extractor.js
```

### NPM Script Integration
```bash
npm run extract-specs
```

### Programmatic API
```javascript
const SpecExtractor = require('./tools/spec-extractor.js');
const extractor = new SpecExtractor('./specs');
extractor.writeContextFile('./output/context-for-copilot.js');
```

## Dependencies

### Input Dependencies
- None (can run independently)

### File Dependencies
- `/specs` directory must exist
- Individual specification files are optional (graceful degradation)

### System Dependencies
- Node.js fs module
- Node.js path module

## Output Format

### File Structure
Single JavaScript file with multi-line comment containing all specifications

### Content Format
```javascript
// SPECIFICATION CONTEXT FOR GITHUB COPILOT
// Generated: [ISO timestamp]

/*
PRODUCT INTENT:
[Content from product-intent.md]

ARCHITECTURE:
[Content from architecture.md]

FEATURES:
--- [FEATURE_NAME] ---
[Feature content]

TESTS:
--- [TEST_NAME] ---
[Test content]
*/
```

### Naming Conventions
- Output file: `context-for-copilot.js`
- Feature sections: uppercase feature name with triple dashes
- Test sections: uppercase test name with triple dashes

## Error Handling

### Error Conditions
1. Specification directories don't exist
2. Individual specification files are missing
3. Output directory is not writable
4. File encoding issues

### Error Messages
- Missing files: `// [filename] not found`
- Directory errors: Console error with descriptive message
- Write errors: Console error with file path

### Recovery Behavior
- Missing individual files: Insert placeholder comment and continue
- Missing directories: Return empty array and continue
- Write errors: Throw exception and exit

## Testing

### Test Scenarios
1. **Complete specifications**: All spec files present and readable
2. **Partial specifications**: Some spec files missing
3. **Empty directories**: Spec directories exist but are empty
4. **Missing directories**: Spec directories don't exist
5. **Custom paths**: Non-default input and output paths
6. **Read-only output**: Output directory is not writable

### Expected Outcomes
- **Success**: Context file created with all available specifications
- **Partial success**: Context file created with placeholders for missing files
- **Failure**: Clear error message and non-zero exit code

### Validation Methods
1. Check output file exists and is readable
2. Verify content includes generation timestamp
3. Confirm all available specifications are included
4. Validate JavaScript comment syntax is correct
5. Test with various directory structures and file permissions