"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptEngine = void 0;
var PromptEngine = /** @class */ (function () {
    function PromptEngine() {
        this.templates = {
            'qoder-java': this.generateJavaPrompt.bind(this),
            'qoder-python': this.generatePythonPrompt.bind(this),
            'qoder-web': this.generateWebPrompt.bind(this),
            'qoder-general': this.generateGeneralPrompt.bind(this)
        };
    }
    PromptEngine.prototype.generatePrompt = function (task, context, options) {
        if (options === void 0) { options = {}; }
        var templateKey = this.selectTemplate(context);
        var template = this.templates[templateKey] || this.templates['qoder-general'];
        return template(task, context, options);
    };
    PromptEngine.prototype.selectTemplate = function (context) {
        if (context.projectType === 'java' || context.language === 'java') {
            return 'qoder-java';
        }
        else if (context.projectType === 'python' || context.language === 'python') {
            return 'qoder-python';
        }
        else if (context.projectType === 'react' || context.projectType === 'vue' || context.projectType === 'node') {
            return 'qoder-web';
        }
        else {
            return 'qoder-general';
        }
    };
    PromptEngine.prototype.generateJavaPrompt = function (task, context, options) {
        var constraints = this.extractJavaConstraints(context);
        var architecture = context.architecture || 'standard';
        return "\n# \u89D2\u8272\u8BBE\u5B9A\n\u4F60\u662F\u4E00\u4E2A\u7ECF\u9A8C\u4E30\u5BCC\u7684Java\u5F00\u53D1\u8005\uFF0C".concat(context.framework === 'spring-boot' ? '精通Spring Boot框架' : '熟悉Java企业级开发', "\u3002\n\n# \u9879\u76EE\u4E0A\u4E0B\u6587\n- \u9879\u76EE\u7C7B\u578B: ").concat(context.projectType, "\n- \u6846\u67B6: ").concat(context.framework || '未指定', "\n- \u67B6\u6784\u6A21\u5F0F: ").concat(architecture, "\n- \u4EE3\u7801\u98CE\u683C: ").concat(JSON.stringify(context.codeStyle), "\n- \u4E3B\u8981\u4F9D\u8D56: ").concat(context.dependencies.slice(0, 10).join(', '), "\n\n# \u4EFB\u52A1\u63CF\u8FF0\n").concat(task, "\n\n# \u7EA6\u675F\u6761\u4EF6 (\u5FC5\u987B\u9075\u5B88)\n").concat(constraints.join('\n'), "\n\n# \u5F00\u53D1\u8981\u6C42\n1. \u9075\u5FAA\u963F\u91CC\u5DF4\u5DF4Java\u5F00\u53D1\u624B\u518C\n2. \u4F7F\u7528\u5408\u9002\u7684\u8BBE\u8BA1\u6A21\u5F0F\n3. \u6DFB\u52A0\u5FC5\u8981\u7684\u65E5\u5FD7\u8BB0\u5F55(SLF4J)\n4. \u5305\u542B\u5B8C\u6574\u7684\u5F02\u5E38\u5904\u7406\n5. \u7F16\u5199\u6E05\u6670\u7684JavaDoc\u6CE8\u91CA\n6. \u8003\u8651\u6027\u80FD\u548C\u7EBF\u7A0B\u5B89\u5168\n\n# \u8F93\u51FA\u683C\u5F0F\n\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u3001\u53EF\u76F4\u63A5\u8FD0\u884C\u7684\u4EE3\u7801\uFF0C\u5305\u62EC\uFF1A\n- \u7C7B\u5B9A\u4E49\uFF08\u5305\u542B\u5305\u58F0\u660E\uFF09\n- \u5FC5\u8981\u7684\u5BFC\u5165\u8BED\u53E5\n- \u65B9\u6CD5\u5B9E\u73B0\n- \u5355\u5143\u6D4B\u8BD5\uFF08\u5982\u679C\u9002\u7528\uFF09\n- \u7B80\u8981\u7684\u4F7F\u7528\u8BF4\u660E\n\n# \u6CE8\u610F\n\u8BF7\u786E\u4FDD\u4EE3\u7801\u7B26\u5408\u9879\u76EE\u7684\u73B0\u6709\u98CE\u683C\u548C\u67B6\u6784\u3002\n");
    };
    PromptEngine.prototype.generatePythonPrompt = function (task, context, options) {
        var constraints = this.extractPythonConstraints(context);
        return "\n# \u89D2\u8272\u8BBE\u5B9A\n\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684Python\u5F00\u53D1\u8005\uFF0C\u719F\u6089Python\u6700\u4F73\u5B9E\u8DF5\u548C\u5E38\u7528\u6846\u67B6\u3002\n\n# \u9879\u76EE\u4E0A\u4E0B\u6587\n- \u9879\u76EE\u7C7B\u578B: ".concat(context.projectType, "\n- \u4EE3\u7801\u98CE\u683C: ").concat(JSON.stringify(context.codeStyle), "\n- \u4E3B\u8981\u4F9D\u8D56: ").concat(context.dependencies.slice(0, 10).join(', '), "\n\n# \u4EFB\u52A1\u63CF\u8FF0\n").concat(task, "\n\n# \u7EA6\u675F\u6761\u4EF6 (\u5FC5\u987B\u9075\u5B88)\n").concat(constraints.join('\n'), "\n\n# \u5F00\u53D1\u8981\u6C42\n1. \u9075\u5FAAPEP 8\u7F16\u7801\u89C4\u8303\n2. \u4F7F\u7528\u7C7B\u578B\u6CE8\u89E3(Type Hints)\n3. \u6DFB\u52A0\u9002\u5F53\u7684\u6587\u6863\u5B57\u7B26\u4E32(docstring)\n4. \u5305\u542B\u9519\u8BEF\u5904\u7406\u548C\u65E5\u5FD7\u8BB0\u5F55\n5. \u8003\u8651\u6027\u80FD\u548C\u5185\u5B58\u4F7F\u7528\n6. \u7F16\u5199\u53EF\u6D4B\u8BD5\u7684\u4EE3\u7801\n\n# \u8F93\u51FA\u683C\u5F0F\n\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u3001\u53EF\u76F4\u63A5\u8FD0\u884C\u7684\u4EE3\u7801\uFF0C\u5305\u62EC\uFF1A\n- \u5FC5\u8981\u7684\u5BFC\u5165\u8BED\u53E5\n- \u51FD\u6570/\u7C7B\u5B9A\u4E49\n- \u7C7B\u578B\u6CE8\u89E3\n- \u6587\u6863\u5B57\u7B26\u4E32\n- \u4F7F\u7528\u793A\u4F8B\uFF08\u5982\u679C\u9002\u7528\uFF09\n- \u7B80\u8981\u8BF4\u660E\n\n# \u6CE8\u610F\n\u4FDD\u6301\u4EE3\u7801\u7B80\u6D01\u3001\u53EF\u8BFB\uFF0C\u9075\u5FAAPython\u4E4B\u7985\u3002\n");
    };
    PromptEngine.prototype.generateWebPrompt = function (task, context, options) {
        var framework = context.projectType === 'react' ? 'React' :
            context.projectType === 'vue' ? 'Vue' : 'JavaScript/TypeScript';
        var constraints = this.extractWebConstraints(context);
        return "\n# \u89D2\u8272\u8BBE\u5B9A\n\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684".concat(framework, "\u524D\u7AEF\u5F00\u53D1\u8005\uFF0C\u719F\u6089\u73B0\u4EE3\u524D\u7AEF\u5F00\u53D1\u5B9E\u8DF5\u3002\n\n# \u9879\u76EE\u4E0A\u4E0B\u6587\n- \u9879\u76EE\u7C7B\u578B: ").concat(context.projectType, "\n- \u6846\u67B6: ").concat(framework, "\n- \u4EE3\u7801\u98CE\u683C: ").concat(JSON.stringify(context.codeStyle), "\n- \u4E3B\u8981\u4F9D\u8D56: ").concat(context.dependencies.slice(0, 10).join(', '), "\n\n# \u4EFB\u52A1\u63CF\u8FF0\n").concat(task, "\n\n# \u7EA6\u675F\u6761\u4EF6 (\u5FC5\u987B\u9075\u5B88)\n").concat(constraints.join('\n'), "\n\n# \u5F00\u53D1\u8981\u6C42\n1. \u9075\u5FAA").concat(framework, "\u6700\u4F73\u5B9E\u8DF5\n2. \u4F7F\u7528\u73B0\u4EE3JavaScript/TypeScript\u7279\u6027\n3. \u7EC4\u4EF6\u5316\u8BBE\u8BA1\uFF0C\u5173\u6CE8\u70B9\u5206\u79BB\n4. \u54CD\u5E94\u5F0F\u8BBE\u8BA1\u548C\u79FB\u52A8\u7AEF\u9002\u914D\n5. \u6027\u80FD\u4F18\u5316\uFF08\u4EE3\u7801\u5206\u5272\u3001\u61D2\u52A0\u8F7D\u7B49\uFF09\n6. \u53EF\u8BBF\u95EE\u6027(A11y)\u8003\u8651\n\n# \u8F93\u51FA\u683C\u5F0F\n\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u3001\u53EF\u76F4\u63A5\u8FD0\u884C\u7684\u4EE3\u7801\uFF0C\u5305\u62EC\uFF1A\n- \u7EC4\u4EF6\u5B9A\u4E49\n- \u5FC5\u8981\u7684\u6837\u5F0F(CSS/SCSS)\n- \u7C7B\u578B\u5B9A\u4E49\uFF08\u5982\u679C\u662FTypeScript\uFF09\n- \u4F7F\u7528\u793A\u4F8B\n- \u7B80\u8981\u8BF4\u660E\n\n# \u6CE8\u610F\n\u786E\u4FDD\u4EE3\u7801\u6A21\u5757\u5316\u3001\u53EF\u7EF4\u62A4\uFF0C\u5E76\u7B26\u5408\u9879\u76EE\u73B0\u6709\u7ED3\u6784\u3002\n");
    };
    PromptEngine.prototype.generateGeneralPrompt = function (task, context, options) {
        return "\n# \u89D2\u8272\u8BBE\u5B9A\n\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u8F6F\u4EF6\u5DE5\u7A0B\u5E08\uFF0C\u64C5\u957F\u89E3\u51B3\u5404\u79CD\u7F16\u7A0B\u95EE\u9898\u3002\n\n# \u9879\u76EE\u4E0A\u4E0B\u6587\n- \u9879\u76EE\u7C7B\u578B: ".concat(context.projectType, "\n- \u4E3B\u8981\u8BED\u8A00: ").concat(context.language, "\n- \u4EE3\u7801\u98CE\u683C: ").concat(JSON.stringify(context.codeStyle), "\n\n# \u4EFB\u52A1\u63CF\u8FF0\n").concat(task, "\n\n# \u901A\u7528\u8981\u6C42\n1. \u7F16\u5199\u9AD8\u8D28\u91CF\u3001\u53EF\u7EF4\u62A4\u7684\u4EE3\u7801\n2. \u9075\u5FAA\u8BED\u8A00\u548C\u6846\u67B6\u7684\u6700\u4F73\u5B9E\u8DF5\n3. \u6DFB\u52A0\u9002\u5F53\u7684\u6CE8\u91CA\u548C\u6587\u6863\n4. \u8003\u8651\u9519\u8BEF\u5904\u7406\u548C\u8FB9\u754C\u60C5\u51B5\n5. \u4F18\u5316\u6027\u80FD\u548C\u8D44\u6E90\u4F7F\u7528\n6. \u786E\u4FDD\u4EE3\u7801\u5B89\u5168\u53EF\u9760\n\n# \u8F93\u51FA\u683C\u5F0F\n\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u89E3\u51B3\u65B9\u6848\uFF0C\u5305\u62EC\uFF1A\n- \u4EE3\u7801\u5B9E\u73B0\n- \u5FC5\u8981\u7684\u89E3\u91CA\n- \u4F7F\u7528\u8BF4\u660E\n- \u6CE8\u610F\u4E8B\u9879\n\n\u8BF7\u6839\u636E\u9879\u76EE\u4E0A\u4E0B\u6587\u63D0\u4F9B\u6700\u5408\u9002\u7684\u5B9E\u73B0\u3002\n");
    };
    PromptEngine.prototype.extractJavaConstraints = function (context) {
        var constraints = [];
        if (context.framework === 'spring-boot') {
            constraints.push('- 使用Spring Boot约定优于配置', '- 依赖注入使用@Autowired或构造函数注入', '- REST API使用@RestController', '- 数据访问使用Spring Data JPA或MyBatis', '- 配置使用application.yml/application.properties', '- 统一异常处理使用@ControllerAdvice');
            if (context.architecture === 'controller-service-repository') {
                constraints.push('- 遵循Controller-Service-Repository分层架构', '- Controller只处理HTTP请求和响应', '- Service层包含业务逻辑', '- Repository层处理数据访问');
            }
        }
        constraints.push('- 使用Lombok减少样板代码（如果项目使用）', '- 日志使用SLF4J', '- 参数校验使用Jakarta Validation或Hibernate Validator', '- 返回统一响应格式');
        return constraints;
    };
    PromptEngine.prototype.extractPythonConstraints = function (context) {
        var constraints = [];
        if (context.dependencies.some(function (dep) { return dep.includes('django'); })) {
            constraints.push('- 遵循Django MTV模式', '- 使用Django ORM进行数据库操作', '- 视图使用基于类的视图(CBV)', '- URL配置使用path()');
        }
        else if (context.dependencies.some(function (dep) { return dep.includes('flask'); })) {
            constraints.push('- 遵循Flask应用工厂模式', '- 使用蓝本(Blueprint)组织路由', '- 配置使用环境变量', '- 使用SQLAlchemy进行数据库操作');
        }
        else if (context.dependencies.some(function (dep) { return dep.includes('fastapi'); })) {
            constraints.push('- 使用Pydantic模型进行数据验证', '- 依赖注入使用Depends()', '- 异步支持使用async/await', '- 自动API文档生成');
        }
        constraints.push('- 使用虚拟环境(venv/poetry/pipenv)', '- 添加requirements.txt或pyproject.toml依赖', '- 使用类型注解(Type Hints)', '- 添加适当的__init__.py文件');
        return constraints;
    };
    PromptEngine.prototype.extractWebConstraints = function (context) {
        var constraints = [];
        if (context.projectType === 'react') {
            constraints.push('- 使用函数组件和Hooks', '- 状态管理使用Context或Redux（根据项目）', '- 样式使用CSS Modules或Styled Components', '- 路由使用React Router');
        }
        else if (context.projectType === 'vue') {
            constraints.push('- 使用Composition API（Vue 3）', '- 状态管理使用Pinia', '- 路由使用Vue Router', '- 样式使用Scoped CSS或CSS Modules');
        }
        constraints.push('- 使用ES6+语法', '- 组件化设计，单一职责原则', '- 响应式设计，移动端优先', '- 性能优化（懒加载、代码分割）', '- 可访问性考虑');
        return constraints;
    };
    return PromptEngine;
}());
exports.PromptEngine = PromptEngine;
