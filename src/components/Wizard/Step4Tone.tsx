'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Smile, Coffee, Code, Gavel, Wrench } from 'lucide-react';
import { Button, Card, Input, Select } from '@/components/UI';
import { TONES, WizardData } from '@/types/agent';

interface Step4ToneProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const toneIcons: Record<string, React.ReactNode> = {
  professional: <Briefcase className="w-6 h-6" />,
  friendly: <Smile className="w-6 h-6" />,
  casual: <Coffee className="w-6 h-6" />,
  technical: <Code className="w-6 h-6" />,
  authoritative: <Gavel className="w-6 h-6" />,
  custom: <Wrench className="w-6 h-6" />,
};

const toneDescriptions: Record<string, string> = {
  professional: 'Formal, business-appropriate language',
  friendly: 'Warm, approachable, conversational',
  casual: 'Relaxed, informal, easy-going',
  technical: 'Precise, detailed, industry-specific',
  authoritative: 'Confident, direct, expert guidance',
  custom: 'Define your own tone',
};

export function Step4Tone({ data, onChange, onNext, onBack }: Step4ToneProps) {
  const isValid = data.tone && (data.tone !== 'custom' || data.customTone);

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
          What tone of voice?
        </h2>
        <p className="text-slate-400">
          How should your agent communicate?
        </p>
      </div>

      <Select
        label="Tone of Voice"
        options={TONES.map((tone) => ({
          value: tone.value,
          label: tone.label,
          icon: toneIcons[tone.value],
        }))}
        value={data.tone}
        onChange={(value) => onChange({ tone: value })}
        placeholder="Select a tone"
      />

      {data.tone === 'custom' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <Input
            label="Describe your custom tone"
            value={data.customTone || ''}
            onChange={(e) => onChange({ customTone: e.target.value })}
            placeholder="e.g., Playful but professional,Inspirational and motivating..."
          />
        </motion.div>
      )}

      {/* Tone Preview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
        {TONES.map((tone) => {
          const isSelected = data.tone === tone.value;
          return (
            <motion.div
              key={tone.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                hover
                glow={isSelected ? 'primary' : 'none'}
                className={`cursor-pointer text-center py-4 ${
                  isSelected ? 'border-primary bg-primary/10' : ''
                }`}
                onClick={() => onChange({ tone: tone.value })}
              >
                <div className={`mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                  {toneIcons[tone.value]}
                </div>
                <span className={`text-sm font-medium block ${isSelected ? 'text-primary' : 'text-white'}`}>
                  {tone.label}
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  {toneDescriptions[tone.value]}
                </span>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Example Preview */}
      {data.tone && data.tone !== 'custom' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-lg p-4 mt-6"
        >
          <p className="text-xs text-slate-500 mb-2">Example response:</p>
          <p className="text-sm text-slate-400 italic">
            {data.tone === 'professional' && '"Thank you for contacting us. We appreciate your inquiry and will respond within 24 hours."'}
            {data.tone === 'friendly' && '"Hey there! Thanks for reaching out. We\'d love to help you out!"'}
            {data.tone === 'casual' && '"Sup! Got your message. We\'ll get back to you ASAP."'}
            {data.tone === 'technical' && '"Request received. Initiating diagnostic protocol. Estimated response time: 24 hours."'}
            {data.tone === 'authoritative' && '"Your inquiry has been logged. Our team will address your request with priority."'}
            {data.tone === 'custom' && data.customTone}
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