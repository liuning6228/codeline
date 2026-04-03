// 检查mockVscode导出结构
const mockVscode = require('./out/test/helpers/mockVscode.js');
console.log('mockVscode对象键:', Object.keys(mockVscode));
console.log('mockVscode.mockVscode:', mockVscode.mockVscode ? 'defined' : 'undefined');
if (mockVscode.mockVscode) {
  console.log('mockVscode.mockVscode.workspace:', mockVscode.mockVscode.workspace ? 'defined' : 'undefined');
}
console.log('mockVscode.default:', mockVscode.default ? 'defined' : 'undefined');
if (mockVscode.default) {
  console.log('mockVscode.default.workspace:', mockVscode.default.workspace ? 'defined' : 'undefined');
}