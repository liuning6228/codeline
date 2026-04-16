module.exports = {
  extension: ['js', 'ts'],
  spec: 'dist/tests/**/*.test.js',
  require: [],
  timeout: 10000,
  exit: true,
  // 确保使用CommonJS模式
  loader: false,
  // 禁用ESM检测
  'experimental-specifier-resolution': 'node',
  'node-option': [
    'experimental-specifier-resolution=node',
    'loader=ts-node/esm'
  ]
};