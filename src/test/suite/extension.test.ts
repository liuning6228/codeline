import * as assert from 'assert';
import * as vscode from 'vscode';
import 'mocha';

// Basic extension tests
describe('CodeLine Extension Test Suite', () => {
it('Extension should be present', () => {
        const extension = vscode.extensions.getExtension('codeline-dev.codeline');
        assert.ok(extension, 'Extension should be available');
    });
it('Extension should activate', async () => {
        const extension = vscode.extensions.getExtension('codeline-dev.codeline');
        if (extension) {
            await extension.activate();
            assert.ok(true, 'Extension activated successfully');
        } else {
            assert.fail('Extension not found');
        }
    });
it('Commands should be registered', async () => {
        const commands = await vscode.commands.getCommands();
        const codelineCommands = commands.filter(cmd => cmd.startsWith('codeline.'));
        
        // Check for expected commands
        const expectedCommands = [
            'codeline.startChat',
            'codeline.executeTask',
            'codeline.analyzeProject'
        ];
        
        for (const expectedCmd of expectedCommands) {
            assert.ok(
                commands.includes(expectedCmd),
                `Command ${expectedCmd} should be registered`
            );
        }
        
        console.log(`Found ${codelineCommands.length} CodeLine commands`);
    });
it('Configuration should exist', () => {
        const config = vscode.workspace.getConfiguration('codeline');
        assert.ok(config, 'CodeLine configuration should exist');
        
        // Check some default values
        const defaultModel = config.get<string>('defaultModel');
        assert.ok(defaultModel, 'Default model should be set');
        console.log(`Default model: ${defaultModel}`);
    });
});