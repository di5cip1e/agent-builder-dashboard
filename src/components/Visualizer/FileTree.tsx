'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderOpen, FileCode, FileJson, FileText, File, ChevronRight, FileType } from 'lucide-react';
import { FileTreeNode } from '@/types/agent';

interface FileTreeProps {
  files: FileTreeNode[];
}

const getFileIcon = (extension?: string) => {
  switch (extension) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode className="w-4 h-4 text-primary" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-warning" />;
    case 'md':
      return <FileText className="w-4 h-4 text-text-secondary" />;
    case 'yml':
    case 'yaml':
      return <FileType className="w-4 h-4 text-accent" />;
    default:
      return <File className="w-4 h-4 text-text-muted" />;
  }
};

interface FileTreeItemProps {
  node: FileTreeNode;
  depth: number;
}

function FileTreeItem({ node, depth }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isFolder = node.type === 'folder';
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-2 py-1 px-2 rounded-md hover:bg-white/5 cursor-pointer ${
          node.created ? 'animate-file-appear' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isFolder && hasChildren && setIsExpanded(!isExpanded)}
      >
        {/* Expand/Collapse Chevron */}
        {isFolder && hasChildren ? (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-3 h-3 text-text-muted" />
          </motion.div>
        ) : (
          <span className="w-3" />
        )}

        {/* Icon */}
        {isFolder ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-warning" />
          ) : (
            <Folder className="w-4 h-4 text-warning" />
          )
        ) : (
          getFileIcon(node.extension)
        )}

        {/* Name */}
        <span className={`text-sm ${
          node.created ? 'text-success' : 'text-text-primary'
        }`}>
          {node.name}
        </span>

        {/* Created indicator */}
        {node.created && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto text-xs text-success"
          >
            ✓
          </motion.span>
        )}
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isFolder && isExpanded && node.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child, index) => (
              <FileTreeItem
                key={`${child.name}-${index}`}
                node={child}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FileTree({ files }: FileTreeProps) {
  return (
    <div className="bg-bg-dark rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-bg-card border-b border-white/10 px-4 py-3">
        <span className="text-sm text-text-secondary">
          Generated Files
        </span>
      </div>

      {/* Tree Content */}
      <div className="p-2 terminal-font text-sm overflow-x-auto">
        {files.map((file, index) => (
          <FileTreeItem key={`${file.name}-${index}`} node={file} depth={0} />
        ))}

        {files.length === 0 && (
          <div className="text-text-muted text-center py-8">
            No files generated yet
          </div>
        )}
      </div>
    </div>
  );
}

// Default file structure
export const defaultFileTree: FileTreeNode[] = [
  {
    name: 'agent-builder',
    type: 'folder',
    created: true,
    children: [
      {
        name: 'src',
        type: 'folder',
        created: true,
        children: [
          { name: 'index.ts', type: 'file', extension: 'ts', created: true },
          { name: 'config.ts', type: 'file', extension: 'ts', created: true },
          {
            name: 'prompts',
            type: 'folder',
            created: true,
            children: [
              { name: 'system.md', type: 'file', extension: 'md', created: true },
            ],
          },
          {
            name: 'tools',
            type: 'folder',
            created: true,
            children: [
              { name: 'api.ts', type: 'file', extension: 'ts', created: true },
              { name: 'database.ts', type: 'file', extension: 'ts', created: true },
            ],
          },
        ],
      },
      { name: 'package.json', type: 'file', extension: 'json', created: true },
      { name: 'tsconfig.json', type: 'file', extension: 'json', created: true },
      { name: 'Dockerfile', type: 'file', created: true },
      { name: 'docker-compose.yml', type: 'file', extension: 'yml', created: true },
      { name: '.env.example', type: 'file', created: true },
      { name: 'README.md', type: 'file', extension: 'md', created: true },
    ],
  },
];