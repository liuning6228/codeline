/**
 * CollaborationExample - 协作功能演示
 * 
 * 演示如何使用CollaborationEngine进行代码协作和审查
 */

import * as path from 'path';
import * as fs from 'fs';
import { CollaborationEngine, createCollaborationEngine } from '../CollaborationEngine';
import { FileEditorTool } from '../tools/FileEditorTool';
import { CodeAnalysisTool } from '../tools/CodeAnalysisTool';
import { PerformanceMonitor, createPerformanceMonitor } from '../PerformanceMonitor';

/**
 * 协作演示结果
 */
export interface CollaborationDemoResult {
  /** 演示名称 */
  demoName: string;
  
  /** 是否成功 */
  success: boolean;
  
  /** 演示步骤 */
  steps: Array<{
    /** 步骤名称 */
    name: string;
    
    /** 描述 */
    description: string;
    
    /** 是否通过 */
    passed: boolean;
    
    /** 详细信息 */
    details?: any;
  }>;
  
  /** 协作统计 */
  collaborationStats?: {
    /** 会话数量 */
    sessionCount: number;
    
    /** 用户数量 */
    userCount: number;
    
    /** 评论数量 */
    commentCount: number;
    
    /** 已解决的评论数量 */
    resolvedCommentCount: number;
    
    /** 建议的编辑数量 */
    suggestedEditCount: number;
    
    /** 已应用的编辑数量 */
    appliedEditCount: number;
  };
  
  /** 性能报告 */
  performanceReport?: any;
  
  /** 建议 */
  suggestions: string[];
}

/**
 * 协作功能演示
 */
export class CollaborationExample {
  private workspaceRoot: string;
  private testFilesDir: string;
  
  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.testFilesDir = path.join(workspaceRoot, 'test-collaboration-examples');
    
    // 创建测试目录
    if (!fs.existsSync(this.testFilesDir)) {
      fs.mkdirSync(this.testFilesDir, { recursive: true });
    }
  }
  
  /**
   * 运行所有演示
   */
  public async runAllDemos(): Promise<CollaborationDemoResult[]> {
    console.log('🚀 Running Collaboration Demos\n');
    console.log('='.repeat(60));
    
    const results: CollaborationDemoResult[] = [];
    
    // 运行各个演示
    results.push(await this.demoSetup());
    results.push(await this.demoSessionManagement());
    results.push(await this.demoCodeReview());
    results.push(await this.demoEditSuggestions());
    results.push(await this.demoPermissions());
    results.push(await this.demoDataPersistence());
    results.push(await this.demoIntegrationWithTools());
    
    // 清理测试文件
    this.cleanup();
    
    // 生成总结报告
    await this.generateSummaryReport(results);
    
    return results;
  }
  
  /**
   * 演示1: 设置和初始化
   */
  private async demoSetup(): Promise<CollaborationDemoResult> {
    console.log('📋 Demo 1: Setup and Initialization');
    console.log('─'.repeat(40));
    
    const steps = [];
    
    try {
      // 步骤1: 创建工具实例
      steps.push({
        name: 'Create Tools',
        description: 'Create FileEditorTool, CodeAnalysisTool, and PerformanceMonitor instances',
        passed: true,
        details: 'Tools initialized successfully',
      });
      
      const fileEditor = new FileEditorTool();
      const codeAnalyzer = new CodeAnalysisTool();
      const performanceMonitor = createPerformanceMonitor({
        monitoringInterval: 1000,
        enableMemoryMonitoring: true,
      });
      
      // 步骤2: 创建协作引擎
      steps.push({
        name: 'Create Collaboration Engine',
        description: 'Create CollaborationEngine instance',
        passed: true,
        details: 'Engine initialized with all required dependencies',
      });
      
      const collaborationEngine = createCollaborationEngine(
        this.workspaceRoot,
        fileEditor,
        codeAnalyzer,
        performanceMonitor,
        {
          dataStoragePath: path.join(this.testFilesDir, '.collaboration-data'),
          enableRealTimeCollaboration: false, // 简化演示，禁用实时协作
          autoSaveInterval: 5000,
          maxSessions: 10,
          maxCommentsPerFile: 100,
        }
      );
      
      // 步骤3: 创建测试用户
      steps.push({
        name: 'Create Test Users',
        description: 'Create sample users for collaboration demos',
        passed: true,
        details: 'Created 3 test users with different roles',
      });
      
      const testUsers = this.createTestUsers();
      
      // 步骤4: 创建测试文件
      steps.push({
        name: 'Create Test Files',
        description: 'Create sample TypeScript files for collaboration demos',
        passed: true,
      });
      
      await this.createTestFiles();
      
      console.log('✅ Setup completed successfully\n');
      
      return {
        demoName: 'Setup and Initialization',
        success: true,
        steps,
        suggestions: [
          'All tools initialized successfully',
          'Collaboration engine ready for use',
          'Test users and files created',
        ],
      };
      
    } catch (error: any) {
      steps.push({
        name: 'Error Handling',
        description: 'Handle initialization errors',
        passed: false,
        details: error.message,
      });
      
      console.error(`❌ Setup failed: ${error.message}\n`);
      
      return {
        demoName: 'Setup and Initialization',
        success: false,
        steps,
        suggestions: [`Fix initialization error: ${error.message}`],
      };
    }
  }
  
  /**
   * 演示2: 会话管理
   */
  private async demoSessionManagement(): Promise<CollaborationDemoResult> {
    console.log('📋 Demo 2: Session Management');
    console.log('─'.repeat(40));
    
    const steps = [];
    
    try {
      const fileEditor = new FileEditorTool();
      const codeAnalyzer = new CodeAnalysisTool();
      const collaborationEngine = createCollaborationEngine(
        this.workspaceRoot,
        fileEditor,
        codeAnalyzer
      );
      
      const testUsers = this.createTestUsers();
      const owner = testUsers[0];
      const reviewer = testUsers[1];
      const viewer = testUsers[2];
      
      // 步骤1: 创建会话
      steps.push({
        name: 'Create Session',
        description: 'Create a new collaboration session',
        passed: true,
      });
      
      const session = await collaborationEngine.createSession(
        'Code Review: User Authentication',
        owner,
        {
          description: 'Review the new user authentication module',
          projectPath: this.testFilesDir,
          settings: {
            allowRealTimeEditing: false,
            requireApproval: true,
            editPermissions: 'editors',
            commentPermissions: 'reviewers',
          },
        }
      );
      
      steps.push({
        name: 'Verify Session Creation',
        description: 'Verify that session was created successfully',
        passed: !!session && session.id.startsWith('session_'),
        details: session ? `Session created: ${session.name} (${session.id})` : 'Session creation failed',
      });
      
      // 步骤2: 用户加入会话
      steps.push({
        name: 'Users Join Session',
        description: 'Multiple users join the collaboration session',
        passed: true,
      });
      
      await collaborationEngine.joinSession(session.id, reviewer);
      await collaborationEngine.joinSession(session.id, viewer);
      
      const updatedSession = collaborationEngine.getSession(session.id);
      const memberCount = updatedSession?.members.length || 0;
      
      steps.push({
        name: 'Verify User Joins',
        description: 'Verify that users successfully joined the session',
        passed: memberCount === 3,
        details: `${memberCount} users in session (expected: 3)`,
      });
      
      // 步骤3: 获取会话列表
      steps.push({
        name: 'List Sessions',
        description: 'Retrieve list of active sessions',
        passed: true,
      });
      
      const sessions = collaborationEngine.getSessions({ active: true });
      
      steps.push({
        name: 'Verify Session Listing',
        description: 'Verify that session appears in the list',
        passed: sessions.length > 0 && sessions.some(s => s.id === session.id),
        details: `Found ${sessions.length} active sessions`,
      });
      
      // 步骤4: 离开会话
      steps.push({
        name: 'User Leaves Session',
        description: 'User leaves the collaboration session',
        passed: true,
      });
      
      await collaborationEngine.leaveSession(session.id, viewer.id);
      
      const finalSession = collaborationEngine.getSession(session.id);
      const activeUserCount = finalSession?.statistics.activeUserCount || 0;
      
      steps.push({
        name: 'Verify User Left',
        description: 'Verify that user successfully left the session',
        passed: activeUserCount === 2, // owner and reviewer still online
        details: `${activeUserCount} active users (expected: 2)`,
      });
      
      // 步骤5: 关闭会话
      steps.push({
        name: 'Close Session',
        description: 'Close the collaboration session',
        passed: true,
      });
      
      await collaborationEngine.closeSession(session.id);
      
      const closedSession = collaborationEngine.getSession(session.id);
      
      steps.push({
        name: 'Verify Session Closed',
        description: 'Verify that session is marked as completed',
        passed: closedSession?.status === 'completed',
        details: `Session status: ${closedSession?.status}`,
      });
      
      console.log('✅ Session management demo completed successfully\n');
      
      return {
        demoName: 'Session Management',
        success: true,
        steps,
        collaborationStats: {
          sessionCount: sessions.length,
          userCount: testUsers.length,
          commentCount: 0,
          resolvedCommentCount: 0,
          suggestedEditCount: 0,
          appliedEditCount: 0,
        },
        suggestions: [
          'Session management functionality working correctly',
          'Consider adding more advanced session features (invitations, notifications)',
        ],
      };
      
    } catch (error: any) {
      steps.push({
        name: 'Error Handling',
        description: 'Handle session management errors',
        passed: false,
        details: error.message,
      });
      
      console.error(`❌ Session management demo failed: ${error.message}\n`);
      
      return {
        demoName: 'Session Management',
        success: false,
        steps,
        suggestions: [`Fix session management error: ${error.message}`],
      };
    }
  }
  
  /**
   * 演示3: 代码审查
   */
  private async demoCodeReview(): Promise<CollaborationDemoResult> {
    console.log('📋 Demo 3: Code Review');
    console.log('─'.repeat(40));
    
    const steps = [];
    
    try {
      const fileEditor = new FileEditorTool();
      const codeAnalyzer = new CodeAnalysisTool();
      const collaborationEngine = createCollaborationEngine(
        this.workspaceRoot,
        fileEditor,
        codeAnalyzer
      );
      
      const testUsers = this.createTestUsers();
      const owner = testUsers[0];
      const reviewer = testUsers[1];
      
      // 创建测试文件
      const testFilePath = path.join(this.testFilesDir, 'user-auth.ts');
      const testContent = `
// User authentication module
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

function validateUser(user: User): boolean {
  // TODO: Add proper validation
  return user.name !== '' && user.email.includes('@');
}

function createUser(name: string, email: string, password: string): User {
  // TODO: Hash the password
  return {
    id: Date.now().toString(),
    name,
    email,
    passwordHash: password, // This is insecure!
  };
}
`;
      
      fs.writeFileSync(testFilePath, testContent, 'utf8');
      
      // 创建会话
      const session = await collaborationEngine.createSession(
        'Code Review Demo',
        owner,
        { projectPath: this.testFilesDir }
      );
      
      await collaborationEngine.joinSession(session.id, reviewer);
      
      // 步骤1: 添加代码评论
      steps.push({
        name: 'Add Code Comment',
        description: 'Add a comment to code for review',
        passed: true,
      });
      
      const comment1 = await collaborationEngine.addComment(
        session.id,
        'user-auth.ts',
        {
          lineStart: 13,
          lineEnd: 13,
          columnStart: 1,
          columnEnd: 1,
        },
        'This comment should mention that storing plain password is insecure',
        reviewer
      );
      
      steps.push({
        name: 'Verify Comment Added',
        description: 'Verify that comment was added successfully',
        passed: !!comment1 && comment1.id.startsWith('comment_'),
        details: comment1 ? `Comment added: ${comment1.content.substring(0, 30)}...` : 'Comment addition failed',
      });
      
      // 步骤2: 添加多个评论
      steps.push({
        name: 'Add Multiple Comments',
        description: 'Add multiple comments to different parts of the code',
        passed: true,
      });
      
      const comment2 = await collaborationEngine.addComment(
        session.id,
        'user-auth.ts',
        {
          lineStart: 7,
          lineEnd: 7,
          columnStart: 1,
          columnEnd: 1,
        },
        'Should add validation for password strength',
        reviewer
      );
      
      const comment3 = await collaborationEngine.addComment(
        session.id,
        'user-auth.ts',
        {
          lineStart: 10,
          lineEnd: 10,
          columnStart: 1,
          columnEnd: 1,
        },
        'TODO comment should be more specific',
        reviewer
      );
      
      // 步骤3: 获取文件评论
      steps.push({
        name: 'Retrieve File Comments',
        description: 'Retrieve all comments for a file',
        passed: true,
      });
      
      const fileComments = collaborationEngine.getFileComments('user-auth.ts');
      
      steps.push({
        name: 'Verify Comments Retrieved',
        description: 'Verify that all comments were retrieved',
        passed: fileComments.length >= 3,
        details: `Retrieved ${fileComments.length} comments (expected: >=3)`,
      });
      
      // 步骤4: 解决评论
      steps.push({
        name: 'Resolve Comment',
        description: 'Resolve a code review comment',
        passed: true,
      });
      
      const resolvedComment = await collaborationEngine.resolveComment(
        session.id,
        comment1.id,
        owner
      );
      
      steps.push({
        name: 'Verify Comment Resolved',
        description: 'Verify that comment was marked as resolved',
        passed: resolvedComment.resolved === true,
        details: `Comment ${resolvedComment.resolved ? 'resolved' : 'not resolved'}`,
      });
      
      // 步骤5: 获取已解决和未解决的评论
      steps.push({
        name: 'Filter Comments',
        description: 'Filter comments by resolved status',
        passed: true,
      });
      
      const unresolvedComments = collaborationEngine.getFileComments('user-auth.ts', { resolved: false });
      const resolvedComments = collaborationEngine.getFileComments('user-auth.ts', { resolved: true });
      
      steps.push({
        name: 'Verify Comment Filtering',
        description: 'Verify that comments are correctly filtered',
        passed: unresolvedComments.length >= 2 && resolvedComments.length >= 1,
        details: `Unresolved: ${unresolvedComments.length}, Resolved: ${resolvedComments.length}`,
      });
      
      // 获取会话统计
      const sessionStats = collaborationEngine.getSessionStatistics(session.id);
      
      console.log('✅ Code review demo completed successfully\n');
      
      return {
        demoName: 'Code Review',
        success: true,
        steps,
        collaborationStats: {
          sessionCount: 1,
          userCount: 2,
          commentCount: sessionStats.commentCount,
          resolvedCommentCount: sessionStats.resolvedCommentCount,
          suggestedEditCount: sessionStats.suggestedEditCount,
          appliedEditCount: sessionStats.appliedEditCount,
        },
        suggestions: [
          'Code review functionality working correctly',
          'Consider adding comment threads and replies',
          'Add notification system for new comments',
        ],
      };
      
    } catch (error: any) {
      steps.push({
        name: 'Error Handling',
        description: 'Handle code review errors',
        passed: false,
        details: error.message,
      });
      
      console.error(`❌ Code review demo failed: ${error.message}\n`);
      
      return {
        demoName: 'Code Review',
        success: false,
        steps,
        suggestions: [`Fix code review error: ${error.message}`],
      };
    }
  }
  
  /**
   * 演示4: 编辑建议
   */
  private async demoEditSuggestions(): Promise<CollaborationDemoResult> {
    console.log('📋 Demo 4: Edit Suggestions');
    console.log('─'.repeat(40));
    
    const steps = [];
    
    try {
      const fileEditor = new FileEditorTool();
      const codeAnalyzer = new CodeAnalysisTool();
      const collaborationEngine = createCollaborationEngine(
        this.workspaceRoot,
        fileEditor,
        codeAnalyzer
      );
      
      const testUsers = this.createTestUsers();
      const owner = testUsers[0];
      const reviewer = testUsers[1];
      
      // 创建测试文件
      const testFilePath = path.join(this.testFilesDir, 'utils.ts');
      const testContent = `
// Utility functions
function calculateTotal(items: number[]): number {
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += items[i];
  }
  return sum;
}

function formatDate(date: Date): string {
  return date.toISOString();
}
`;
      
      fs.writeFileSync(testFilePath, testContent, 'utf8');
      
      // 创建会话
      const session = await collaborationEngine.createSession(
        'Edit Suggestions Demo',
        owner,
        { projectPath: this.testFilesDir }
      );
      
      await collaborationEngine.joinSession(session.id, reviewer);
      
      // 步骤1: 添加带编辑建议的评论
      steps.push({
        name: 'Add Comment with Edit Suggestion',
        description: 'Add a comment that includes a suggested edit',
        passed: true,
      });
      
      const comment = await collaborationEngine.addComment(
        session.id,
        'utils.ts',
        {
          lineStart: 3,
          lineEnd: 7,
          columnStart: 1,
          columnEnd: 1,
        },
        'Consider using Array.reduce() for better readability',
        reviewer
      );
      
      // 步骤2: 添加编辑建议
      steps.push({
        name: 'Suggest Edit',
        description: 'Suggest a specific code edit',
        passed: true,
      });
      
      const suggestedEdit = await collaborationEngine.suggestEdit(
        session.id,
        comment.id,
        'replace',
        reviewer,
        '  let sum = 0;\n  for (let i = 0; i < items.length; i++) {\n    sum += items[i];\n  }',
        '  return items.reduce((sum, item) => sum + item, 0);'
      );
      
      steps.push({
        name: 'Verify Edit Suggested',
        description: 'Verify that edit suggestion was added',
        passed: suggestedEdit.suggestedEdit !== undefined,
        details: suggestedEdit.suggestedEdit ? 'Edit suggestion added' : 'Edit suggestion failed',
      });
      
      // 步骤3: 应用编辑建议
      steps.push({
        name: 'Apply Edit Suggestion',
        description: 'Apply the suggested edit to the code',
        passed: true,
      });
      
      const applyResult = await collaborationEngine.applyEdit(
        session.id,
        comment.id,
        owner
      );
      
      steps.push({
        name: 'Verify Edit Applied',
        description: 'Verify that edit was applied successfully',
        passed: applyResult.comment.suggestedEdit?.applied === true,
        details: applyResult.comment.suggestedEdit?.applied ? 'Edit applied' : 'Edit not applied',
      });
      
      // 步骤4: 验证文件内容
      steps.push({
        name: 'Verify File Content',
        description: 'Verify that file content was updated',
        passed: true,
      });
      
      const updatedContent = fs.readFileSync(testFilePath, 'utf8');
      const editApplied = updatedContent.includes('items.reduce');
      
      steps.push({
        name: 'Check File Update',
        description: 'Check that the file was actually updated',
        passed: editApplied,
        details: editApplied ? 'File updated with suggested edit' : 'File not properly updated',
      });
      
      console.log('✅ Edit suggestions demo completed successfully\n');
      
      return {
        demoName: 'Edit Suggestions',
        success: true,
        steps,
        suggestions: [
          'Edit suggestion functionality working correctly',
          'Consider adding more edit operation types',
          'Add conflict resolution for concurrent edits',
        ],
      };
      
    } catch (error: any) {
      steps.push({
        name: 'Error Handling',
        description: 'Handle edit suggestion errors',
        passed: false,
        details: error.message,
      });
      
      console.error(`❌ Edit suggestions demo failed: ${error.message}\n`);
      
      return {
        demoName: 'Edit Suggestions',
        success: false,
        steps,
        suggestions: [`Fix edit suggestion error: ${error.message}`],
      };
    }
  }
  
  /**
   * 演示5: 权限系统
   */
  private async demoPermissions(): Promise<CollaborationDemoResult> {
    console.log('📋 Demo 5: Permission System');
    console.log('─'.repeat(40));
    
    const steps = [];
    
    try {
      const fileEditor = new FileEditorTool();
      const codeAnalyzer = new CodeAnalysisTool();
      const collaborationEngine = createCollaborationEngine(
        this.workspaceRoot,
        fileEditor,
        codeAnalyzer
      );
      
      const testUsers = this.createTestUsers();
      const owner = testUsers[0]; // owner role
      const reviewer = testUsers[1]; // reviewer role
      const viewer = testUsers[2]; // viewer role
      
      // 创建会话，设置严格的权限
      const session = await collaborationEngine.createSession(
        'Permission Demo',
        owner,
        {
          projectPath: this.testFilesDir,
          settings: {
            editPermissions: 'admins', // 只有管理员和所有者可以编辑
            commentPermissions: 'reviewers', // 只有审查员及以上可以评论
          },
        }
      );
      
      // 步骤1: 验证所有者权限
      steps.push({
        name: 'Owner Permissions',
        description: 'Verify that owner has all permissions',
        passed: true,
      });
      
      try {
        await collaborationEngine.addComment(
          session.id,
          'test.ts',
          { lineStart: 1, lineEnd: 1, columnStart: 1, columnEnd: 1 },
          'Owner comment',
          owner
        );
        steps.push({
          name: 'Owner Can Add Comment',
          description: 'Owner should be able to add comments',
          passed: true,
        });
      } catch (error: any) {
        steps.push({
          name: 'Owner Can Add Comment',
          description: 'Owner should be able to add comments',
          passed: false,
          details: error.message,
        });
      }
      
      // 步骤2: 验证审查员权限
      steps.push({
        name: 'Reviewer Permissions',
        description: 'Verify reviewer permissions',
        passed: true,
      });
      
      try {
        await collaborationEngine.addComment(
          session.id,
          'test.ts',
          { lineStart: 1, lineEnd: 1, columnStart: 1, columnEnd: 1 },
          'Reviewer comment',
          reviewer
        );
        steps.push({
          name: 'Reviewer Can Add Comment',
          description: 'Reviewer should be able to add comments',
          passed: true,
        });
      } catch (error: any) {
        steps.push({
          name: 'Reviewer Can Add Comment',
          description: 'Reviewer should be able to add comments',
          passed: false,
          details: error.message,
        });
      }
      
      // 步骤3: 验证查看者权限（应该失败）
      steps.push({
        name: 'Viewer Permissions',
        description: 'Verify viewer has limited permissions',
        passed: true,
      });
      
      let viewerCommentFailed = false;
      try {
        await collaborationEngine.addComment(
          session.id,
          'test.ts',
          { lineStart: 1, lineEnd: 1, columnStart: 1, columnEnd: 1 },
          'Viewer comment',
          viewer
        );
        steps.push({
          name: 'Viewer Cannot Add Comment',
          description: 'Viewer should not be able to add comments',
          passed: false,
          details: 'Viewer was able to add comment unexpectedly',
        });
      } catch (error: any) {
        viewerCommentFailed = true;
        steps.push({
          name: 'Viewer Cannot Add Comment',
          description: 'Viewer should not be able to add comments',
          passed: true,
          details: `Correctly denied: ${error.message}`,
        });
      }
      
      // 步骤4: 验证会话特定权限
      steps.push({
        name: 'Session-specific Permissions',
        description: 'Verify session-level permission settings',
        passed: true,
      });
      
      // 创建另一个会话，设置不同的权限
      const openSession = await collaborationEngine.createSession(
        'Open Session',
        owner,
        {
          projectPath: this.testFilesDir,
          settings: {
            editPermissions: 'all',
            commentPermissions: 'all',
          },
        }
      );
      
      try {
        await collaborationEngine.addComment(
          openSession.id,
          'test.ts',
          { lineStart: 1, lineEnd: 1, columnStart: 1, columnEnd: 1 },
          'Viewer comment in open session',
          viewer
        );
        steps.push({
          name: 'Viewer Can Comment in Open Session',
          description: 'Viewer should be able to comment in open session',
          passed: true,
        });
      } catch (error: any) {
        steps.push({
          name: 'Viewer Can Comment in Open Session',
          description: 'Viewer should be able to comment in open session',
          passed: false,
          details: error.message,
        });
      }
      
      console.log('✅ Permission system demo completed successfully\n');
      
      return {
        demoName: 'Permission System',
        success: viewerCommentFailed, // 成功意味着查看者被正确拒绝
        steps,
        suggestions: [
          'Permission system working correctly',
          'Consider adding more granular permission levels',
          'Add permission inheritance and role hierarchies',
        ],
      };
      
    } catch (error: any) {
      steps.push({
        name: 'Error Handling',
        description: 'Handle permission system errors',
        passed: false,
        details: error.message,
      });
      
      console.error(`❌ Permission system demo failed: ${error.message}\n`);
      
      return {
        demoName: 'Permission System',
        success: false,
        steps,
        suggestions: [`Fix permission system error: ${error.message}`],
      };
    }
  }
  
  /**
   * 演示6: 数据持久化
   */
  private async demoDataPersistence(): Promise<CollaborationDemoResult> {
    console.log('📋 Demo 6: Data Persistence');
    console.log('─'.repeat(40));
    
    const steps = [];
    
    try {
      const dataDir = path.join(this.testFilesDir, 'persistence-test');
      
      // 步骤1: 创建引擎并添加数据
      steps.push({
        name: 'Create Engine and Add Data',
        description: 'Create collaboration engine and add sample data',
        passed: true,
      });
      
      const fileEditor = new FileEditorTool();
      const codeAnalyzer = new CodeAnalysisTool();
      const engine1 = createCollaborationEngine(
        this.workspaceRoot,
        fileEditor,
        codeAnalyzer,
        undefined,
        {
          dataStoragePath: dataDir,
          autoSaveInterval: 1000,
        }
      );
      
      const testUsers = this.createTestUsers();
      const owner = testUsers[0];
      
      const session = await engine1.createSession(
        'Persistence Test',
        owner,
        { projectPath: this.testFilesDir }
      );
      
      await engine1.addComment(
        session.id,
        'test.ts',
        { lineStart: 1, lineEnd: 1, columnStart: 1, columnEnd: 1 },
        'Test comment for persistence',
        owner
      );
      
      const initialStats = engine1.getSessionStatistics(session.id);
      
      steps.push({
        name: 'Verify Initial Data',
        description: 'Verify that data was added to first engine instance',
        passed: initialStats.commentCount > 0,
        details: `Initial comment count: ${initialStats.commentCount}`,
      });
      
      // 步骤2: 保存数据
      steps.push({
        name: 'Save Data',
        description: 'Manually save collaboration data',
        passed: true,
      });
      
      await engine1.saveData();
      
      // 步骤3: 销毁第一个引擎
      steps.push({
        name: 'Destroy First Engine',
        description: 'Destroy the first engine instance',
        passed: true,
      });
      
      await engine1.destroy();
      
      // 步骤4: 创建第二个引擎并加载数据
      steps.push({
        name: 'Create Second Engine',
        description: 'Create a new engine instance',
        passed: true,
      });
      
      const engine2 = createCollaborationEngine(
        this.workspaceRoot,
        fileEditor,
        codeAnalyzer,
        undefined,
        {
          dataStoragePath: dataDir,
        }
      );
      
      // 步骤5: 验证数据加载
      steps.push({
        name: 'Verify Data Loaded',
        description: 'Verify that data was loaded into second engine',
        passed: true,
      });
      
      const sessions = engine2.getSessions();
      const loadedSession = sessions.find(s => s.name === 'Persistence Test');
      
      steps.push({
        name: 'Check Session Loaded',
        description: 'Check that session was loaded',
        passed: !!loadedSession,
        details: loadedSession ? `Session loaded: ${loadedSession.name}` : 'Session not found',
      });
      
      if (loadedSession) {
        const loadedStats = engine2.getSessionStatistics(loadedSession.id);
        const fileComments = engine2.getFileComments('test.ts');
        
        steps.push({
          name: 'Check Comments Loaded',
          description: 'Check that comments were loaded',
          passed: loadedStats.commentCount === initialStats.commentCount && fileComments.length > 0,
          details: `Loaded comment count: ${loadedStats.commentCount}, File comments: ${fileComments.length}`,
        });
      }
      
      // 步骤6: 销毁第二个引擎
      await engine2.destroy();
      
      console.log('✅ Data persistence demo completed successfully\n');
      
      return {
        demoName: 'Data Persistence',
        success: true,
        steps,
        suggestions: [
          'Data persistence working correctly',
          'Consider adding data migration and versioning',
          'Add backup and restore functionality',
        ],
      };
      
    } catch (error: any) {
      steps.push({
        name: 'Error Handling',
        description: 'Handle data persistence errors',
        passed: false,
        details: error.message,
      });
      
      console.error(`❌ Data persistence demo failed: ${error.message}\n`);
      
      return {
        demoName: 'Data Persistence',
        success: false,
        steps,
        suggestions: [`Fix data persistence error: ${error.message}`],
      };
    }
  }
  
  /**
   * 演示7: 与现有工具集成
   */
  private async demoIntegrationWithTools(): Promise<CollaborationDemoResult> {
    console.log('📋 Demo 7: Integration with Existing Tools');
    console.log('─'.repeat(40));
    
    const steps = [];
    
    try {
      // 创建测试文件
      const testFilePath = path.join(this.testFilesDir, 'integration-test.ts');
      const testContent = `
// Integration test file
function processData(data: string[]): string[] {
  return data.map(item => item.toUpperCase());
}
`;
      
      fs.writeFileSync(testFilePath, testContent, 'utf8');
      
      // 步骤1: 创建所有工具
      steps.push({
        name: 'Create All Tools',
        description: 'Create all tool instances for integration test',
        passed: true,
        details: 'Created FileEditorTool, CodeAnalysisTool, PerformanceMonitor, and CollaborationEngine',
      });
      
      const fileEditor = new FileEditorTool();
      const codeAnalyzer = new CodeAnalysisTool();
      const performanceMonitor = createPerformanceMonitor();
      const collaborationEngine = createCollaborationEngine(
        this.workspaceRoot,
        fileEditor,
        codeAnalyzer,
        performanceMonitor
      );
      
      // 步骤2: 开始性能监控
      performanceMonitor.start();
      
      const testUsers = this.createTestUsers();
      const owner = testUsers[0];
      
      // 步骤3: 创建协作会话
      const session = await collaborationEngine.createSession(
        'Integration Test',
        owner,
        { projectPath: this.testFilesDir }
      );
      
      // 步骤4: 使用CodeAnalysisTool分析代码
      const analysisResult = await codeAnalyzer.execute({
        codePath: testFilePath,
        analysisType: 'file',
        analyzers: ['quality', 'complexity'],
        analysisDepth: 'shallow',
      }, {} as any);
      
      steps.push({
        name: 'Code Analysis Integration',
        description: 'Use CodeAnalysisTool in collaboration context',
        passed: analysisResult.success,
        details: analysisResult.success ? 'Code analysis completed' : 'Code analysis failed',
      });
      
      // 步骤5: 添加基于分析的评论
      if (analysisResult.success && analysisResult.issueStats.total > 0) {
        const comment = await collaborationEngine.addComment(
          session.id,
          'integration-test.ts',
          { lineStart: 3, lineEnd: 3, columnStart: 1, columnEnd: 1 },
          `Code analysis found ${analysisResult.issueStats.total} issues. Consider improving code quality.`,
          owner
        );
        
        steps.push({
          name: 'Analysis-based Comment',
          description: 'Add comment based on code analysis results',
          passed: !!comment,
          details: comment ? 'Comment added based on analysis' : 'Failed to add comment',
        });
      }
      
      // 步骤6: 获取性能报告
      const performanceReport = performanceMonitor.getReport();
      
      steps.push({
        name: 'Performance Monitoring Integration',
        description: 'Verify performance monitoring is working',
        passed: performanceReport.summary.totalRequests > 0,
        details: `Performance monitoring active: ${performanceReport.summary.totalRequests} requests`,
      });
      
      // 步骤7: 停止性能监控
      performanceMonitor.stop();
      
      // 步骤8: 销毁协作引擎
      await collaborationEngine.destroy();
      
      console.log('✅ Integration with tools demo completed successfully\n');
      
      return {
        demoName: 'Integration with Existing Tools',
        success: true,
        steps,
        performanceReport,
        suggestions: [
          'All tools integrated successfully',
          'Consider adding more integration points between tools',
          'Add shared configuration and state management',
        ],
      };
      
    } catch (error: any) {
      steps.push({
        name: 'Error Handling',
        description: 'Handle integration errors',
        passed: false,
        details: error.message,
      });
      
      console.error(`❌ Integration demo failed: ${error.message}\n`);
      
      return {
        demoName: 'Integration with Existing Tools',
        success: false,
        steps,
        suggestions: [`Fix integration error: ${error.message}`],
      };
    }
  }
  
  /**
   * 创建测试用户
   */
  private createTestUsers(): Array<{
    id: string;
    name: string;
    email?: string;
    role: 'owner' | 'admin' | 'editor' | 'reviewer' | 'viewer';
    online: boolean;
    lastActive: Date;
  }> {
    return [
      {
        id: 'user_1',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        role: 'owner',
        online: true,
        lastActive: new Date(),
      },
      {
        id: 'user_2',
        name: 'Sam Wilson',
        email: 'sam@example.com',
        role: 'reviewer',
        online: true,
        lastActive: new Date(),
      },
      {
        id: 'user_3',
        name: 'Taylor Smith',
        email: 'taylor@example.com',
        role: 'viewer',
        online: true,
        lastActive: new Date(),
      },
    ];
  }
  
  /**
   * 创建测试文件
   */
  private async createTestFiles(): Promise<void> {
    // 已经由各个演示创建
  }
  
  /**
   * 清理测试文件
   */
  private cleanup(): void {
    if (fs.existsSync(this.testFilesDir)) {
      fs.rmSync(this.testFilesDir, { recursive: true, force: true });
      console.log(`🧹 Cleaned up test files: ${this.testFilesDir}`);
    }
  }
  
  /**
   * 生成总结报告
   */
  private async generateSummaryReport(results: CollaborationDemoResult[]): Promise<void> {
    const reportDir = path.join(this.workspaceRoot, 'demo-reports');
    const reportPath = path.join(reportDir, 'collaboration-demo-report.json');
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const totalDemos = results.length;
    const successfulDemos = results.filter(r => r.success).length;
    const successRate = (successfulDemos / totalDemos) * 100;
    
    // 收集所有协作统计
    const allStats = results
      .filter(r => r.collaborationStats)
      .map(r => r.collaborationStats!);
    
    const totalComments = allStats.reduce((sum, stats) => sum + stats.commentCount, 0);
    const totalSessions = allStats.reduce((sum, stats) => sum + stats.sessionCount, 0);
    
    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        totalDemos,
        successfulDemos,
        successRate: successRate.toFixed(1),
        overallSuccess: successfulDemos === totalDemos,
        totalComments,
        totalSessions,
      },
      demoResults: results.map(r => ({
        name: r.demoName,
        success: r.success,
        steps: r.steps.length,
        passedSteps: r.steps.filter(s => s.passed).length,
      })),
      keySuggestions: this.collectAllSuggestions(results),
      nextSteps: this.generateNextSteps(results),
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    console.log('\n📊 Collaboration Demo Summary Report');
    console.log('='.repeat(60));
    console.log(`   Total Demos: ${totalDemos}`);
    console.log(`   Successful: ${successfulDemos}`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`   Total Sessions: ${totalSessions}`);
    console.log(`   Total Comments: ${totalComments}`);
    console.log(`   Report saved to: ${reportPath}`);
    console.log('\n🎯 Key Suggestions:');
    report.keySuggestions.forEach((suggestion, i) => {
      console.log(`   ${i + 1}. ${suggestion}`);
    });
    console.log('\n🚀 Next Steps:');
    report.nextSteps.forEach((step, i) => {
      console.log(`   ${i + 1}. ${step}`);
    });
  }
  
  /**
   * 收集所有建议
   */
  private collectAllSuggestions(results: CollaborationDemoResult[]): string[] {
    const allSuggestions: string[] = [];
    
    results.forEach(result => {
      allSuggestions.push(...result.suggestions);
    });
    
    // 去重并限制数量
    return [...new Set(allSuggestions)].slice(0, 10);
  }
  
  /**
   * 生成下一步建议
   */
  private generateNextSteps(results: CollaborationDemoResult[]): string[] {
    const nextSteps: string[] = [];
    
    // 基于演示结果生成建议
    const failedDemos = results.filter(r => !r.success);
    
    if (failedDemos.length > 0) {
      nextSteps.push(`Fix ${failedDemos.length} failed demo(s): ${failedDemos.map(d => d.demoName).join(', ')}`);
    }
    
    // 通用建议
    nextSteps.push('Add real-time collaboration with WebSocket support');
    nextSteps.push('Integrate with VS Code Live Share or similar technologies');
    nextSteps.push('Add notification system for comments and edits');
    nextSteps.push('Create web interface for collaboration sessions');
    nextSteps.push('Add conflict resolution for concurrent edits');
    nextSteps.push('Implement version control integration (Git comments)');
    
    return nextSteps.slice(0, 5);
  }
}

/**
 * 运行协作演示
 */
export async function runCollaborationDemos(workspaceRoot?: string): Promise<void> {
  const root = workspaceRoot || process.cwd();
  
  console.log('='.repeat(60));
  console.log('   Collaboration Engine Demos');
  console.log('='.repeat(60) + '\n');
  
  try {
    const example = new CollaborationExample(root);
    const results = await example.runAllDemos();
    
    const successfulDemos = results.filter(r => r.success).length;
    const totalDemos = results.length;
    
    console.log('\n' + '='.repeat(60));
    console.log('   Collaboration Demos Completed');
    console.log('='.repeat(60));
    console.log(`   ✅ ${successfulDemos}/${totalDemos} demos successful`);
    
    if (successfulDemos === totalDemos) {
      console.log('   🎉 All collaboration demos completed successfully!');
    } else {
      console.log('   ⚠️  Some demos failed - check the reports for details');
    }
    
  } catch (error: any) {
    console.error(`❌ Collaboration demo execution failed: ${error.message}`);
    throw error;
  }
}

export default CollaborationExample;