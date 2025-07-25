#!/usr/bin/env node

/**
 * Automated Spaces Mapping Agent
 * Automatically detects changes to spec, context, and TODO files within a Space 
 * and updates .copilot/spaces-mapping.yaml accordingly.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class SpacesMappingAgent {
  constructor(rootDir = '.') {
    this.rootDir = rootDir;
    this.spacesConfigPath = path.join(rootDir, '.copilot', 'spaces-mapping.yaml');
    this.config = null;
  }

  async updateSpacesMapping() {
    console.log('🔄 Starting automated spaces mapping update...\n');
    
    try {
      // Load current spaces mapping configuration
      this.loadConfig();
      
      // Scan file system for changes
      const currentFiles = this.scanFileSystem();
      
      // Update spaces mapping based on discovered files
      let hasChanges = false;
      hasChanges = this.updateSpaceFiles(currentFiles) || hasChanges;
      
      // Save updated configuration if there are changes
      if (hasChanges) {
        this.saveConfig();
        console.log('✅ Spaces mapping updated successfully!');
      } else {
        console.log('✅ Spaces mapping is already up to date.');
      }
      
      return hasChanges;
      
    } catch (error) {
      console.error('❌ Error updating spaces mapping:', error.message);
      throw error;
    }
  }

  loadConfig() {
    try {
      const configContent = fs.readFileSync(this.spacesConfigPath, 'utf8');
      this.config = yaml.load(configContent);
      console.log('📖 Loaded current spaces mapping configuration');
    } catch (error) {
      throw new Error(`Failed to load spaces mapping config: ${error.message}`);
    }
  }

  saveConfig() {
    try {
      // Update last_updated timestamp
      this.config.metadata.last_updated = new Date().toISOString().split('T')[0];
      
      const yamlContent = yaml.dump(this.config, {
        lineWidth: 120,
        indent: 2,
        noRefs: true
      });
      
      fs.writeFileSync(this.spacesConfigPath, yamlContent, 'utf8');
      console.log('💾 Saved updated spaces mapping configuration');
    } catch (error) {
      throw new Error(`Failed to save spaces mapping config: ${error.message}`);
    }
  }

  scanFileSystem() {
    console.log('🔍 Scanning file system for spec, context, and TODO files...');
    
    const files = {
      specifications: this.scanDirectory('specs', ['.md']),
      tests: this.scanDirectory('tests', ['.js']),
      source: this.scanDirectory('src', ['.js']),
      planning: this.scanDirectory('planning', ['.md']),
      infrastructure: this.scanDirectory('infra', ['.yml', '.yaml', '.json']),
      documentation: this.scanForFiles(['README.md', 'TODO.md']),
      tools: this.scanDirectory('tools', ['.js']),
      github: this.scanDirectory('.github', ['.md', '.yml', '.yaml']),
      database: this.scanDirectory('database', ['.js', '.sql']),
      config: this.scanForFiles(['package.json', 'jest.config.js', '.env.example', 'spec-driven.code-workspace'])
    };
    
    console.log(`📁 Found ${this.countTotalFiles(files)} files across all categories`);
    return files;
  }

  scanDirectory(dirPath, extensions) {
    const fullPath = path.join(this.rootDir, dirPath);
    const files = [];
    
    if (!fs.existsSync(fullPath)) {
      return files;
    }
    
    const scanRecursively = (currentPath, relativePath = '') => {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanRecursively(itemPath, relativeItemPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push({
              path: path.join(dirPath, relativeItemPath).replace(/\\/g, '/'),
              name: item,
              type: this.inferFileType(path.join(dirPath, path.dirname(relativeItemPath)), item),
              description: this.generateFileDescription(path.join(dirPath, path.dirname(relativeItemPath)), item)
            });
          }
        }
      }
    };
    
    scanRecursively(fullPath);
    return files;
  }

  scanForFiles(filePaths) {
    return filePaths
      .filter(filePath => fs.existsSync(path.join(this.rootDir, filePath)))
      .map(filePath => ({
        path: filePath,
        name: path.basename(filePath),
        type: this.inferFileType(path.dirname(filePath), path.basename(filePath)),
        description: this.generateFileDescription(path.dirname(filePath), path.basename(filePath))
      }));
  }

  inferFileType(directory, filename) {
    // Determine file type based on directory and filename patterns
    if (directory.startsWith('specs/features')) return 'feature_spec';
    if (directory.startsWith('specs/technical')) return 'technical_spec';
    if (directory.startsWith('specs/tests')) return 'test_spec';
    if (directory.startsWith('specs/product-overview')) return 'architecture_spec';
    if (directory.startsWith('specs/technical/adrs')) return 'adr';
    if (directory.startsWith('tests') && filename.endsWith('.test.js')) return 'unit_test';
    if (directory.startsWith('src/controllers')) return 'controller';
    if (directory.startsWith('src/models')) return 'model';
    if (directory.startsWith('src/routes')) return 'route';
    if (directory.startsWith('src/middleware')) return 'middleware';
    if (directory.startsWith('planning')) return 'planning';
    if (directory.startsWith('infra')) return 'infrastructure';
    if (directory.startsWith('tools')) return 'automation';
    if (directory.startsWith('.github/workflows')) return 'cicd';
    if (directory.startsWith('.github')) return 'github_templates';
    if (directory.startsWith('database')) return 'database';
    if (filename === 'README.md') return 'documentation';
    if (filename.startsWith('TODO')) return 'planning';
    if (filename.endsWith('config.js') || filename.endsWith('.config.js')) return 'test_config';
    if (filename === 'package.json') return 'config';
    
    return 'other';
  }

  generateFileDescription(directory, filename) {
    // Generate human-readable descriptions for files
    const baseName = path.basename(filename, path.extname(filename));
    
    if (directory.startsWith('specs/features')) {
      return `${baseName.replace(/-/g, ' ')} feature specification`;
    }
    if (directory.startsWith('specs/technical')) {
      return `${baseName.replace(/-/g, ' ')} technical specification`;
    }
    if (directory.startsWith('specs/tests')) {
      return `${baseName.replace(/-/g, ' ')} test specifications`;
    }
    if (directory.startsWith('tests') && filename.endsWith('.test.js')) {
      return `${baseName.replace('.test', '').replace(/([A-Z])/g, ' $1').toLowerCase()} unit tests`;
    }
    if (directory.startsWith('src/controllers')) {
      return `${baseName.replace('Controller', '').toLowerCase()} controller implementation`;
    }
    if (directory.startsWith('src/models')) {
      return `${baseName.replace('Model', '').toLowerCase()} data model`;
    }
    if (directory.startsWith('tools')) {
      return `${baseName.replace(/-/g, ' ')} automation tool`;
    }
    if (filename === 'README.md') {
      return 'Main repository documentation and getting started guide';
    }
    if (filename === 'TODO.md') {
      return 'Global todo list and development priorities';
    }
    
    return `${baseName.replace(/-/g, ' ')} file`;
  }

  updateSpaceFiles(currentFiles) {
    let hasChanges = false;
    
    // Map files to appropriate spaces based on categorization rules
    const spaceFileMapping = this.categorizeFilesToSpaces(currentFiles);
    
    // Update each space with its mapped files
    for (const [spaceName, spaceFiles] of Object.entries(spaceFileMapping)) {
      if (this.config.spaces[spaceName]) {
        const spaceChanged = this.updateSpaceFileLists(spaceName, spaceFiles);
        hasChanges = hasChanges || spaceChanged;
      }
    }
    
    return hasChanges;
  }

  categorizeFilesToSpaces(files) {
    const spaceMapping = {
      user_management: [],
      collaborative_spec_editing: [],
      test_coverage_cicd: [],
      technical_architecture: []
    };
    
    // Categorize specifications
    files.specifications.forEach(file => {
      if (this.isUserManagementFile(file.path)) {
        spaceMapping.user_management.push({ ...file, category: 'specification_files' });
      } else if (this.isCollaborativeEditingFile(file.path)) {
        spaceMapping.collaborative_spec_editing.push({ ...file, category: 'specification_files' });
      } else if (this.isTechnicalArchitectureFile(file.path)) {
        spaceMapping.technical_architecture.push({ ...file, category: 'specification_files' });
      }
    });
    
    // Categorize tests
    files.tests.forEach(file => {
      if (this.isUserManagementFile(file.path)) {
        spaceMapping.user_management.push({ ...file, category: 'test_files' });
      } else if (this.isCollaborativeEditingFile(file.path)) {
        spaceMapping.collaborative_spec_editing.push({ ...file, category: 'test_files' });
      }
      // All tests also go to test coverage space
      spaceMapping.test_coverage_cicd.push({ ...file, category: 'test_files' });
    });
    
    // Categorize source code
    files.source.forEach(file => {
      if (this.isUserManagementFile(file.path)) {
        spaceMapping.user_management.push({ ...file, category: 'source_files' });
      } else if (this.isCollaborativeEditingFile(file.path)) {
        spaceMapping.collaborative_spec_editing.push({ ...file, category: 'source_files' });
      }
    });
    
    // Categorize planning files
    files.planning.forEach(file => {
      // Planning files can belong to multiple spaces
      if (this.isUserManagementFile(file.path)) {
        spaceMapping.user_management.push({ ...file, category: 'planning_files' });
      }
      if (this.isCollaborativeEditingFile(file.path)) {
        spaceMapping.collaborative_spec_editing.push({ ...file, category: 'planning_files' });
      }
      if (this.isTestCoverageFile(file.path)) {
        spaceMapping.test_coverage_cicd.push({ ...file, category: 'planning_files' });
      }
      if (this.isTechnicalArchitectureFile(file.path)) {
        spaceMapping.technical_architecture.push({ ...file, category: 'planning_files' });
      }
    });
    
    // Categorize infrastructure files
    files.infrastructure.forEach(file => {
      spaceMapping.technical_architecture.push({ ...file, category: 'source_files' });
    });
    
    // Categorize tools
    files.tools.forEach(file => {
      spaceMapping.test_coverage_cicd.push({ ...file, category: 'source_files' });
    });
    
    // Categorize configuration files
    files.config.forEach(file => {
      if (this.isTestConfigFile(file.path)) {
        spaceMapping.test_coverage_cicd.push({ ...file, category: 'reference_files' });
      } else {
        spaceMapping.technical_architecture.push({ ...file, category: 'reference_files' });
      }
    });
    
    // Categorize documentation
    files.documentation.forEach(file => {
      // Documentation goes to all spaces as reference
      Object.keys(spaceMapping).forEach(spaceName => {
        spaceMapping[spaceName].push({ ...file, category: 'reference_files' });
      });
    });
    
    return spaceMapping;
  }

  // File categorization helper methods
  isUserManagementFile(filePath) {
    return /auth|user|login|registration|profile/.test(filePath.toLowerCase());
  }

  isCollaborativeEditingFile(filePath) {
    return /project|collaboration|collaborative|editing|spec/.test(filePath.toLowerCase());
  }

  isTechnicalArchitectureFile(filePath) {
    return /architecture|technical|adr|infra|db\.js|database/.test(filePath.toLowerCase());
  }

  isTestCoverageFile(filePath) {
    return /test|coverage|jest|ci|cd|devops/.test(filePath.toLowerCase());
  }

  isTestConfigFile(filePath) {
    return /jest\.config|test/.test(filePath.toLowerCase());
  }

  updateSpaceFileLists(spaceName, newFiles) {
    let hasChanges = false;
    const space = this.config.spaces[spaceName];
    
    // Group new files by category
    const filesByCategory = {};
    newFiles.forEach(file => {
      if (!filesByCategory[file.category]) {
        filesByCategory[file.category] = [];
      }
      filesByCategory[file.category].push(file);
    });
    
    // Update each file category in the space
    for (const [category, files] of Object.entries(filesByCategory)) {
      if (!space[category]) {
        space[category] = [];
      }
      
      const categoryChanged = this.updateFileCategoryList(space[category], files);
      hasChanges = hasChanges || categoryChanged;
    }
    
    if (hasChanges) {
      console.log(`📝 Updated ${spaceName} space with ${newFiles.length} files`);
    }
    
    return hasChanges;
  }

  updateFileCategoryList(existingFiles, newFiles) {
    let hasChanges = false;
    
    // Create a map of existing files by path for quick lookup
    const existingPaths = new Set(existingFiles.map(f => f.path));
    
    // Add new files that don't exist
    newFiles.forEach(newFile => {
      if (!existingPaths.has(newFile.path)) {
        existingFiles.push({
          path: newFile.path,
          type: newFile.type,
          description: newFile.description
        });
        hasChanges = true;
      } else {
        // Update existing file if type or description changed
        const existingFile = existingFiles.find(f => f.path === newFile.path);
        if (existingFile && (existingFile.type !== newFile.type || existingFile.description !== newFile.description)) {
          existingFile.type = newFile.type;
          existingFile.description = newFile.description;
          hasChanges = true;
        }
      }
    });
    
    // Remove files that no longer exist (optional - may want to keep for historical reference)
    // This is commented out to avoid removing files that may temporarily not be detected
    /*
    const newPaths = new Set(newFiles.map(f => f.path));
    for (let i = existingFiles.length - 1; i >= 0; i--) {
      if (!newPaths.has(existingFiles[i].path)) {
        existingFiles.splice(i, 1);
        hasChanges = true;
      }
    }
    */
    
    return hasChanges;
  }

  countTotalFiles(files) {
    return Object.values(files).reduce((total, fileList) => total + fileList.length, 0);
  }
}

// CLI usage
async function main() {
  try {
    const agent = new SpacesMappingAgent();
    const hasChanges = await agent.updateSpacesMapping();
    
    if (hasChanges) {
      console.log('\n🎉 Spaces mapping automation completed successfully!');
      console.log('📋 Next steps:');
      console.log('   - Review the updated .copilot/spaces-mapping.yaml');
      console.log('   - Run npm run update-context to update all Copilot context files');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Spaces mapping automation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SpacesMappingAgent };