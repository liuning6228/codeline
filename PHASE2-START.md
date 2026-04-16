# 阶段2：完整的模拟依赖实现 - 快速启动指南

## 目标
在阶段1成功的基础上，实现更完整的模拟依赖，为阶段3的真实组件集成测试做好准备。

## 阶段1回顾
✅ **已完成**:
- 隔离测试环境创建
- 基础模拟依赖 (ModelAdapter, ProjectAnalyzer, PromptEngine, ToolRegistry)
- EnhancedEngineAdapter接口设计验证
- 基础功能测试通过

## 阶段2具体任务

### 任务2.1：EnhancedToolRegistry完整模拟
**目标**: 实现完整的EnhancedToolRegistry模拟，支持真实EnhancedEngineAdapter所需的所有功能。

**具体工作**:
1. 分析真实EnhancedToolRegistry的接口 (`src/core/tool/EnhancedToolRegistry.ts`)
2. 创建完整模拟: `test-integration-phase2/src/mocks/EnhancedToolRegistry.ts`
3. 实现关键功能:
   - 工具注册和分类
   - 工具搜索和过滤
   - 工具执行和参数验证
   - 工具状态监控
   - 工具配置管理

### 任务2.2：EnhancedQueryEngine接口模拟
**目标**: 创建EnhancedQueryEngine的模拟版本，支持基本的查询和工具调用功能。

**具体工作**:
1. 分析真实EnhancedQueryEngine的接口 (`src/core/EnhancedQueryEngine.ts`)
2. 创建模拟: `test-integration-phase2/src/mocks/EnhancedQueryEngine.ts`
3. 实现关键功能:
   - `submitMessageSync` 方法模拟
   - 对话状态管理
   - 工具调用路由
   - 响应生成和格式化

### 任务2.3：MCPHandler基础模拟
**目标**: 创建MCPHandler的简化模拟，支持基本的MCP消息处理。

**具体工作**:
1. 分析真实MCPHandler的接口 (`src/mcp/MCPHandler.ts`)
2. 创建模拟: `test-integration-phase2/src/mocks/MCPHandler.ts`
3. 实现关键功能:
   - MCP消息解析和路由
   - 工具调用转发
   - 响应生成
   - 错误处理和状态报告

### 任务2.4：更全面的功能测试
**目标**: 创建更全面的集成测试，验证多个模拟组件之间的交互。

**具体工作**:
1. 创建集成测试: `test-integration-phase2/src/tests/Phase2Integration.test.ts`
2. 测试场景:
   - EnhancedEngineAdapter与EnhancedQueryEngine的集成
   - MCPHandler消息处理流程
   - 完整的工具调用链
   - 错误处理和恢复机制
3. 性能基准测试:
   - 组件初始化时间
   - 消息处理延迟
   - 工具执行性能

## 预计时间
- **任务2.1**: 1.5小时 (EnhancedToolRegistry完整模拟)
- **任务2.2**: 1小时 (EnhancedQueryEngine接口模拟)
- **任务2.3**: 1小时 (MCPHandler基础模拟)
- **任务2.4**: 1小时 (全面功能测试)
- **测试和验证**: 0.5小时

**总计**: 5小时 (分2-3个会话完成)

## 成功标准
1. ✅ EnhancedToolRegistry模拟支持所有关键接口
2. ✅ EnhancedQueryEngine模拟正确处理消息和工具调用
3. ✅ MCPHandler模拟支持基本的MCP协议交互
4. ✅ 集成测试覆盖主要交互场景
5. ✅ 性能基准测试提供可比较的数据

## 风险与缓解
| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 接口理解不准确 | 中 | 基于阶段1已验证的接口设计，参考真实代码注释 |
| 模拟实现过于复杂 | 低 | 保持简化，仅实现测试所需的核心功能 |
| 与真实组件差异过大 | 中 | 定期与真实组件接口对比验证 |
| 时间超出预估 | 低 | 分任务执行，每个任务后进行评估 |

## 技术策略
**延续路径B策略**:
1. **渐进式实现**: 从简单到复杂，逐步增加功能
2. **接口优先**: 先定义清晰的接口契约，再实现具体功能
3. **测试驱动**: 为每个功能先编写测试，再实现代码
4. **快速验证**: 每个子任务完成后立即验证功能

## 关键决策点
1. **接口设计验证**: 完成每个模拟类后，与真实组件接口对比
2. **集成测试设计**: 设计反映真实使用场景的测试用例
3. **性能基准建立**: 建立可重复的性能测试基准
4. **错误处理覆盖**: 确保模拟组件包含基本的错误处理

## 交付成果
1. **代码**:
   - 3个完整的模拟组件 (EnhancedToolRegistry, EnhancedQueryEngine, MCPHandler)
   - 1个综合集成测试文件
   - 更新的测试运行脚本

2. **文档**:
   - 模拟组件接口文档
   - 集成测试用例说明
   - 性能基准报告

3. **验证**:
   - 所有模拟组件通过基本功能测试
   - 集成测试覆盖主要交互场景
   - 性能基准测试数据

## 下一步
阶段2完成后，进入阶段3：EnhancedEngineAdapter适配器测试，开始集成真实EnhancedEngineAdapter组件。

---
*创建时间: 2026年4月13日 01:15*
*阶段状态: 待开始*
*预计开始: 2026年4月13日 上午*
*前提条件: 阶段1已完成并验证*
*负责人: 开发团队*

**路径B策略延续确认**: ✅ 功能验证优先，渐进式集成，风险隔离，快速反馈