"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedPromptEngine = void 0;
var vscode = require("vscode");
/**
 * Enhanced prompt engine based on Cline's componentized architecture and Qoder-style prompts
 */
var EnhancedPromptEngine = /** @class */ (function () {
    function EnhancedPromptEngine() {
        this.systemPromptComponents = {
            'agentRole': this.getAgentRole.bind(this),
            'objective': this.getObjective.bind(this),
            'rules': this.getRules.bind(this),
            'capabilities': this.getCapabilities.bind(this),
            'editingFiles': this.getEditingFiles.bind(this),
            'taskProgress': this.getTaskProgress.bind(this),
            'feedback': this.getFeedback.bind(this),
            'systemInfo': this.getSystemInfo.bind(this)
        };
        this.taskSpecificPrompts = {
            'java': this.getJavaTaskPrompt.bind(this),
            'python': this.getPythonTaskPrompt.bind(this),
            'typescript': this.getTypeScriptTaskPrompt.bind(this),
            'javascript': this.getJavaScriptTaskPrompt.bind(this),
            'react': this.getReactTaskPrompt.bind(this),
            'vue': this.getVueTaskPrompt.bind(this),
            'general': this.getGeneralTaskPrompt.bind(this)
        };
    }
    /**
     * Generate a high-quality prompt based on Qoder and Cline best practices
     */
    EnhancedPromptEngine.prototype.generateEnhancedPrompt = function (task, context, options) {
        var _a, _b, _c, _d, _e;
        if (options === void 0) { options = {}; }
        var includeSystemPrompt = (_a = options.includeSystemPrompt) !== null && _a !== void 0 ? _a : true;
        var includeContext = (_b = options.includeContext) !== null && _b !== void 0 ? _b : true;
        var languageSpecific = (_c = options.languageSpecific) !== null && _c !== void 0 ? _c : true;
        var prompt = '';
        // System prompt (based on Cline's componentized system)
        if (includeSystemPrompt) {
            prompt += this.generateSystemPrompt(context);
        }
        // Context information
        if (includeContext && context) {
            prompt += this.generateContextSection(context);
        }
        // Task-specific prompt (Qoder-style)
        var language = this.determineLanguage(context);
        var taskPrompt = languageSpecific
            ? ((_e = (_d = this.taskSpecificPrompts)[language]) === null || _e === void 0 ? void 0 : _e.call(_d, task, context)) || this.taskSpecificPrompts['general'](task, context)
            : this.taskSpecificPrompts['general'](task, context);
        prompt += taskPrompt;
        return prompt;
    };
    /**
     * Generate Cline-style system prompt with components
     */
    EnhancedPromptEngine.prototype.generateSystemPrompt = function (context) {
        var components = [
            'agentRole',
            'objective',
            'rules',
            'capabilities',
            'editingFiles',
            'taskProgress',
            'feedback',
            'systemInfo'
        ];
        var systemPrompt = '# SYSTEM PROMPT\n\n';
        for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
            var component = components_1[_i];
            var componentText = this.systemPromptComponents[component](context);
            if (componentText) {
                systemPrompt += componentText + '\n\n';
            }
        }
        return systemPrompt;
    };
    /**
     * Generate context section based on project analysis
     */
    EnhancedPromptEngine.prototype.generateContextSection = function (context) {
        var _a;
        var contextSection = '# CONTEXT\n\n';
        // Project overview
        if (context.projectType) {
            contextSection += "## Project Overview\n";
            contextSection += "- **Project Type**: ".concat(context.projectType, "\n");
            if (context.language)
                contextSection += "- **Primary Language**: ".concat(context.language, "\n");
            if (context.framework)
                contextSection += "- **Framework**: ".concat(context.framework, "\n");
            contextSection += '\n';
        }
        // Code style
        if (context.codeStyle && Object.keys(context.codeStyle).length > 0) {
            contextSection += "## Code Style Guidelines\n";
            for (var _i = 0, _b = Object.entries(context.codeStyle); _i < _b.length; _i++) {
                var _c = _b[_i], key = _c[0], value = _c[1];
                contextSection += "- **".concat(key, "**: ").concat(value, "\n");
            }
            contextSection += '\n';
        }
        // Dependencies (top 10)
        if (context.dependencies && context.dependencies.length > 0) {
            var topDeps = context.dependencies.slice(0, 10);
            contextSection += "## Key Dependencies (Top ".concat(topDeps.length, ")\n");
            topDeps.forEach(function (dep) {
                contextSection += "- ".concat(dep, "\n");
            });
            contextSection += '\n';
        }
        // Recent changes (if available in enhanced context)
        if ((_a = context.relevantContext) === null || _a === void 0 ? void 0 : _a.recentChanges) {
            var recentChanges = context.relevantContext.recentChanges.slice(0, 5);
            contextSection += "## Recently Modified Files\n";
            recentChanges.forEach(function (file) {
                contextSection += "- ".concat(file, "\n");
            });
            contextSection += '\n';
        }
        return contextSection;
    };
    /**
     * Determine language from context
     */
    EnhancedPromptEngine.prototype.determineLanguage = function (context) {
        if (context.projectType === 'java' || context.language === 'java')
            return 'java';
        if (context.projectType === 'python' || context.language === 'python')
            return 'python';
        if (context.projectType === 'typescript' || context.language === 'typescript')
            return 'typescript';
        if (context.projectType === 'javascript' || context.language === 'javascript')
            return 'javascript';
        if (context.projectType === 'react')
            return 'react';
        if (context.projectType === 'vue')
            return 'vue';
        return 'general';
    };
    // === System Prompt Components (Cline-style) ===
    EnhancedPromptEngine.prototype.getAgentRole = function (context) {
        return "## AGENT ROLE\nYou are CodeLine, an expert AI coding assistant designed to help developers write high-quality code efficiently. You have deep knowledge of software engineering principles, design patterns, and best practices across multiple languages and frameworks.";
    };
    EnhancedPromptEngine.prototype.getObjective = function (context) {
        return "## OBJECTIVE\nYour primary objective is to understand the user's task and provide accurate, efficient, and production-ready solutions. You should:\n1. Analyze the task requirements thoroughly\n2. Consider edge cases and error handling\n3. Follow established coding standards\n4. Optimize for performance and maintainability\n5. Provide clear explanations when needed";
    };
    EnhancedPromptEngine.prototype.getRules = function (context) {
        var workspaceFolders = vscode.workspace.workspaceFolders;
        var cwd = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : process.cwd();
        return "## RULES\n- **Current Working Directory**: ".concat(cwd, "\n- Always write clean, maintainable, and well-documented code\n- Follow language-specific best practices and style guides\n- Add appropriate error handling and input validation\n- Consider performance implications and optimize where necessary\n- Use meaningful variable and function names\n- Write code that is testable and modular\n- Respect existing project structure and conventions\n- When modifying files, ensure backward compatibility\n- Provide code that is secure and follows security best practices");
    };
    EnhancedPromptEngine.prototype.getCapabilities = function (context) {
        return "## CAPABILITIES\n- **Multi-language Support**: Java, Python, JavaScript, TypeScript, Go, Rust, C++, and more\n- **Framework Expertise**: Spring Boot, React, Vue, Angular, Django, Flask, Express.js, etc.\n- **Code Analysis**: Static analysis, dependency resolution, architecture pattern recognition\n- **Testing**: Unit tests, integration tests, end-to-end tests\n- **Debugging**: Identifying and fixing bugs, performance issues\n- **Refactoring**: Code quality improvements, architectural improvements\n- **Documentation**: Code comments, API documentation, README files";
    };
    EnhancedPromptEngine.prototype.getEditingFiles = function (context) {
        return "## EDITING FILES\nWhen making changes to code:\n1. Understand the existing codebase structure\n2. Make minimal changes to achieve the desired functionality\n3. Preserve existing functionality unless explicitly asked to change it\n4. Update related files if necessary (e.g., tests, documentation)\n5. Verify changes don't break existing functionality\n6. Format code according to project conventions";
    };
    EnhancedPromptEngine.prototype.getTaskProgress = function (context) {
        return "## TASK PROGRESS\n- Break down complex tasks into manageable steps\n- Provide incremental progress updates when appropriate\n- Handle errors gracefully and suggest alternatives\n- Complete tasks efficiently without unnecessary complexity\n- Verify solutions before presenting them";
    };
    EnhancedPromptEngine.prototype.getFeedback = function (context) {
        return "## FEEDBACK\n- Be receptive to user feedback and corrections\n- Adapt to user preferences and coding style\n- Clarify requirements when ambiguous\n- Learn from previous interactions in the session";
    };
    EnhancedPromptEngine.prototype.getSystemInfo = function (context) {
        var vscodeVersion = vscode.version;
        var workspaceFolders = vscode.workspace.workspaceFolders;
        var workspaceName = workspaceFolders && workspaceFolders.length > 0
            ? workspaceFolders[0].name
            : 'No workspace';
        return "## SYSTEM INFORMATION\n- **IDE**: VS Code v".concat(vscodeVersion, "\n- **Workspace**: ").concat(workspaceName, "\n- **Environment**: Node.js ").concat(process.version, "\n- **Extension**: CodeLine v0.3.0");
    };
    // === Task-specific Prompts (Qoder-style) ===
    EnhancedPromptEngine.prototype.getJavaTaskPrompt = function (task, context) {
        var isSpring = context.framework === 'spring-boot';
        return "# TASK: ".concat(task, "\n\n## JAVA DEVELOPMENT REQUIREMENTS\n\n### Core Principles\n").concat(isSpring ? '1. Follow Spring Boot best practices and conventions' : '1. Follow Java Enterprise Edition patterns', "\n2. Use appropriate design patterns (Factory, Builder, Strategy, etc.)\n3. Implement proper exception handling and logging\n4. Write thread-safe code when necessary\n5. Follow SOLID principles\n\n### Code Quality\n1. Follow Google Java Style Guide or project-specific conventions\n2. Add comprehensive Javadoc comments\n3. Use meaningful class and method names\n4. Keep methods focused and single-purpose\n5. Avoid code duplication through abstraction\n\n### Testing\n1. Write unit tests with JUnit 5\n2. Include integration tests for critical paths\n3. Use Mockito for mocking dependencies\n4. Achieve meaningful test coverage\n5. Test edge cases and error scenarios\n\n### Output Format\nProvide complete, runnable code including:\n- Package declaration\n- Import statements\n- Class definition with proper visibility\n- Method implementations with error handling\n- Documentation comments\n- Example usage if applicable\n\n").concat(isSpring ? '**Spring Boot Specific**: Use @RestController, @Service, @Repository annotations appropriately. Configure application.properties/yml. Follow dependency injection patterns.' : '', "\n\n**Note**: Ensure backward compatibility and follow existing project structure.");
    };
    EnhancedPromptEngine.prototype.getPythonTaskPrompt = function (task, context) {
        return "# TASK: ".concat(task, "\n\n## PYTHON DEVELOPMENT REQUIREMENTS\n\n### Core Principles\n1. Follow PEP 8 style guide rigorously\n2. Use type hints (PEP 484) for better code clarity\n3. Implement proper exception handling\n4. Write Pythonic code (list comprehensions, generators, context managers)\n5. Follow Zen of Python principles\n\n### Code Quality\n1. Write clean, readable, and maintainable code\n2. Use meaningful variable and function names\n3. Keep functions small and focused (single responsibility)\n4. Add comprehensive docstrings (Google or NumPy style)\n5. Use appropriate data structures and algorithms\n\n### Testing\n1. Write unit tests with pytest or unittest\n2. Include integration tests for critical functionality\n3. Mock external dependencies appropriately\n4. Test edge cases and error conditions\n5. Ensure good test coverage\n\n### Output Format\nProvide complete, runnable code including:\n- Module imports\n- Function/class definitions with type hints\n- Comprehensive docstrings\n- Error handling\n- Example usage in __main__ guard\n- Requirements.txt if needed\n\n**Note**: Consider performance for large datasets, use appropriate libraries (NumPy, Pandas for data tasks).");
    };
    EnhancedPromptEngine.prototype.getTypeScriptTaskPrompt = function (task, context) {
        var isAngular = context.framework === 'angular';
        return "# TASK: ".concat(task, "\n\n## TYPESCRIPT DEVELOPMENT REQUIREMENTS\n\n### Core Principles\n1. Use strict TypeScript configuration (strict: true)\n2. Follow consistent type definitions\n3. Implement proper error handling\n4. Write modular, reusable code\n5. Use modern ES6+ features appropriately\n\n### Code Quality\n1. Follow consistent naming conventions (camelCase, PascalCase)\n2. Use meaningful variable and function names\n3. Keep functions focused and single-purpose\n4. Add comprehensive JSDoc comments\n5. Use interfaces and types for better type safety\n\n### Testing\n1. Write unit tests with Jest or Mocha\n2. Test type correctness in addition to runtime behavior\n3. Mock dependencies appropriately\n4. Include integration tests for complex interactions\n5. Test edge cases and error scenarios\n\n### Output Format\nProvide complete, runnable code including:\n- Type imports and exports\n- Interface/type definitions\n- Function/class implementations\n- Error handling\n- Example usage\n- tsconfig.json recommendations if needed\n\n").concat(isAngular ? '**Angular Specific**: Follow Angular style guide, use dependency injection, implement proper lifecycle hooks.' : '', "\n\n**Note**: Consider bundle size and performance implications.");
    };
    EnhancedPromptEngine.prototype.getJavaScriptTaskPrompt = function (task, context) {
        return "# TASK: ".concat(task, "\n\n## JAVASCRIPT DEVELOPMENT REQUIREMENTS\n\n### Core Principles\n1. Use modern ES6+ features (let/const, arrow functions, destructuring)\n2. Follow functional programming principles where appropriate\n3. Implement proper error handling with try/catch\n4. Write asynchronous code using async/await\n5. Follow JavaScript best practices and patterns\n\n### Code Quality\n1. Write clean, readable, and maintainable code\n2. Use meaningful variable and function names\n3. Keep functions small and focused\n4. Add comprehensive JSDoc comments\n5. Avoid global variables and side effects\n\n### Testing\n1. Write unit tests with Jest, Mocha, or Jasmine\n2. Test both synchronous and asynchronous code\n3. Mock dependencies appropriately\n4. Test edge cases and error scenarios\n5. Ensure good test coverage\n\n### Output Format\nProvide complete, runnable code including:\n- Module imports/exports\n- Function implementations\n- Error handling\n- Example usage\n- Package.json dependencies if needed\n\n**Note**: Consider browser compatibility if targeting web applications.");
    };
    EnhancedPromptEngine.prototype.getReactTaskPrompt = function (task, context) {
        return "# TASK: ".concat(task, "\n\n## REACT DEVELOPMENT REQUIREMENTS\n\n### Core Principles\n1. Follow React Hooks best practices\n2. Use functional components over class components\n3. Implement proper state management\n4. Write pure components when possible\n5. Follow React performance optimization patterns\n\n### Code Quality\n1. Write clean, modular, and reusable components\n2. Use meaningful component and prop names\n3. Keep components focused and single-purpose\n4. Add comprehensive PropTypes or TypeScript interfaces\n5. Separate concerns (presentation vs. logic)\n\n### Styling\n1. Use CSS modules, styled-components, or Tailwind CSS as appropriate\n2. Follow consistent styling conventions\n3. Ensure responsive design\n4. Consider accessibility (a11y) requirements\n\n### Testing\n1. Write unit tests with React Testing Library\n2. Test component rendering and interactions\n3. Mock hooks and context appropriately\n4. Test edge cases and error boundaries\n\n### Output Format\nProvide complete, runnable code including:\n- Component definition with props interface\n- Hook implementations\n- JSX/TSX markup\n- Styling (CSS/SCSS or styled-components)\n- Example usage\n\n**Note**: Consider performance (memoization, lazy loading) and bundle size.");
    };
    EnhancedPromptEngine.prototype.getVueTaskPrompt = function (task, context) {
        return "# TASK: ".concat(task, "\n\n## VUE DEVELOPMENT REQUIREMENTS\n\n### Core Principles\n1. Follow Vue 3 Composition API best practices\n2. Use reactive state management appropriately\n3. Implement proper component lifecycle handling\n4. Write composable and reusable logic\n5. Follow Vue-specific patterns and conventions\n\n### Code Quality\n1. Write clean, modular Vue components\n2. Use meaningful component and prop names\n3. Keep components focused and single-purpose\n4. Add comprehensive TypeScript types if using\n5. Separate template, script, and style concerns\n\n### Styling\n1. Use scoped styles or CSS modules\n2. Follow consistent styling conventions\n3. Ensure responsive design\n4. Consider accessibility (a11y) requirements\n\n### Testing\n1. Write unit tests with Vue Test Utils\n2. Test component rendering and interactions\n3. Mock Vuex/Pinia stores appropriately\n4. Test computed properties and watchers\n\n### Output Format\nProvide complete, runnable code including:\n- Component definition (Options API or Composition API)\n- Template section with Vue directives\n- Script section with logic\n- Style section (scoped if needed)\n- Example usage\n\n**Note**: Consider Vue 3 migration if applicable, and performance optimization.");
    };
    EnhancedPromptEngine.prototype.getGeneralTaskPrompt = function (task, context) {
        return "# TASK: ".concat(task, "\n\n## SOFTWARE DEVELOPMENT REQUIREMENTS\n\n### Core Principles\n1. Write clean, maintainable, and well-documented code\n2. Follow language-appropriate design patterns\n3. Implement robust error handling and validation\n4. Consider performance and scalability\n5. Ensure code security and follow best practices\n\n### Code Quality\n1. Use meaningful and consistent naming conventions\n2. Write modular, loosely coupled code\n3. Add comprehensive comments and documentation\n4. Follow established coding standards\n5. Refactor when necessary for clarity\n\n### Testing & Validation\n1. Write comprehensive tests for critical functionality\n2. Test edge cases and error conditions\n3. Validate inputs and outputs\n4. Ensure backward compatibility when modifying existing code\n5. Verify solutions meet requirements\n\n### Output Format\nProvide a complete solution including:\n- Code implementation with proper structure\n- Error handling and edge case management\n- Documentation and comments\n- Example usage or test cases\n- Any necessary configuration\n\n**Note**: Tailor the solution to the specific technology stack and project requirements. Always prioritize clarity, maintainability, and correctness.");
    };
    return EnhancedPromptEngine;
}());
exports.EnhancedPromptEngine = EnhancedPromptEngine;
