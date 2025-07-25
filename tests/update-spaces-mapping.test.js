const { SpacesMappingAgent } = require('../tools/update-spaces-mapping');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

describe('SpacesMappingAgent', () => {
  let agent;
  let originalConfig;
  
  beforeEach(() => {
    agent = new SpacesMappingAgent();
    // Backup original config
    const configPath = path.join(__dirname, '..', '.copilot', 'spaces-mapping.yaml');
    if (fs.existsSync(configPath)) {
      originalConfig = fs.readFileSync(configPath, 'utf8');
    }
  });
  
  afterEach(() => {
    // Restore original config if it existed
    if (originalConfig) {
      const configPath = path.join(__dirname, '..', '.copilot', 'spaces-mapping.yaml');
      fs.writeFileSync(configPath, originalConfig, 'utf8');
    }
  });
  
  test('should load existing spaces mapping configuration', () => {
    expect(() => agent.loadConfig()).not.toThrow();
    expect(agent.config).toBeDefined();
    expect(agent.config.metadata).toBeDefined();
    expect(agent.config.spaces).toBeDefined();
  });
  
  test('should scan file system and find relevant files', () => {
    const files = agent.scanFileSystem();
    
    expect(files).toBeDefined();
    expect(files.specifications).toBeDefined();
    expect(files.tests).toBeDefined();
    expect(files.source).toBeDefined();
    
    // Should find some spec files
    expect(files.specifications.length).toBeGreaterThan(0);
    
    // Should find some test files
    expect(files.tests.length).toBeGreaterThan(0);
    
    // Should find some source files
    expect(files.source.length).toBeGreaterThan(0);
  });
  
  test('should categorize user management files correctly', () => {
    expect(agent.isUserManagementFile('src/controllers/authController.js')).toBe(true);
    expect(agent.isUserManagementFile('specs/features/user-management.md')).toBe(true);
    expect(agent.isUserManagementFile('tests/authController.test.js')).toBe(true);
    expect(agent.isUserManagementFile('src/controllers/projectController.js')).toBe(false);
  });
  
  test('should categorize collaborative editing files correctly', () => {
    expect(agent.isCollaborativeEditingFile('src/controllers/projectController.js')).toBe(true);
    expect(agent.isCollaborativeEditingFile('specs/features/collaborative_editing.md')).toBe(true);
    expect(agent.isCollaborativeEditingFile('tests/projectController.test.js')).toBe(true);
    expect(agent.isCollaborativeEditingFile('src/controllers/authController.js')).toBe(false);
  });
  
  test('should categorize technical architecture files correctly', () => {
    expect(agent.isTechnicalArchitectureFile('specs/technical/architecture.md')).toBe(true);
    expect(agent.isTechnicalArchitectureFile('specs/technical/adrs/ADR-001-technology-stack-selection.md')).toBe(true);
    expect(agent.isTechnicalArchitectureFile('infra/docker-compose.yml')).toBe(true);
    expect(agent.isTechnicalArchitectureFile('src/models/db.js')).toBe(true);
    expect(agent.isTechnicalArchitectureFile('specs/features/user-management.md')).toBe(false);
  });
  
  test('should infer file types correctly', () => {
    expect(agent.inferFileType('specs/features', 'user-management.md')).toBe('feature_spec');
    expect(agent.inferFileType('specs/technical', 'architecture.md')).toBe('technical_spec');
    expect(agent.inferFileType('tests', 'authController.test.js')).toBe('unit_test');
    expect(agent.inferFileType('src/controllers', 'authController.js')).toBe('controller');
    expect(agent.inferFileType('src/models', 'userModel.js')).toBe('model');
    expect(agent.inferFileType('infra', 'docker-compose.yml')).toBe('infrastructure');
  });
  
  test('should generate meaningful file descriptions', () => {
    const desc1 = agent.generateFileDescription('specs/features', 'user-management.md');
    expect(desc1).toContain('user management feature specification');
    
    const desc2 = agent.generateFileDescription('tests', 'authController.test.js');
    expect(desc2).toContain('auth controller');
    expect(desc2).toContain('unit tests');
    
    const desc3 = agent.generateFileDescription('src/controllers', 'projectController.js');
    expect(desc3).toContain('project controller implementation');
  });
  
  test('should update spaces mapping successfully', async () => {
    agent.loadConfig();
    const initialConfigStr = JSON.stringify(agent.config);
    
    const hasChanges = await agent.updateSpacesMapping();
    
    // Configuration should be loaded and potentially updated
    expect(agent.config).toBeDefined();
    expect(agent.config.spaces).toBeDefined();
    
    // Check that spaces still exist
    expect(agent.config.spaces.user_management).toBeDefined();
    expect(agent.config.spaces.collaborative_spec_editing).toBeDefined();
    expect(agent.config.spaces.test_coverage_cicd).toBeDefined();
    expect(agent.config.spaces.technical_architecture).toBeDefined();
  });
});