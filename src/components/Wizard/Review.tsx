'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2, Loader2, Zap } from 'lucide-react';
import { Button, Card } from '@/components/UI';
import { INDUSTRIES, FIELDS, TONES, DEPLOYMENT_OPTIONS, USE_CASES, WizardData } from '@/types/agent';

interface ReviewProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export function Review({ data, onChange, onBack, onGenerate }: ReviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const getLabel = (options: readonly { value: string; label: string }[], value: string) => {
    return options.find((opt) => opt.value === value)?.label || value;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onGenerate();
    setIsGenerating(false);
  };

  const fieldKey = data.field || 'custom';
  const useCaseLabels = data.useCases.map((uc) => {
    const options = USE_CASES[fieldKey] || USE_CASES.custom;
    return options.find((opt) => opt.value === uc)?.label || uc;
  });

  const deploymentLabels = data.deployment.map((d) => {
    const opt = DEPLOYMENT_OPTIONS.find((o) => o.value === d);
    return opt?.label || d;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Review your configuration
        </h2>
        <p className="text-text-secondary">
          Confirm your choices before generating the agent
        </p>
      </div>

      <div className="space-y-4">
        {/* Industry */}
        <Card className="flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted uppercase tracking-wider">Industry</span>
            <p className="text-text-primary font-medium">
              {getLabel(INDUSTRIES, data.industry)}
              {data.industry === 'custom' && data.customUseCase && ` - ${data.customUseCase}`}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange({})}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </Card>

        {/* Field */}
        <Card className="flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted uppercase tracking-wider">Operational Field</span>
            <p className="text-text-primary font-medium">
              {getLabel(FIELDS, data.field)}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange({})}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </Card>

        {/* Use Cases */}
        <Card className="flex items-center justify-between">
          <div className="flex-1">
            <span className="text-xs text-text-muted uppercase tracking-wider">Use Cases</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {useCaseLabels.map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-sm rounded-md"
                >
                  <Check className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange({})}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </Card>

        {/* Tone */}
        <Card className="flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted uppercase tracking-wider">Tone of Voice</span>
            <p className="text-text-primary font-medium">
              {getLabel(TONES, data.tone)}
              {data.tone === 'custom' && data.customTone && ` - ${data.customTone}`}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange({})}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </Card>

        {/* Deployment */}
        <Card className="flex items-center justify-between">
          <div className="flex-1">
            <span className="text-xs text-text-muted uppercase tracking-wider">Deployment</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {deploymentLabels.map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/20 text-secondary text-sm rounded-md"
                >
                  <Check className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange({})}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </Card>
      </div>

      {/* Value Proposition */}
      <Card glow="primary" className="mt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-1">
              Ready to build!
            </h4>
            <p className="text-sm text-text-secondary">
              Your AI agent will be customized for {getLabel(INDUSTRIES, data.industry)} industry
              with focus on {getLabel(FIELDS, data.field)} operations.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleGenerate} loading={isGenerating} icon={<Zap className="w-4 h-4" />}>
          Generate Agent
        </Button>
      </div>
    </motion.div>
  );
}