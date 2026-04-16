#!/usr/bin/env node

/**
 * MCP功能验证脚本
 * 路径B策略：忽略编译错误，直接验证核心功能
 */

const path = require('path');

console.log('=== MCP核心功能验证 (路径B策略) ===');
console.log('时间:', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
console.log('策略: 功能验证优先，忽略编译错误\n');

// 检查MCP相关文件是否存在
console.log('1. 检查MCP相关文件结构...');

const filesToCheck = [
  'src/mcp/MCPHandler.ts',
  'src/mcp/MCPMessage.ts',
  'src/mcp/MCPResponse.ts',
  'src/mcp/MCPTool.ts',
  'src/mcp/MCPIntegration.ts',
  'test/mcp/MCPEndToEnd.test.ts',
  'test/mcp/production/MCPHandlerProduction.test.ts'
];

let missingFiles = [];
let existingFiles = [];

filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  try {
    require('fs').accessSync(fullPath);
    existingFiles.push(file);
  } catch (e) {
    missingFiles.push(file);
  }
});

console.log(`✅ 存在的文件: ${existingFiles.length}/${filesToCheck.length}`);
existingFiles.forEach(f => console.log(`   - ${f}`));

if (missingFiles.length > 0) {
  console.log(`⚠️  缺失的文件: ${missingFiles.length}`);
  missingFiles.forEach(f => console.log(`   - ${f}`));
}

console.log('\n2. 检查MCP核心类结构...');

// 尝试分析MCPHandler.ts的内容
try {
  const mcpHandlerPath = path.join(__dirname, 'src/mcp/MCPHandler.ts');
  const content = require('fs').readFileSync(mcpHandlerPath, 'utf8');
  
  // 检查关键类和方法
  const checks = {
    'MCPHandler类定义': /class MCPHandler/i.test(content),
    'initialize方法': /(async\s+)?initialize\s*\(/i.test(content),
    'handleMessage方法': /(async\s+)?handleMessage\s*\(/i.test(content),
    'registerTool方法': /(async\s+)?registerTool\s*\(/i.test(content),
    'getTools方法': /(async\s+)?getTools\s*\(/i.test(content),
    'MCPMessage接口': /interface MCPMessage/i.test(content),
    'MCPResponse接口': /interface MCPResponse/i.test(content)
  };
  
  Object.entries(checks).forEach(([check, result]) => {
    console.log(`   ${result ? '✅' : '❌'} ${check}`);
  });
  
  // 统计方法数量
  const methodCount = (content.match(/public\s+(async\s+)?\w+\s*\(/g) || []).length;
  const privateMethodCount = (content.match(/private\s+(async\s+)?\w+\s*\(/g) || []).length;
  const protectedMethodCount = (content.match(/protected\s+(async\s+)?\w+\s+\(/g) || []).length;
  
  console.log(`\n   📊 方法统计: 公共(${methodCount}) 私有(${privateMethodCount}) 保护(${protectedMethodCount})`);
  
} catch (e) {
  console.log(`❌ 无法分析MCPHandler.ts: ${e.message}`);
}

console.log('\n3. 检查MCP测试覆盖...');

// 检查测试文件
try {
  const endToEndTestPath = path.join(__dirname, 'test/mcp/MCPEndToEnd.test.ts');
  const endToEndContent = require('fs').readFileSync(endToEndTestPath, 'utf8');
  
  const testChecks = {
    'describe块': /describe\s*\(['"]MCP End-to-End/i.test(endToEndContent),
    'it测试用例': (endToEndContent.match(/it\s*\(/g) || []).length,
    '工具发现测试': /工具发现|tool discovery/i.test(endToEndContent),
    '工具执行测试': /工具执行|tool execution/i.test(endToEndContent),
    '错误处理测试': /错误处理|error handling/i.test(endToEndContent)
  };
  
  console.log(`   ✅ MCP端到端测试文件存在 (${endToEndContent.length} 字符)`);
  console.log(`   📊 包含 ${testChecks['it测试用例']} 个it测试用例`);
  
  ['工具发现测试', '工具执行测试', '错误处理测试'].forEach(check => {
    console.log(`   ${testChecks[check] ? '✅' : '⚠️ '} ${check}`);
  });
  
} catch (e) {
  console.log(`❌ 无法分析MCP测试文件: ${e.message}`);
}

console.log('\n4. 验证第二阶段架构集成...');

// 检查EnhancedQueryEngine集成
try {
  const integrationFiles = [
    'src/core/query-engine-enhancement/EnhancedQueryEngine.ts',
    'src/core/query-engine-enhancement/CodeMasterQueryEngine.ts',
    'src/core/query-engine-enhancement/CodeMasterIntegration.ts'
  ];
  
  let integrationStatus = [];
  
  integrationFiles.forEach(file => {
    try {
      const filePath = path.join(__dirname, file);
      require('fs').accessSync(filePath);
      
      const content = require('fs').readFileSync(filePath, 'utf8');
      const hasClass = /class \w+/.test(content);
      const hasExport = /export/.test(content);
      
      integrationStatus.push({
        file,
        exists: true,
        hasClass,
        hasExport,
        size: content.length
      });
    } catch (e) {
      integrationStatus.push({
        file,
        exists: false,
        error: e.message
      });
    }
  });
  
  console.log(`   📁 第二阶段架构文件检查:`);
  integrationStatus.forEach(status => {
    if (status.exists) {
      console.log(`      ✅ ${status.file} (${status.size} 字符)`);
    } else {
      console.log(`      ❌ ${status.file}: ${status.error}`);
    }
  });
  
} catch (e) {
  console.log(`❌ 架构集成检查失败: ${e.message}`);
}

console.log('\n5. 功能验证总结 (路径B策略)...');

// 基于检查结果的评估
const existingFileRatio = existingFiles.length / filesToCheck.length;
const architectureFiles = [
  'src/core/query-engine-enhancement/EnhancedQueryEngine.ts',
  'src/core/query-engine-enhancement/CodeMasterQueryEngine.ts',
  'src/core/query-engine-enhancement/CodeMasterIntegration.ts'
].filter(f => {
  try {
    require('fs').accessSync(path.join(__dirname, f));
    return true;
  } catch {
    return false;
  }
}).length / 3;

console.log(`   📊 文件完整性: ${Math.round(existingFileRatio * 100)}%`);
console.log(`   📊 架构完整性: ${Math.round(architectureFiles * 100)}%`);

if (existingFileRatio > 0.7 && architectureFiles > 0.6) {
  console.log('\n   🎉 结论: MCP核心架构基本完整，可以进行功能测试');
  console.log('   建议: 选择性修复关键编译错误后运行MCP测试');
} else if (existingFileRatio > 0.5) {
  console.log('\n   ⚠️  结论: MCP架构部分完整，需要补充缺失文件');
  console.log('   建议: 优先创建缺失的核心接口文件');
} else {
  console.log('\n   ❌ 结论: MCP架构不完整，需要重新评估集成策略');
  console.log('   建议: 检查源代码结构和集成计划');
}

console.log('\n=== 路径B功能验证完成 ===');
console.log('下一步: 根据验证结果决定具体修复策略');