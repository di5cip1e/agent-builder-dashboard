export interface WizardData {
  industry: string;
  field: string;
  useCases: string[];
  customUseCase?: string;
  tone: string;
  customTone?: string;
  deployment: string[];
}

export interface UseCase {
  id: string;
  label: string;
  industry?: string[];
}

export interface AgentConfig {
  id: string;
  name: string;
  slug: string;
  industry: string;
  field: string;
  useCases: string[];
  tone: string;
  deployment: string[];
  status: 'draft' | 'generating' | 'ready' | 'deployed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface FileTreeNode {
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  children?: FileTreeNode[];
  created?: boolean;
}

export interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'success' | 'warning' | 'error';
  content: string;
  timestamp: Date;
}

export const INDUSTRIES = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'legal', label: 'Legal' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hr', label: 'HR' },
  { value: 'realestate', label: 'Real Estate' },
  { value: 'custom', label: 'Custom' },
] as const;

export const FIELDS = [
  { value: 'customerservice', label: 'Customer Service' },
  { value: 'dataentry', label: 'Data Entry' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'research', label: 'Research' },
  { value: 'custom', label: 'Custom' },
] as const;

export const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'technical', label: 'Technical' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'custom', label: 'Custom' },
] as const;

export const DEPLOYMENT_OPTIONS = [
  { value: 'webwidget', label: 'Web Widget', icon: '🌐' },
  { value: 'slack', label: 'Slack Bot', icon: '💬' },
  { value: 'sms', label: 'SMS', icon: '📱' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '📲' },
  { value: 'api', label: 'API Endpoint', icon: '🔌' },
  { value: 'chrome', label: 'Chrome Extension', icon: '🔶' },
] as const;

export const USE_CASES: Record<string, { value: string; label: string }[]> = {
  customerservice: [
    { value: 'respond-inquiries', label: 'Respond to customer inquiries' },
    { value: 'handle-complaints', label: 'Handle complaints and escalations' },
    { value: 'provide-support', label: 'Provide technical support' },
    { value: 'process-returns', label: 'Process returns and refunds' },
    { value: 'account-assistance', label: 'Account assistance' },
  ],
  dataentry: [
    { value: 'extract-info', label: 'Extract information from documents' },
    { value: 'populate-databases', label: 'Populate databases' },
    { value: 'validate-data', label: 'Validate and clean data' },
    { value: 'migrate-data', label: 'Data migration' },
    { value: 'generate-reports', label: 'Generate reports' },
  ],
  analytics: [
    { value: 'generate-insights', label: 'Generate business insights' },
    { value: 'create-dashboards', label: 'Create dashboards' },
    { value: 'predict-trends', label: 'Predict trends' },
    { value: 'analyze-metrics', label: 'Analyze key metrics' },
    { value: 'visualize-data', label: 'Data visualization' },
  ],
  scheduling: [
    { value: 'book-meetings', label: 'Book meetings' },
    { value: 'manage-calendars', label: 'Manage calendars' },
    { value: 'send-reminders', label: 'Send reminders' },
    { value: 'handle-conflicts', label: 'Handle scheduling conflicts' },
    { value: 'coordinate-travel', label: 'Coordinate travel' },
  ],
  sales: [
    { value: 'lead-qualification', label: 'Lead qualification' },
    { value: 'cold-outreach', label: 'Cold outreach' },
    { value: 'follow-up', label: 'Follow-up sequences' },
    { value: 'demo-scheduling', label: 'Demo scheduling' },
    { value: 'proposal-generation', label: 'Proposal generation' },
  ],
  support: [
    { value: 'ticket-routing', label: 'Ticket routing' },
    { value: 'faq-responses', label: 'FAQ responses' },
    { value: 'troubleshoot', label: 'Troubleshoot issues' },
    { value: 'kb-lookup', label: 'Knowledge base lookup' },
    { value: 'escalation', label: 'Escalation management' },
  ],
  research: [
    { value: 'market-research', label: 'Market research' },
    { value: 'competitor-analysis', label: 'Competitor analysis' },
    { value: 'content-research', label: 'Content research' },
    { value: 'data-gathering', label: 'Data gathering' },
    { value: 'summarize-findings', label: 'Summarize findings' },
  ],
  custom: [
    { value: 'custom-use-case-1', label: 'Custom use case 1' },
    { value: 'custom-use-case-2', label: 'Custom use case 2' },
  ],
};