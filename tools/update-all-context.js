#!/usr/bin/env node

/**
 * Update All Copilot Context
 * Runs all context generation tools: spec extractor, quick reference, and copilot instructions updaters
 */

const { execSync } = require('child_process');
const path = require('path');

async function updateAllCopilotContext() {
  console.log('🚀 Updating all Copilot context files...\n');
  
  try {
    const toolsDir = __dirname;
    
    // Extract specification context
    console.log('📋 Extracting specification context...');
    execSync(`node "${path.join(toolsDir, 'spec-extractor.js')}"`, { stdio: 'inherit' });
    
    // Update quick reference
    console.log('\n📚 Updating quick reference...');
    execSync(`node "${path.join(toolsDir, 'update-quick-reference.js')}"`, { stdio: 'inherit' });
    
    // Update copilot instructions
    console.log('\n📖 Updating copilot instructions...');
    execSync(`node "${path.join(toolsDir, 'update-copilot-instructions.js')}"`, { stdio: 'inherit' });
    
    // Update TODO list from specifications
    console.log('\n📝 Updating TODO list from specifications...');
    execSync(`node "${path.join(toolsDir, 'update-todos.js')}"`, { stdio: 'inherit' });
    
    // Update spaces mapping
    console.log('\n🗺️ Updating spaces mapping...');
    execSync(`node "${path.join(toolsDir, 'update-spaces-mapping.js')}"`, { stdio: 'inherit' });
    
    console.log('\n✨ All Copilot context files updated successfully!');
    console.log('📝 Files updated:');
    console.log('   - context-for-copilot.js');
    console.log('   - docs/copilot-quick-reference.md');
    console.log('   - .github/instructions/copilot-instructions.md');
    console.log('   - TODO.md');
    console.log('   - .copilot/spaces-mapping.yaml');
    
  } catch (error) {
    console.error('❌ Error updating context files:', error.message);
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  updateAllCopilotContext();
}

module.exports = updateAllCopilotContext;