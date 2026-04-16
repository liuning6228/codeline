/**
 * 工作区快照视图
 * 基于Cline的工作区快照功能
 * 提供代码状态快照、版本管理和差异比较
 */

import React, { useState } from 'react';
import { WorktreesViewConfig } from '../../config/codeline-config';

interface WorktreesViewProps {
  /** 工作区视图配置 */
  config: WorktreesViewConfig;
  /** 导航回调函数 */
  onNavigate?: (viewName: string) => void;
}

interface WorkspaceSnapshot {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  type: 'manual' | 'auto' | 'task';
  size: number; // KB
  changes: {
    filesAdded: number;
    filesModified: number;
    filesDeleted: number;
  };
  tags: string[];
}

const WorktreesView: React.FC<WorktreesViewProps> = ({ config, onNavigate }) => {
  const [snapshots, setSnapshots] = useState<WorkspaceSnapshot[]>([
    {
      id: 'snap-1',
      name: 'Before refactoring',
      description: 'State before starting user module refactoring',
      timestamp: Date.now() - 86400000, // 1天前
      type: 'manual',
      size: 4500,
      changes: {
        filesAdded: 0,
        filesModified: 12,
        filesDeleted: 3,
      },
      tags: ['refactoring', 'user-module'],
    },
    {
      id: 'snap-2',
      name: 'After login fix',
      description: 'State after fixing authentication bug #123',
      timestamp: Date.now() - 172800000, // 2天前
      type: 'task',
      size: 4200,
      changes: {
        filesAdded: 2,
        filesModified: 8,
        filesDeleted: 1,
      },
      tags: ['bug-fix', 'authentication'],
    },
    {
      id: 'snap-3',
      name: 'Initial state',
      description: 'Initial project state before any modifications',
      timestamp: Date.now() - 604800000, // 7天前
      type: 'auto',
      size: 3800,
      changes: {
        filesAdded: 0,
        filesModified: 0,
        filesDeleted: 0,
      },
      tags: ['initial', 'baseline'],
    },
  ]);
  
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>('snap-1');
  
  // 创建新快照
  const handleCreateSnapshot = () => {
    if (snapshots.length >= config.maxSnapshots) {
      alert(`Maximum ${config.maxSnapshots} snapshots allowed`);
      return;
    }
    
    const newSnapshot: WorkspaceSnapshot = {
      id: `snap-${snapshots.length + 1}`,
      name: `Snapshot ${snapshots.length + 1}`,
      description: 'New workspace snapshot',
      timestamp: Date.now(),
      type: 'manual',
      size: Math.floor(Math.random() * 1000) + 3000,
      changes: {
        filesAdded: Math.floor(Math.random() * 5),
        filesModified: Math.floor(Math.random() * 10),
        filesDeleted: Math.floor(Math.random() * 3),
      },
      tags: ['new'],
    };
    
    setSnapshots(prev => [newSnapshot, ...prev]);
    setSelectedSnapshot(newSnapshot.id);
  };
  
  // 删除快照
  const handleDeleteSnapshot = (snapshotId: string) => {
    setSnapshots(prev => prev.filter(snap => snap.id !== snapshotId));
    if (selectedSnapshot === snapshotId) {
      setSelectedSnapshot(snapshots.length > 1 ? snapshots[1].id : null);
    }
  };
  
  // 格式化文件大小
  const formatFileSize = (kb: number): string => {
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };
  
  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const selectedSnapshotData = snapshots.find(snap => snap.id === selectedSnapshot);
  
  if (!config.enabled) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Worktrees View Disabled</div>
          <div className="text-gray-400 mb-4">
            Workspace snapshots are currently disabled in settings
          </div>
          {onNavigate && (
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={() => onNavigate('settings')}
            >
              Go to Settings
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col p-6">
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workspace Snapshots</h1>
        <p className="text-gray-400">
          Capture, manage, and compare workspace states over time
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-gray-400">
            {formatFileSize(snapshots.reduce((total, snap) => total + snap.size, 0))} total
          </div>
          {config.autoSnapshotInterval > 0 && (
            <div className="text-sm text-gray-400">
              Auto-snapshots every {config.autoSnapshotInterval} min
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 space-x-6 overflow-hidden">
        {/* 快照列表 */}
        <div className="w-1/3 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Saved Snapshots</h2>
            <button
              onClick={handleCreateSnapshot}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
              disabled={snapshots.length >= config.maxSnapshots}
              title={snapshots.length >= config.maxSnapshots ? `Maximum ${config.maxSnapshots} snapshots allowed` : ''}
            >
              Create Snapshot
            </button>
          </div>
          
          <div className="flex-1 overflow-auto space-y-3">
            {snapshots.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-lg mb-2">No snapshots yet</div>
                <p className="text-sm">Create your first workspace snapshot</p>
              </div>
            ) : (
              snapshots.map(snapshot => (
                <div
                  key={snapshot.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedSnapshot === snapshot.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSnapshot(snapshot.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{snapshot.name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatTime(snapshot.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        snapshot.type === 'manual' ? 'bg-blue-500/20 text-blue-600' :
                        snapshot.type === 'auto' ? 'bg-green-500/20 text-green-600' :
                        'bg-purple-500/20 text-purple-600'
                      }`}>
                        {snapshot.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-3">
                    {snapshot.description}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {snapshot.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-secondary text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSnapshot(snapshot.id);
                      }}
                      className="px-2 py-1 text-xs bg-red-500/20 text-red-600 rounded hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* 快照详情和差异比较 */}
        <div className="w-2/3 flex flex-col space-y-6">
          {selectedSnapshotData ? (
            <>
              {/* 快照详情 */}
              <div className="bg-secondary/50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">{selectedSnapshotData.name} Details</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Snapshot Type</div>
                    <div className="font-medium capitalize">{selectedSnapshotData.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Created</div>
                    <div className="font-medium">{formatTime(selectedSnapshotData.timestamp)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Size</div>
                    <div className="font-medium">{formatFileSize(selectedSnapshotData.size)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Snapshot ID</div>
                    <div className="font-mono text-sm">{selectedSnapshotData.id}</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Changes in this Snapshot</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-500/10 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        +{selectedSnapshotData.changes.filesAdded}
                      </div>
                      <div className="text-sm text-gray-400">Files Added</div>
                    </div>
                    <div className="bg-yellow-500/10 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        ~{selectedSnapshotData.changes.filesModified}
                      </div>
                      <div className="text-sm text-gray-400">Files Modified</div>
                    </div>
                    <div className="bg-red-500/10 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        -{selectedSnapshotData.changes.filesDeleted}
                      </div>
                      <div className="text-sm text-gray-400">Files Deleted</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 差异比较（如果启用） */}
              {config.showDiffView && snapshots.length > 1 && (
                <div className="flex-1 flex flex-col">
                  <h2 className="text-xl font-semibold mb-4">Compare with Another Snapshot</h2>
                  <div className="flex-1 bg-secondary/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-4 mb-4">
                      <select className="px-3 py-2 bg-background border border-border rounded">
                        <option>Select snapshot to compare...</option>
                        {snapshots
                          .filter(snap => snap.id !== selectedSnapshotData.id)
                          .map(snap => (
                            <option key={snap.id} value={snap.id}>
                              {snap.name} ({formatTime(snap.timestamp)})
                            </option>
                          ))
                        }
                      </select>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                        Compare
                      </button>
                    </div>
                    
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-lg mb-2">Comparison View</div>
                      <p className="text-sm">
                        Select another snapshot and click "Compare" to view differences
                      </p>
                      <p className="text-sm mt-2">
                        This feature shows file-level differences between snapshots
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-semibold mb-2">Select a Snapshot</div>
                <div className="text-gray-400">
                  Choose a snapshot from the list to view details and compare
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorktreesView;