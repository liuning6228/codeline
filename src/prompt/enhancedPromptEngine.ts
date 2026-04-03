import * as vscode from 'vscode';
import { ProjectContext } from '../analyzer/projectAnalyzer';

/**
 * Enhanced prompt engine based on Cline's componentized architecture and Qoder-style prompts
 */
export class EnhancedPromptEngine {
  private readonly systemPromptComponents: Record<string, (context: ProjectContext) => string> = {
    'agentRole': this.getAgentRole.bind(this),
    'objective': this.getObjective.bind(this),
    'rules': this.getRules.bind(this),
    'capabilities': this.getCapabilities.bind(this),
    'editingFiles': this.getEditingFiles.bind(this),
    'taskProgress': this.getTaskProgress.bind(this),
    'feedback': this.getFeedback.bind(this),
    'systemInfo': this.getSystemInfo.bind(this)
  };

  private readonly taskSpecificPrompts: Record<string, (task: string, context: ProjectContext) => string> = {
    'java': this.getJavaTaskPrompt.bind(this),
    'python': this.getPythonTaskPrompt.bind(this),
    'typescript': this.getTypeScriptTaskPrompt.bind(this),
    'javascript': this.getJavaScriptTaskPrompt.bind(this),
    'react': this.getReactTaskPrompt.bind(this),
    'vue': this.getVueTaskPrompt.bind(this),
    'general': this.getGeneralTaskPrompt.bind(this)
  };

  /**
   * Generate a high-quality prompt based on Qoder and Cline best practices
   */
  public generateEnhancedPrompt(
    task: string,
    context: ProjectContext,
    options: {
      includeSystemPrompt?: boolean;
      includeContext?: boolean;
      languageSpecific?: boolean;
    } = {}
  ): string {
    const includeSystemPrompt = options.includeSystemPrompt ?? true;
    const includeContext = options.includeContext ?? true;
    const languageSpecific = options.languageSpecific ?? true;

    let prompt = '';

    // System prompt (based on Cline's componentized system)
    if (includeSystemPrompt) {
      prompt += this.generateSystemPrompt(context);
    }

    // Context information
    if (includeContext && context) {
      prompt += this.generateContextSection(context);
    }

    // Task-specific prompt (Qoder-style)
    const language = this.determineLanguage(context);
    const taskPrompt = languageSpecific 
      ? this.taskSpecificPrompts[language]?.(task, context) || this.taskSpecificPrompts['general'](task, context)
      : this.taskSpecificPrompts['general'](task, context);
    
    prompt += taskPrompt;

    return prompt;
  }

  /**
   * Generate Cline-style system prompt with components
   */
  private generateSystemPrompt(context: ProjectContext): string {
    const components = [
      'agentRole',
      'objective',
      'rules',
      'capabilities',
      'editingFiles',
      'taskProgress',
      'feedback',
      'systemInfo'
    ];

    let systemPrompt = '# SYSTEM PROMPT\n\n';
    
    for (const component of components) {
      const componentText = this.systemPromptComponents[component](context);
      if (componentText) {
        systemPrompt += componentText + '\n\n';
      }
    }

    return systemPrompt;
  }

  /**
   * Generate context section based on project analysis
   */
  private generateContextSection(context: ProjectContext): string {
    let contextSection = '# CONTEXT\n\n';

    // Project overview
    if (context.projectType) {
      contextSection += `## Project Overview\n`;
      contextSection += `- **Project Type**: ${context.projectType}\n`;
      if (context.language) contextSection += `- **Primary Language**: ${context.language}\n`;
      if (context.framework) contextSection += `- **Framework**: ${context.framework}\n`;
      contextSection += '\n';
    }

    // Code style
    if (context.codeStyle && Object.keys(context.codeStyle).length > 0) {
      contextSection += `## Code Style Guidelines\n`;
      for (const [key, value] of Object.entries(context.codeStyle)) {
        contextSection += `- **${key}**: ${value}\n`;
      }
      contextSection += '\n';
    }

    // Dependencies (top 10)
    if (context.dependencies && context.dependencies.length > 0) {
      const topDeps = context.dependencies.slice(0, 10);
      contextSection += `## Key Dependencies (Top ${topDeps.length})\n`;
      topDeps.forEach(dep => {
        contextSection += `- ${dep}\n`;
      });
      contextSection += '\n';
    }

    // Recent changes (if available in enhanced context)
    if ((context as any).relevantContext?.recentChanges) {
      const recentChanges = (context as any).relevantContext.recentChanges.slice(0, 5);
      contextSection += `## Recently Modified Files\n`;
      recentChanges.forEach((file: string) => {
        contextSection += `- ${file}\n`;
      });
      contextSection += '\n';
    }

    return contextSection;
  }

  /**
   * Determine language from context
   */
  private determineLanguage(context: ProjectContext): string {
    if (context.projectType === 'java' || context.language === 'java') return 'java';
    if (context.projectType === 'python' || context.language === 'python') return 'python';
    if (context.projectType === 'typescript' || context.language === 'typescript') return 'typescript';
    if (context.projectType === 'javascript' || context.language === 'javascript') return 'javascript';
    if (context.projectType === 'react') return 'react';
    if (context.projectType === 'vue') return 'vue';
    return 'general';
  }

  // === System Prompt Components (Cline-style) ===

  private getAgentRole(context: ProjectContext): string {
    return `## AGENT ROLE
You are CodeLine, an expert AI coding assistant designed to help developers write high-quality code efficiently. You have deep knowledge of software engineering principles, design patterns, and best practices across multiple languages and frameworks.`;
  }

  private getObjective(context: ProjectContext): string {
    return `## OBJECTIVE
Your primary objective is to understand the user's task and provide accurate, efficient, and production-ready solutions. You should:
1. Analyze the task requirements thoroughly
2. Consider edge cases and error handling
3. Follow established coding standards
4. Optimize for performance and maintainability
5. Provide clear explanations when needed`;
  }

  private getRules(context: ProjectContext): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const cwd = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : process.cwd();
    
    return `## RULES
- **Current Working Directory**: ${cwd}
- Always write clean, maintainable, and well-documented code
- Follow language-specific best practices and style guides
- Add appropriate error handling and input validation
- Consider performance implications and optimize where necessary
- Use meaningful variable and function names
- Write code that is testable and modular
- Respect existing project structure and conventions
- When modifying files, ensure backward compatibility
- Provide code that is secure and follows security best practices`;
  }

  private getCapabilities(context: ProjectContext): string {
    return `## CAPABILITIES
- **Multi-language Support**: Java, Python, JavaScript, TypeScript, Go, Rust, C++, and more
- **Framework Expertise**: Spring Boot, React, Vue, Angular, Django, Flask, Express.js, etc.
- **Code Analysis**: Static analysis, dependency resolution, architecture pattern recognition
- **Testing**: Unit tests, integration tests, end-to-end tests
- **Debugging**: Identifying and fixing bugs, performance issues
- **Refactoring**: Code quality improvements, architectural improvements
- **Documentation**: Code comments, API documentation, README files`;
  }

  private getEditingFiles(context: ProjectContext): string {
    return `## EDITING FILES
When making changes to code:
1. Understand the existing codebase structure
2. Make minimal changes to achieve the desired functionality
3. Preserve existing functionality unless explicitly asked to change it
4. Update related files if necessary (e.g., tests, documentation)
5. Verify changes don't break existing functionality
6. Format code according to project conventions`;
  }

  private getTaskProgress(context: ProjectContext): string {
    return `## TASK PROGRESS
- Break down complex tasks into manageable steps
- Provide incremental progress updates when appropriate
- Handle errors gracefully and suggest alternatives
- Complete tasks efficiently without unnecessary complexity
- Verify solutions before presenting them`;
  }

  private getFeedback(context: ProjectContext): string {
    return `## FEEDBACK
- Be receptive to user feedback and corrections
- Adapt to user preferences and coding style
- Clarify requirements when ambiguous
- Learn from previous interactions in the session`;
  }

  private getSystemInfo(context: ProjectContext): string {
    const vscodeVersion = vscode.version;
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspaceName = workspaceFolders && workspaceFolders.length > 0 
      ? workspaceFolders[0].name 
      : 'No workspace';
    
    return `## SYSTEM INFORMATION
- **IDE**: VS Code v${vscodeVersion}
- **Workspace**: ${workspaceName}
- **Environment**: Node.js ${process.version}
- **Extension**: CodeLine v0.3.0`;
  }

  // === Task-specific Prompts (Qoder-style) ===

  private getJavaTaskPrompt(task: string, context: ProjectContext): string {
    const isSpring = context.framework === 'spring-boot';
    
    return `# TASK: ${task}

## JAVA DEVELOPMENT REQUIREMENTS

### Core Principles
${isSpring ? '1. Follow Spring Boot best practices and conventions' : '1. Follow Java Enterprise Edition patterns'}
2. Use appropriate design patterns (Factory, Builder, Strategy, etc.)
3. Implement proper exception handling and logging
4. Write thread-safe code when necessary
5. Follow SOLID principles

### Code Quality
1. Follow Google Java Style Guide or project-specific conventions
2. Add comprehensive Javadoc comments
3. Use meaningful class and method names
4. Keep methods focused and single-purpose
5. Avoid code duplication through abstraction

### Testing
1. Write unit tests with JUnit 5
2. Include integration tests for critical paths
3. Use Mockito for mocking dependencies
4. Achieve meaningful test coverage
5. Test edge cases and error scenarios

### Output Format
Provide complete, runnable code including:
- Package declaration
- Import statements
- Class definition with proper visibility
- Method implementations with error handling
- Documentation comments
- Example usage if applicable

${isSpring ? '**Spring Boot Specific**: Use @RestController, @Service, @Repository annotations appropriately. Configure application.properties/yml. Follow dependency injection patterns.' : ''}

**Note**: Ensure backward compatibility and follow existing project structure.`;
  }

  private getPythonTaskPrompt(task: string, context: ProjectContext): string {
    return `# TASK: ${task}

## PYTHON DEVELOPMENT REQUIREMENTS

### Core Principles
1. Follow PEP 8 style guide rigorously
2. Use type hints (PEP 484) for better code clarity
3. Implement proper exception handling
4. Write Pythonic code (list comprehensions, generators, context managers)
5. Follow Zen of Python principles

### Code Quality
1. Write clean, readable, and maintainable code
2. Use meaningful variable and function names
3. Keep functions small and focused (single responsibility)
4. Add comprehensive docstrings (Google or NumPy style)
5. Use appropriate data structures and algorithms

### Testing
1. Write unit tests with pytest or unittest
2. Include integration tests for critical functionality
3. Mock external dependencies appropriately
4. Test edge cases and error conditions
5. Ensure good test coverage

### Output Format
Provide complete, runnable code including:
- Module imports
- Function/class definitions with type hints
- Comprehensive docstrings
- Error handling
- Example usage in __main__ guard
- Requirements.txt if needed

**Note**: Consider performance for large datasets, use appropriate libraries (NumPy, Pandas for data tasks).`;
  }

  private getTypeScriptTaskPrompt(task: string, context: ProjectContext): string {
    const isAngular = context.framework === 'angular';
    
    return `# TASK: ${task}

## TYPESCRIPT DEVELOPMENT REQUIREMENTS

### Core Principles
1. Use strict TypeScript configuration (strict: true)
2. Follow consistent type definitions
3. Implement proper error handling
4. Write modular, reusable code
5. Use modern ES6+ features appropriately

### Code Quality
1. Follow consistent naming conventions (camelCase, PascalCase)
2. Use meaningful variable and function names
3. Keep functions focused and single-purpose
4. Add comprehensive JSDoc comments
5. Use interfaces and types for better type safety

### Testing
1. Write unit tests with Jest or Mocha
2. Test type correctness in addition to runtime behavior
3. Mock dependencies appropriately
4. Include integration tests for complex interactions
5. Test edge cases and error scenarios

### Output Format
Provide complete, runnable code including:
- Type imports and exports
- Interface/type definitions
- Function/class implementations
- Error handling
- Example usage
- tsconfig.json recommendations if needed

${isAngular ? '**Angular Specific**: Follow Angular style guide, use dependency injection, implement proper lifecycle hooks.' : ''}

**Note**: Consider bundle size and performance implications.`;
  }

  private getJavaScriptTaskPrompt(task: string, context: ProjectContext): string {
    return `# TASK: ${task}

## JAVASCRIPT DEVELOPMENT REQUIREMENTS

### Core Principles
1. Use modern ES6+ features (let/const, arrow functions, destructuring)
2. Follow functional programming principles where appropriate
3. Implement proper error handling with try/catch
4. Write asynchronous code using async/await
5. Follow JavaScript best practices and patterns

### Code Quality
1. Write clean, readable, and maintainable code
2. Use meaningful variable and function names
3. Keep functions small and focused
4. Add comprehensive JSDoc comments
5. Avoid global variables and side effects

### Testing
1. Write unit tests with Jest, Mocha, or Jasmine
2. Test both synchronous and asynchronous code
3. Mock dependencies appropriately
4. Test edge cases and error scenarios
5. Ensure good test coverage

### Output Format
Provide complete, runnable code including:
- Module imports/exports
- Function implementations
- Error handling
- Example usage
- Package.json dependencies if needed

**Note**: Consider browser compatibility if targeting web applications.`;
  }

  private getReactTaskPrompt(task: string, context: ProjectContext): string {
    return `# TASK: ${task}

## REACT DEVELOPMENT REQUIREMENTS

### Core Principles
1. Follow React Hooks best practices
2. Use functional components over class components
3. Implement proper state management
4. Write pure components when possible
5. Follow React performance optimization patterns

### Code Quality
1. Write clean, modular, and reusable components
2. Use meaningful component and prop names
3. Keep components focused and single-purpose
4. Add comprehensive PropTypes or TypeScript interfaces
5. Separate concerns (presentation vs. logic)

### Styling
1. Use CSS modules, styled-components, or Tailwind CSS as appropriate
2. Follow consistent styling conventions
3. Ensure responsive design
4. Consider accessibility (a11y) requirements

### Testing
1. Write unit tests with React Testing Library
2. Test component rendering and interactions
3. Mock hooks and context appropriately
4. Test edge cases and error boundaries

### Output Format
Provide complete, runnable code including:
- Component definition with props interface
- Hook implementations
- JSX/TSX markup
- Styling (CSS/SCSS or styled-components)
- Example usage

**Note**: Consider performance (memoization, lazy loading) and bundle size.`;
  }

  private getVueTaskPrompt(task: string, context: ProjectContext): string {
    return `# TASK: ${task}

## VUE DEVELOPMENT REQUIREMENTS

### Core Principles
1. Follow Vue 3 Composition API best practices
2. Use reactive state management appropriately
3. Implement proper component lifecycle handling
4. Write composable and reusable logic
5. Follow Vue-specific patterns and conventions

### Code Quality
1. Write clean, modular Vue components
2. Use meaningful component and prop names
3. Keep components focused and single-purpose
4. Add comprehensive TypeScript types if using
5. Separate template, script, and style concerns

### Styling
1. Use scoped styles or CSS modules
2. Follow consistent styling conventions
3. Ensure responsive design
4. Consider accessibility (a11y) requirements

### Testing
1. Write unit tests with Vue Test Utils
2. Test component rendering and interactions
3. Mock Vuex/Pinia stores appropriately
4. Test computed properties and watchers

### Output Format
Provide complete, runnable code including:
- Component definition (Options API or Composition API)
- Template section with Vue directives
- Script section with logic
- Style section (scoped if needed)
- Example usage

**Note**: Consider Vue 3 migration if applicable, and performance optimization.`;
  }

  private getGeneralTaskPrompt(task: string, context: ProjectContext): string {
    return `# TASK: ${task}

## SOFTWARE DEVELOPMENT REQUIREMENTS

### Core Principles
1. Write clean, maintainable, and well-documented code
2. Follow language-appropriate design patterns
3. Implement robust error handling and validation
4. Consider performance and scalability
5. Ensure code security and follow best practices

### Code Quality
1. Use meaningful and consistent naming conventions
2. Write modular, loosely coupled code
3. Add comprehensive comments and documentation
4. Follow established coding standards
5. Refactor when necessary for clarity

### Testing & Validation
1. Write comprehensive tests for critical functionality
2. Test edge cases and error conditions
3. Validate inputs and outputs
4. Ensure backward compatibility when modifying existing code
5. Verify solutions meet requirements

### Output Format
Provide a complete solution including:
- Code implementation with proper structure
- Error handling and edge case management
- Documentation and comments
- Example usage or test cases
- Any necessary configuration

**Note**: Tailor the solution to the specific technology stack and project requirements. Always prioritize clarity, maintainability, and correctness.`;
  }
}