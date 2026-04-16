"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserAutomator = void 0;
const vscode = __importStar(require("vscode"));
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const url_1 = require("url");
class BrowserAutomator {
    outputChannel;
    isInitialized = false;
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Browser');
    }
    /**
     * 初始化浏览器实例（轻量级HTTP客户端）
     */
    async initialize(options = {}) {
        try {
            this.outputChannel.show(true);
            this.outputChannel.appendLine('🌐 Initializing lightweight browser client...');
            this.isInitialized = true;
            this.outputChannel.appendLine('✅ Browser client initialized');
            return true;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Browser initialization failed: ${error.message}`);
            vscode.window.showErrorMessage(`Browser initialization failed: ${error.message}`);
            return false;
        }
    }
    /**
     * 执行浏览器自动化序列（简化版）
     */
    async executeSequence(url, actions) {
        const startTime = Date.now();
        const results = [];
        let error;
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                return {
                    success: false,
                    output: 'Browser initialization failed',
                    error: 'Failed to initialize browser',
                    actions,
                    duration: 0
                };
            }
        }
        try {
            // 验证URL
            let targetUrl = url;
            if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                targetUrl = 'https://' + targetUrl;
            }
            this.outputChannel.appendLine(`🌐 Processing URL: ${targetUrl}`);
            // 执行动作序列
            for (let i = 0; i < actions.length; i++) {
                const action = actions[i];
                try {
                    this.outputChannel.appendLine(`🔧 Executing action ${i + 1}: ${action.type}`);
                    const result = await this.executeAction(targetUrl, action);
                    results.push(result);
                }
                catch (actionError) {
                    this.outputChannel.appendLine(`❌ Action ${i + 1} failed: ${actionError.message}`);
                    error = `Action ${i + 1} (${action.type}) failed: ${actionError.message}`;
                    break;
                }
            }
            const duration = Date.now() - startTime;
            return {
                success: !error,
                output: results.join('\n\n'),
                error,
                actions,
                duration,
                url: targetUrl
            };
        }
        catch (mainError) {
            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`❌ Browser automation failed: ${mainError.message}`);
            return {
                success: false,
                output: results.join('\n\n'),
                error: mainError.message,
                actions,
                duration
            };
        }
    }
    /**
     * 执行单个浏览器动作（简化版）
     */
    async executeAction(url, action) {
        switch (action.type) {
            case 'navigate':
                // 获取页面内容
                const content = await this.fetchUrl(url);
                const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
                const title = titleMatch ? titleMatch[1].trim() : 'No title found';
                const contentLength = content.length;
                return `Navigated to: ${url}\nTitle: "${title}"\nContent length: ${contentLength} characters`;
            case 'extract':
                if (!action.selector) {
                    throw new Error('Extract action requires selector pattern');
                }
                // 简单的内容提取（使用正则表达式）
                const pageContent = await this.fetchUrl(url);
                let extracted = '';
                if (action.selector.startsWith('title')) {
                    const titleMatch = pageContent.match(/<title[^>]*>([^<]+)<\/title>/i);
                    extracted = titleMatch ? titleMatch[1].trim() : 'No title found';
                }
                else if (action.selector.startsWith('h1')) {
                    const h1Match = pageContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
                    extracted = h1Match ? h1Match[1].trim() : 'No h1 found';
                }
                else if (action.selector.includes('text=')) {
                    // 提取包含特定文本的内容
                    const searchText = action.selector.split('text=')[1];
                    const lines = pageContent.split('\n');
                    const matchingLines = lines.filter(line => line.toLowerCase().includes(searchText.toLowerCase()));
                    extracted = matchingLines.slice(0, 5).join('\n'); // 最多5行
                }
                else {
                    // 通用选择器（简化）
                    extracted = `Simple selector extraction for "${action.selector}" is limited.\nFor advanced extraction, full browser automation (Puppeteer) is required.`;
                }
                return `Extracted from ${url} using selector "${action.selector}":\n${extracted}`;
            case 'test':
                // 测试连接
                const testResult = await this.testConnection(url);
                return `Connection test for ${url}:\n${testResult}`;
            default:
                throw new Error(`Unsupported action type in lightweight browser: ${action.type}`);
        }
    }
    /**
     * 获取URL内容
     */
    async fetchUrl(urlString) {
        return new Promise((resolve, reject) => {
            const url = new url_1.URL(urlString);
            const protocol = url.protocol === 'https:' ? https : http;
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname + url.search,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 CodeLine/1.0'
                }
            };
            const req = protocol.get(options, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}`));
                    return;
                }
                let data = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(data);
                });
            });
            req.on('error', (err) => {
                reject(err);
            });
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }
    /**
     * 测试连接
     */
    async testConnection(url) {
        try {
            const startTime = Date.now();
            await this.fetchUrl(url);
            const duration = Date.now() - startTime;
            return `✅ Connection successful\nResponse time: ${duration}ms`;
        }
        catch (error) {
            return `❌ Connection failed: ${error.message}`;
        }
    }
    /**
     * 生成浏览器自动化结果的HTML报告
     */
    generateHtmlReport(result) {
        const statusClass = result.success ? 'browser-success' : 'browser-error';
        const statusIcon = result.success ? '✅' : '❌';
        const duration = result.duration ? `${result.duration}ms` : 'N/A';
        return `
<div class="browser-result ${statusClass}">
  <div class="browser-header">
    <h3>${statusIcon} Browser Automation (Lightweight)</h3>
    <div class="browser-meta">
      ${result.url ? `<span>URL: ${result.url}</span>` : ''}
      <span>Duration: ${duration}</span>
      <span>Actions: ${result.actions.length}</span>
    </div>
  </div>
  
  ${result.url ? `
  <div class="browser-url">
    <strong>URL:</strong> <code>${this.escapeHtml(result.url)}</code>
  </div>
  ` : ''}
  
  <div class="browser-actions">
    <h4>Actions Executed:</h4>
    <ol>
      ${result.actions.map((action, index) => `
        <li>
          <code>${action.type}</code>
          ${action.selector ? ` | Selector: <code>${action.selector}</code>` : ''}
          ${action.text ? ` | Text: "${action.text}"` : ''}
          ${action.url ? ` | URL: ${action.url}` : ''}
        </li>
      `).join('')}
    </ol>
  </div>
  
  <div class="browser-output">
    <h4>Output:</h4>
    <pre>${this.escapeHtml(result.output || '(no output)')}</pre>
  </div>
  
  ${result.error ? `
  <div class="browser-error-output">
    <h4>Error:</h4>
    <pre>${this.escapeHtml(result.error)}</pre>
  </div>
  ` : ''}
  
  <div class="browser-note">
    <p><strong>Note:</strong> This is a lightweight browser implementation using HTTP requests only.</p>
    <p>For full browser automation (clicking, typing, screenshots), Puppeteer integration is required.</p>
  </div>
</div>`;
    }
    /**
     * 执行简单的网页抓取
     */
    async scrapePage(url, selectors) {
        try {
            const pageContent = await this.fetchUrl(url);
            const results = {};
            for (const [key, selector] of Object.entries(selectors)) {
                if (selector === 'title') {
                    const titleMatch = pageContent.match(/<title[^>]*>([^<]+)<\/title>/i);
                    results[key] = titleMatch ? titleMatch[1].trim() : 'No title found';
                }
                else if (selector.startsWith('h')) {
                    // h1, h2, etc.
                    const tag = selector;
                    const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, 'i');
                    const match = pageContent.match(regex);
                    results[key] = match ? match[1].trim() : `No ${tag} found`;
                }
                else {
                    results[key] = `Selector "${selector}" requires full browser automation`;
                }
            }
            return results;
        }
        catch (error) {
            throw new Error(`Scraping failed: ${error.message}`);
        }
    }
    /**
     * 测试浏览器连接和功能
     */
    async testBrowser() {
        try {
            this.outputChannel.appendLine('🧪 Testing browser functionality...');
            const testUrl = 'https://httpbin.org/html';
            const result = await this.testConnection(testUrl);
            this.outputChannel.appendLine(result);
            const success = result.includes('✅');
            if (success) {
                this.outputChannel.appendLine('✅ Browser test passed');
            }
            else {
                this.outputChannel.appendLine('❌ Browser test failed');
            }
            return success;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Browser test failed: ${error.message}`);
            return false;
        }
    }
    /**
     * 关闭浏览器（清理资源）
     */
    async close() {
        this.outputChannel.appendLine('🔒 Browser client closed');
    }
    /**
     * 获取浏览器状态
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            lightweight: true,
            outputChannel: this.outputChannel !== null
        };
    }
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
    }
}
exports.BrowserAutomator = BrowserAutomator;
//# sourceMappingURL=browserAutomator.js.map