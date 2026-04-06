// WebView HTML Content - Extracted to avoid TypeScript template literal issues
export function getWebviewContent(): string {
    const css = getCSS();
    const js = getJavaScript();
    
    return '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '    <meta charset="UTF-8">' +
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '    <title>CodeLine</title>' +
        '    <style>' + css + '</style>' +
        '</head>' +
        '<body>' +
        '    <!-- Navigation Bar -->' +
        '    <div class="nav-bar">' +
        '        <button class="nav-tab active" data-view="chat" data-action="switch-view" data-view-name="chat">' +
        '            <span>Chat</span>' +
        '        </button>' +
        '        <button class="nav-tab" data-view="tasks" data-action="switch-view" data-view-name="tasks">' +
        '            <span>Tasks</span>' +
        '        </button>' +
        '        <button class="nav-tab" data-view="settings" data-action="switch-view" data-view-name="settings">' +
        '            <span>Settings</span>' +
        '        </button>' +
        '        <button class="nav-tab" data-view="permissions" data-action="switch-view" data-view-name="permissions">' +
        '            <span>Permissions</span>' +
        '        </button>' +
        '    </div>' +
        '    ' +
        '    <!-- Main Content -->' +
        '    <div class="main-content">' +
        '        <!-- Chat View -->' +
        '        <div class="chat-view active" id="chat-view">' +
        '            <div class="messages-container" id="messages-container"></div>' +
        '            <div class="input-area">' +
        '                <div class="input-container">' +
        '                    <textarea class="message-input" id="message-input" placeholder="Type a message..." rows="1"></textarea>' +
        '                    <div class="input-buttons">' +
        '                        <button class="input-btn" data-action="attach-file" title="Attach file">📎</button>' +
        '                        <button class="input-btn" data-action="mention-context" title="Mention context">@</button>' +
        '                        <button class="send-btn" id="send-button" data-action="send-message">Send</button>' +
        '                    </div>' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '        ' +
        '        <!-- Tasks View -->' +
        '        <div class="chat-view" id="tasks-view">' +
        '            <div class="view-header">' +
        '                <h2>Tasks</h2>' +
        '                <button class="action-btn" data-action="clear-tasks">Clear All</button>' +
        '            </div>' +
        '            <div class="tasks-list" id="tasks-list"></div>' +
        '        </div>' +
        '        ' +
        '        <!-- Settings View -->' +
        '        <div class="chat-view" id="settings-view">' +
        '            <div class="view-header">' +
        '                <h2>Settings</h2>' +
        '            </div>' +
        '            <div class="settings-list">' +
        '                <div class="setting-item">' +
        '                    <div class="setting-info">' +
        '                        <div class="setting-label">API Key</div>' +
        '                        <div class="setting-desc">Your API key for the AI service</div>' +
        '                    </div>' +
        '                    <input type="password" class="setting-input" id="api-key-input" placeholder="Enter API key...">' +
        '                </div>' +
        '                <div class="setting-item">' +
        '                    <div class="setting-info">' +
        '                        <div class="setting-label">Model</div>' +
        '                        <div class="setting-desc">Select the AI model to use</div>' +
        '                    </div>' +
        '                    <select class="setting-select" id="model-select">' +
        '                        <option value="gpt-4">GPT-4</option>' +
        '                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>' +
        '                        <option value="claude-3-opus">Claude 3 Opus</option>' +
        '                        <option value="claude-3-sonnet">Claude 3 Sonnet</option>' +
        '                    </select>' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '        ' +
        '        <!-- Permissions View -->' +
        '        <div class="chat-view" id="permissions-view">' +
        '            <div class="view-header">' +
        '                <h2>Auto-Approve Permissions</h2>' +
        '            </div>' +
        '            <div class="permissions-list">' +
        '                <div class="permission-item">' +
        '                    <input type="checkbox" class="permission-checkbox" id="perm-read-files" data-perm="readFiles">' +
        '                    <div class="permission-info">' +
        '                        <div class="permission-label">Read Files</div>' +
        '                        <div class="permission-desc">Allow reading files in the workspace</div>' +
        '                    </div>' +
        '                </div>' +
        '                <div class="permission-item">' +
        '                    <input type="checkbox" class="permission-checkbox" id="perm-edit-files" data-perm="editFiles">' +
        '                    <div class="permission-info">' +
        '                        <div class="permission-label">Edit Files</div>' +
        '                        <div class="permission-desc">Allow editing files (requires approval)</div>' +
        '                    </div>' +
        '                </div>' +
        '                <div class="permission-item">' +
        '                    <input type="checkbox" class="permission-checkbox" id="perm-execute-commands" data-perm="executeSafeCommands">' +
        '                    <div class="permission-info">' +
        '                        <div class="permission-label">Execute Commands</div>' +
        '                        <div class="permission-desc">Allow executing safe commands</div>' +
        '                    </div>' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '    ' +
        '    <script>' + js + '</script>' +
        '</body>' +
        '</html>';
}

function getCSS(): string {
    return `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #1e1e1e; color: #ffffff; height: 100vh;
            display: flex; flex-direction: column;
        }
        .nav-bar {
            display: flex; background: var(--vscode-editor-inactiveSelectionBackground, #252526);
            border-bottom: 1px solid var(--vscode-panel-border, #3e3e42);
            padding: 4px 8px; gap: 2px;
        }
        .nav-tab {
            padding: 6px 12px; background: transparent;
            color: var(--vscode-descriptionForeground, #888); border: none;
            border-radius: 3px; cursor: pointer; font-size: 12px;
            display: flex; align-items: center; gap: 4px; transition: all 0.15s;
        }
        .nav-tab:hover { background: var(--vscode-list-hoverBackground, #2a2d2e); color: var(--vscode-foreground, #cccccc); }
        .nav-tab.active { background: var(--vscode-editor-background, #1e1e1e); color: var(--vscode-foreground, #ffffff); }
        .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .chat-view { flex: 1; display: none; flex-direction: column; overflow: hidden; }
        .chat-view.active { display: flex; }
        .messages-container { flex: 1; overflow-y: auto; padding: 16px; }
        .message { margin-bottom: 16px; padding: 0 16px; }
        .message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground, #888); }
        .message-header .role { font-weight: 600; color: var(--vscode-foreground, #cccccc); }
        .message-content { line-height: 1.6; word-wrap: break-word; color: var(--vscode-foreground, #cccccc); font-size: 13px; }
        .message-content pre { background: var(--vscode-textCodeBlock-background, #0d0d0d); padding: 12px; border-radius: 3px; overflow-x: auto; font-family: var(--vscode-editor-font-family, 'Consolas', monospace); font-size: 12px; margin: 8px 0; }
        .message-content code { background: var(--vscode-textCodeBlock-background, #0d0d0d); padding: 2px 4px; border-radius: 3px; font-family: var(--vscode-editor-font-family, 'Consolas', monospace); font-size: 12px; }
        .input-area { padding: 12px 16px; border-top: 1px solid var(--vscode-panel-border, #3e3e42); background: var(--vscode-editor-background, #1e1e1e); }
        .input-container { display: flex; gap: 8px; align-items: flex-end; background: var(--vscode-input-background, #3c3c3c); border: 1px solid var(--vscode-input-border, #3c3c3c); border-radius: 6px; padding: 8px; }
        .input-container:focus-within { border-color: var(--vscode-focusBorder, #007fd4); }
        .message-input { flex: 1; background: transparent; border: none; color: var(--vscode-input-foreground, #cccccc); font-size: 13px; resize: none; outline: none; min-height: 20px; max-height: 200px; font-family: inherit; }
        .message-input::placeholder { color: var(--vscode-input-placeholderForeground, #888); }
        .input-buttons { display: flex; gap: 4px; align-items: center; }
        .input-btn { background: transparent; border: none; color: var(--vscode-descriptionForeground, #888); cursor: pointer; padding: 4px 8px; border-radius: 4px; font-size: 14px; }
        .input-btn:hover { background: var(--vscode-toolbar-hoverBackground, #2a2d2e); color: var(--vscode-foreground, #cccccc); }
        .send-btn { background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #ffffff); border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; }
        .send-btn:hover { background: var(--vscode-button-hoverBackground, #1177bb); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .view-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid var(--vscode-panel-border, #3e3e42); }
        .view-header h2 { font-size: 16px; font-weight: 600; margin: 0; }
        .action-btn { background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #ffffff); border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; }
        .tasks-list, .settings-list, .permissions-list { padding: 16px; overflow-y: auto; flex: 1; }
        .setting-item, .permission-item { display: flex; align-items: center; padding: 12px; border-bottom: 1px solid var(--vscode-panel-border, #2a2d2e); gap: 12px; }
        .setting-info, .permission-info { flex: 1; }
        .setting-label, .permission-label { font-size: 13px; font-weight: 500; margin-bottom: 2px; }
        .setting-desc, .permission-desc { font-size: 11px; color: var(--vscode-descriptionForeground, #888); }
        .setting-input, .setting-select { background: var(--vscode-input-background, #3c3c3c); border: 1px solid var(--vscode-input-border, #3c3c3c); color: var(--vscode-input-foreground, #cccccc); padding: 6px 10px; border-radius: 4px; font-size: 13px; min-width: 200px; }
        .permission-checkbox { width: 16px; height: 16px; cursor: pointer; }
        
        /* Cline-style tool cards */
        .cline-tool-card { background: var(--vscode-editor-background, #1e1e1e); border: 1px solid var(--vscode-panel-border, #3e3e42); border-radius: 6px; margin-bottom: 12px; overflow: hidden; }
        .cline-tool-header { display: flex; align-items: center; padding: 10px 12px; cursor: pointer; background: var(--vscode-editor-inactiveSelectionBackground, #252526); gap: 8px; }
        .cline-tool-tag { background: var(--vscode-badge-background, #007acc); color: var(--vscode-badge-foreground, #ffffff); padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 500; }
        .cline-tool-path { flex: 1; font-size: 12px; color: var(--vscode-foreground, #cccccc); font-family: var(--vscode-editor-font-family, monospace); }
        .cline-tool-arrow { color: var(--vscode-descriptionForeground, #888); font-size: 10px; transition: transform 0.2s; }
        .cline-tool-card.expanded .cline-tool-arrow { transform: rotate(90deg); }
        .cline-tool-content { display: none; padding: 12px; border-top: 1px solid var(--vscode-panel-border, #3e3e42); }
        .cline-tool-card.expanded .cline-tool-content { display: block; }
        .cline-code-block { background: var(--vscode-textCodeBlock-background, #0d0d0d); border-radius: 4px; padding: 12px; font-family: var(--vscode-editor-font-family, monospace); font-size: 12px; overflow-x: auto; }
        .cline-code-line { display: block; line-height: 1.5; }
        .cline-tool-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 10px 12px; border-top: 1px solid var(--vscode-panel-border, #3e3e42); background: var(--vscode-editor-inactiveSelectionBackground, #252526); }
        .cline-btn { padding: 6px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; }
        .cline-btn-save { background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #ffffff); }
        .cline-btn-reject { background: transparent; color: var(--vscode-descriptionForeground, #888); border: 1px solid var(--vscode-panel-border, #3e3e42); }
        .cline-btn:hover { opacity: 0.9; }
        .cline-tool-card.saved { border-color: #28a745; }
        .cline-tool-card.saved .cline-tool-header { background: rgba(40, 167, 69, 0.1); }
        .cline-tool-card.rejected { border-color: #dc3545; opacity: 0.7; }
        .cline-tool-card.rejected .cline-tool-header { background: rgba(220, 53, 69, 0.1); }
        .cline-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--vscode-editor-inactiveSelectionBackground, #252526); border-bottom: 1px solid var(--vscode-panel-border, #3e3e42); margin-bottom: 12px; }
        .cline-toolbar-text { font-size: 13px; color: var(--vscode-foreground, #cccccc); }
        .cline-toolbar-actions { display: flex; gap: 8px; }
        .cline-toolbar-btn { padding: 6px 12px; border: 1px solid var(--vscode-panel-border, #3e3e42); background: transparent; color: var(--vscode-foreground, #cccccc); border-radius: 4px; cursor: pointer; font-size: 12px; }
        .cline-toolbar-btn.primary { background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #ffffff); border-color: transparent; }
    `.replace(/\s+/g, ' ').trim();
}

function getJavaScript(): string {
    return `
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messages-container');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        
        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 200) + 'px';
        });
        
        // Send message on Enter (Shift+Enter for new line)
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Event delegation for all buttons
        document.addEventListener('click', function(e) {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            
            const action = target.dataset.action;
            console.log('Button clicked:', action);
            
            switch (action) {
                case 'send-message':
                    sendMessage();
                    break;
                case 'switch-view':
                    switchView(target.dataset.viewName);
                    break;
                case 'attach-file':
                    vscode.postMessage({ command: 'attachFile' });
                    break;
                case 'mention-context':
                    insertAtCursor('@');
                    break;
                case 'approve-diff':
                    approveDiff(target.dataset.diffId);
                    break;
                case 'reject-diff':
                    rejectDiff(target.dataset.diffId);
                    break;
                case 'approve-all-diffs':
                    approveAllDiffs();
                    break;
                case 'reject-all-diffs':
                    rejectAllDiffs();
                    break;
                case 'preview-diff':
                    previewDiff(target.dataset.diffId, target.dataset.filePath);
                    break;
                case 'clear-tasks':
                    vscode.postMessage({ command: 'clearTasks' });
                    break;
            }
        });
        
        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;
            
            vscode.postMessage({ command: 'sendMessage', text: text });
            messageInput.value = '';
            messageInput.style.height = 'auto';
            sendButton.disabled = true;
        }
        
        function switchView(viewName) {
            document.querySelectorAll('.chat-view').forEach(v => v.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.getElementById(viewName + '-view').classList.add('active');
            document.querySelector('[data-view="' + viewName + '"]').classList.add('active');
        }
        
        function insertAtCursor(text) {
            const start = messageInput.selectionStart;
            const end = messageInput.selectionEnd;
            messageInput.value = messageInput.value.substring(0, start) + text + messageInput.value.substring(end);
            messageInput.selectionStart = messageInput.selectionEnd = start + text.length;
            messageInput.focus();
        }
        
        function approveDiff(diffId) {
            vscode.postMessage({ command: 'approveDiff', diffId: diffId, action: 'approve' });
        }
        
        function rejectDiff(diffId) {
            vscode.postMessage({ command: 'approveDiff', diffId: diffId, action: 'reject' });
        }
        
        function approveAllDiffs() {
            document.querySelectorAll('[data-action="approve-diff"]').forEach(btn => {
                approveDiff(btn.dataset.diffId);
            });
        }
        
        function rejectAllDiffs() {
            document.querySelectorAll('[data-action="reject-diff"]').forEach(btn => {
                rejectDiff(btn.dataset.diffId);
            });
        }
        
        function previewDiff(diffId, filePath) {
            vscode.postMessage({ command: 'previewDiff', diffId: diffId, filePath: filePath });
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function addMessage(message) {
            const div = document.createElement('div');
            div.className = 'message';
            div.innerHTML = '<div class="message-header"><span class="role">' + escapeHtml(message.role) + '</span></div>' +
                '<div class="message-content">' + escapeHtml(message.content) + '</div>';
            messagesContainer.appendChild(div);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Handle messages from extension
        window.addEventListener('message', function(event) {
            const message = event.data;
            console.log('WebView received:', message);
            
            switch (message.command) {
                case 'addMessage':
                    addMessage(message);
                    sendButton.disabled = false;
                    break;
                case 'showPendingDiffs':
                    showPendingDiffsInUI(message.diffs);
                    break;
                case 'diffApproved':
                    updateDiffCard(message.diffId, 'saved');
                    break;
                case 'diffRejected':
                    updateDiffCard(message.diffId, 'rejected');
                    break;
            }
        });
        
        function showPendingDiffsInUI(diffs) {
            if (!diffs || diffs.length === 0) return;
            
            const toolbar = document.createElement('div');
            toolbar.className = 'cline-toolbar';
            toolbar.innerHTML = '<span class="cline-toolbar-text">' + diffs.length + ' files to edit</span>' +
                '<div class="cline-toolbar-actions">' +
                '<button class="cline-toolbar-btn" data-action="reject-all-diffs">Reject All</button>' +
                '<button class="cline-toolbar-btn primary" data-action="approve-all-diffs">Save All</button>' +
                '</div>';
            messagesContainer.appendChild(toolbar);
            
            diffs.forEach(function(diff) {
                const card = createClineToolCard(diff);
                messagesContainer.appendChild(card);
            });
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function createClineToolCard(diff) {
            const card = document.createElement('div');
            card.className = 'cline-tool-card expanded';
            card.setAttribute('data-diff-id', diff.diffId);
            
            const codePreview = diff.newContent ? diff.newContent.split('\\n').slice(0, 20).map(function(line) {
                return '<span class="cline-code-line">' + escapeHtml(line) + '</span>';
            }).join('\\n') : 'No preview available';
            
            const operationTag = diff.filePath.includes('create') ? 'create_file' : 'write_to_file';
            
            card.innerHTML = '<div class="cline-tool-header" onclick="toggleClineCard(this)">' +
                '<span class="cline-tool-tag">' + operationTag + '</span>' +
                '<span class="cline-tool-path">' + escapeHtml(diff.filePath) + '</span>' +
                '<span class="cline-tool-arrow">▶</span>' +
                '</div>' +
                '<div class="cline-tool-content">' +
                '<div class="cline-code-block">' + codePreview + '</div>' +
                '</div>' +
                '<div class="cline-tool-actions">' +
                '<button class="cline-btn cline-btn-reject" data-action="reject-diff" data-diff-id="' + diff.diffId + '">Reject</button>' +
                '<button class="cline-btn cline-btn-save" data-action="approve-diff" data-diff-id="' + diff.diffId + '">Save</button>' +
                '</div>';
            
            return card;
        }
        
        window.toggleClineCard = function(header) {
            header.parentElement.classList.toggle('expanded');
        };
        
        function updateDiffCard(diffId, status) {
            const card = document.querySelector('[data-diff-id="' + diffId + '"]');
            if (card) {
                card.classList.add(status);
                card.classList.remove('expanded');
                card.querySelectorAll('.cline-btn').forEach(function(btn) {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                });
            }
        }
        
        messageInput.focus();
    `.trim();
}
