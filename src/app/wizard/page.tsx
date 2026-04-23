'use client';

import { useState, useEffect } from 'react';
import { WizardForm } from '@/components/Wizard/WizardForm';
import { Terminal } from '@/components/Visualizer/Terminal';
import { FileTree } from '@/components/Visualizer/FileTree';
import { ValueProposition } from '@/components/Visualizer/ValueProposition';

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentData, setAgentData] = useState<Record<string, unknown> | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [fileTree, setFileTree] = useState<{ name: string; type: string; children?: unknown[] }[]>([]);

  const handleWizardComplete = async (data: Record<string, unknown>) => {
    setAgentData(data);
    setIsGenerating(true);
    setCurrentStep(6);

    // Simulate real-time generation output
    const steps = [
      '🚀 Initializing agent build process...',
      '📁 Creating directory structure...',
      '✓ Created: /src/index.ts',
      '✓ Created: /src/config.ts',
      '✓ Created: /src/prompts/system.md',
      '✓ Created: /src/tools/api.ts',
      '✓ Created: /src/tools/database.ts',
      '📦 Generating package.json...',
      '🐳 Creating Dockerfile...',
      '✓ Created: /Dockerfile',
      '✓ Created: /docker-compose.yml',
      '⚙️ Configuring Stripe integration...',
      '🔧 Setting up environment variables...',
      '✓ Created: /.env.example',
      '📝 Generating README.md...',
      '✅ Agent build complete!',
      '💳 Redirecting to checkout...',
    ];

    const newFileTree: { name: string; type: string; children?: { name: string; type: string }[] }[] = [
      {
        name: 'agent-builder',
        type: 'folder',
        children: [
          { name: 'src', type: 'folder' },
          { name: 'package.json', type: 'file' },
          { name: 'tsconfig.json', type: 'file' },
          { name: 'Dockerfile', type: 'file' },
          { name: 'docker-compose.yml', type: 'file' },
          { name: '.env.example', type: 'file' },
          { name: 'README.md', type: 'file' },
        ],
      },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setTerminalOutput((prev) => [...prev, steps[i]]);
      
      // Add files to tree progressively
      if (i === 5) {
        setFileTree([{ name: 'src', type: 'folder', children: [] }]);
      } else if (i >= 6 && i <= 7) {
        setFileTree([
          {
            name: 'src',
            type: 'folder',
            children: [
              { name: 'index.ts', type: 'file' },
              { name: 'config.ts', type: 'file' },
              { name: 'prompts', type: 'folder' },
              { name: 'tools', type: 'folder' },
            ],
          },
        ]);
      } else if (i >= 8) {
        setFileTree(newFileTree);
      }
    }

    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold">Agent Builder</span>
          </div>
          <div className="text-sm text-slate-400">MVP Dashboard</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        {currentStep <= 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {['Industry', 'Field', 'Use Cases', 'Tone', 'Deployment'].map((label, idx) => (
                <div
                  key={label}
                  className={`flex items-center ${idx < 4 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      currentStep > idx + 1
                        ? 'bg-emerald-500 text-white'
                        : currentStep === idx + 1
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {currentStep > idx + 1 ? '✓' : idx + 1}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:inline ${currentStep === idx + 1 ? 'text-white' : 'text-slate-400'}`}>
                    {label}
                  </span>
                  {idx < 4 && <div className={`flex-1 h-0.5 mx-4 ${currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Wizard Form or Results */}
          <div className="space-y-6">
            {!isGenerating && currentStep <= 5 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <h1 className="text-2xl font-bold mb-2">Configure Your Agent</h1>
                <p className="text-slate-400 mb-6">Step {currentStep} of 5</p>
                <WizardForm
                  currentStep={currentStep}
                  onComplete={handleWizardComplete}
                  onStepChange={setCurrentStep}
                />
              </div>
            )}

            {isGenerating && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Building Your Agent
                </h2>
                <Terminal output={terminalOutput} />
              </div>
            )}

            {currentStep === 6 && !isGenerating && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Agent Ready!</h2>
                  <p className="text-slate-400 mb-6">Your agent has been generated. Proceeding to payment...</p>
                  <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Continue to Stripe Checkout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Visualizations */}
          <div className="space-y-6">
            {/* Value Props - show during wizard */}
            {currentStep <= 5 && <ValueProposition />}

            {/* File Tree - show during generation */}
            {isGenerating && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold mb-4">File Structure</h3>
                <FileTree files={fileTree} />
              </div>
            )}

            {/* Summary after generation */}
            {currentStep === 6 && !isGenerating && agentData && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold mb-4">Agent Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Industry</span>
                    <span className="text-white">{(agentData.industry as string) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Field</span>
                    <span className="text-white">{(agentData.field as string) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tone</span>
                    <span className="text-white">{(agentData.tone as string) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interfaces</span>
                    <span className="text-white">{Array.isArray(agentData.interfaces) ? (agentData.interfaces as string[]).join(', ') : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}