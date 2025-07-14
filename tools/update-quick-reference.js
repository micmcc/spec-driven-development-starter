#!/usr/bin/env node

/**
 * Quick Reference Updater
 * Automatically updates docs/copilot-quick-reference.md based on current specifications
 */

const fs = require('fs');
const path = require('path');

class QuickReferenceUpdater {
  constructor() {
    this.specsDir = './specs';
    this.outputFile = './docs/copilot-quick-reference.md';
  }

  async updateQuickReference() {
    console.log('🔄 Updating copilot-quick-reference.md...');
    
    const content = this.generateContent();
    fs.writeFileSync(this.outputFile, content, 'utf8');
    
    console.log('✅ Updated docs/copilot-quick-reference.md');
  }

  generateContent() {
    const dbSchema = this.parseDbSchema();
    const apiPatterns = this.parseApiPatterns();
    
    return `# Quick Reference for GitHub Copilot

## Common Data Model Patterns

${this.generateDataModels(dbSchema)}

${this.generateApiPatterns(apiPatterns)}

## Copilot Prompting Tips

1. **Reference specific files**: "Following /specs/product-overview/db-schema.md"
2. **Be explicit about constraints**: "Use UUID not auto-increment"
3. **Mention enum values**: "Role must be 'owner' or 'contributor'"
4. **Ask for corrections**: "Does this match the data model specs?"
5. **Specify response format**: "Return response following API patterns"
6. **Check project instructions**: See \`.github/instructions/copilot-instructions.md\` for detailed guidelines

## Common Field Patterns

- **IDs**: Always use UUID, never auto-increment
- **Timestamps**: Use TIMESTAMP with DEFAULT now()
- **Foreign Keys**: Reference parent table with \`_id\` suffix
- **Enums**: Always define allowed values explicitly

## Validation Rules

- Email fields must be unique
- Password fields stored as \`password_hash\`
- User names stored in \`name\` field (not \`username\`)
- All enum fields must have CHECK constraints

---
*Auto-generated from specifications. Run \`node tools/update-quick-reference.js\` to update.*
`;
  }

  parseDbSchema() {
    try {
      const schemaContent = fs.readFileSync(
        path.join(this.specsDir, 'product-overview/db-schema.md'), 
        'utf8'
      );
      
      const tables = {};
      const tableRegex = /## Table: (\w+)\s*([\s\S]*?)(?=## Table:|\Z)/g;
      let match;
      
      while ((match = tableRegex.exec(schemaContent)) !== null) {
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

  parseApiPatterns() {
    // Extract common patterns from existing controllers
    return {
      success: '{ success: true, data: {...} }',
      error: '{ success: false, error: "message" }'
    };
  }

  generateDataModels(dbSchema) {
    let content = '';
    
    // Generate User model
    if (dbSchema.users) {
      content += `### User Model (from specs/product-overview/db-schema.md)
\`\`\`javascript
// Correct User model structure:
{
${dbSchema.users.map(field => this.formatField(field)).join(',\n')}
}
\`\`\`

`;
    }
    
    // Generate Project model
    if (dbSchema.projects) {
      content += `### Project Model
\`\`\`javascript
{
${dbSchema.projects.map(field => this.formatField(field)).join(',\n')}
}
\`\`\`

`;
    }
    
    // Generate Specification model
    if (dbSchema.specifications) {
      content += `### Specification Model
\`\`\`javascript
{
${dbSchema.specifications.map(field => this.formatField(field)).join(',\n')}
}
\`\`\`

`;
    }
    
    return content;
  }

  formatField(field) {
    const { name, definition } = field;
    let comment = '';
    
    // Add helpful comments based on field patterns
    if (name === 'id') {
      comment = '           // NOT auto-increment';
    } else if (name === 'email') {
      comment = '        // unique';
    } else if (name === 'password_hash') {
      comment = ' // NOT \'password\'';
    } else if (name === 'name') {
      comment = '         // NOT \'username\'';
    } else if (name.endsWith('_id')) {
      const refTable = name.replace('_id', '');
      comment = `     // FK to ${refTable}`;
    } else if (definition.includes('CHECK')) {
      const enumMatch = definition.match(/CHECK \([^(]*IN \(([^)]+)\)/);
      if (enumMatch) {
        comment = ` // ${enumMatch[1]}`;
      }
    }
    
    // Determine JavaScript type from PostgreSQL type
    let jsType = 'TEXT';
    if (definition.includes('UUID')) jsType = 'UUID';
    else if (definition.includes('TIMESTAMP')) jsType = 'TIMESTAMP';
    else if (definition.includes('CHECK')) jsType = 'ENUM';
    
    return `  ${name}: ${jsType}${comment}`;
  }

  generateApiPatterns(patterns) {
    return `### API Response Patterns
\`\`\`javascript
// Success response
${patterns.success}

// Error response  
${patterns.error}
\`\`\`

`;
  }
}

// CLI usage
if (require.main === module) {
  const updater = new QuickReferenceUpdater();
  updater.updateQuickReference().catch(console.error);
}

module.exports = QuickReferenceUpdater;
