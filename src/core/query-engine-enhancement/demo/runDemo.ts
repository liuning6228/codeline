#!/usr/bin/env node

/**
 * runDemo.ts - QueryEngine增强演示系统入口点
 * 
 * 运行完整的QueryEngine增强演示系统，展示所有新功能：
 * 1. 智能代码补全
 * 2. 代码生成和编辑
 * 3. 调试和分析
 * 4. 测试运行
 * 5. 代码重构
 * 6. 协作功能
 * 7. 性能监控
 * 8. 项目向导
 */

import * as path from 'path';
import { runCompleteDemoSystem } from '../examples/CompleteDemoSystem';

/**
 * 命令行参数解析
 */
interface CliOptions {
  /** 工作空间根目录 */
  workspace?: string;
  
  /** 输出目录 */
  outputDir?: string;
  
  /** 是否跳过清理 */
  noCleanup?: boolean;
  
  /** 是否禁用性能监控 */
  noPerformance?: boolean;
  
  /** 模块过滤 */
  modules?: string[];
  
  /** 帮助信息 */
  help?: boolean;
}

/**
 * 解析命令行参数
 */
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--workspace':
      case '-w':
        options.workspace = args[++i];
        break;
        
      case '--output':
      case '-o':
        options.outputDir = args[++i];
        break;
        
      case '--no-cleanup':
        options.noCleanup = true;
        break;
        
      case '--no-performance':
        options.noPerformance = true;
        break;
        
      case '--modules':
      case '-m':
        options.modules = args[++i].split(',');
        break;
        
      case '--help':
      case '-h':
        options.help = true;
        break;
        
      default:
        if (arg.startsWith('--')) {
          console.warn(`Unknown option: ${arg}`);
        }
    }
  }
  
  return options;
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(`
QueryEngine增强演示系统

使用方法:
  npx ts-node runDemo.ts [选项]

选项:
  -w, --workspace <path>     工作空间根目录 (默认: 当前目录)
  -o, --output <path>        输出目录 (默认: workspace/demo-output)
  --no-cleanup               不清理临时文件
  --no-performance           禁用性能监控
  -m, --modules <list>       运行指定模块 (逗号分隔)
  -h, --help                 显示此帮助信息

可用模块:
  integration_tests    集成测试验证
  tool_integration     工具集成演示
  smart_completion     智能代码补全
  code_refactoring     代码重构功能
  collaboration        协作功能
  performance          性能监控
  project_wizard       项目向导
  complete_workflow    完整工作流

示例:
  # 运行完整演示
  npx ts-node runDemo.ts
  
  # 运行指定模块
  npx ts-node runDemo.ts --modules smart_completion,code_refactoring
  
  # 指定工作空间和输出目录
  npx ts-node runDemo.ts --workspace ./my-project --output ./demo-results
`);
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const options = parseArgs();
  
  // 显示帮助信息
  if (options.help) {
    showHelp();
    return;
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('   QUERYENGINE ENHANCEMENT DEMONSTRATION SYSTEM');
  console.log('='.repeat(70));
  
  // 设置工作空间
  const workspaceRoot = options.workspace || process.cwd();
  const outputDir = options.outputDir || path.join(workspaceRoot, 'demo-output');
  
  console.log(`\n📁 Workspace: ${workspaceRoot}`);
  console.log(`📁 Output Directory: ${outputDir}`);
  
  // 构建配置
  const config: any = {
    workspaceRoot,
    outputDir,
    cleanupTempFiles: !options.noCleanup,
    performanceMonitoring: {
      enabled: !options.noPerformance,
      interval: 1000,
    },
  };
  
  // 如果有模块过滤，更新模块配置
  if (options.modules && options.modules.length > 0) {
    const enabledModules = new Set(options.modules.map(m => m.trim().toLowerCase()));
    
    config.modules = [
      { name: 'integration_tests', description: '集成测试验证', enabled: enabledModules.has('integration_tests'), weight: 1 },
      { name: 'tool_integration', description: '工具集成演示', enabled: enabledModules.has('tool_integration'), weight: 2 },
      { name: 'smart_completion', description: '智能代码补全', enabled: enabledModules.has('smart_completion'), weight: 3 },
      { name: 'code_refactoring', description: '代码重构功能', enabled: enabledModules.has('code_refactoring'), weight: 4 },
      { name: 'collaboration', description: '协作功能', enabled: enabledModules.has('collaboration'), weight: 5 },
      { name: 'performance', description: '性能监控', enabled: enabledModules.has('performance'), weight: 6 },
      { name: 'project_wizard', description: '项目向导', enabled: enabledModules.has('project_wizard'), weight: 7 },
      { name: 'complete_workflow', description: '完整工作流', enabled: enabledModules.has('complete_workflow'), weight: 8 },
    ];
  }
  
  try {
    // 运行演示系统
    const results = await runCompleteDemoSystem(workspaceRoot, config);
    
    // 计算统计信息
    const totalModules = results.length;
    const successfulModules = results.filter(r => r.success).length;
    const successRate = (successfulModules / totalModules) * 100;
    const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);
    
    console.log('\n' + '='.repeat(70));
    console.log('   DEMONSTRATION COMPLETE');
    console.log('='.repeat(70));
    
    console.log(`\n📊 Final Results:`);
    console.log(`   Total Modules: ${totalModules}`);
    console.log(`   Successful: ${successfulModules}`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`   Total Duration: ${totalDuration}ms`);
    console.log(`   Average Duration: ${(totalDuration / totalModules).toFixed(1)}ms`);
    
    // 显示模块结果
    console.log(`\n📋 Module Results:`);
    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration;
      console.log(`   ${status} ${(index + 1).toString().padStart(2)}. ${result.module.padEnd(20)} ${duration.toString().padStart(6)}ms`);
    });
    
    // 如果有失败的模块，显示错误信息
    const failedModules = results.filter(r => !r.success);
    if (failedModules.length > 0) {
      console.log(`\n⚠️  Failed Modules:`);
      failedModules.forEach(module => {
        console.log(`   - ${module.module}: ${module.error}`);
      });
    }
    
    // 显示报告位置
    console.log(`\n📄 Reports:`);
    console.log(`   Complete Report: ${path.join(outputDir, 'complete-demo-report.json')}`);
    console.log(`   Summary Report: ${path.join(outputDir, 'complete-demo-summary.txt')}`);
    
    // 显示下一步建议
    console.log(`\n🚀 Next Steps:`);
    if (successRate === 100) {
      console.log(`   1. Integrate enhanced components into main QueryEngine`);
      console.log(`   2. Create VS Code extension for user-friendly interface`);
      console.log(`   3. Run user testing and collect feedback`);
      console.log(`   4. Optimize performance based on monitoring data`);
    } else {
      console.log(`   1. Fix ${failedModules.length} failed module(s)`);
      console.log(`   2. Review error details in the reports`);
      console.log(`   3. Run specific module tests to verify fixes`);
      console.log(`   4. Re-run complete demonstration`);
    }
    
    console.log(`\n🎉 QueryEngine Enhancement Project Demonstration Completed!`);
    
  } catch (error: any) {
    console.error(`\n❌ Demonstration failed: ${error.message}`);
    console.error(`\nStack trace:`);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };