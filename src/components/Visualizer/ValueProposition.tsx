'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Zap, Users, DollarSign, Activity } from 'lucide-react';
import { Card } from '@/components/UI';
import { WizardData, INDUSTRIES, FIELDS } from '@/types/agent';

interface ValuePropositionProps {
  data?: WizardData;
}

const industryStats: Record<string, { timeSaved: string; efficiency: string; roi: string }> = {
  healthcare: { timeSaved: '35%', efficiency: '4x faster', roi: '280%' },
  finance: { timeSaved: '45%', efficiency: '5x faster', roi: '320%' },
  legal: { timeSaved: '50%', efficiency: '6x faster', roi: '350%' },
  ecommerce: { timeSaved: '40%', efficiency: '4.5x faster', roi: '290%' },
  marketing: { timeSaved: '30%', efficiency: '3.5x faster', roi: '240%' },
  hr: { timeSaved: '42%', efficiency: '4.8x faster', roi: '310%' },
  realestate: { timeSaved: '38%', efficiency: '4.2x faster', roi: '270%' },
  custom: { timeSaved: '35%', efficiency: '4x faster', roi: '250%' },
};

const statIcons = {
  time: Clock,
  efficiency: Zap,
  roi: TrendingUp,
};

export function ValueProposition({ data }: ValuePropositionProps) {
  const industryKey = data?.industry || 'custom';
  const stats = industryStats[industryKey] || industryStats.custom;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-white">
        Expected Impact
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {/* Time Saved */}
        <motion.div variants={itemVariants}>
          <Card className="text-center py-4">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.timeSaved}</p>
            <p className="text-xs text-slate-500">Time Saved</p>
          </Card>
        </motion.div>

        {/* Efficiency */}
        <motion.div variants={itemVariants}>
          <Card className="text-center py-4">
            <Zap className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.efficiency}</p>
            <p className="text-xs text-slate-500">Efficiency</p>
          </Card>
        </motion.div>

        {/* ROI */}
        <motion.div variants={itemVariants}>
          <Card className="text-center py-4">
            <TrendingUp className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.roi}</p>
            <p className="text-xs text-slate-500">ROI</p>
          </Card>
        </motion.div>
      </div>

      {/* Industry-specific benefit text */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white">
                <span className="font-medium">For {INDUSTRIES.find((i) => i.value === data?.industry)?.label || 'your industry'}:</span>{' '}
                Automate {FIELDS.find((f) => f.value === data?.field)?.label?.toLowerCase() || 'operations'}{' '}
                tasks that typically take hours to complete in minutes.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}