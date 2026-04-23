'use client';

import { useState } from 'react';
import { Step1Industry } from './Step1Industry';
import { Step2Field } from './Step2Field';
import { Step3UseCases } from './Step3UseCases';
import { Step4Tone } from './Step4Tone';
import { Step5Deployment } from './Step5Deployment';
import { Review } from './Review';
import { WizardData } from '@/types/agent';

interface WizardFormProps {
  currentStep: number;
  onComplete: (data: Record<string, unknown>) => void;
  onStepChange: (step: number) => void;
}

export function WizardForm({ currentStep, onComplete, onStepChange }: WizardFormProps) {
  const [formData, setFormData] = useState<WizardData>({
    industry: '',
    field: '',
    useCases: [],
    customUseCase: '',
    tone: '',
    interfaces: [],
  });

  const updateData = (data: Partial<WizardData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      onStepChange(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Industry data={formData} onChange={updateData} onNext={handleNext} />;
      case 2:
        return <Step2Field data={formData} onChange={updateData} onNext={handleNext} />;
      case 3:
        return <Step3UseCases data={formData} onChange={updateData} onNext={handleNext} />;
      case 4:
        return <Step4Tone data={formData} onChange={updateData} onNext={handleNext} />;
      case 5:
        return <Step5Deployment data={formData} onChange={updateData} onNext={handleNext} />;
      default:
        return null;
    }
  };

  return <div className="space-y-6">{renderStep()}</div>;
}