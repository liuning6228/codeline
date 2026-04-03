"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const SettingsView = ({ onClose }) => {
    const [settings, setSettings] = (0, react_1.useState)({
        apiKey: '',
        model: 'deepseek-chat',
        baseUrl: 'https://api.deepseek.com',
        temperature: 0.7,
        maxTokens: 2048,
        autoAnalyze: true,
        showExamples: true,
        typingIndicator: true,
    });
    const handleSave = () => {
        // 实际实现中会保存设置到 VS Code 配置
        alert('Settings saved!');
        onClose();
    };
    return (<div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Settings</h1>
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 hover:bg-secondary">
            Back to Chat
          </button>
        </div>

        <div className="space-y-8">
          {/* API Configuration */}
          <div className="rounded-lg border border-border p-6">
            <h2 className="mb-4 text-xl font-semibold">API Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">API Key</label>
                <input type="password" value={settings.apiKey} onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })} placeholder="Enter your API key" className="w-full rounded border border-border bg-secondary px-3 py-2 focus:border-primary focus:outline-none"/>
                <p className="mt-1 text-xs text-gray-500">
                  Your API key for AI services (DeepSeek, Claude, GPT, Qwen)
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Default Model</label>
                <select value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} className="w-full rounded border border-border bg-secondary px-3 py-2 focus:border-primary focus:outline-none">
                  <option value="deepseek-chat">DeepSeek Chat</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="qwen-max">Qwen Max</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">API Base URL</label>
                <input type="text" value={settings.baseUrl} onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })} placeholder="https://api.deepseek.com" className="w-full rounded border border-border bg-secondary px-3 py-2 focus:border-primary focus:outline-none"/>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Temperature: {settings.temperature}
                </label>
                <input type="range" min="0" max="1" step="0.1" value={settings.temperature} onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })} className="w-full"/>
                <p className="mt-1 text-xs text-gray-500">
                  Creativity level (0 = more deterministic, 1 = more creative)
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Max Tokens</label>
                <input type="number" min="100" max="8192" value={settings.maxTokens} onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })} className="w-full rounded border border-border bg-secondary px-3 py-2 focus:border-primary focus:outline-none"/>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="rounded-lg border border-border p-6">
            <h2 className="mb-4 text-xl font-semibold">Features</h2>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" checked={settings.autoAnalyze} onChange={(e) => setSettings({ ...settings, autoAnalyze: e.target.checked })} className="mr-3"/>
                <span>Auto-analyze project on startup</span>
              </label>

              <label className="flex items-center">
                <input type="checkbox" checked={settings.showExamples} onChange={(e) => setSettings({ ...settings, showExamples: e.target.checked })} className="mr-3"/>
                <span>Show example tasks</span>
              </label>

              <label className="flex items-center">
                <input type="checkbox" checked={settings.typingIndicator} onChange={(e) => setSettings({ ...settings, typingIndicator: e.target.checked })} className="mr-3"/>
                <span>Show typing indicator</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 hover:bg-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
              Save Settings
            </button>
            <button onClick={() => setSettings({
            apiKey: '',
            model: 'deepseek-chat',
            baseUrl: 'https://api.deepseek.com',
            temperature: 0.7,
            maxTokens: 2048,
            autoAnalyze: true,
            showExamples: true,
            typingIndicator: true,
        })} className="rounded-lg border border-border px-4 py-2 hover:bg-secondary">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>);
};
exports.default = SettingsView;
//# sourceMappingURL=SettingsView.js.map