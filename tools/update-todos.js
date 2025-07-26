const fs = require('fs');
const path = require('path');

class TodoManager {
    constructor() {
        this.specsDir = path.join(__dirname, '..', 'specs');
        this.srcDir = path.join(__dirname, '..', 'src');
        this.planningDir = path.join(__dirname, '..', 'planning');
        this.todoFile = path.join(__dirname, '..', 'TODO.md');
        
        // Planning file paths
        this.planningFiles = {
            feature: path.join(this.planningDir, 'TODO.feature.md'),
            specs: path.join(this.planningDir, 'TODO.specs.md'),
            tests: path.join(this.planningDir, 'TODO.tests.md'),
            techdebt: path.join(this.planningDir, 'TODO.techdebt.md'),
            devops: path.join(this.planningDir, 'TODO.devops.md'),
            context: path.join(this.planningDir, 'TODO.context.md')
        };
    }

    async updateTodos() {
        console.log('🎯 Updating planning files from specifications and codebase...');

        // Ensure planning directory exists
        if (!fs.existsSync(this.planningDir)) {
            fs.mkdirSync(this.planningDir);
        }

        const todos = {
            features: await this.extractFeatureTodos(),
            technical: await this.extractTechnicalTodos(),
            tests: await this.extractTestTodos(),
            specs: await this.extractSpecTodos()
        };

        // Update individual planning files
        await this.updateFeatureTodos(todos.features);
        await this.updateSpecsTodos(todos.specs);
        await this.updateTestsTodos(todos.tests);
        await this.updateTechDebtTodos(todos.technical);
        
        // Update dashboard
        const dashboardContent = this.generateDashboardContent(todos);
        fs.writeFileSync(this.todoFile, dashboardContent);
        
        console.log('✅ All planning files updated successfully!');
    }

    async extractFeatureTodos() {
        const featuresDir = path.join(this.specsDir, 'features');
        const todos = [];

        // Add frontend implementation as a synthetic feature
        const frontendComponentsDir = path.join(__dirname, '..', 'frontend', 'src', 'components');
        if (fs.existsSync(frontendComponentsDir)) {
            const components = fs.readdirSync(frontendComponentsDir).filter(f => f.endsWith('.tsx'));
            if (components.length > 5) {
                todos.push({
                    name: 'Frontend Application Implementation',
                    file: 'frontend/src/',
                    status: 'completed',
                    tasks: [
                        { completed: true, description: 'React application structure with TypeScript' },
                        { completed: true, description: 'Authentication system (AuthPage, login/logout)' },
                        { completed: true, description: 'Dashboard component for project management' },
                        { completed: true, description: 'Project creation and management UI (CreateProjectModal)' },
                        { completed: true, description: 'Project detail view (ProjectDetail)' },
                        { completed: true, description: 'Specification management (SpecificationManagement, CreateSpecModal, UploadSpecModal)' },
                        { completed: true, description: 'Collaborator management (CollaboratorManagement, AddCollaboratorModal)' },
                        { completed: true, description: 'Authentication context and services' },
                        { completed: true, description: 'CSS styling for all components' },
                        { completed: true, description: 'Test files for core components' }
                    ]
                });
            }
        }

        if (!fs.existsSync(featuresDir)) return todos;

        const featureFiles = fs.readdirSync(featuresDir).filter(f => f.endsWith('.md'));
        
        for (const file of featureFiles) {
            const filePath = path.join(featuresDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Extract feature name from title
            const titleMatch = content.match(/^#\s+(.+)/m);
            const featureName = titleMatch ? titleMatch[1] : file.replace('.md', '');
            
            // Check if feature has implementation status
            const implementationStatus = this.checkFeatureImplementation(featureName);
            
            todos.push({
                name: featureName,
                file: `specs/features/${file}`,
                status: implementationStatus === 'completed' ? 'completed' : 
                       implementationStatus === 'in-progress' ? 'in-progress' : 'planned',
                tasks: this.extractTasksFromContent(content)
            });
        }

        return todos;
    }

    async extractTechnicalTodos() {
        const todos = [];
        
        // Scan source files for TODO comments
        const sourceFiles = this.getAllSourceFiles();
        
        for (const file of sourceFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const todoMatches = content.match(/\/\/\s*(TODO|FIXME|HACK|NOTE):?\s*(.+)/gi);
            
            if (todoMatches) {
                const relativePath = path.relative(path.join(__dirname, '..'), file);
                todos.push({
                    file: relativePath,
                    todos: todoMatches.map(match => {
                        const [, type, description] = match.match(/\/\/\s*(TODO|FIXME|HACK|NOTE):?\s*(.+)/i);
                        return { type, description };
                    })
                });
            }
        }

        return todos;
    }

    async extractTestTodos() {
        const testsDir = path.join(this.specsDir, 'tests');
        const todos = [];

        if (!fs.existsSync(testsDir)) return todos;

        const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.md'));
        
        for (const file of testFiles) {
            const filePath = path.join(testsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            const titleMatch = content.match(/^#\s+(.+)/m);
            const testName = titleMatch ? titleMatch[1] : file.replace('.md', '');
            
            todos.push({
                name: testName,
                file: `specs/tests/${file}`,
                needsImplementation: !this.checkTestImplementation(testName)
            });
        }

        return todos;
    }

    async extractSpecTodos() {
        const todos = [];
        
        // Dynamically discover all specification files
        const allSpecs = this.getAllSpecFiles();
        const coreSpecs = this.getCoreSpecifications();
        
        // Check for missing core specifications
        for (const coreSpec of coreSpecs) {
            const specExists = allSpecs.some(spec => spec.relativePath === coreSpec.path);
            
            if (!specExists) {
                todos.push({
                    type: 'missing',
                    spec: coreSpec.path,
                    priority: coreSpec.priority || 'high',
                    description: coreSpec.description
                });
            }
        }
        
        // Check existing specs for completeness
        for (const spec of allSpecs) {
            const content = fs.readFileSync(spec.fullPath, 'utf8');
            
            // Check if spec appears incomplete (very short or has placeholder content)
            const isIncomplete = this.isSpecIncomplete(content, spec.relativePath);
            
            if (isIncomplete) {
                todos.push({
                    type: 'incomplete',
                    spec: spec.relativePath,
                    priority: this.getSpecPriority(spec.relativePath),
                    reason: isIncomplete
                });
            }
        }
        
        return todos;
    }

    getAllSpecFiles() {
        const specs = [];
        
        function scanSpecDir(dir, relativePath = '') {
            if (!fs.existsSync(dir)) return;
            
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relPath = path.join(relativePath, entry.name);
                
                if (entry.isDirectory()) {
                    scanSpecDir(fullPath, relPath);
                } else if (entry.name.endsWith('.md')) {
                    specs.push({
                        fullPath,
                        relativePath: relPath.replace(/\\/g, '/'), // Normalize path separators
                        name: entry.name,
                        directory: relativePath || 'root'
                    });
                }
            }
        }
        
        scanSpecDir(this.specsDir);
        return specs;
    }

    getCoreSpecifications() {
        // Define core specifications that every project should have
        // These can be customized based on your project needs
        return [
            {
                path: 'product-intent.md',
                priority: 'high',
                description: 'Core product vision and objectives'
            },
            {
                path: 'product-overview/architecture.md',
                priority: 'high',
                description: 'Technology stack and system architecture'
            },
            {
                path: 'product-overview/api-routes.md',
                priority: 'high',
                description: 'API endpoint specifications'
            },
            {
                path: 'product-overview/db-schema.md',
                priority: 'high',
                description: 'Database schema definition'
            },
            {
                path: 'product-overview/data-model.md',
                priority: 'medium',
                description: 'Entity relationships and data structures'
            },
            {
                path: 'product-overview/use-cases.md',
                priority: 'medium',
                description: 'User stories and scenarios'
            },
            {
                path: 'product-overview/ux.md',
                priority: 'medium',
                description: 'User experience guidelines'
            },
            {
                path: 'product-overview/security.md',
                priority: 'high',
                description: 'Security considerations and authentication'
            },
            {
                path: 'product-overview/deployment.md',
                priority: 'medium',
                description: 'Deployment and infrastructure guidelines'
            }
        ];
    }

    isSpecIncomplete(content, specPath) {
        // Multiple checks for spec completeness
        
        // Check 1: Very short content (likely just a title)
        if (content.trim().length < 200) {
            return 'Very short content (< 200 characters)';
        }
        
        // Check 2: Contains placeholder text
        const placeholders = [
            'TODO:', 'TBD', 'To be determined', 'Coming soon',
            'Placeholder', 'Draft', 'WIP', 'Work in progress'
        ];
        
        for (const placeholder of placeholders) {
            if (content.toLowerCase().includes(placeholder.toLowerCase())) {
                return `Contains placeholder text: "${placeholder}"`;
            }
        }
        
        // Check 3: Critical specs need specific content
        if (specPath.includes('db-schema.md') && !content.includes('CREATE TABLE')) {
            return 'Database schema missing table definitions';
        }
        
        if (specPath.includes('api-routes.md') && !content.match(/(GET|POST|PUT|DELETE)/)) {
            return 'API routes missing HTTP method definitions';
        }
        
        if (specPath.includes('architecture.md') && !content.toLowerCase().includes('technology')) {
            return 'Architecture missing technology stack information';
        }
        
        // Check 4: Only has a title and no real content
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 5) {
            return 'Too few content lines (appears to be just a title)';
        }
        
        return false; // Spec appears complete
    }

    getSpecPriority(specPath) {
        const highPriority = ['architecture', 'api-routes', 'db-schema', 'security'];
        const lowPriority = ['ux', 'deployment', 'examples'];
        
        for (const high of highPriority) {
            if (specPath.includes(high)) return 'high';
        }
        
        for (const low of lowPriority) {
            if (specPath.includes(low)) return 'low';
        }
        
        return 'medium';
    }

    checkFeatureImplementation(featureName) {
        // Check if feature has corresponding route/controller implementation
        const routes = ['auth.js', 'projects.js', 'specs.js'];
        const controllers = ['authController.js', 'projectController.js', 'specController.js'];
        
        // Simple heuristic: if feature name matches existing files, it's in progress
        const normalizedName = featureName.toLowerCase().replace(/\s+/g, '');
        
        // Check for specific completed features
        if (normalizedName.includes('project') && normalizedName.includes('creation')) {
            // Check if both frontend and backend components exist
            const frontendExists = fs.existsSync(path.join(__dirname, '..', 'frontend', 'src', 'components', 'CreateProjectModal.tsx'));
            const backendExists = fs.existsSync(path.join(__dirname, '..', 'src', 'controllers', 'projectController.js'));
            return frontendExists && backendExists ? 'completed' : 'in-progress';
        }
        
        // Check for frontend implementation - if there are React components, frontend is completed
        if (normalizedName.includes('frontend') || featureName.toLowerCase().includes('frontend')) {
            const frontendComponentsDir = path.join(__dirname, '..', 'frontend', 'src', 'components');
            if (fs.existsSync(frontendComponentsDir)) {
                const components = fs.readdirSync(frontendComponentsDir).filter(f => f.endsWith('.tsx'));
                return components.length > 5 ? 'completed' : 'in-progress';
            }
        }
        
        return routes.some(route => route.includes(normalizedName.substring(0, 5))) ||
               controllers.some(controller => controller.includes(normalizedName.substring(0, 5))) ? 'in-progress' : 'planned';
    }

    checkTestImplementation(testName) {
        // Check if test files exist
        const testDir = path.join(__dirname, '..', 'test');
        if (!fs.existsSync(testDir)) return false;
        
        const testFiles = fs.readdirSync(testDir, { recursive: true });
        return testFiles.some(file => file.includes(testName.toLowerCase().replace(/\s+/g, '')));
    }

    extractTasksFromContent(content) {
        // Extract task lists from markdown content
        const taskMatches = content.match(/^[-*]\s+\[.\]\s+(.+)/gm);
        return taskMatches ? taskMatches.map(task => {
            const [, checked, description] = task.match(/^[-*]\s+\[(.)\]\s+(.+)/);
            return {
                completed: checked === 'x',
                description: description
            };
        }) : [];
    }

    getAllSourceFiles() {
        const files = [];
        
        function scanDir(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    scanDir(fullPath);
                } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
                    files.push(fullPath);
                }
            }
        }
        
        if (fs.existsSync(this.srcDir)) {
            scanDir(this.srcDir);
        }
        return files;
    }

    async updateFeatureTodos(features) {
        const timestamp = new Date().toISOString().split('T')[0];
        
        const completedFeatures = features.filter(f => f.status === 'completed');
        const inProgressFeatures = features.filter(f => f.status === 'in-progress');
        const plannedFeatures = features.filter(f => f.status === 'planned');
        
        let content = `# Feature Implementation TODOs

## ✅ Completed Features

${this.generateFeatureTasks(completedFeatures)}

## 🚧 In Progress Features

${this.generateFeatureTasks(inProgressFeatures)}

## 📝 Planned Features

${this.generateFeatureTasks(plannedFeatures)}

---
*Last updated: ${timestamp}*
*This file is automatically updated by the planning automation system.*
*Cross-references: See [TODO.tests.md](TODO.tests.md) for related test implementations.*`;
        
        fs.writeFileSync(this.planningFiles.feature, content);
    }

    async updateSpecsTodos(specs) {
        const timestamp = new Date().toISOString().split('T')[0];
        
        const content = `# Specification Completeness TODOs

${this.generateSpecTodos(specs)}

---
*Last updated: ${timestamp}*
*This file is automatically updated by the planning automation system.*
*Cross-references: See [TODO.feature.md](TODO.feature.md) for feature implementations requiring these specs.*`;
        
        fs.writeFileSync(this.planningFiles.specs, content);
    }

    async updateTestsTodos(tests) {
        const timestamp = new Date().toISOString().split('T')[0];
        
        const content = `# Test Coverage & Testing TODOs

## Test Implementation Status

${this.generateTestTodos(tests)}

## Test Infrastructure Improvements

- [ ] Fix Jest test runner configuration
- [ ] Set up test database for CI/CD pipeline
- [ ] Add integration test framework
- [ ] Implement automated test data setup/teardown
- [ ] Add test coverage reporting
- [ ] Set up performance testing
- [ ] Add API endpoint testing
- [ ] Create test utilities for common scenarios

## CI/CD Testing Gaps

- [ ] Add automated test runs on pull requests
- [ ] Set up test environment provisioning
- [ ] Configure test result reporting
- [ ] Add test failure notifications
- [ ] Implement parallel test execution
- [ ] Add browser/E2E testing pipeline

---
*Last updated: ${timestamp}*
*This file is automatically updated by the planning automation system.*
*Cross-references: See [TODO.devops.md](TODO.devops.md) for CI/CD infrastructure and [TODO.feature.md](TODO.feature.md) for feature test cases.*`;
        
        fs.writeFileSync(this.planningFiles.tests, content);
    }

    async updateTechDebtTodos(technical) {
        const timestamp = new Date().toISOString().split('T')[0];
        
        const content = `# Technical Debt & Code Quality TODOs

## Code Quality Improvements

- [ ] Enhance API error handling and validation
- [ ] Add input validation middleware
- [ ] Implement proper logging and monitoring
- [ ] Add comprehensive code documentation
- [ ] Standardize error response formats
- [ ] Implement request/response logging
- [ ] Add code linting and formatting rules
- [ ] Set up automated code quality checks

## Refactoring Tasks

- [ ] Extract database connection logic into service layer
- [ ] Implement proper dependency injection
- [ ] Standardize API response structures
- [ ] Create reusable middleware components
- [ ] Implement proper configuration management
- [ ] Add type definitions for better IDE support
- [ ] Optimize database query performance
- [ ] Implement caching strategies

## Security Improvements

- [ ] Add security headers middleware
- [ ] Implement proper session management
- [ ] Add CORS configuration
- [ ] Implement rate limiting
- [ ] Add request validation and sanitization
- [ ] Set up security audit tools
- [ ] Implement proper authentication token handling
- [ ] Add OWASP security recommendations

## Code TODOs from Codebase

${this.generateTechnicalTodos(technical)}

---
*Last updated: ${timestamp}*
*This file is automatically updated by the planning automation system.*
*Cross-references: See [TODO.tests.md](TODO.tests.md) for testing improvements and [TODO.devops.md](TODO.devops.md) for deployment security.*`;
        
        fs.writeFileSync(this.planningFiles.techdebt, content);
    }

    generateDashboardContent(todos) {
        const timestamp = new Date().toISOString().split('T')[0];
        
        return `# Project TODO Dashboard

## 📊 Planning Overview

This project uses a centralized planning system with area-specific TODO files to organize work by functional domain. All detailed tasks are maintained in the \`/planning\` folder.

### Planning File Structure

| Area | File | Description | Status |
|------|------|-------------|---------|
| **Features** | [\`planning/TODO.feature.md\`](planning/TODO.feature.md) | Feature implementation tasks | 🔄 Active |
| **Specifications** | [\`planning/TODO.specs.md\`](planning/TODO.specs.md) | Spec completeness and updates | 🔄 Active |
| **Testing** | [\`planning/TODO.tests.md\`](planning/TODO.tests.md) | Test coverage and CI gaps | 🔄 Active |
| **Tech Debt** | [\`planning/TODO.techdebt.md\`](planning/TODO.techdebt.md) | Code quality and refactoring | 🔄 Active |
| **DevOps** | [\`planning/TODO.devops.md\`](planning/TODO.devops.md) | Infrastructure and deployment | 🔄 Active |
| **Context** | [\`planning/TODO.context.md\`](planning/TODO.context.md) | Copilot and context management | 🔄 Active |

## 🎯 Current Sprint Priorities

### High Priority Items
${this.generateHighPriorityDashboardTasks(todos)}

### Medium Priority Items
${this.generateMediumPriorityDashboardTasks(todos)}

## 📈 Progress Summary

| Area | Total Tasks | Completed | In Progress | Planned |
|------|-------------|-----------|-------------|---------|
| Features | ~${this.countTasks(todos.features)} | ${this.calculateFeatureProgress(todos.features).completed}% | ${this.calculateFeatureProgress(todos.features).in_progress}% | ${this.calculateFeatureProgress(todos.features).planned}% |
| Specifications | ~${todos.specs.length} | ${this.calculateSpecProgress(todos.specs).completed}% | ${this.calculateSpecProgress(todos.specs).in_progress}% | ${this.calculateSpecProgress(todos.specs).planned}% |
| Testing | ~${todos.tests.length + 12} | 10% | 15% | 75% |
| Tech Debt | ~${todos.technical.length + 18} | 5% | 15% | 80% |
| DevOps | ~30 | 5% | 10% | 85% |
| Context | ~25 | 60% | 25% | 15% |

## 🔄 How to Use This Planning System

### For Contributors
1. **Browse by area**: Navigate to the appropriate planning file for your work area
2. **Find tasks**: Look for \`[ ]\` unchecked items that match your expertise
3. **Check dependencies**: Review cross-references to other planning files
4. **Update progress**: Check off completed items and add new ones as needed

### For Agents/Automation
1. **Scan all planning files**: Use \`npm run update-todos\` to refresh from specifications
2. **Follow cross-references**: Links between files indicate dependencies
3. **Update status**: Modify planning files when implementing features or fixing issues
4. **Maintain consistency**: Ensure changes are reflected across related planning files

### For Project Management
- **Dashboard**: This file provides the high-level overview
- **Detailed planning**: Area-specific files contain comprehensive task lists
- **Progress tracking**: Status updates should be reflected in both detailed and dashboard views
- **Cross-functional coordination**: Use cross-references to coordinate between areas

## 🔗 Quick Links

- **Development**: [Features](planning/TODO.feature.md) → [Tech Debt](planning/TODO.techdebt.md) → [Testing](planning/TODO.tests.md)
- **Documentation**: [Specifications](planning/TODO.specs.md) → [Context](planning/TODO.context.md)
- **Operations**: [DevOps](planning/TODO.devops.md) → [Testing](planning/TODO.tests.md)

---

*Last updated: ${timestamp}*  
*Run \`npm run update-todos\` to refresh all planning files from current specifications*  
*Planning system automatically maintains cross-references and task organization*
`;
    }

    generateHighPriorityDashboardTasks(todos) {
        const high = [];
        
        // Features in progress
        todos.features.filter(f => f.status === 'in-progress').forEach(feature => {
            high.push(`- [ ] Complete ${feature.name} implementation ([Features](planning/TODO.feature.md))`);
        });
        
        // Missing critical specs
        todos.specs.filter(s => s.type === 'missing' && s.priority === 'high').forEach(spec => {
            high.push(`- [ ] Create missing ${spec.spec.split('/').pop().replace('.md', '')} specification ([Specs](planning/TODO.specs.md))`);
        });
        
        // Incomplete critical specs
        todos.specs.filter(s => s.type === 'incomplete' && s.priority === 'high').forEach(spec => {
            high.push(`- [ ] Complete ${spec.spec.split('/').pop().replace('.md', '')} specification ([Specs](planning/TODO.specs.md))`);
        });
        
        return high.length ? high.join('\n') : '- [ ] No high priority tasks identified';
    }

    generateMediumPriorityDashboardTasks(todos) {
        const medium = [
            '- [ ] Enhance API error handling ([Tech Debt](planning/TODO.techdebt.md))',
            '- [ ] Add comprehensive test coverage ([Testing](planning/TODO.tests.md))',
            '- [ ] Set up CI/CD pipeline ([DevOps](planning/TODO.devops.md))',
            '- [ ] Complete draft specifications ([Specs](planning/TODO.specs.md))'
        ];
        
        return medium.join('\n');
    }

    countTasks(features) {
        return features.reduce((total, feature) => {
            return total + (feature.tasks ? feature.tasks.length : 1);
        }, 0);
    }

    calculateFeatureProgress(features) {
        const completed = features.filter(f => f.status === 'completed').length;
        const inProgress = features.filter(f => f.status === 'in-progress').length;
        const planned = features.filter(f => f.status === 'planned').length;
        const total = features.length;
        
        if (total === 0) return { completed: 0, in_progress: 0, planned: 0 };
        
        return {
            completed: Math.round((completed / total) * 100),
            in_progress: Math.round((inProgress / total) * 100),
            planned: Math.round((planned / total) * 100)
        };
    }

    calculateSpecProgress(specs) {
        // Count specifications by looking at all spec files
        const allSpecs = this.getAllSpecFiles();
        const totalSpecs = allSpecs.length;
        const incompleteSpecs = specs.length; // specs array contains incomplete ones
        const completedSpecs = Math.max(0, totalSpecs - incompleteSpecs);
        
        if (totalSpecs === 0) return { completed: 0, in_progress: 0, planned: 0 };
        
        const completedPercent = Math.round((completedSpecs / totalSpecs) * 100);
        const incompletePercent = Math.round((incompleteSpecs / totalSpecs) * 100);
        const plannedPercent = Math.max(0, 100 - completedPercent - incompletePercent);
        
        return {
            completed: completedPercent,
            in_progress: incompletePercent,
            planned: plannedPercent
        };
    }

    generateHighPriorityTasks(todos) {
        const high = [];
        
        // Features in progress
        todos.features.filter(f => f.status === 'in-progress').forEach(feature => {
            high.push(`- [ ] Complete ${feature.name} implementation`);
        });
        
        // Missing critical specs
        todos.specs.filter(s => s.type === 'missing' && s.priority === 'high').forEach(spec => {
            high.push(`- [ ] Create missing specification: ${spec.spec} (${spec.description})`);
        });
        
        // Incomplete critical specs
        todos.specs.filter(s => s.type === 'incomplete' && s.priority === 'high').forEach(spec => {
            high.push(`- [ ] Complete specification: ${spec.spec} - ${spec.reason}`);
        });
        
        return high.length ? high.join('\n') : '- [ ] No high priority tasks identified';
    }

    generateMediumPriorityTasks(todos) {
        const medium = [
            '- [ ] Enhance API error handling and validation',
            '- [ ] Add comprehensive test coverage',
            '- [ ] Implement proper logging and monitoring',
            '- [ ] Add input validation middleware'
        ];
        
        // Add medium priority spec tasks
        todos.specs.filter(s => s.priority === 'medium').forEach(spec => {
            if (spec.type === 'missing') {
                medium.push(`- [ ] Create ${spec.spec} (${spec.description})`);
            } else if (spec.type === 'incomplete') {
                medium.push(`- [ ] Complete ${spec.spec} - ${spec.reason}`);
            }
        });
        
        return medium.join('\n');
    }

    generateFeatureTasks(features) {
        if (!features.length) return '- No features in this category';
        
        return features.map(feature => {
            const isCompleted = feature.status === 'completed';
            let output = `- [${isCompleted ? 'x' : ' '}] **${feature.name}** (\`${feature.file}\`)`;
            if (feature.tasks && feature.tasks.length) {
                output += '\n' + feature.tasks.map(task => 
                    `  - [${task.completed || isCompleted ? 'x' : ' '}] ${task.description}`
                ).join('\n');
            }
            return output;
        }).join('\n');
    }

    generateTechnicalTodos(technical) {
        if (!technical.length) return '- No technical TODOs found in codebase';
        
        return technical.map(file => {
            let output = `\n### ${file.file}`;
            output += '\n' + file.todos.map(todo => 
                `- [ ] **${todo.type}**: ${todo.description}`
            ).join('\n');
            return output;
        }).join('\n');
    }

    generateTestTodos(tests) {
        if (!tests.length) return '- No test specifications found';
        
        return tests.map(test => {
            const status = test.needsImplementation ? '[ ]' : '[x]';
            return `- ${status} **${test.name}** (\`${test.file}\`)`;
        }).join('\n');
    }

    generateSpecTodos(specs) {
        if (!specs.length) return '- All specifications are complete and up to date';
        
        const missing = specs.filter(s => s.type === 'missing');
        const incomplete = specs.filter(s => s.type === 'incomplete');
        
        let output = '';
        
        if (missing.length) {
            output += '\n### Missing Specifications\n';
            output += missing.map(spec => 
                `- [ ] **${spec.spec}** (${spec.priority} priority) - ${spec.description}`
            ).join('\n');
        }
        
        if (incomplete.length) {
            output += '\n### Incomplete Specifications\n';
            output += incomplete.map(spec => 
                `- [ ] **${spec.spec}** (${spec.priority} priority) - ${spec.reason}`
            ).join('\n');
        }
        
        return output || '- All specifications are complete';
    }
}

// CLI usage
if (require.main === module) {
    const manager = new TodoManager();
    manager.updateTodos().catch(console.error);
}

module.exports = TodoManager;