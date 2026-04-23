'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, Check, AlertTriangle, XCircle, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/UI';
import { TerminalLine } from '@/types/agent';

interface TerminalProps {
  lines: TerminalLine[];
  isGenerating?: boolean;
}

export function Terminal({ lines, isGenerating }: TerminalProps) {
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const copyToClipboard = () => {
    const text = lines.map((l) => l.content).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeStyles = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-slate-400';
      case 'output':
        return 'text-white';
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-white';
    }
  };

  const getTypeIcon = (type: TerminalLine['type']) => {
    switch (type) {
      case 'success':
        return <Check className="w-3 h-3 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-warning" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-error" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-error/50" />
            <div className="w-3 h-3 rounded-full bg-warning/50" />
            <div className="w-3 h-3 rounded-full bg-success/50" />
          </div>
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <TerminalIcon className="w-4 h-4" />
            agent-builder
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={copyToClipboard}>
          {copied ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Terminal Content */}
      <div
        ref={scrollRef}
        className="terminal-font p-4 h-64 overflow-y-auto text-sm"
      >
        <AnimatePresence>
          {lines.map((line, index) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              className={`flex items-start gap-2 py-0.5 ${getTypeStyles(line.type)}`}
            >
              <span className="flex-shrink-0 mt-0.5">
                {getTypeIcon(line.type)}
              </span>
              <span className="whitespace-pre-wrap break-all">
                {line.type === 'command' ? '$ ' : ''}
                {line.content}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-slate-500"
            >
              <span className="animate-pulse">▋</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper to create terminal lines
export function createTerminalLine(
  type: TerminalLine['type'],
  content: string
): TerminalLine {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    timestamp: new Date(),
  };
}

// Default welcome message
export const defaultTerminalLines: TerminalLine[] = [
  createTerminalLine('output', '🎬 Agent Builder Terminal'),
  createTerminalLine('output', '─────────────────────────'),
  createTerminalLine('output', 'Ready to generate your AI agent...'),
  createTerminalLine('output', ''),
];