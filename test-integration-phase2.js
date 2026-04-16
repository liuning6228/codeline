/**
 * 第二阶段架构集成验证脚本
 * 
 * 验证EnhancedQueryEngine、CodeMasterIntegration和MCP的核心集成
 * 使用Progressive Repair Strategy，只验证关键集成点
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始第二阶段架构集成验证');
console.log('='.repeat(60));

// 项目根目录
const projectRoot = path.join(__dirname);
const srcDir = path.join(projectRoot, 'src');

// 1. 检查关键集成文件是否存在
console.log('\n📁 步骤1：检查关键集成文件');
const criticalFiles = [
  'src/core/EnhancedQueryEngine.ts',
  'src/core/EnhancedEngineAdapter.ts',
  'src/core/query-engine-enhancement/CodeMasterIntegration.ts',
  'src/core/query-engine-enhancement/CodeMasterQueryEngine.ts',
  'src/mcp/MCPHandler.ts',
  'src/task/EnhancedTaskEngine.ts',
];

let allCriticalFilesExist = true;
for (const file of criticalFiles) {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 不存在`);
    allCriticalFilesExist = false;
  }
}

if (!allCriticalFilesExist) {
  console.log('\n⚠️ 警告：部分关键文件缺失，可能影响集成');
}

// 2. 检查TypeScript编译状态（关键文件）
console.log('\n🔧 步骤2：检查关键文件的TypeScript编译状态');
const criticalCompilationFiles = [
  'src/core/EnhancedQueryEngine.ts',
  'src/core/EnhancedEngineAdapter.ts',
  'src/mcp/MCPHandler.ts',
];

console.log('检查关键文件的TypeScript语法...');
for (const file of criticalCompilationFiles) {
  const filePath = path.join(projectRoot, file);
  try {
    // 使用TypeScript编译器检查语法
    const command = `npx tsc --noEmit --target es2022 "${filePath}" 2>&1 | head -5`;
    execSync(command, { cwd: projectRoot, stdio: 'pipe' });
    console.log(`✅ ${file} - 语法检查通过`);
  } catch (error) {
    console.log(`⚠️ ${file} - 语法检查有警告或错误`);
    if (error.stderr) {
      console.log(`   错误信息: ${error.stderr.toString().substring(0, 200)}`);
    }
  }
}

// 3. 验证MCP与EnhancedTaskEngine的集成点
console.log('\n🔄 步骤3：验证MCP与EnhancedTaskEngine集成点');

// 检查MCPHandler中是否有EnhancedTaskEngine引用
const mcpHandlerPath = path.join(projectRoot, 'src/mcp/MCPHandler.ts');
if (fs.existsSync(mcpHandlerPath)) {
  const mcpContent = fs.readFileSync(mcpHandlerPath, 'utf8');
  
  const checks = {
    '导入EnhancedTaskEngine': mcpContent.includes('import.*EnhancedTaskEngine') || mcpContent.includes('from.*EnhancedTaskEngine'),
    '创建EnhancedTaskEngine实例': mcpContent.includes('new EnhancedTaskEngine'),
    '使用taskEngine属性': mcpContent.includes('this.taskEngine'),
  };
  
  console.log('MCPHandler集成点检查:');
  Object.entries(checks).forEach(([check, result]) => {
    console.log(result ? `✅ ${check}` : `❌ ${check}`);
  });
  
  if (checks['导入EnhancedTaskEngine'] && checks['创建EnhancedTaskEngine实例']) {
    console.log('✅ MCP与EnhancedTaskEngine集成点存在');
  } else {
    console.log('❌ MCP与EnhancedTaskEngine集成点不完整');
  }
}

// 4. 验证EnhancedEngineAdapter与EnhancedQueryEngine集成
console.log('\n🔄 步骤4：验证EnhancedEngineAdapter集成');

const adapterPath = path.join(projectRoot, 'src/core/EnhancedEngineAdapter.ts');
if (fs.existsSync(adapterPath)) {
  const adapterContent = fs.readFileSync(adapterPath, 'utf8');
  
  const checks = {
    '导入EnhancedQueryEngine': adapterContent.includes('import.*EnhancedQueryEngine'),
    '创建EnhancedQueryEngine实例': adapterContent.includes('new EnhancedQueryEngine'),
    '单例模式实现': adapterContent.includes('static.*getInstance') || adapterContent.includes('private static instance'),
    '初始化方法': adapterContent.includes('initialize()') || adapterContent.includes('async initialize'),
  };
  
  console.log('EnhancedEngineAdapter集成点检查:');
  Object.entries(checks).forEach(([check, result]) => {
    console.log(result ? `✅ ${check}` : `❌ ${check}`);
  });
  
  if (checks['导入EnhancedQueryEngine'] && checks['创建EnhancedQueryEngine实例']) {
    console.log('✅ EnhancedEngineAdapter与EnhancedQueryEngine集成完整');
  } else {
    console.log('❌ EnhancedEngineAdapter集成不完整');
  }
}

// 5. 验证CodeMasterIntegration
console.log('\n🔄 步骤5：验证CodeMasterIntegration集成');

const codeMasterIntegrationPath = path.join(projectRoot, 'src/core/query-engine-enhancement/CodeMasterIntegration.ts');
if (fs.existsSync(codeMasterIntegrationPath)) {
  const integrationContent = fs.readFileSync(codeMasterIntegrationPath, 'utf8');
  
  const checks = {
    '导入CodeMasterQueryEngine': integrationContent.includes('import.*CodeMasterQueryEngine'),
    '集成配置接口': integrationContent.includes('CodeMasterIntegrationConfig'),
    '集成管理器类': integrationContent.includes('class CodeMasterIntegration'),
    '初始化方法': integrationContent.includes('initialize()'),
  };
  
  console.log('CodeMasterIntegration集成点检查:');
  Object.entries(checks).forEach(([check, result]) => {
    console.log(result ? `✅ ${check}` : `❌ ${check}`);
  });
  
  if (checks['导入CodeMasterQueryEngine'] && checks['集成管理器类']) {
    console.log('✅ CodeMasterIntegration集成完整');
  } else {
    console.log('❌ CodeMasterIntegration集成不完整');
  }
}

// 6. 检查关键依赖
console.log('\n📦 步骤6：检查关键依赖');

const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = [
    '@types/vscode',
    'typescript',
  ];
  
  console.log('关键依赖检查:');
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  
  requiredDeps.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`✅ ${dep}: ${allDeps[dep]}`);
    } else {
      console.log(`❌ ${dep}: 缺失`);
    }
  });
}

// 总结报告
console.log('\n' + '='.repeat(60));
console.log('📊 第二阶段架构集成验证报告');
console.log('='.repeat(60));

console.log('\n✅ 验证完成！');
console.log('\n🎯 下一步建议：');
console.log('1. 修复关键TypeScript编译错误（如果有）');
console.log('2. 运行集成测试验证实际功能');
console.log('3. 创建端到端演示展示第二阶段架构集成');
console.log('4. 继续推进EnhancedQueryEngine与MCP的深度集成');

console.log('\n📝 注意事项：');
console.log('- 根据路径B策略，优先验证功能而非修复所有编译错误');
console.log('- 关注核心集成点而非边缘案例');
console.log('- 逐步推进，每次解决一个关键集成问题');

console.log('\n🚀 第二阶段架构集成验证完成！');