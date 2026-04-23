'use client';

import { useState } from 'react';

const INDUSTRIES = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'legal', label: 'Legal' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hr', label: 'HR' },
  { value: 'realestate', label: 'Real Estate' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const FIELDS = [
  { value: 'customer-service', label: 'Customer Service' },
  { value: 'data-entry', label: 'Data Entry' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'research', label: 'Research' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'other', label: 'Other' },
];

const USE_CASES = [
  { value: 'lead-generation', label: 'Lead Generation' },
  { value: 'customer-support', label: 'Customer Support' },
  { value: 'appointment-setting', label: 'Appointment Setting' },
  { value: 'data-collection', label: 'Data Collection' },
  { value: 'qualification', label: 'Lead Qualification' },
  { value: 'follow-up', label: 'Automated Follow-ups' },
  { value: 'faq-handling', label: 'FAQ Handling' },
  { value: 'order-processing', label: 'Order Processing' },
  { value: 'feedback', label: 'Feedback Collection' },
  { value: 'other', label: 'Other' },
];

const TONUES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'technical', label: 'Technical' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'playful', label: 'Playful' },
];

const INTERFACES = [
  { value: 'web-widget', label: 'Web Widget' },
  { value: 'slack', label: 'Slack Bot' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'api', label: 'API Endpoint' },
  { value: 'chrome-extension', label: 'Chrome Extension' },
  { value: 'discord', label: 'Discord Bot' },
  { value: 'email', label: 'Email Integration' },
];

const SKILL_LEVELS = [
  { value: 'basic', label: 'Basic', desc: 'Simple Q&A and tasks' },
  { value: 'intermediate', desc: 'Can handle complex conversations', label: 'Intermediate' },
  { value: 'advanced', desc: 'Full automation capabilities', label: 'Advanced' },
  { value: 'enterprise', desc: 'Custom AI with full API access', label: 'Enterprise' },
];

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basics
    botName: '',
    businessName: '',
    industry: '',
    otherIndustry: '',
    // Step 2: Function
    field: '',
    otherField: '',
    useCases: [] as string[],
    otherUseCase: '',
    // Step 3: Personality
    tone: '',
    customTone: '',
    personality: '',
    // Step 4: Technical
    interfaces: [] as string[],
    skillLevel: 'intermediate',
    // Step 5: Integrations
    integrations: {
      slack: false,
      whatsapp: false,
      sms: false,
      email: false,
      crm: false,
      calendar: false,
      zapier: false,
    },
  });

  const update = (key: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleUseCase = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      useCases: prev.useCases.includes(value)
        ? prev.useCases.filter((i) => i !== value)
        : [...prev.useCases, value],
    }));
  };

  const toggleInterface = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      interfaces: prev.interfaces.includes(value)
        ? prev.interfaces.filter((i) => i !== value)
        : [...prev.interfaces, value],
    }));
  };

  const toggleIntegration = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      integrations: { ...prev.integrations, [key]: !prev.integrations[key as keyof typeof prev.integrations] },
    }));
  };

  const canContinue = () => {
    switch (step) {
      case 1: return !!formData.botName && !!formData.businessName && !!formData.industry;
      case 2: return !!formData.field && formData.useCases.length > 0;
      case 3: return !!formData.tone;
      case 4: return formData.interfaces.length > 0 && !!formData.skillLevel;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 bg-slate-800/50 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold">Agent Builder</span>
          </div>
          <span className="text-slate-400 text-sm">Step {step} of 6</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {['Basics', 'Function', 'Persona', 'Deploy', 'Integrate', 'Review'].map((label, idx) => (
            <div key={label} className="flex items-center flex-1 min-w-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                step > idx + 1 ? 'bg-emerald-500' : step === idx + 1 ? 'bg-indigo-500' : 'bg-slate-700'
              }`}>
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span className={`ml-1 text-xs hidden sm:inline truncate ${step === idx + 1 ? 'text-white' : 'text-slate-500'}`}>
                {label}
              </span>
              {idx < 5 && <div className={`flex-1 h-0.5 mx-1 min-w-4 ${step > idx + 1 ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Let's start with the basics</h2>
                <p className="text-slate-400">Give your agent an identity</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Agent Name *</label>
                <input
                  type="text"
                  value={formData.botName}
                  onChange={(e) => update('botName', e.target.value)}
                  placeholder="e.g., SalesBot, SupportBuddy, AppointmentPro"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-slate-500 text-sm mt-1">This is how your agent will introduce itself</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => update('businessName', e.target.value)}
                  placeholder="e.g., Acme Corp, John's Pizza, TechStart Inc"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Industry *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind.value}
                      onClick={() => update('industry', ind.value)}
                      className={`p-3 rounded-xl border text-sm text-center transition-all ${
                        formData.industry === ind.value
                          ? 'border-indigo-500 bg-indigo-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {ind.label}
                    </button>
                  ))}
                </div>
                {formData.industry === 'other' && (
                  <input
                    type="text"
                    value={formData.otherIndustry}
                    onChange={(e) => update('otherIndustry', e.target.value)}
                    placeholder="Enter your industry"
                    className="w-full mt-3 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Function */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">What should it do?</h2>
                <p className="text-slate-400">Define the primary function</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Primary Field *</label>
                <div className="grid grid-cols-2 gap-2">
                  {FIELDS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => update('field', f.value)}
                      className={`p-3 rounded-xl border text-sm text-center transition-all ${
                        formData.field === f.value
                          ? 'border-indigo-500 bg-indigo-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                {formData.field === 'other' && (
                  <input
                    type="text"
                    value={formData.otherField}
                    onChange={(e) => update('otherField', e.target.value)}
                    placeholder="Describe the field"
                    className="w-full mt-3 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Use Cases * (select multiple)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {USE_CASES.map((uc) => (
                    <button
                      key={uc.value}
                      onClick={() => toggleUseCase(uc.value)}
                      className={`p-3 rounded-xl border text-sm text-center transition-all ${
                        formData.useCases.includes(uc.value)
                          ? 'border-indigo-500 bg-indigo-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {uc.label}
                    </button>
                  ))}
                </div>
                {formData.useCases.includes('other') && (
                  <input
                    type="text"
                    value={formData.otherUseCase}
                    onChange={(e) => update('otherUseCase', e.target.value)}
                    placeholder="Describe your use case"
                    className="w-full mt-3 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 3: Personality */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">How should it sound?</h2>
                <p className="text-slate-400">Define the personality</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tone of Voice *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TONUES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => update('tone', t.value)}
                      className={`p-3 rounded-xl border text-sm text-center transition-all ${
                        formData.tone === t.value
                          ? 'border-indigo-500 bg-indigo-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Custom Tone (optional)</label>
                <input
                  type="text"
                  value={formData.customTone}
                  onChange={(e) => update('customTone', e.target.value)}
                  placeholder="e.g., Sarcastic, British, Pirate..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Personality Traits</label>
                <textarea
                  value={formData.personality}
                  onChange={(e) => update('personality', e.target.value)}
                  placeholder="Describe additional personality traits, quirks, or characteristics..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Deployment */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Where should it live?</h2>
                <p className="text-slate-400">Choose deployment interfaces</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interfaces * (select at least one)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {INTERFACES.map((int) => (
                    <button
                      key={int.value}
                      onClick={() => toggleInterface(int.value)}
                      className={`p-3 rounded-xl border text-sm text-center transition-all ${
                        formData.interfaces.includes(int.value)
                          ? 'border-indigo-500 bg-indigo-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {int.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skill Level *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SKILL_LEVELS.map((skill) => (
                    <button
                      key={skill.value}
                      onClick={() => update('skillLevel', skill.value)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        formData.skillLevel === skill.value
                          ? 'border-indigo-500 bg-indigo-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-medium">{skill.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{skill.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Integrations */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Connect to your tools</h2>
                <p className="text-slate-400">Select integrations (optional)</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'slack', label: 'Slack', icon: '💬' },
                  { key: 'whatsapp', label: 'WhatsApp', icon: '📱' },
                  { key: 'sms', label: 'SMS', icon: '💬' },
                  { key: 'email', label: 'Email', icon: '📧' },
                  { key: 'crm', label: 'CRM', icon: '📊' },
                  { key: 'calendar', label: 'Calendar', icon: '📅' },
                  { key: 'zapier', label: 'Zapier', icon: '⚡' },
                ].map((tool) => (
                  <button
                    key={tool.key}
                    onClick={() => toggleIntegration(tool.key)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      formData.integrations[tool.key as keyof typeof formData.integrations]
                        ? 'border-indigo-500 bg-indigo-500/20'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{tool.icon}</div>
                    <div className="text-sm">{tool.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Agent Configuration Complete!</h2>
                <p className="text-slate-400">Review your agent settings</p>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-400">Agent Name:</span>
                  <span className="font-medium">{formData.botName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-400">Business:</span>
                  <span className="font-medium">{formData.businessName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-400">Industry:</span>
                  <span className="font-medium">{formData.industry === 'other' ? formData.otherIndustry : formData.industry}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-400">Primary Function:</span>
                  <span className="font-medium">{formData.field}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-400">Use Cases:</span>
                  <span className="font-medium">{formData.useCases.join(', ')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-400">Tone:</span>
                  <span className="font-medium">{formData.tone} {formData.customTone ? `(${formData.customTone})` : ''}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-400">Skill Level:</span>
                  <span className="font-medium">{formData.skillLevel}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-400">Interfaces:</span>
                  <span className="font-medium">{formData.interfaces.join(', ')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-400">Integrations:</span>
                  <span className="font-medium">
                    {Object.entries(formData.integrations).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'None'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-medium">
                  Save Draft
                </button>
                <button className="flex-1 bg-indigo-500 hover:bg-indigo-600 py-3 rounded-lg font-medium">
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 6 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="px-6 py-2 rounded-lg bg-slate-700 disabled:opacity-50 hover:bg-slate-600"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canContinue()}
                className="px-8 py-2 rounded-lg bg-indigo-500 disabled:opacity-50 hover:bg-indigo-600 font-medium"
              >
                {step === 5 ? 'Review Agent' : 'Continue'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}