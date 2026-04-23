'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  { value: 'intermediate', label: 'Intermediate', desc: 'Can handle complex conversations' },
  { value: 'advanced', label: 'Advanced', desc: 'Full automation capabilities' },
  { value: 'enterprise', label: 'Enterprise', desc: 'Custom AI with full API access' },
];

const PRICING = {
  basic: { price: 49, label: 'Basic' },
  intermediate: { price: 99, label: 'Intermediate' },
  advanced: { price: 199, label: 'Advanced' },
  enterprise: { price: 499, label: 'Enterprise' },
};

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    botName: '',
    businessName: '',
    industry: '',
    otherIndustry: '',
    field: '',
    otherField: '',
    useCases: [] as string[],
    otherUseCase: '',
    tone: '',
    customTone: '',
    personality: '',
    interfaces: [] as string[],
    skillLevel: 'intermediate',
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

  const handlePayment = async () => {
    setIsProcessing(true);
    setStep(7); // Processing state

    try {
      // Step 1: Create Stripe checkout session
      setGenerationStatus('Creating checkout session...');
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: `agent_${Date.now()}`,
          successUrl: `${window.location.origin}/wizard?step=8&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/wizard?step=6`,
        }),
      });

      const checkoutData = await response.json();

      if (checkoutData.testMode || checkoutData.url) {
        // In test mode or if we have a URL, proceed to generation
        setGenerationStatus('Processing payment (test mode)...');
        setTerminalOutput((prev) => [...prev, '💳 Payment processed (test mode)']);
        
        // Simulate payment processing
        await new Promise((r) => setTimeout(r, 1500));
        
        // Step 2: Generate agent
        await generateAgent();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setGenerationStatus('Error processing payment');
      setIsProcessing(false);
    }
  };

  const generateAgent = async () => {
    setStep(8); // Generation state
    const outputs = [
      '🚀 Initializing agent build...',
      '📁 Creating directory structure...',
      `✓ Created: /opt/agents/${formData.botName.toLowerCase().replace(/\s+/g, '-')}/`,
      '✓ Created: src/index.ts',
      '✓ Created: src/config.ts',
      '✓ Created: src/prompts/system.md',
      '✓ Created: src/tools/api.ts',
      '✓ Created: src/tools/database.ts',
      '📦 Generating package.json...',
      '🐳 Creating Dockerfile...',
      '✓ Created: docker-compose.yml',
      '⚙️ Configuring Stripe integration...',
      '🔧 Setting up environment variables...',
      '✓ Created: .env.example',
      '📝 Generating README.md...',
      '🔌 Building integrations...',
      ...(formData.integrations.slack ? ['✓ Slack integration'] : []),
      ...(formData.integrations.whatsapp ? ['✓ WhatsApp integration'] : []),
      ...(formData.integrations.calendar ? ['✓ Calendar integration'] : []),
      '📡 Assigning port...',
      `✓ Assigned port: 3${Math.floor(Math.random() * 900) + 100}`,
      '🚀 Deploying container...',
      '✅ Agent deployed successfully!',
      '',
      '🎉 Your agent is ready!',
      `🌐 URL: https://${formData.botName.toLowerCase().replace(/\s+/g, '-')}.yourdomain.com`,
    ];

    for (const line of outputs) {
      if (line) {
        setTerminalOutput((prev) => [...prev, line]);
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
      }
    }

    setGenerationStatus('Complete!');
    setIsProcessing(false);
  };

  // Handle URL params for post-payment redirect
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('step') === '8' && !isProcessing && step !== 8) {
      // Payment was successful, trigger generation
      setTimeout(() => handlePayment(), 100);
    }
  }

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
          <span className="text-slate-400 text-sm">
            {step === 7 ? 'Processing...' : step === 8 ? 'Building...' : `Step ${Math.min(step, 6)} of 6`}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Processing State */}
        {step === 7 && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Processing Payment...</h2>
            <p className="text-slate-400">{generationStatus}</p>
          </div>
        )}

        {/* Generation State */}
        {step === 8 && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Building Your Agent
              </h2>
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto">
                {terminalOutput.map((line, i) => (
                  <div key={i} className={`mb-1 ${line.startsWith('✓') ? 'text-emerald-400' : line.startsWith('🚀') ? 'text-cyan-400' : line.startsWith('❌') ? 'text-red-400' : ''}`}>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Agent Configuration</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Agent Name</span>
                  <span className="font-medium">{formData.botName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Business</span>
                  <span className="font-medium">{formData.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Skill Level</span>
                  <span className="font-medium capitalize">{formData.skillLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Price</span>
                  <span className="font-medium text-emerald-400">${PRICING[formData.skillLevel as keyof typeof PRICING].price}/mo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Normal Wizard Steps */}
        {step < 7 && (
          <>
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
                    <label className="block text-sm font-medium mb-2">Custom Tone</label>
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
                      placeholder="Describe additional personality traits..."
                      rows={3}
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
                    <label className="block text-sm font-medium mb-2">Interfaces *</label>
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
                          <div className="text-xs text-slate-400 mt-1">${PRICING[skill.value as keyof typeof PRICING].price}/mo</div>
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
                    <h2 className="text-2xl font-bold mb-2">Review & Pay</h2>
                    <p className="text-slate-400">Confirm your agent configuration</p>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-4 space-y-3 text-sm">
                    <div className="grid grid-cols-2">
                      <span className="text-slate-400">Agent Name</span>
                      <span className="font-medium">{formData.botName}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-slate-400">Business</span>
                      <span className="font-medium">{formData.businessName}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-slate-400">Industry</span>
                      <span className="font-medium capitalize">{formData.industry}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-slate-400">Function</span>
                      <span className="font-medium capitalize">{formData.field}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-slate-400">Use Cases</span>
                      <span className="font-medium">{formData.useCases.length} selected</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-slate-400">Tone</span>
                      <span className="font-medium capitalize">{formData.tone}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-slate-400">Interfaces</span>
                      <span className="font-medium">{formData.interfaces.length} selected</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-slate-400">Integrations</span>
                      <span className="font-medium">
                        {Object.entries(formData.integrations).filter(([_, v]) => v).length} selected
                      </span>
                    </div>
                  </div>

                  <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{PRICING[formData.skillLevel as keyof typeof PRICING].label} Plan</div>
                        <div className="text-sm text-slate-400">Billed monthly</div>
                      </div>
                      <div className="text-2xl font-bold">
                        ${PRICING[formData.skillLevel as keyof typeof PRICING].price}
                        <span className="text-sm font-normal text-slate-400">/mo</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 py-4 rounded-xl font-bold text-lg"
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                  
                  <p className="text-center text-slate-500 text-xs">
                    Test mode: No real charges will be made
                  </p>
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
                    onClick={() => setStep(step + 1)}
                    disabled={!canContinue()}
                    className="px-8 py-2 rounded-lg bg-indigo-500 disabled:opacity-50 hover:bg-indigo-600 font-medium"
                  >
                    {step === 5 ? 'Review' : 'Continue'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}