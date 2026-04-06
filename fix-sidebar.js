const fs = require('fs');
let content = fs.readFileSync('src/sidebar/sidebarProvider.ts', 'utf8');

// Find the _getWebviewContent method and replace it
const startMarker = '    private _getWebviewContent(): string {';
const endMarker = '    public show() {';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
    console.log('Could not find markers');
    process.exit(1);
}

// Keep everything before startMarker and from endMarker onwards
const before = content.substring(0, startIdx);
const after = content.substring(endIdx);

// Create new method that uses the external function
const newMethod = `    private _getWebviewContent(): string {
        return getWebviewContent();
    }


`;

// Add import statement if not present
let finalContent = before + newMethod + after;
if (!finalContent.includes("import { getWebviewContent }")) {
    finalContent = finalContent.replace(
        "import { AutoApprovalSettings } from '../auth/PermissionManager';",
        "import { AutoApprovalSettings } from '../auth/PermissionManager';\nimport { getWebviewContent } from './webviewContent';"
    );
}

fs.writeFileSync('src/sidebar/sidebarProvider.ts', finalContent);
console.log('File updated successfully');
