'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Headphones, Keyboard, BarChart3, Calendar, TrendingUp, LifeBuoy, Search, Wrench } from 'lucide-react';
import { Button, Card, Select } from '@/components/UI';
import { FIELDS, WizardData } from '@/types/agent';

interface Step2FieldProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const fieldIcons: Record<string, React.ReactNode> = {
  customerservice: <Headphones className="w-6 h-6" />,
  dataentry: <Keyboard className="w-6 h-6" />,
  analytics: <BarChart3 className="w-6 h-6" />,
  scheduling: <Calendar className="w-6 h-6" />,
  sales: <TrendingUp className="w-6 h-6" />,
  support: <LifeBuoy className="w-6 h-6" />,
  research: <Search className="w-6 h-6" />,
  custom: <Wrench className="w-6 h-6" />,
};

export function Step2Field({ data, onChange, onNext, onBack }: Step2FieldProps) {
  const isValid = data.field;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          What operational field?
        </h2>
        <p className="text-slate-400">
          Choose the primary function your agent will perform
        </p>
      </div>

      <Select
        label="Operational Field"
        options={FIELDS.map((field) => ({
          value: field.value,
          label: field.label,
          icon: fieldIcons[field.value],
        }))}
        value={data.field}
        onChange={(value) => onChange({ field: value })}
        placeholder="Select a field"
      />

      {/* Field Preview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {FIELDS.map((field) => (
          <motion.div
            key={field.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              hover
              glow={data.field === field.value ? 'secondary' : 'none'}
              className={`cursor-pointer text-center py-4 ${
                data.field === field.value
                  ? 'border-secondary bg-secondary/10'
                  : ''
              }`}
              onClick={() => onChange({ field: field.value })}
            >
              <div className={`mx-auto mb-2 ${
                data.field === field.value ? 'text-secondary' : 'text-slate-400'
              }`}>
                {fieldIcons[field.value]}
              </div>
              <span className={`text-sm font-medium ${
                data.field === field.value ? 'text-secondary' : 'text-white'
              }`}>
                {field.label}
              </span>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Context based on selection */}
      {data.industry && data.field && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6"
        >
          <p className="text-sm text-white">
            <span className="text-primary font-medium">Context:</span>{' '}
            Building a {data.field} agent for the {data.industry} industry.
            This will help us tailor the agent&apos;s capabilities and prompts.
          </p>
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