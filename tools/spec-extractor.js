#!/usr/bin/env node

/**
 * Specification Context Extractor
 * Generates context summaries from specification files for GitHub Copilot
 */

const fs = require('fs');
const path = require('path');

class SpecExtractor {
  constructor(specsDir = './specs') {
    this.specsDir = specsDir;
  }

  extractContext() {
    const context = {
      productIntent: this.readSpec('product-intent.md'),
      architecture: this.readSpec('product-overview/architecture.md'),
      features: this.readFeatures(),
      tests: this.readTests(),
      tools: this.readTools()
    };

    return this.formatForCopilot(context);
  }

  readSpec(relativePath) {
    try {
      return fs.readFileSync(path.join(this.specsDir, relativePath), 'utf8');
    } catch (error) {
      return `// ${relativePath} not found`;
    }
  }

  readFeatures() {
    const featuresDir = path.join(this.specsDir, 'features');
    try {
      return fs.readdirSync(featuresDir)
        .filter(file => file.endsWith('.md'))
        .map(file => ({
          name: file.replace('.md', ''),
          content: fs.readFileSync(path.join(featuresDir, file), 'utf8')
        }));
    } catch (error) {
      return [];
    }
  }

  readTests() {
    const testsDir = path.join(this.specsDir, 'tests');
    try {
      return fs.readdirSync(testsDir)
        .filter(file => file.endsWith('.md'))
        .map(file => ({
          name: file.replace('.md', ''),
          content: fs.readFileSync(path.join(testsDir, file), 'utf8')
        }));
    } catch (error) {
      return [];
    }
  }

  readTools() {
    const toolsDir = path.join(this.specsDir, 'tools');
    try {
      return fs.readdirSync(toolsDir)
        .filter(file => file.endsWith('.md'))
        .map(file => ({
          name: file.replace('.md', ''),
          content: fs.readFileSync(path.join(toolsDir, file), 'utf8')
        }));
    } catch (error) {
      return [];
    }
  }

  formatForCopilot(context) {
    return `
// SPECIFICATION CONTEXT FOR GITHUB COPILOT
// Generated: ${new Date().toISOString()}

/*
PRODUCT INTENT:
${context.productIntent}

ARCHITECTURE:
${context.architecture}

FEATURES:
${context.features.map(f => `
--- ${f.name.toUpperCase()} ---
${f.content}
`).join('\n')}

TESTS:
${context.tests.map(t => `
--- ${t.name.toUpperCase()} ---
${t.content}
`).join('\n')}

TOOLS:
${context.tools.map(tool => `
--- ${tool.name.toUpperCase()} ---
${tool.content}
`).join('\n')}
*/
`;
  }

  writeContextFile(outputPath = './context-for-copilot.js') {
    const context = this.extractContext();
    fs.writeFileSync(outputPath, context);
    console.log(`Context written to ${outputPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const extractor = new SpecExtractor();
  extractor.writeContextFile();
}

module.exports = SpecExtractor;
