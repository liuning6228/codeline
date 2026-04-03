import { ProjectContext } from '../analyzer/projectAnalyzer';

export interface PromptOptions {
  includeExamples?: boolean;
  includeConstraints?: boolean;
  includeBestPractices?: boolean;
  language?: string;
}

export class PromptEngine {
  private readonly templates: Record<string, (task: string, context: ProjectContext, options: PromptOptions) => string> = {
    'qoder-java': this.generateJavaPrompt.bind(this),
    'qoder-python': this.generatePythonPrompt.bind(this),
    'qoder-web': this.generateWebPrompt.bind(this),
    'qoder-general': this.generateGeneralPrompt.bind(this)
  };

  public generatePrompt(
    task: string, 
    context: ProjectContext, 
    options: PromptOptions = {}
  ): string {
    const templateKey = this.selectTemplate(context);
    const template = this.templates[templateKey] || this.templates['qoder-general'];
    
    return template(task, context, options);
  }

  private selectTemplate(context: ProjectContext): string {
    if (context.projectType === 'java' || context.language === 'java') {
      return 'qoder-java';
    } else if (context.projectType === 'python' || context.language === 'python') {
      return 'qoder-python';
    } else if (context.projectType === 'react' || context.projectType === 'vue' || context.projectType === 'node') {
      return 'qoder-web';
    } else {
      return 'qoder-general';
    }
  }

  private generateJavaPrompt(task: string, context: ProjectContext, options: PromptOptions): string {
    const constraints = this.extractJavaConstraints(context);
    const architecture = context.architecture || 'standard';
    
    return `
# 角色设定
你是一个经验丰富的Java开发者，${context.framework === 'spring-boot' ? '精通Spring Boot框架' : '熟悉Java企业级开发'}。

# 项目上下文
- 项目类型: ${context.projectType}
- 框架: ${context.framework || '未指定'}
- 架构模式: ${architecture}
- 代码风格: ${JSON.stringify(context.codeStyle)}
- 主要依赖: ${context.dependencies.slice(0, 10).join(', ')}

# 任务描述
${task}

# 约束条件 (必须遵守)
${constraints.join('\n')}

# 开发要求
1. 遵循阿里巴巴Java开发手册
2. 使用合适的设计模式
3. 添加必要的日志记录(SLF4J)
4. 包含完整的异常处理
5. 编写清晰的JavaDoc注释
6. 考虑性能和线程安全

# 输出格式
请提供完整的、可直接运行的代码，包括：
- 类定义（包含包声明）
- 必要的导入语句
- 方法实现
- 单元测试（如果适用）
- 简要的使用说明

# 注意
请确保代码符合项目的现有风格和架构。
`;
  }

  private generatePythonPrompt(task: string, context: ProjectContext, options: PromptOptions): string {
    const constraints = this.extractPythonConstraints(context);
    
    return `
# 角色设定
你是一个专业的Python开发者，熟悉Python最佳实践和常用框架。

# 项目上下文
- 项目类型: ${context.projectType}
- 代码风格: ${JSON.stringify(context.codeStyle)}
- 主要依赖: ${context.dependencies.slice(0, 10).join(', ')}

# 任务描述
${task}

# 约束条件 (必须遵守)
${constraints.join('\n')}

# 开发要求
1. 遵循PEP 8编码规范
2. 使用类型注解(Type Hints)
3. 添加适当的文档字符串(docstring)
4. 包含错误处理和日志记录
5. 考虑性能和内存使用
6. 编写可测试的代码

# 输出格式
请提供完整的、可直接运行的代码，包括：
- 必要的导入语句
- 函数/类定义
- 类型注解
- 文档字符串
- 使用示例（如果适用）
- 简要说明

# 注意
保持代码简洁、可读，遵循Python之禅。
`;
  }

  private generateWebPrompt(task: string, context: ProjectContext, options: PromptOptions): string {
    const framework = context.projectType === 'react' ? 'React' : 
                     context.projectType === 'vue' ? 'Vue' : 'JavaScript/TypeScript';
    const constraints = this.extractWebConstraints(context);
    
    return `
# 角色设定
你是一个专业的${framework}前端开发者，熟悉现代前端开发实践。

# 项目上下文
- 项目类型: ${context.projectType}
- 框架: ${framework}
- 代码风格: ${JSON.stringify(context.codeStyle)}
- 主要依赖: ${context.dependencies.slice(0, 10).join(', ')}

# 任务描述
${task}

# 约束条件 (必须遵守)
${constraints.join('\n')}

# 开发要求
1. 遵循${framework}最佳实践
2. 使用现代JavaScript/TypeScript特性
3. 组件化设计，关注点分离
4. 响应式设计和移动端适配
5. 性能优化（代码分割、懒加载等）
6. 可访问性(A11y)考虑

# 输出格式
请提供完整的、可直接运行的代码，包括：
- 组件定义
- 必要的样式(CSS/SCSS)
- 类型定义（如果是TypeScript）
- 使用示例
- 简要说明

# 注意
确保代码模块化、可维护，并符合项目现有结构。
`;
  }

  private generateGeneralPrompt(task: string, context: ProjectContext, options: PromptOptions): string {
    return `
# 角色设定
你是一个专业的软件工程师，擅长解决各种编程问题。

# 项目上下文
- 项目类型: ${context.projectType}
- 主要语言: ${context.language}
- 代码风格: ${JSON.stringify(context.codeStyle)}

# 任务描述
${task}

# 通用要求
1. 编写高质量、可维护的代码
2. 遵循语言和框架的最佳实践
3. 添加适当的注释和文档
4. 考虑错误处理和边界情况
5. 优化性能和资源使用
6. 确保代码安全可靠

# 输出格式
请提供完整的解决方案，包括：
- 代码实现
- 必要的解释
- 使用说明
- 注意事项

请根据项目上下文提供最合适的实现。
`;
  }

  private extractJavaConstraints(context: ProjectContext): string[] {
    const constraints: string[] = [];
    
    if (context.framework === 'spring-boot') {
      constraints.push(
        '- 使用Spring Boot约定优于配置',
        '- 依赖注入使用@Autowired或构造函数注入',
        '- REST API使用@RestController',
        '- 数据访问使用Spring Data JPA或MyBatis',
        '- 配置使用application.yml/application.properties',
        '- 统一异常处理使用@ControllerAdvice'
      );
      
      if (context.architecture === 'controller-service-repository') {
        constraints.push(
          '- 遵循Controller-Service-Repository分层架构',
          '- Controller只处理HTTP请求和响应',
          '- Service层包含业务逻辑',
          '- Repository层处理数据访问'
        );
      }
    }
    
    constraints.push(
      '- 使用Lombok减少样板代码（如果项目使用）',
      '- 日志使用SLF4J',
      '- 参数校验使用Jakarta Validation或Hibernate Validator',
      '- 返回统一响应格式'
    );
    
    return constraints;
  }

  private extractPythonConstraints(context: ProjectContext): string[] {
    const constraints: string[] = [];
    
    if (context.dependencies.some(dep => dep.includes('django'))) {
      constraints.push(
        '- 遵循Django MTV模式',
        '- 使用Django ORM进行数据库操作',
        '- 视图使用基于类的视图(CBV)',
        '- URL配置使用path()'
      );
    } else if (context.dependencies.some(dep => dep.includes('flask'))) {
      constraints.push(
        '- 遵循Flask应用工厂模式',
        '- 使用蓝本(Blueprint)组织路由',
        '- 配置使用环境变量',
        '- 使用SQLAlchemy进行数据库操作'
      );
    } else if (context.dependencies.some(dep => dep.includes('fastapi'))) {
      constraints.push(
        '- 使用Pydantic模型进行数据验证',
        '- 依赖注入使用Depends()',
        '- 异步支持使用async/await',
        '- 自动API文档生成'
      );
    }
    
    constraints.push(
      '- 使用虚拟环境(venv/poetry/pipenv)',
      '- 添加requirements.txt或pyproject.toml依赖',
      '- 使用类型注解(Type Hints)',
      '- 添加适当的__init__.py文件'
    );
    
    return constraints;
  }

  private extractWebConstraints(context: ProjectContext): string[] {
    const constraints: string[] = [];
    
    if (context.projectType === 'react') {
      constraints.push(
        '- 使用函数组件和Hooks',
        '- 状态管理使用Context或Redux（根据项目）',
        '- 样式使用CSS Modules或Styled Components',
        '- 路由使用React Router'
      );
    } else if (context.projectType === 'vue') {
      constraints.push(
        '- 使用Composition API（Vue 3）',
        '- 状态管理使用Pinia',
        '- 路由使用Vue Router',
        '- 样式使用Scoped CSS或CSS Modules'
      );
    }
    
    constraints.push(
      '- 使用ES6+语法',
      '- 组件化设计，单一职责原则',
      '- 响应式设计，移动端优先',
      '- 性能优化（懒加载、代码分割）',
      '- 可访问性考虑'
    );
    
    return constraints;
  }
}