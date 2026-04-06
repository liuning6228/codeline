const fs = require('fs');
const content = fs.readFileSync('src/sidebar/sidebarProvider.ts', 'utf8');
const start = content.indexOf('_getWebviewContent()');
const end = content.indexOf('public show()', start);
const method = content.substring(start, end);
const lines = method.split('\n');
let count = 0;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('${')) {
        count++;
        if (count <= 10) console.log('Line ' + (i+1) + ': ' + lines[i].trim());
    }
}
console.log('Total lines with ${}:', count);
