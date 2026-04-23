'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MessageSquare, Phone, Contact, Database, Puzzle } from 'lucide-react';
import { Button, Card, MultiSelect } from '@/components/UI';
import { DEPLOYMENT_OPTIONS, WizardData } from '@/types/agent';

interface Step5DeploymentProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const deploymentIcons: Record<string, React.ReactNode> = {
  webwidget: <Globe className="w-6 h-6" />,
  slack: <MessageSquare className="w-6 h-6" />,
  sms: <Phone className="w-6 h-6" />,
  whatsapp: <Contact className="w-6 h-6" />,
  api: <Database className="w-6 h-6" />,
  chrome: <Puzzle className="w-6 h-6" />,
};

export function Step5Deployment({ data, onChange, onNext, onBack }: Step5DeploymentProps) {
  const isValid = data.deployment.length > 0;

  const deploymentOptions = DEPLOYMENT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    icon: opt.icon,
  }));

  const toggleDeployment = (value: string) => {
    if (data.deployment.includes(value)) {
      onChange({
        deployment: data.deployment.filter((d) => d !== value),
      });
    } else {
      onChange({
        deployment: [...data.deployment, value],
      });
    }
  };

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
          Deployment interfaces
        </h2>
        <p className="text-text-secondary">
          Where will your agent be deployed?
        </p>
      </div>

      <MultiSelect
        label="Select deployment interfaces"
        options={deploymentOptions}
        value={data.deployment}
        onChange={(value) => onChange({ deployment: value })}
        placeholder="Choose one or more interfaces"
      />

      {/* Deployment Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
        {DEPLOYMENT_OPTIONS.map((opt) => {
          const isSelected = data.deployment.includes(opt.value);
          return (
            <motion.div
              key={opt.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                hover
                glow={isSelected ? 'secondary' : 'none'}
                className={`cursor-pointer text-center py-4 ${
                  isSelected ? 'border-secondary bg-secondary/10' : ''
                }`}
                onClick={() => toggleDeployment(opt.value)}
              >
                <div className="text-2xl mb-2">{opt.icon}</div>
                <span className={`text-sm font-medium block ${isSelected ? 'text-secondary' : 'text-text-primary'}`}>
                  {opt.label}
                </span>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Deployment Summary */}
      {data.deployment.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 mt-6"
        >
          <p className="text-sm text-text-primary">
            <span className="text-secondary font-medium">Deploying to:</span>{' '}
            {data.deployment.map((d) => {
              const opt = DEPLOYMENT_OPTIONS.find((o) => o.value === d);
              return opt?.label || d;
            }).join(', ')}
          </p>
        </motion.div>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Review
        </Button>
      </div>
    </motion.div>
  );
}