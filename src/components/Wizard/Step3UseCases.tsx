'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ListChecks } from 'lucide-react';
import { Button, Card, MultiSelect } from '@/components/UI';
import { USE_CASES, WizardData } from '@/types/agent';

interface Step3UseCasesProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3UseCases({ data, onChange, onNext, onBack }: Step3UseCasesProps) {
  const fieldKey = data.field || 'custom';
  const availableUseCases = USE_CASES[fieldKey] || USE_CASES.custom;

  const isValid = data.useCases.length > 0;

  const useCaseOptions = availableUseCases.map((uc) => ({
    value: uc.value,
    label: uc.label,
  }));

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
          Primary use cases
        </h2>
        <p className="text-text-secondary">
          What tasks should your agent handle?
        </p>
      </div>

      <MultiSelect
        label="Select use cases"
        options={useCaseOptions}
        value={data.useCases}
        onChange={(value) => onChange({ useCases: value })}
        placeholder="Choose one or more use cases"
      />

      {/* Use Case Cards */}
      <div className="grid gap-3 mt-6">
        {useCaseOptions.map((uc, index) => {
          const isSelected = data.useCases.includes(uc.value);
          return (
            <motion.div
              key={uc.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                hover
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-accent bg-accent/10'
                    : 'border-white/10'
                }`}
                onClick={() => {
                  if (isSelected) {
                    onChange({
                      useCases: data.useCases.filter((u) => u !== uc.value),
                    });
                  } else {
                    onChange({
                      useCases: [...data.useCases, uc.value],
                    });
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-accent border-accent'
                        : 'border-white/30'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={isSelected ? 'text-text-primary' : 'text-text-secondary'}>
                    {uc.label}
                  </span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Summary */}
      {data.useCases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-text-secondary mt-4"
        >
          <ListChecks className="w-4 h-4 text-accent" />
          <span>{data.useCases.length} use case(s) selected</span>
        </motion.div>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
}