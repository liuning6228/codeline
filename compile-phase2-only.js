/**
 * 仅编译第二阶段架构核心文件
 * 使用Progressive Repair Strategy，逐步修复关键错误
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始第二阶段架构核心文件编译');
console.log('='.repeat(60));

// 项目根目录
const projectRoot = __dirname;
const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

// 读取原始tsconfig
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

// 创建仅包含第二阶段架构核心文件的tsconfig
const phase2Tsconfig = {
  ...tsconfig,
  include: [
    'src/core/EnhancedQueryEngine.ts',
    'src/core/EnhancedEngineAdapter.ts',
    'src/core/query-engine-enhancement/CodeMasterQueryEngine.ts',
    'src/core/query-engine-enhancement/CodeMasterIntegration.ts',
    'src/mcp/MCPHandler.ts',
    'src/task/EnhancedTaskEngine.ts',
    'src/extension.ts'  // 主扩展文件
  ],
  exclude: []
};

// 写入临时tsconfig
const tempTsconfigPath = path.join(projectRoot, 'tsconfig.phase2.json');
fs.writeFileSync(tempTsconfigPath, JSON.stringify(phase2Tsconfig, null, 2));

console.log('📁 编译文件列表:');
phase2Tsconfig.include.forEach(file => {
  console.log(`  - ${file}`);
});

try {
  console.log('\n🔧 开始编译...');
  
  // 使用临时tsconfig编译
  const command = `npx tsc --project "${tempTsconfigPath}" --noEmit 2>&1`;
  const output = execSync(command, { cwd: projectRoot, encoding: 'utf8' });
  
  // 分析输出
  const lines = output.split('\n');
  const errorLines = lines.filter(line => line.includes('error TS'));
  const warningLines = lines.filter(line => line.includes('warning TS'));
  
  console.log(`\n📊 编译结果:`);
  console.log(`   总行数: ${lines.length}`);
  console.log(`   错误数: ${errorLines.length}`);
  console.log(`   警告数: ${warningLines.length}`);
  
  if (errorLines.length > 0) {
    console.log('\n❌ 编译错误（前10个）:');
    errorLines.slice(0, 10).forEach((error, i) => {
      console.log(`   ${i + 1}. ${error.substring(0, 150)}...`);
    });
    
    // 分类错误
    const errorTypes = {
      downlevelIteration: errorLines.filter(e => e.includes('TS2802')).length,
      typeMissing: errorLines.filter(e => e.includes('TS2339')).length,
      importMissing: errorLines.filter(e => e.includes('TS2305') || e.includes('TS2307')).length,
      other: errorLines.length - (errorLines.filter(e => e.includes('TS2802')).length + 
             errorLines.filter(e => e.includes('TS2339')).length + 
             errorLines.filter(e => e.includes('TS2305') || e.includes('TS2307')).length)
    };
    
    console.log('\n🔍 错误类型分析:');
    Object.entries(errorTypes).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`   ${type}: ${count}个`);
      }
    });
    
    // 建议修复方案
    console.log('\n🎯 修复建议:');
    
    if (errorTypes.downlevelIteration > 0) {
      console.log('   1. downlevelIteration错误: 检查tsconfig配置，确保target为ES2015或更高');
    }
    
    if (errorTypes.typeMissing > 0) {
      console.log('   2. 类型缺失错误: 可能是proto类型定义不匹配，可以暂时使用类型断言或any');
    }
    
    if (errorTypes.importMissing > 0) {
      console.log('   3. 导入缺失: 检查依赖包是否已安装');
    }
    
  } else {
    console.log('\n✅ 第二阶段架构核心文件编译通过！');
  }
  
  if (warningLines.length > 0) {
    console.log('\n⚠️ 编译警告（前5个）:');
    warningLines.slice(0, 5).forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning.substring(0, 100)}...`);
    });
  }
  
} catch (error) {
  console.log(`❌ 编译过程出错: ${error.message}`);
  
  // 尝试获取更多错误信息
  if (error.stderr) {
    const stderr = error.stderr.toString();
    const errorLines = stderr.split('\n').filter(line => line.includes('error TS'));
    console.log('\n提取的错误信息:');
    errorLines.slice(0, 5).forEach((line, i) => {
      console.log(`   ${i + 1}. ${line}`);
    });
  }
} finally {
  // 清理临时文件
  if (fs.existsSync(tempTsconfigPath)) {
    fs.unlinkSync(tempTsconfigPath);
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 第二阶段架构核心编译报告');
console.log('='.repeat(60));

console.log('\n🎯 根据路径B策略的建议:');
console.log('1. 如果核心文件编译通过或只有少量错误 → 继续推进功能开发');
console.log('2. 如果错误较多但可绕过 → 使用工作区变通方案');
console.log('3. 优先修复阻止功能的关键错误，而非所有编译错误');
console.log('4. 关注实际功能验证，而非完美编译');

console.log('\n🚀 编译检查完成！');