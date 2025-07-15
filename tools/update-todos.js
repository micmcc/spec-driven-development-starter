const fs = require('fs');
const path = require('path');

class TodoManager {
    constructor() {
        this.specsDir = path.join(__dirname, '..', 'specs');
        this.srcDir = path.join(__dirname, '..', 'src');
        this.todoFile = path.join(__dirname, '..', 'TODO.md');
    }

    async updateTodos() {
        console.log('🎯 Updating TODO.md from specifications and codebase...');

        const todos = {
            features: await this.extractFeatureTodos(),
            technical: await this.extractTechnicalTodos(),
            tests: await this.extractTestTodos(),
            specs: await this.extractSpecTodos()
        };

        const todoContent = this.generateTodoContent(todos);
        
        fs.writeFileSync(this.todoFile, todoContent);
        console.log('✅ TODO.md updated successfully!');
    }

    async extractFeatureTodos() {
        const featuresDir = path.join(this.specsDir, 'features');
        const todos = [];

        if (!fs.existsSync(featuresDir)) return todos;

        const featureFiles = fs.readdirSync(featuresDir).filter(f => f.endsWith('.md'));
        
        for (const file of featureFiles) {
            const filePath = path.join(featuresDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Extract feature name from title
            const titleMatch = content.match(/^#\s+(.+)/m);
            const featureName = titleMatch ? titleMatch[1] : file.replace('.md', '');
            
            // Check if feature has implementation status
            const hasImplementation = this.checkFeatureImplementation(featureName);
            
            todos.push({
                name: featureName,
                file: `specs/features/${file}`,
                status: hasImplementation ? 'in-progress' : 'planned',
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
        
        return routes.some(route => route.includes(normalizedName.substring(0, 5))) ||
               controllers.some(controller => controller.includes(normalizedName.substring(0, 5)));
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

    generateTodoContent(todos) {
        const timestamp = new Date().toISOString().split('T')[0];
        
        return `# Project Goals & Tasks

## 🎯 Current Sprint Goals

### High Priority
${this.generateHighPriorityTasks(todos)}

### Medium Priority
${this.generateMediumPriorityTasks(todos)}

## 📋 Feature Implementation Status

### 🚧 In Progress Features
${this.generateFeatureTasks(todos.features.filter(f => f.status === 'in-progress'))}

### 📝 Planned Features
${this.generateFeatureTasks(todos.features.filter(f => f.status === 'planned'))}

## 🔧 Technical Debt & Code TODOs

${this.generateTechnicalTodos(todos.technical)}

## 🧪 Test Implementation Status

${this.generateTestTodos(todos.tests)}

## 📖 Specification Status

${this.generateSpecTodos(todos.specs)}

## 🚀 Infrastructure & DevOps

- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Add database migrations
- [ ] Implement backup strategy
- [ ] Set up monitoring and alerting

## 📊 Context Management Tasks

- [x] Automated quick reference updates
- [x] Automated copilot instructions updates
- [x] Spec extraction for context
- [ ] Git hooks for automatic context updates
- [ ] CI/CD integration for context synchronization
- [ ] Validation that code matches specifications

---

*Last updated: ${timestamp}*
*Run \`npm run update-todos\` to sync with current specifications*
*Automatically scans all specification files for completeness*
`;
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
            let output = `- [ ] **${feature.name}** (\`${feature.file}\`)`;
            if (feature.tasks && feature.tasks.length) {
                output += '\n' + feature.tasks.map(task => 
                    `  - [${task.completed ? 'x' : ' '}] ${task.description}`
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