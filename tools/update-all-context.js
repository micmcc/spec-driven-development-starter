#!/usr/bin/env node

/**
 * Update All Copilot Context
 * Runs all context generation tools: spec extractor, quick reference, and copilot instructions updaters
 */

const QuickReferenceUpdater = require('./update-quick-reference');
const CopilotInstructionsUpdater = require('./update-copilot-instructions');
const SpecExtractor = require('./spec-extractor');

async function updateAllCopilotContext() {
  console.log('🚀 Updating all Copilot context files...\n');
  
  try {
    // Extract specification context
    const specExtractor = new SpecExtractor();
    console.log('📋 Extracting specification context...');
    specExtractor.writeContextFile();
    
    // Update quick reference
    const quickRefUpdater = new QuickReferenceUpdater();
    await quickRefUpdater.updateQuickReference();
    
    // Update copilot instructions
    const instructionsUpdater = new CopilotInstructionsUpdater();
    await instructionsUpdater.updateInstructions();
    
    console.log('\n✨ All Copilot context files updated successfully!');
    console.log('📝 Files updated:');
    console.log('   - context-for-copilot.js');
    console.log('   - docs/copilot-quick-reference.md');
    console.log('   - .github/instructions/copilot-instructions.md');
    
  } catch (error) {
    console.error('❌ Error updating context files:', error.message);
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  updateAllCopilotContext();
}
