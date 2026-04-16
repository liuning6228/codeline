#!/bin/bash
echo "🔨 编译Phase 3权限系统测试文件..."

# 创建输出目录
mkdir -p out/test/security/permission-tests

# 编译测试文件
echo "📝 编译RuleManagerComprehensive测试..."
npx tsc test/security/permission-tests/RuleManagerComprehensive.test.ts \
  --outDir out/test \
  --target es2022 \
  --downlevelIteration \
  --module commonjs \
  --lib es2022,dom

echo "📝 编译CommandClassifierComprehensive测试..."
npx tsc test/security/permission-tests/CommandClassifierComprehensive.test.ts \
  --outDir out/test \
  --target es2022 \
  --downlevelIteration \
  --module commonjs \
  --lib es2022,dom

echo "📝 编译PermissionDialogComprehensive测试..."
npx tsc test/security/permission-tests/PermissionDialogComprehensive.test.ts \
  --outDir out/test \
  --target es2022 \
  --downlevelIteration \
  --module commonjs \
  --lib es2022,dom

echo "📝 编译CompletePermissionWorkflow测试..."
npx tsc test/security/permission-tests/CompletePermissionWorkflow.test.ts \
  --outDir out/test \
  --target es2022 \
  --downlevelIteration \
  --module commonjs \
  --lib es2022,dom

echo "✅ 所有测试文件编译完成!"
echo "📁 输出目录: out/test/security/permission-tests/"
ls -la out/test/security/permission-tests/*.js 2>/dev/null | wc -l | xargs echo "  生成文件数:"