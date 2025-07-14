#!/usr/bin/env node

/**
 * Copilot Instructions Updater
 * Automatically updates .github/instructions/copilot-instructions.md based on current specifications and project structure
 */

const fs = require('fs');
const path = require('path');

class CopilotInstructionsUpdater {
  constructor() {
    this.specsDir = './specs';
    this.srcDir = './src';
    this.outputFile = './.github/instructions/copilot-instructions.md';
  }

  async updateInstructions() {
    console.log('🔄 Updating copilot-instructions.md...');
    
    const content = this.generateInstructions();
    
    // Ensure the directory exists
    const outputDir = path.dirname(this.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(this.outputFile, content, 'utf8');
    
    console.log('✅ Updated .github/instructions/copilot-instructions.md');
  }

  generateInstructions() {
    const specs = this.analyzeSpecs();
    const projectStructure = this.analyzeProjectStructure();
    const dbSchema = this.parseDbSchema();
    const apiRoutes = this.analyzeApiRoutes();
    
    return `# GitHub Copilot Instructions for Spec Driven Development

## Project Context

This is a collaborative specification and test design workspace. All development should be driven by the specifications in the \`/specs\` directory.

## Development Workflow

1. Always reference \`/specs/product-intent.md\` for core values and purpose
2. Check \`/specs/product-overview/\` for architecture and technical decisions
3. Implement features based on \`/specs/features/\` specifications
4. Create tests following patterns in \`/specs/tests/\`

## Key Specifications to Reference

${this.generateSpecsReference(specs)}

## Code Generation Guidelines

- Follow the technology stack defined in architecture.md
- Implement features according to their specification requirements
- Include error handling for edge cases mentioned in feature specs
- Generate tests that cover the test cases outlined in specs
- Use the existing project structure in \`/src/\`

## Current Project Structure

\`\`\`text
${this.generateProjectStructure(projectStructure)}
\`\`\`

When implementing features, maintain this structure and follow the patterns established in existing files.

${this.generateApiGuidelines(apiRoutes)}

## Database Schema Reference

When working with data models, always reference:
- \`/specs/product-overview/data-model.md\` for entity definitions
- \`/specs/product-overview/db-schema.md\` for PostgreSQL schema

### Key Data Model Rules:
- All IDs should be UUIDs, not auto-incrementing integers
- User table uses \`name\` field (not \`username\`)
- User table uses \`password_hash\` field (not \`password\`)
- Role field is enum: ('owner', 'contributor')
- Visibility field is enum: ('private', 'public')
- Use PostgreSQL-specific types (UUID, TIMESTAMP, TEXT)

${this.generateSchemaPatterns(dbSchema)}

---
*Auto-generated from specifications and project structure. Run \`node tools/update-copilot-instructions.js\` to update.*
`;
  }

  analyzeSpecs() {
    const specs = {
      intent: this.checkFile('product-intent.md'),
      overview: this.scanDirectory('product-overview'),
      features: this.scanDirectory('features'),
      tests: this.scanDirectory('tests'),
      templates: this.scanDirectory('templates')
    };
    
    return specs;
  }

  analyzeProjectStructure() {
    const structure = {};
    
    if (fs.existsSync(this.srcDir)) {
      structure.src = this.scanDirectoryStructure(this.srcDir);
    }
    
    return structure;
  }

  analyzeApiRoutes() {
    const routes = [];
    const routesDir = path.join(this.srcDir, 'routes');
    
    if (fs.existsSync(routesDir)) {
      const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
      for (const file of routeFiles) {
        const routePath = path.join(routesDir, file);
        const content = fs.readFileSync(routePath, 'utf8');
        routes.push({
          file: file.replace('.js', ''),
          endpoints: this.extractEndpoints(content)
        });
      }
    }
    
    return routes;
  }

  extractEndpoints(content) {
    const endpoints = [];
    const routeRegex = /router\.(get|post|put|delete|patch)\('([^']+)'.*?(?:\/\/\s*(.*))?$/gm;
    let match;
    
    while ((match = routeRegex.exec(content)) !== null) {
      endpoints.push({
        method: match[1].toUpperCase(),
        path: match[2],
        comment: match[3] || ''
      });
    }
    
    return endpoints;
  }

  parseDbSchema() {
    try {
      const schemaPath = path.join(this.specsDir, 'product-overview/db-schema.md');
      if (!fs.existsSync(schemaPath)) return {};
      
      const content = fs.readFileSync(schemaPath, 'utf8');
      const tables = {};
      const tableRegex = /## Table: (\w+)\s*([\s\S]*?)(?=## Table:|\Z)/g;
      let match;
      
      while ((match = tableRegex.exec(content)) !== null) {
        const tableName = match[1];
        const tableContent = match[2];
        tables[tableName] = this.parseTableFields(tableContent);
      }
      
      return tables;
    } catch (error) {
      console.warn('⚠️  Could not parse db-schema.md:', error.message);
      return {};
    }
  }

  parseTableFields(tableContent) {
    const fields = [];
    const fieldLines = tableContent.split('\n').filter(line => line.trim().startsWith('-'));
    
    for (const line of fieldLines) {
      const fieldMatch = line.match(/- (\w+)\s+(.+)/);
      if (fieldMatch) {
        const [, name, definition] = fieldMatch;
        fields.push({ name, definition: definition.trim() });
      }
    }
    
    return fields;
  }

  checkFile(relativePath) {
    const fullPath = path.join(this.specsDir, relativePath);
    return {
      exists: fs.existsSync(fullPath),
      path: relativePath,
      lastModified: fs.existsSync(fullPath) ? fs.statSync(fullPath).mtime : null
    };
  }

  scanDirectory(dirName) {
    const dirPath = path.join(this.specsDir, dirName);
    if (!fs.existsSync(dirPath)) {
      return { exists: false, files: [] };
    }
    
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: f,
        path: path.join(dirName, f),
        title: this.extractTitle(path.join(dirPath, f))
      }));
    
    return { exists: true, files };
  }

  scanDirectoryStructure(dirPath, prefix = '') {
    const items = [];
    
    if (!fs.existsSync(dirPath)) return items;
    
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        items.push({
          type: 'directory',
          name: entry.name,
          children: this.scanDirectoryStructure(path.join(dirPath, entry.name), prefix + '  ')
        });
      } else if (entry.name.endsWith('.js')) {
        items.push({
          type: 'file',
          name: entry.name
        });
      }
    }
    
    return items;
  }

  extractTitle(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      return titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
    } catch {
      return path.basename(filePath, '.md');
    }
  }

  generateSpecsReference(specs) {
    let content = '';
    
    if (specs.intent.exists) {
      content += `### Product Intent

- File: \`/specs/product-intent.md\`
- Purpose: Core values, target users, and product vision
- Use for: Understanding overall direction and constraints

`;
    }
    
    if (specs.overview.exists && specs.overview.files.length > 0) {
      content += `### Architecture & Overview

`;
      for (const file of specs.overview.files) {
        const purpose = this.getFilePurpose(file.name);
        content += `- **${file.title}**: \`/specs/${file.path}\`${purpose ? ` - ${purpose}` : ''}
`;
      }
      content += `
`;
    }
    
    if (specs.features.exists && specs.features.files.length > 0) {
      content += `### Feature Specifications

- Directory: \`/specs/features/\`
- Available features:
`;
      for (const file of specs.features.files) {
        content += `  - **${file.title}**: \`/specs/${file.path}\`
`;
      }
      content += `- Pattern: Each feature has objective, requirements, UX flow, edge cases
- Use for: Implementation guidance and acceptance criteria

`;
    }
    
    if (specs.tests.exists && specs.tests.files.length > 0) {
      content += `### Test Strategy

- Directory: \`/specs/tests/\`
- Available test specs:
`;
      for (const file of specs.tests.files) {
        content += `  - **${file.title}**: \`/specs/${file.path}\`
`;
      }
      content += `- Use for: Test case patterns and validation approaches

`;
    }
    
    return content;
  }

  getFilePurpose(filename) {
    const purposes = {
      'architecture.md': 'Technology stack and infrastructure patterns',
      'db-schema.md': 'PostgreSQL database schema',
      'data-model.md': 'Entity definitions and relationships',
      'api-routes.md': 'API endpoint specifications',
      'ux.md': 'User experience guidelines',
      'use-cases.md': 'User stories and scenarios'
    };
    
    return purposes[filename] || '';
  }

  generateProjectStructure(structure) {
    if (!structure.src) return 'src/ (not found)';
    
    return this.formatStructure('src', structure.src, '');
  }

  formatStructure(name, items, indent) {
    let result = `${indent}${name}/\n`;
    
    // Sort: directories first, then files
    const dirs = items.filter(item => item.type === 'directory');
    const files = items.filter(item => item.type === 'file');
    
    [...dirs, ...files].forEach((item, index, array) => {
      const isLast = index === array.length - 1;
      const prefix = indent + (isLast ? '└── ' : '├── ');
      
      if (item.type === 'directory') {
        result += `${prefix}${item.name}/`;
        if (item.children && item.children.length > 0) {
          result += this.getDirectoryComment(item.name);
          result += '\n';
          const childIndent = indent + (isLast ? '    ' : '│   ');
          result += this.formatStructure('', item.children, childIndent).replace(/^.*?\n/, '');
        } else {
          result += this.getDirectoryComment(item.name) + '\n';
        }
      } else {
        result += `${prefix}${item.name}\n`;
      }
    });
    
    return result;
  }

  getDirectoryComment(dirName) {
    const comments = {
      'controllers': '     # Business logic',
      'middleware': '      # Auth and validation',
      'models': '         # Data models and DB interactions',
      'routes': '         # API endpoints'
    };
    
    return comments[dirName] || '';
  }

  generateApiGuidelines(routes) {
    if (routes.length === 0) return '';
    
    let content = `## API Route Patterns

Current API endpoints:

`;
    
    for (const route of routes) {
      content += `### ${route.file.charAt(0).toUpperCase() + route.file.slice(1)} Routes
`;
      for (const endpoint of route.endpoints) {
        content += `- \`${endpoint.method} ${endpoint.path}\``;
        if (endpoint.comment) {
          content += ` - ${endpoint.comment}`;
        }
        content += '\n';
      }
      content += '\n';
    }
    
    return content;
  }

  generateSchemaPatterns(dbSchema) {
    if (Object.keys(dbSchema).length === 0) return '';
    
    let content = `### Schema Patterns:
\`\`\`sql
`;
    
    // Show user table as primary example
    if (dbSchema.users) {
      content += `-- User table pattern from db-schema.md\n`;
      for (const field of dbSchema.users) {
        content += `${field.name} ${field.definition}\n`;
      }
    }
    
    content += `\`\`\`
`;
    
    return content;
  }
}

// CLI usage
if (require.main === module) {
  const updater = new CopilotInstructionsUpdater();
  updater.updateInstructions().catch(console.error);
}

module.exports = CopilotInstructionsUpdater;
