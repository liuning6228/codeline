# Cline UI壳 + Claude Code核 架构改造计划

## 🎯 项目目标

**核心指令**：使用Cline的UI和交互作为用户交互的壳子，套在Claude Code的优秀程序开发框架上。

### 具体要求
1. **UI完全一致**：包括Chat、MCP、History、Settings图标按钮（顶部右侧，图标+工具提示），Account暂时不要
2. **交互逻辑完全一致**：文件差异审批流程、工具执行流程、实时进度反馈、错误处理模式等一致
3. **架构继承**：使用Claude Code的QueryEngine、工具系统、插件架构
4. **插件支持**：支持当前参考Claude Code的插件
5. **不复制代码**：重新实现所有功能，确保像素级一致性

## 🏗️ 四层架构模型

```
┌─────────────────────────────────────────┐
│         UI层（Cline外观与交互）           │ ← 重新实现，像素级一致
│                                         │
│   • Navbar（Chat、MCP、History、Settings）│
│   • ChatView（聊天界面）                 │
│   • DiffEditRow（文件差异审批）          │
│   • ToolGroupRenderer（工具执行）        │
│   • SettingsView（设置界面）             │
├─────────────────────────────────────────┤
│       通信适配层（GRPC→VS Code API）      │ ← 替换底层通信
│                                         │
│   • FileServiceAdapter                 │
│   • ToolServiceAdapter                 │
│   • UiServiceAdapter                   │
│   • StateServiceAdapter                │
├─────────────────────────────────────────┤
│   Claude Code核心引擎层（QueryEngine）    │ ← 继承全部架构优势
│                                         │
│   • QueryEngine（配置驱动对话引擎）       │
│   • 40+插件化工具系统                   │
│   • 状态管理和上下文跟踪                │
│   • 异步生成器和流式响应                │
├─────────────────────────────────────────┤
│      工具系统层（Claude Code插件）        │ ← 支持Claude Code插件
│                                         │
│   • 插件发现和注册机制                  │
│   • 工具权限和安全管理                  │
│   • 工具执行和进度报告                  │
│   • 工具结果格式适配                    │
└─────────────────────────────────────────┘
```

## 📋 详细实施计划

### 第一阶段：基础架构搭建（1-2天）

#### 目标
建立React WebView项目基础，设计适配层接口，确保技术栈与Cline完全一致。

#### 任务
1. **技术栈确认**
   - ✅ Vite + React + TypeScript（与Cline一致）
   - ✅ TailwindCSS（与Cline一致）
   - ✅ Lucide图标库（与Cline一致）
   - ✅ Radix UI组件库（与Cline一致）
   - ✅ VS Code WebView UI Toolkit（适配VS Code主题）

2. **项目结构重构**
   ```
   /codeline/webview-ui/
   ├── src/
   │   ├── components/           # 重新实现的Cline组件
   │   │   ├── chat/            # ChatView及子组件
   │   │   ├── menu/            # Navbar（优先实现）
   │   │   ├── mcp/             # MCP配置界面
   │   │   ├── history/         # 历史记录界面
   │   │   └── settings/        # 设置界面（权限设置等）
   │   ├── adapters/            # 通信适配层
   │   │   ├── cline-to-vscode.ts     # GRPC→VS Code API转换
   │   │   ├── vscode-to-claude.ts    # VS Code→Claude Code转换
   │   │   └── format-adapters/       # 格式转换适配器
   │   ├── claude-integration/  # Claude Code集成
   │   │   ├── query-engine.ts  # QueryEngine封装
   │   │   ├── tool-adapter.ts  # 工具系统适配
   │   │   └── plugin-loader.ts # 插件加载器
   │   ├── context/             # React Context
   │   │   ├── ExtensionStateContext.tsx
   │   │   ├── ClineAuthContext.tsx
   │   │   └── PlatformContext.tsx
   │   └── types/               # TypeScript类型定义
   │       ├── cline-types.ts   # Cline类型定义
   │       ├── claude-types.ts  # Claude Code类型定义
   │       └── adapter-types.ts # 适配器类型定义
   ```

3. **核心适配接口设计**
   ```typescript
   // 文件操作适配器（Cline FileServiceClient → VS Code API）
   interface FileServiceAdapter {
     openFileRelativePath(path: string): Promise<void>
     selectFiles(supportsImages: boolean): Promise<{images: string[], files: string[]}>
     copyToClipboard(text: string): Promise<void>
     readFile(path: string): Promise<string>
     writeFile(path: string, content: string): Promise<void>
   }
   
   // 工具执行适配器（UI → Claude Code工具系统）
   interface ToolServiceAdapter {
     executeTool(toolName: string, params: any): Promise<ToolResult>
     streamProgress(callback: (progress: ToolProgress) => void): void
     cancelTool(executionId: string): Promise<void>
     getToolList(): Promise<ToolDefinition[]>
   }
   
   // UI服务适配器
   interface UiServiceAdapter {
     subscribeToShowWebview(callback: (event: ShowWebviewEvent) => void): () => void
     subscribeToAddToInput(callback: (event: AddToInputEvent) => void): () => void
     showAnnouncement(): Promise<void>
   }
   ```

### 第二阶段：UI组件重新实现（3-5天）

#### 目标
逐个重新实现Cline的关键UI组件，确保像素级一致性。

#### 组件优先级清单

1. **Navbar.tsx - 顶部导航栏**（最高优先级）
   - 图标按钮位置、大小、间距完全一致
   - 工具提示内容和显示方式一致
   - 点击动画和状态反馈一致
   - 按钮：Chat、MCP、History、Settings（Account暂时不要）

2. **ChatView.tsx - 主聊天界面**
   - 输入框布局和样式（字体、间距、边框）
   - 消息区域滚动行为（自动滚动到底部）
   - 文件/图片附件选择器（最大数量限制）
   - 发送按钮状态管理（禁用状态、加载状态）
   - 欢迎页面（无任务时显示）

3. **DiffEditRow.tsx - 文件差异审批组件**（关键交互组件）
   - 文件块折叠/展开动画
   - 增删行颜色和标记（绿色+/红色-）
   - 打开文件按钮位置和行为
   - 滚动跟随行为（流式差异显示）
   - 行号显示格式

4. **ToolGroupRenderer.tsx - 工具执行组件**
   - 工具图标和名称显示
   - 进度指示器样式（活动状态）
   - 工具结果展示格式（文件列表、搜索结果等）
   - 错误处理显示方式

5. **SettingsView.tsx - 设置界面**
   - 权限设置（AutoApproveBar、AutoApproveMenuItem等）
   - 模型配置界面（API密钥、模型选择）
   - 主题和外观设置

#### 实现策略
- **像素级对比**：使用截图工具对比Cline和CodeLine的每个组件
- **交互录制**：录制Cline的交互流程，在CodeLine中复现
- **CSS提取**：提取Cline的关键CSS样式，确保视觉效果一致
- **图标资源**：使用相同的Lucide图标和大小

### 第三阶段：交互逻辑集成（2-3天）

#### 目标
确保所有用户交互流程与Cline完全一致。

#### 关键交互流程对比表

| 交互场景 | Cline实现 | CodeLine实现 | 一致性验证 |
|---------|-----------|--------------|-----------|
| 文件差异审批 | DiffEditRow + GRPC | 相同UI + 适配层 + Claude Code工具 | 像素级截图对比 |
| 工具执行 | ToolGroupRenderer + GRPC | 相同UI + 适配层 + Claude Code工具 | 进度反馈时间对比 |
| 实时进度反馈 | 流式响应 + 进度条 | 相同UI + Claude Code进度回调 | 动画速度和颜色对比 |
| 错误处理 | 错误提示模态框 | 相同UI + Claude Code错误格式转换 | 错误消息格式对比 |
| 权限设置 | AutoApproveBar + 规则 | 相同UI + Claude Code权限系统 | 规则匹配逻辑对比 |

#### 适配层实现细节

1. **格式转换适配器**
   ```typescript
   // 将Claude Code的FileEdit工具输出转换为Cline的Diff格式
   function adaptClaudeFileEditToClineDiff(claudeOutput: FileEditResult): ClineDiffFormat {
     return {
       action: claudeOutput.operation, // "Add" | "Update" | "Delete"
       path: claudeOutput.path,
       lines: claudeOutput.diffLines,
       additions: claudeOutput.additions,
       deletions: claudeOutput.deletions
     }
   }
   
   // 将Claude Code的工具进度转换为Cline的进度指示器格式
   function adaptClaudeProgressToClineUI(progress: ToolProgress): ClineProgressIndicator {
     return {
       percentage: progress.percentage,
       message: progress.message,
       estimatedTimeRemaining: progress.eta,
       isIndeterminate: progress.indeterminate
     }
   }
   ```

2. **状态同步机制**
   - 使用React Context管理UI状态
   - 使用VS Code的全局状态管理扩展状态
   - 确保UI状态与Claude Code引擎状态同步

### 第四阶段：Claude Code集成（2-3天）

#### 目标
将Claude Code的核心引擎无缝集成到CodeLine中。

#### 集成任务

1. **QueryEngine集成**
   ```typescript
   // 创建配置驱动的QueryEngine实例
   import { QueryEngine } from '@claude-code/core'
   
   const queryEngine = new QueryEngine({
     // 工具配置
     tools: [
       ...claudeCodeCoreTools,
       ...adaptedCodeLineTools, // CodeLine现有功能包装为工具
       ...thirdPartyPlugins     // Claude Code插件
     ],
     
     // 模型配置
     model: {
       provider: config.modelProvider,
       name: config.modelName,
       apiKey: config.apiKey
     },
     
     // 系统提示
     systemPrompt: config.systemPrompt,
     
     // 上下文配置
     context: {
       maxTokens: config.maxContextTokens,
       includeFileContents: true,
       includeTerminalOutput: true
     }
   })
   ```

2. **工具系统适配**
   - **文件操作工具**：包装CodeLine的FileManager为Claude Code工具
   - **终端执行工具**：集成Claude Code的BashTool，添加VS Code终端适配
   - **浏览器工具**：集成Claude Code的BrowserTool，适配VS Code的WebView
   - **代码分析工具**：包装CodeLine的ProjectAnalyzer为工具

3. **插件支持实现**
   - 实现Claude Code的插件发现机制
   - 支持`.claude-code/plugins`目录结构
   - 插件工具自动注册到QueryEngine
   - 插件权限和沙箱隔离

4. **性能优化**
   - 工具执行结果缓存
   - 大文件分块处理
   - 流式响应优化
   - 内存使用监控

### 第五阶段：测试验证（1-2天）

#### 目标
确保UI和交互完全一致，功能完整可用。

#### 测试方法

1. **视觉一致性测试**
   - 使用pixelmatch或类似工具进行像素级对比
   - 自动化截图关键界面状态
   - 建立视觉回归测试套件

2. **交互流程测试**
   - 录制Cline的用户操作序列
   - 在CodeLine中回放相同操作
   - 对比每个步骤的UI状态和响应时间

3. **功能完整性测试**
   - 测试所有Cline功能在CodeLine中的可用性
   - 特别关注"修改程序、阅读、新建程序文档"场景
   - 验证Claude Code插件的兼容性

4. **性能对比测试**
   - 工具执行速度对比
   - 内存使用对比
   - 响应时间对比

#### 验收标准

1. **UI一致性**：普通用户无法区分Cline和CodeLine界面
2. **交互一致性**：所有用户操作流程和反馈完全一致
3. **功能完整性**：Cline所有功能在CodeLine中可用
4. **性能可接受**：响应时间差异不超过20%

## 🚀 立即执行步骤

### 第一步：分析现有webview-ui结构
1. 对比CodeLine现有webview-ui与Cline的差异
2. 确定需要保留的CodeLine特色功能
3. 制定组件迁移策略

### 第二步：创建基础架构
1. 建立适配层接口定义
2. 配置TypeScript类型定义
3. 设置开发环境和构建脚本

### 第三步：实现Navbar组件
1. 从Cline的Navbar.tsx分析开始
2. 重新实现，替换GRPC调用为VS Code API
3. 验证像素级一致性

## 📊 风险管理

### 技术风险
1. **React与VS Code WebView兼容性**：已有经验，风险低
2. **Claude Code架构复杂度**：已分析核心模块，风险中
3. **性能影响**：渐进式优化，风险可控

### 项目风险
1. **时间估计**：各阶段有缓冲时间
2. **功能遗漏**：建立完整的验收清单
3. **质量保证**：自动化测试和手动验证结合

### 缓解策略
1. **增量开发**：每个组件独立开发验证
2. **持续对比**：每个功能都与Cline对比
3. **用户反馈**：早期展示成果获取反馈

## 📝 成功指标

1. **视觉一致性**：95%以上的像素匹配率
2. **交互一致性**：所有用户操作路径验证通过
3. **功能完整性**：100%的Cline核心功能覆盖
4. **性能表现**：关键操作响应时间<2秒
5. **用户满意度**：无法区分Cline和CodeLine的体验

## 🔄 后续规划

### 短期（1个月）
完成所有核心组件的重新实现和集成

### 中期（2-3个月）
1. 优化性能和用户体验
2. 增加更多Claude Code插件支持
3. 扩展CodeLine特色功能

### 长期（6个月+）
1. 超越Cline的功能创新
2. 建立开发者生态系统
3. 成为VS Code生态中最佳的AI编程助手

---
**计划制定时间**：2026-04-07 00:34 (GMT+8)
**制定依据**：用户指令、Cline源码分析、Claude Code架构分析、CodeLine现状评估
**执行原则**：不复制代码，重新实现，确保像素级一致性和架构优越性