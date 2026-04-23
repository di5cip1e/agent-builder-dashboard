'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Shield, Scale, ShoppingCart, Megaphone, Users, Home, Wrench } from 'lucide-react';
import { Button, Card, Select } from '@/components/UI';
import { INDUSTRIES, WizardData } from '@/types/agent';

interface Step1IndustryProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
  onNext: () => void;
}

const industryIcons: Record<string, React.ReactNode> = {
  healthcare: <Building2 className="w-6 h-6" />,
  finance: <Shield className="w-6 h-6" />,
  legal: <Scale className="w-6 h-6" />,
  ecommerce: <ShoppingCart className="w-6 h-6" />,
  marketing: <Megaphone className="w-6 h-6" />,
  hr: <Users className="w-6 h-6" />,
  realestate: <Home className="w-6 h-6" />,
  custom: <Wrench className="w-6 h-6" />,
};

export function Step1Industry({ data, onChange, onNext }: Step1IndustryProps) {
  const isValid = data.industry && (data.industry !== 'custom' || data.customUseCase);

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
          What industry are you targeting?
        </h2>
        <p className="text-text-secondary">
          Select the primary industry for your AI agent
        </p>
      </div>

      <Select
        label="Target Industry"
        options={INDUSTRIES.map((ind) => ({
          value: ind.value,
          label: ind.label,
          icon: industryIcons[ind.value],
        }))}
        value={data.industry}
        onChange={(value) => onChange({ industry: value })}
        placeholder="Select an industry"
      />

      {data.industry === 'custom' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <div className="bg-bg-dark border border-white/10 rounded-lg p-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Describe your custom industry
            </label>
            <input
              type="text"
              value={data.customUseCase || ''}
              onChange={(e) => onChange({ customUseCase: e.target.value })}
              placeholder="e.g., Automotive, Non-profit, Education..."
              className="w-full bg-bg-card border border-white/10 rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </motion.div>
      )}

      {/* Industry Preview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {INDUSTRIES.map((ind) => (
          <motion.div
            key={ind.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              hover
              glow={data.industry === ind.value ? 'primary' : 'none'}
              className={`cursor-pointer text-center py-4 ${
                data.industry === ind.value
                  ? 'border-primary bg-primary/10'
                  : ''
              }`}
              onClick={() => onChange({ industry: ind.value })}
            >
              <div className={`mx-auto mb-2 ${
                data.industry === ind.value ? 'text-primary' : 'text-text-secondary'
              }`}>
                {industryIcons[ind.value]}
              </div>
              <span className={`text-sm font-medium ${
                data.industry === ind.value ? 'text-primary' : 'text-text-primary'
              }`}>
                {ind.label}
              </span>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={onNext} disabled={!isValid}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
}