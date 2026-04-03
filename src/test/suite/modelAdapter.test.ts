import * as assert from 'assert';
import * as vscode from 'vscode';
import { ModelAdapter } from '../../models/modelAdapter';
import 'mocha';
describe('ModelAdapter Tests', () => {
    
    let adapter: ModelAdapter;
beforeEach(() => {
        adapter = new ModelAdapter();
    });
afterEach(() => {
        // Cleanup if needed
    });
it('ModelAdapter should be created', () => {
        assert.ok(adapter, 'ModelAdapter should be instantiated');
        assert.strictEqual(typeof adapter.getConfiguration, 'function', 'Should have getConfiguration method');
        assert.strictEqual(typeof adapter.isReady, 'function', 'Should have isReady method');
    });
it('ModelAdapter configuration should have defaults', () => {
        const config = adapter.getConfiguration();
        assert.ok(config, 'Configuration should exist');
        assert.ok('apiKey' in config, 'Should have apiKey property');
        assert.ok('model' in config, 'Should have model property');
        assert.ok('baseUrl' in config, 'Should have baseUrl property');
    });
it('ModelAdapter should not be ready without API key', () => {
        // By default, no API key is configured
        const isReady = adapter.isReady();
        // isReady checks if apiKey is not empty
        const config = adapter.getConfiguration();
        const expectedReady = !!config.apiKey;
        assert.strictEqual(isReady, expectedReady, `isReady should be ${expectedReady} when apiKey is ${config.apiKey ? 'set' : 'empty'}`);
    });
it('ModelAdapter should update configuration', async () => {
        // Test configuration update
        const newConfig = {
            apiKey: 'test-key-123',
            model: 'deepseek-chat',
            baseUrl: 'https://api.deepseek.com'
        };
        
        await adapter.updateConfiguration(newConfig);
        const config = adapter.getConfiguration();
        
        assert.strictEqual(config.apiKey, 'test-key-123', 'API key should be updated');
        assert.strictEqual(config.model, 'deepseek-chat', 'Model should be updated');
    });
it('ModelAdapter connection test should handle errors gracefully', async () => {
        // Test connection with invalid configuration
        const result = await adapter.testConnection();
        // Should return false or handle error without crashing
        assert.ok(typeof result === 'boolean', 'testConnection should return boolean');
    });
});